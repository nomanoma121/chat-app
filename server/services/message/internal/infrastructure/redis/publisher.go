package redis

import (
	"context"
	"encoding/json"
	"message-service/internal/domain"

	"github.com/redis/go-redis/v9"
)

const (
	RedisChannelMessagePrefix = "message"
)

type RedisPublisher struct {
	client redis.Client
}

func NewRedisPublisher(client redis.Client) *RedisPublisher {
	return &RedisPublisher{
		client: client,
	}
}

func (p *RedisPublisher) Publish(ctx context.Context, message *domain.Message) error {
	messageJson, err := json.Marshal(message)
	if err != nil {
		return err
	}

	redisChannel := RedisChannelMessagePrefix + ":" + message.ChannelID.String()
	return p.client.Publish(ctx, redisChannel, messageJson).Err()
}

var _ domain.IPublisher = (*RedisPublisher)(nil)
