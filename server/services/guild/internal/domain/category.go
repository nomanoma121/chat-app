package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

const (
	DefaultCategoryName = "一般"
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
