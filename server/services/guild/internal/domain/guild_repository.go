package domain

import (
	"context"

	"github.com/google/uuid"
)

type GuildRepository interface {
	Create(ctx context.Context, guild *CreateGuildRequest) (*Guild, error)
	GetGuildByID(ctx context.Context, id uuid.UUID) (*Guild, error)
	Update(ctx context.Context, guild *UpdateGuildRequest) (*Guild, error)
}
