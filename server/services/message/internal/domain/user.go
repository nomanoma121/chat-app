package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `json:"id"`
	DisplayId string    `json:"displayId"`
	Name      string    `json:"name"`
	Bio       string    `json:"bio"`
	IconURL   string    `json:"iconUrl"`
	CreatedAt time.Time `json:"createdAt"`
}

type IUserService interface {
	GetUserByID(ctx context.Context, id uuid.UUID) (*User, error)
	GetUsersByIDs(ctx context.Context, ids []uuid.UUID) ([]*User, error)
}
