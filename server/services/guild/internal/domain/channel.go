package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Channel struct {
	ID         uuid.UUID
	CategoryID uuid.UUID
	Name       string
	CreatedAt  time.Time
}

type IChannelRepository interface {
	Create(ctx context.Context, channel *Channel) (*Channel, error)
}
