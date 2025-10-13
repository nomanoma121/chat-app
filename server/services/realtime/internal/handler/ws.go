package handler

import (
	"net/http"
	"realtime-service/internal/auth"
	"realtime-service/internal/hub"

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
	tokenString := r.URL.Query().Get("token")
	if tokenString == "" {
		http.Error(w, "Missing token", http.StatusUnauthorized)
		return
	}

	claims, err := auth.ValidateToken(tokenString, h.jwtSecret)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to upgrade to WebSocket", http.StatusInternalServerError)
		return
	}

	client := hub.NewClient(h.hub, conn, claims.UserID)

	h.hub.Register(client)

	go client.WritePump()
	go client.ReadPump()
}
