package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Category struct {
	ID        uuid.UUID
	GuildID   uuid.UUID
	Name      string
	CreatedAt time.Time
}

type ICategoryRepository interface {
	Create(ctx context.Context, category *Category) (*Category, error)
}
