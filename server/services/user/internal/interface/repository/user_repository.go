package repository

import (
	"context"
	"user-service/internal/domain"

	"github.com/google/uuid"
)

type CreateUserResponse struct {
	ID        uuid.UUID
	CreatedAt int64
}

type UserRepository interface {
	Create(ctx context.Context, user *domain.User) (CreateUserResponse, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
	ExistsByEmail(ctx context.Context, email string) (bool, error)
	ExistsByDisplayId(ctx context.Context, displayId string) (bool, error)
	Update(ctx context.Context, user *domain.User) error
}
