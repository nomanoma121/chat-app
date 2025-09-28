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

type CategoryOverview struct {
	*Category
	Channels []*Channel
}

type ICategoryRepository interface {
	Create(ctx context.Context, category *Category) (*Category, error)
	GetByGuildID(ctx context.Context, guildID uuid.UUID) ([]*Category, error)
	GetGuildIDByCategoryID(ctx context.Context, categoryID uuid.UUID) (uuid.UUID, error)
}
