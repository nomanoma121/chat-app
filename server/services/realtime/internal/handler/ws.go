package handler

import (
	"encoding/json"
	"log"
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

	if err := conn.SetReadDeadline(time.Now().Add(5 * time.Second)); err != nil {
		http.Error(w, "Failed to set read deadline", http.StatusInternalServerError)
		return
	}

	// 最初に認証メッセージを受け取るが、それ以外はタイムアウトまで無視する
	var authEvent event.Event
	if err := conn.ReadJSON(&authEvent); err != nil {
		log.Printf("Failed to read auth message: %v", err)
		_ = conn.WriteJSON(event.EventResponse[event.AuthError]{
			Type: event.EventTypeAuthError,
			Data: event.AuthError{Message: "Failed to read auth message"},
		})
		_ = conn.Close()
		return
	}

	if authEvent.Type != event.EventTypeAuth {
		log.Printf("Invalid auth message type: %s", authEvent.Type)
		_ = conn.WriteJSON(event.EventResponse[event.AuthError]{
			Type: event.EventTypeAuthError,
			Data: event.AuthError{Message: "Invalid auth message"},
		})
		_ = conn.Close()
		return
	}

	authRequest := event.AuthRequest{}
	if err := json.Unmarshal(authEvent.Data, &authRequest); err != nil {
		log.Printf("Failed to unmarshal auth data: %v", err)
		_ = conn.WriteJSON(event.EventResponse[event.AuthError]{
			Type: event.EventTypeAuthError,
			Data: event.AuthError{Message: "Invalid auth data"},
		})
		_ = conn.Close()
		return
	}

	claims, err := auth.ValidateToken(authRequest.Token, h.jwtSecret)
	if err != nil {
		log.Printf("Invalid token: %v", err)
		_ = conn.WriteJSON(event.EventResponse[event.AuthError]{
			Type: event.EventTypeAuthError,
			Data: event.AuthError{Message: "Invalid token"},
		})
		_ = conn.Close()
		return
	}

	if err := conn.SetReadDeadline(time.Time{}); err != nil {
		log.Printf("Failed to reset read deadline: %v", err)
		_ = conn.Close()
		return
	}

	if err := conn.WriteJSON(event.EventResponse[event.AuthSuccess]{
		Type: event.EventTypeAuthSuccess,
		Data: event.AuthSuccess{UserID: claims.UserID},
	}); err != nil {
		log.Printf("Failed to send auth success: %v", err)
		_ = conn.Close()
		return
	}

	log.Printf("WebSocket connection established for user: %s", claims.UserID)

	client := hub.NewClient(h.hub, conn, claims.UserID)

	h.hub.Register(client)

	go client.WritePump()
	go client.ReadPump()
}
