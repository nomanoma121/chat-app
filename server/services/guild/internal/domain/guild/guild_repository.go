package guild

import (
	"context"

	"github.com/google/uuid"
)

type CreateGuildInput struct {
	ID          uuid.UUID
	OwnerID     uuid.UUID
	Name        string
	Description string
	IconURL     string
}

type UpdateGuildInput struct {
	ID          uuid.UUID
	Name        string
	Description string
	IconURL     string
}

type IGuildRepository interface {
	Create(ctx context.Context, guild *CreateGuildInput) (*Guild, error)
	GetGuildByID(ctx context.Context, id uuid.UUID) (*Guild, error)
	Update(ctx context.Context, guild *UpdateGuildInput) (*Guild, error)
}
