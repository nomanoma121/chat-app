package model

import (
	"time"

	"github.com/google/uuid"
)

type Guild struct {
	ID          uuid.UUID
	OwnerID     uuid.UUID
	Name        string
	Description string
	IconURL     string
	CreatedAt   time.Time
	UpdatedAt   time.Time
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
