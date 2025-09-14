package domain

import (
	"time"

	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

var validate = validator.New()

type Guild struct {
	ID          uuid.UUID `validate:"required"`
	OwnerID     uuid.UUID `validate:"required"`
	Name        string    `validate:"required,min=2,max=20"`
	Description string    `validate:"required,max=200"`
	IconURL     string    `validate:"omitempty,url"`
	CreatedAt   time.Time `validate:"required"`
	UpdatedAt   time.Time `validate:"required"`
}

func NewGuild(guild Guild) *Guild {
	return &Guild{
		ID:          guild.ID,
		OwnerID:     guild.OwnerID,
		Name:        guild.Name,
		Description: guild.Description,
		IconURL:     guild.IconURL,
		CreatedAt:   guild.CreatedAt,
		UpdatedAt:   guild.UpdatedAt,
	}
}

type CreateGuildRequest struct {
	ID          uuid.UUID `validate:"required"`
	OwnerID     uuid.UUID `validate:"required"`
	Name        string    `validate:"required,min=2,max=20"`
	Description string    `validate:"required,max=200"`
	IconURL     string    `validate:"omitempty,url"`
}

type UpdateGuildRequest struct {
	ID          uuid.UUID `validate:"required"`
	Name        string    `validate:"required,min=2,max=20"`
	Description string    `validate:"required,max=200"`
	IconURL     string    `validate:"omitempty,url"`
}

func (g *CreateGuildRequest) Validate() error {
	return validate.Struct(g)
}

func (g *UpdateGuildRequest) Validate() error {
	return validate.Struct(g)
}
