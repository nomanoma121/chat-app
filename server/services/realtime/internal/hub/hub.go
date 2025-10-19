package hub

import (
	"encoding/json"
	"log"
	"realtime-service/internal/event"

	"github.com/google/uuid"
)

type Hub struct {
	clients       map[uuid.UUID]*Client
	subscriptions *SubscriptionManager
	handlers      *EventHandlerRegistry
	register      chan *Client
	unregister    chan *Client
	broadcast     chan *event.Event
}

func NewHub() *Hub {
	return &Hub{
		clients:       make(map[uuid.UUID]*Client),
		subscriptions: NewSubscriptionManager(),
		handlers:      NewEventHandlerRegistry(),
		register:      make(chan *Client),
		unregister:    make(chan *Client),
		broadcast:     make(chan *event.Event),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client.userID] = client
			log.Printf("Client registered: %s", client.userID)
		case client := <-h.unregister:
			if _, ok := h.clients[client.userID]; ok {
				delete(h.clients, client.userID)
				h.subscriptions.UnsubscribeAll(client)
				close(client.send)
				log.Printf("Client unregistered: %s", client.userID)
			}
		case event := <-h.broadcast:
			h.handleEvent(event)
		}
	}
}

func (h *Hub) handleEvent(evt *event.Event) {
	channelID, err := h.handlers.Handle(evt)
	if err != nil {
		log.Printf("Error handling event %s: %v", evt.Type, err)
		return
	}

	if channelID == uuid.Nil {
		log.Printf("No channel ID found for event type: %s", evt.Type)
		return
	}

	h.broadcastToChannel(channelID, evt)
}

func (h *Hub) broadcastToChannel(channelID uuid.UUID, evt *event.Event) {
	message, err := json.Marshal(evt)
	if err != nil {
		log.Printf("Error marshaling event: %v", err)
		return
	}

	subscribers := h.subscriptions.GetSubscribers(channelID)
	if len(subscribers) == 0 {
		log.Printf("No subscribers for channel %s", channelID)
		return
	}

	for client := range subscribers {
		select {
		case client.send <- message:
		default:
			close(client.send)
			delete(h.clients, client.userID)
			h.subscriptions.UnsubscribeAll(client)
			log.Printf("Failed to send to client %s, cleaned up", client.userID)
		}
	}

	log.Printf("Broadcasted event %s to %d subscribers in channel %s", evt.Type, len(subscribers), channelID)
}

func (h *Hub) SubscribeClientToChannel(client *Client, channelID uuid.UUID) {
	h.subscriptions.SubscribeChannel(client, channelID)
	log.Printf("Client %s subscribed to channel %s", client.userID, channelID)
}

func (h *Hub) Broadcast(evt *event.Event) {
	h.broadcast <- evt
}

func (h *Hub) Register(client *Client) {
	h.register <- client
}
