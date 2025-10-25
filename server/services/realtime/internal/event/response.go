package event

import (
	"time"

	"github.com/google/uuid"
)

// TODO: 今後可能ならスネークケースにしたい(OpenAPIをスネークケースで生成したい)
type MessageUser struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	DisplayID string    `json:"displayId"`
	Bio       string    `json:"bio"`
	IconURL   string    `json:"iconUrl"`
	CreatedAt time.Time `json:"createdAt"`
}

type MessageCreatedEvent struct {
	ID        uuid.UUID   `json:"id"`
	ChannelID uuid.UUID   `json:"channelId"`
	SenderID  uuid.UUID   `json:"senderId"`
	Sender    MessageUser `json:"sender"`
	Content   string      `json:"content"`
	ReplyID   *uuid.UUID  `json:"replyId"`
	CreatedAt time.Time   `json:"createdAt"`
}

func (e MessageCreatedEvent) GetChannelID() uuid.UUID {
	return e.ChannelID
}

type MessageUpdatedEvent struct {
	ID        uuid.UUID `json:"id"`
	ChannelID uuid.UUID `json:"channelId"`
	Content   string    `json:"content"`
}

func (e MessageUpdatedEvent) GetChannelID() uuid.UUID {
	return e.ChannelID
}

type MessageDeletedEvent struct {
	ID        uuid.UUID `json:"id"`
	ChannelID uuid.UUID `json:"channelId"`
}

func (e MessageDeletedEvent) GetChannelID() uuid.UUID {
	return e.ChannelID
}
