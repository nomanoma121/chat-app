package handler

import (
	"net/http"
	"realtime-service/internal/hub"

	"github.com/google/uuid"
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
	hub *hub.Hub
}

func NewWebSocketHandler(hub *hub.Hub, jwtSecret string) *WebSocketHandler {
	return &WebSocketHandler{
		hub: hub,
	}
}

func (h *WebSocketHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to upgrade to WebSocket", http.StatusInternalServerError)
		return
	}

	userIdStr := r.Header.Get("X-User-ID")
	if userIdStr == "" {
		http.Error(w, "Missing X-User-ID header", http.StatusBadRequest)
		conn.Close()
		return
	}

	userId, err := uuid.Parse(userIdStr)
	if err != nil {
		http.Error(w, "Invalid X-User-ID header", http.StatusBadRequest)
		conn.Close()
		return
	}

	client := hub.NewClient(h.hub, conn, userId)

	h.hub.Register(client)

	go client.WritePump()
	go client.ReadPump()
}
