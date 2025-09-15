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
