package handler

import (
	"fmt"
	"net/http"
	"realtime-service/internal/auth"
	"realtime-service/internal/event"
	"realtime-service/internal/hub"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type WebSocketHandler struct {
	hub       *hub.Hub
	jwtSecret string
}

func NewWebSocketHandler(hub *hub.Hub, jwtSecret string) *WebSocketHandler {
	return &WebSocketHandler{
		hub:       hub,
		jwtSecret: jwtSecret,
	}
}

func (h *WebSocketHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to upgrade to WebSocket", http.StatusInternalServerError)
		return
	}

	conn.SetReadDeadline(time.Now().Add(5 * time.Second))

	// 最初に認証メッセージを受け取るが、それ以外はタイムアウトまで無視する
	var authMsg event.AuthRequest
	if err := conn.ReadJSON(&authMsg); err != nil {
		conn.WriteJSON(event.Event{
			Type: event.EventTypeAuthError,
			Data: event.AuthError{Message: "Failed to read auth message"},
		})
		fmt.Println("Failed to read auth message:", err)
		conn.Close()
		return
	}

	if authMsg.Type != event.EventTypeAuth || authMsg.Token == "" {
		conn.WriteJSON(AuthErrorMessage{
			Type:    event.EventTypeAuthError,
			Message: "Invalid auth message",
		})
		fmt.Println("Invalid auth message:", authMsg)
		conn.Close()
		return
	}

	fmt.Println("Auth message received:", authMsg)

	claims, err := auth.ValidateToken(authMsg.Token, h.jwtSecret)
	if err != nil {
		conn.WriteJSON(AuthErrorMessage{
			Type:    event.EventTypeAuthError,
			Message: "Invalid token",
		})
		fmt.Println("Invalid token:", err)
		conn.Close()
		return
	}

	fmt.Println("Token validated for user:", claims.UserID)

	conn.SetReadDeadline(time.Time{})

	conn.WriteJSON(AuthSuccessMessage{
		Type:   "auth_success",
		UserID: claims.UserID.String(),
	})

	fmt.Println("WebSocket connection established for user:", claims.UserID)

	client := hub.NewClient(h.hub, conn, claims.UserID)

	h.hub.Register(client)

	go client.WritePump()
	go client.ReadPump()
}
