package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Guild struct {
	ID               uuid.UUID
	OwnerID          uuid.UUID
	Name             string
	Description      string
	IconURL          string
	DefaultChannelID uuid.UUID
	CreatedAt        time.Time
}

type GuildWithMemberCount struct {
	*Guild
	MemberCount int32
}

type GuildOverview struct {
	*Guild
	Categories []*CategoryOverview
}

type IGuildRepository interface {
	Create(ctx context.Context, guild *Guild) (*Guild, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Guild, error)
	GetMyGuilds(ctx context.Context, userID uuid.UUID) ([]*Guild, error)
	Update(ctx context.Context, guild *Guild) (*Guild, error)
}
