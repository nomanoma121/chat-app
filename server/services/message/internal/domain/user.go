package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `json:"id"`
	DisplayId string    `json:"display_id"`
	Name      string    `json:"name"`
	Bio       string    `json:"bio"`
	IconURL   string    `json:"icon_url"`
	CreatedAt time.Time `json:"created_at"`
}

type IUserService interface {
	GetUsersByIDs(ctx context.Context, ids []uuid.UUID) ([]*User, error)
}
