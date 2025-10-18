package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Message struct {
	ID        uuid.UUID `json:"id"`
	ChannelID uuid.UUID `json:"channel_id"`
	SenderID  uuid.UUID `json:"sender_id"`
	Sender    *User 		`json:"sender"`
	Content   string     `json:"content"`
	ReplyID   *uuid.UUID `json:"reply_id"`
	CreatedAt time.Time  `json:"created_at"`	
}

type IMessageRepository interface {
	Create(ctx context.Context, message *Message) (*Message, error)
	GetByChannelID(ctx context.Context, channelID uuid.UUID) ([]*Message, error)
}
