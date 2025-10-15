package redis

import (
	"message-service/internal/domain"

	"github.com/redis/go-redis/v9"
)

type RedisPublisher struct {
	client redis.Client
}

func NewRedisPublisher(client redis.Client) *RedisPublisher {
	return &RedisPublisher{
		client: client,
	}
}

func (p *RedisPublisher) Publish(channel string, message interface{}) error {
	return nil
}

var _ domain.IPublisher = (*RedisPublisher)(nil)
