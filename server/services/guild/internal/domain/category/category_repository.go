package category

import (
	"github.com/google/uuid"
)

type CreateCategoryInput struct {
	GuildID uuid.UUID
	Name    string
	Order   int
}

type ICategoryRepository interface {
	Create(category *CreateCategoryInput) (*Category, error)
}
