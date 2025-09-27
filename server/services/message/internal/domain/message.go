package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Message struct {
	ID        uuid.UUID
	ChannelID uuid.UUID
	SenderID  uuid.UUID
	Sender    *User
	Content   string
	ReplyID   *uuid.UUID
	CreatedAt time.Time
}

type IMessageRepository interface {
	Create(ctx context.Context, message *Message) (*Message, error)
	GetByChannelID(ctx context.Context, channelID uuid.UUID) ([]*Message, error)
}
