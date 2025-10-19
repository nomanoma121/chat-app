package redis

import (
	"context"
	"encoding/json"
	"message-service/internal/domain"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	RedisChannelMessagePrefix = "message"
	EventTypeMessageCreate     = "MESSAGE_CREATE"
)

type Event struct {
	Type      string          `json:"type"`
	Timestamp time.Time       `json:"timestamp"`
	Data      json.RawMessage `json:"data"`
}

type RedisPublisher struct {
	client *redis.Client
}

func NewRedisPublisher(client *redis.Client) *RedisPublisher {
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
	
	payload := Event{
		Type:      EventTypeMessageCreate,
		Timestamp: time.Now(),
		Data:      messageJson,
	}
	payloadJson, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	return p.client.Publish(ctx, redisChannel, payloadJson).Err()
}

var _ domain.IPublisher = (*RedisPublisher)(nil)
