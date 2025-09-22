package domain

import (
	"time"

	"github.com/google/uuid"
)

type Message struct {
	ID        uuid.UUID
	ChannelID uuid.UUID
	SenderID  uuid.UUID
	Content   string
	ReplyID   *uuid.UUID
	CreatedAt time.Time
}
