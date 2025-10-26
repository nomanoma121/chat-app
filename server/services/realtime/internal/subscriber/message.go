package subscriber

import (
	"realtime-service/internal/hub"

	"github.com/redis/go-redis/v9"
)

func NewMessageSubscriber(redisClient *redis.Client, hub *hub.Hub) *Subscriber {
	return NewSubscriber(redisClient, hub, MessageEventPattern)
}
