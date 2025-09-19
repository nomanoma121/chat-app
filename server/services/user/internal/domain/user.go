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
	Email     string
	Password  string
	Bio       string
	IconURL   string
	CreatedAt time.Time
}

type UserRepository interface {
	Create(ctx context.Context, user *User) (*User, error)
	FindByEmail(ctx context.Context, email string) (*User, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (*User, error)
	ExistsByEmail(ctx context.Context, email string) (bool, error)
	ExistsByDisplayId(ctx context.Context, displayId string) (bool, error)
	Update(ctx context.Context, user *User) (*User, error)
}
