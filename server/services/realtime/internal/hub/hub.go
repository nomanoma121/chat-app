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
	register      chan *Client
	unregister    chan *Client
	broadcast     chan *event.Event
}

func NewHub() *Hub {
	return &Hub{
		clients:       make(map[uuid.UUID]*Client),
		subscriptions: NewSubscriptionManager(),
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
	switch evt.Type {
	case event.EventTypeMessageCreated, event.EventTypeMessageUpdated, event.EventTypeMessageDeleted:
		h.broadcastMessageEvent(evt)
	default:
		log.Printf("Unhandled event type: %s", evt.Type)
	}
}

func (h *Hub) broadcastMessageEvent(evt *event.Event) {
	var channelID uuid.UUID

	switch evt.Type {
	case event.EventTypeMessageCreated:
		var msgEvent event.MessageCreatedEvent
		if err := json.Unmarshal(evt.Data, &msgEvent); err != nil {
			log.Printf("Error unmarshaling message created event: %v", err)
			return
		}
		channelID = msgEvent.ChannelID
	case event.EventTypeMessageUpdated:
		var msgEvent event.MessageUpdatedEvent
		if err := json.Unmarshal(evt.Data, &msgEvent); err != nil {
			log.Printf("Error unmarshaling message updated event: %v", err)
			return
		}
		channelID = msgEvent.ChannelID
	case event.EventTypeMessageDeleted:
		var msgEvent event.MessageDeletedEvent
		if err := json.Unmarshal(evt.Data, &msgEvent); err != nil {
			log.Printf("Error unmarshaling message deleted event: %v", err)
			return
		}
		channelID = msgEvent.ChannelID
	default:
		log.Printf("Unhandled message event type: %s", evt.Type)
		return
	}
	message, err := json.Marshal(evt)
	if err != nil {
		log.Printf("Error marshaling event: %v", err)
		return
	}

	subscribers := h.subscriptions.GetSubscribers(channelID.String())
	for client := range subscribers {
		select {
		case client.send <- message:
		default:
			close(client.send)

			delete(h.clients, client.userID)
			h.subscriptions.UnsubscribeAll(client)
		}
	}
	log.Printf("Broadcasted event %s to channel %s", evt.Type, channelID)
}

func (h *Hub) SubscribeClientToChannel(client *Client, channelID string) {
	h.subscriptions.SubscribeChannel(client, channelID)
	log.Printf("Client %s subscribed to channel %s", client.userID, channelID)
}

func (h *Hub) Broadcast(evt *event.Event) {
	h.broadcast <- evt
}

func (h *Hub) Register(client *Client) {
	h.register <- client
}
