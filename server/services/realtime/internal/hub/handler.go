package hub

import (
	"encoding/json"
	"errors"
	"log"
	"realtime-service/internal/event"

	"github.com/google/uuid"
)

type EventProcessor interface {
	Process(*Hub, *event.Event) error
}

type ChannelEvent interface {
	GetChannelID() uuid.UUID
}

type MessageEventProcessor[T ChannelEvent] struct{}

func (p MessageEventProcessor[T]) Process(hub *Hub, evt *event.Event) error {
	var e T
	if err := json.Unmarshal(evt.Data, &e); err != nil {
		return err
	}

	channelID := e.GetChannelID()
	hub.broadcastToChannel(channelID, evt)
	return nil
}

type EventHandlerRegistry struct {
	processors map[event.EventType]EventProcessor
}

func NewEventHandlerRegistry() *EventHandlerRegistry {
	registry := &EventHandlerRegistry{
		processors: make(map[event.EventType]EventProcessor),
	}

	registry.registerDefaultHandlers()

	return registry
}

func (r *EventHandlerRegistry) registerDefaultHandlers() {
	r.processors[event.EventTypeMessageCreated] = MessageEventProcessor[event.MessageCreatedEvent]{}
	r.processors[event.EventTypeMessageUpdated] = MessageEventProcessor[event.MessageUpdatedEvent]{}
	r.processors[event.EventTypeMessageDeleted] = MessageEventProcessor[event.MessageDeletedEvent]{}

	log.Printf("Registered %d event processors", len(r.processors))
}

func (r *EventHandlerRegistry) Handle(hub *Hub, evt *event.Event) error {
	processor, ok := r.processors[evt.Type]
	if !ok {
		log.Printf("No processor registered for event type: %s", evt.Type)
		return errors.New("no processor registered for event type: " + string(evt.Type))
	}

	return processor.Process(hub, evt)
}
