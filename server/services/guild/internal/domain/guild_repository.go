package domain

import (
	"context"

	"github.com/google/uuid"
)

type CreateGuildRequest struct {
	ID          uuid.UUID `validate:"required"`
	OwnerID     uuid.UUID `validate:"required"`
	Name        string    `validate:"required,min=2,max=20"`
	Description string    `validate:"required,max=200"`
	IconURL     string    `validate:"required,url"`
}

type UpdateGuildRequest struct {
	ID          uuid.UUID `validate:"required"`
	Name        string    `validate:"required,min=2,max=20"`
	Description string    `validate:"required,max=200"`
	IconURL     string    `validate:"required,url"`
}

type GuildRepository interface {
	Create(ctx context.Context, guild *CreateGuildRequest) (*Guild, error)
	GetGuildByID(ctx context.Context, id uuid.UUID) (*Guild, error)
	Update(ctx context.Context, guild *UpdateGuildRequest) (*Guild, error)
}
