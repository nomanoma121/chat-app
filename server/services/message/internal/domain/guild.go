package domain

import (
	"context"

	"github.com/google/uuid"
)

type IGuildService interface {
	CheckChannelAccess(ctx context.Context, userID, channelID uuid.UUID) (bool, error)
}
