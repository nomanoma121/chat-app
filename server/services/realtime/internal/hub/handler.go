package hub

import (
	"encoding/json"
	"log"
	"realtime-service/internal/event"

	"github.com/google/uuid"
)

type EventHandler func(*event.Event) (uuid.UUID, error)

type EventHandlerRegistry struct {
	handlers map[event.EventType]EventHandler
}

func NewEventHandlerRegistry() *EventHandlerRegistry {
	registry := &EventHandlerRegistry{
		handlers: make(map[event.EventType]EventHandler),
	}

	registry.registerDefaultHandlers()

	return registry
}

func (r *EventHandlerRegistry) registerDefaultHandlers() {
	registerChannelEventHandler[event.MessageCreatedEvent](r, event.EventTypeMessageCreated)
	registerChannelEventHandler[event.MessageUpdatedEvent](r, event.EventTypeMessageUpdated)
	registerChannelEventHandler[event.MessageDeletedEvent](r, event.EventTypeMessageDeleted)
}

func registerChannelEventHandler[T event.ChannelEvent](
	registry *EventHandlerRegistry,
	eventType event.EventType,
) {
	registry.Register(eventType, func(evt *event.Event) (uuid.UUID, error) {
		var e T
		if err := json.Unmarshal(evt.Data, &e); err != nil {
			return uuid.Nil, err
		}
		return e.GetChannelID(), nil
	})
}

func (r *EventHandlerRegistry) Register(eventType event.EventType, handler EventHandler) {
	r.handlers[eventType] = handler
	log.Printf("Registered handler for event type: %s", eventType)
}

func (r *EventHandlerRegistry) Handle(evt *event.Event) (uuid.UUID, error) {
	handler, ok := r.handlers[evt.Type]
	if !ok {
		log.Printf("No handler registered for event type: %s", evt.Type)
		return uuid.Nil, nil
	}

	return handler(evt)
}

func (r *EventHandlerRegistry) HasHandler(eventType event.EventType) bool {
	_, ok := r.handlers[eventType]
	return ok
}
