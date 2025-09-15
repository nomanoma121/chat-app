package category

import (
	"github.com/google/uuid"
)

type CategoryInput struct {
	GuildID uuid.UUID
	Name    string
	Order   int
}

type ICategoryRepository interface {
	Create(category *CategoryInput) (*Category, error)
}
