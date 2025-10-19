package subscriber

import (
	"context"
	"encoding/json"
	"log"
	"realtime-service/internal/event"
	"realtime-service/internal/hub"

	"github.com/redis/go-redis/v9"
)

type Pattern string

const (
	MessageEventPattern Pattern = "message:*"
)

type Subscriber struct {
	redis   *redis.Client
	hub     *hub.Hub
	pattern Pattern
}

func NewSubscriber(redisClient *redis.Client, hub *hub.Hub, pattern Pattern) *Subscriber {
	return &Subscriber{
		redis:   redisClient,
		hub:     hub,
		pattern: pattern,
	}
}

func (s *Subscriber) Start(ctx context.Context) error {
	pubsub := s.redis.PSubscribe(ctx, string(s.pattern))
	defer pubsub.Close()

	log.Println("Redis subscriber started")

	ch := pubsub.Channel()

	for {
		select {
		case <-ctx.Done():
			log.Println("Redis subscriber stopped")
			return nil
		case msg := <-ch:
			if msg == nil {
				continue
			}
			var evt event.Event
			if err := json.Unmarshal([]byte(msg.Payload), &evt); err != nil {
				log.Printf("Error unmarshaling event: %v", err)
				continue
			}
			s.hub.Broadcast(&evt)
		}
	}
}
