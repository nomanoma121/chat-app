package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

var DefaultChannelName = "general"

type Channel struct {
	ID         uuid.UUID
	CategoryID uuid.UUID
	Name       string
	CreatedAt  time.Time
}

type IChannelRepository interface {
	Create(ctx context.Context, channel *Channel) (*Channel, error)
	GetByCategoryID(ctx context.Context, categoryID uuid.UUID) ([]*Channel, error)
	CheckChannelMember(ctx context.Context, userID, channelID uuid.UUID) (bool, error)
}
