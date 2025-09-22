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
	Bio       string
	IconURL   string
	CreatedAt time.Time
}

type CreateUserParams struct {
	ID        uuid.UUID
	DisplayId string
	Name      string
	Email     string
	Password  string
	Bio       string
	IconURL   string
	CreatedAt time.Time
}

type GetPasswordByEmailParams struct {
	ID           uuid.UUID
	PasswordHash string
}

type UserRepository interface {
	Create(ctx context.Context, params *CreateUserParams) (*User, error)
	GetPasswordByEmail(ctx context.Context, email string) (*GetPasswordByEmailParams, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (*User, error)
	ExistsByEmail(ctx context.Context, email string) (bool, error)
	ExistsByDisplayId(ctx context.Context, displayId string) (bool, error)
	Update(ctx context.Context, user *User) (*User, error)
}
