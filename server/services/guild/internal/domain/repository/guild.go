package repository

import (
	"context"
	"guild-service/internal/domain/model"

	"github.com/google/uuid"
)

type CreateGuildInput struct {
	ID          uuid.UUID `validate:"required"`
	OwnerID     uuid.UUID `validate:"required"`
	Name        string    `validate:"required,min=2,max=20"`
	Description string    `validate:"required,max=200"`
	IconURL     string    `validate:"required,url"`
}

type UpdateGuildInput struct {
	ID          uuid.UUID `validate:"required"`
	Name        string    `validate:"required,min=2,max=20"`
	Description string    `validate:"required,max=200"`
	IconURL     string    `validate:"required,url"`
}

type GuildRepository interface {
	Create(ctx context.Context, guild *CreateGuildInput) (*model.Guild, error)
	GetGuildByID(ctx context.Context, id uuid.UUID) (*model.Guild, error)
	Update(ctx context.Context, guild *UpdateGuildInput) (*model.Guild, error)
}
