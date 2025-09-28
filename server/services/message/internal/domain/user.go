package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID
	DisplayId string
	Name      string
	Bio       string
	IconURL   string
	CreatedAt time.Time
}

type IUserService interface {
	GetUsersByIDs(ctx context.Context, ids []uuid.UUID) ([]*User, error)
}
