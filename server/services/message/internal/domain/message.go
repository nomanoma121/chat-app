package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Message struct {
	ID        uuid.UUID `json:"id"`
	ChannelID uuid.UUID `json:"channelId"`
	SenderID  uuid.UUID `json:"senderId"`
	Sender    *User 		`json:"sender"`
	Content   string     `json:"content"`
	ReplyID   *uuid.UUID `json:"replyId"`
	CreatedAt time.Time  `json:"createdAt"`	
}

type IMessageRepository interface {
	Create(ctx context.Context, message *Message) (*Message, error)
	GetByChannelID(ctx context.Context, channelID uuid.UUID) ([]*Message, error)
}
