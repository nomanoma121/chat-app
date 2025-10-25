package event

import (
	"time"

	"github.com/google/uuid"
)

type MessageUser struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	DisplayID string    `json:"display_id"`
	Bio       string    `json:"bio"`
	IconURL   string    `json:"icon_url"`
	CreatedAt time.Time `json:"created_at"`
}

type MessageCreatedEvent struct {
	ID        uuid.UUID   `json:"id"`
	ChannelID uuid.UUID   `json:"channel_id"`
	SenderID  uuid.UUID   `json:"sender_id"`
	Sender    MessageUser `json:"sender"`
	Content   string      `json:"content"`
	ReplyID   *uuid.UUID  `json:"reply_id"`
	CreatedAt time.Time   `json:"created_at"`
}

func (e MessageCreatedEvent) GetChannelID() uuid.UUID {
	return e.ChannelID
}

type MessageUpdatedEvent struct {
	ID        uuid.UUID `json:"id"`
	ChannelID uuid.UUID `json:"channel_id"`
	Content   string    `json:"content"`
}

func (e MessageUpdatedEvent) GetChannelID() uuid.UUID {
	return e.ChannelID
}

type MessageDeletedEvent struct {
	ID        uuid.UUID `json:"id"`
	ChannelID uuid.UUID `json:"channel_id"`
}

func (e MessageDeletedEvent) GetChannelID() uuid.UUID {
	return e.ChannelID
}
