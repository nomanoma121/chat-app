package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type PublishUser struct {
	ID        uuid.UUID `json:"id"`
	DisplayId string    `json:"display_id"`
	Name      string    `json:"name"`
	Bio       string    `json:"bio"`
	IconURL   string    `json:"icon_url"`
	CreatedAt time.Time `json:"created_at"`
}

type PublishMessage struct {
	ID        uuid.UUID    `json:"id"`
	ChannelID uuid.UUID    `json:"channel_id"`
	SenderID  uuid.UUID    `json:"sender_id"`
	Sender    *PublishUser `json:"sender"`
	Content   string       `json:"content"`
	ReplyID   *uuid.UUID   `json:"reply_id"`
	CreatedAt time.Time    `json:"created_at"`
}

type IPublisher interface {
	Publish(ctx context.Context, message PublishMessage) error
}
