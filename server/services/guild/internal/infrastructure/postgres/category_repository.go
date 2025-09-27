package postgres

import (
	"context"
	"guild-service/internal/domain"
	"guild-service/internal/infrastructure/postgres/gen"

	"github.com/google/uuid"
)

type categoryRepository struct {
	queries *gen.Queries
}

func NewPostgresCategoryRepository(queries *gen.Queries) *categoryRepository {
	return &categoryRepository{
		queries: queries,
	}
}

func (r *categoryRepository) Create(ctx context.Context, category *domain.Category) (*domain.Category, error) {
	dbCategory, err := r.queries.CreateCategory(ctx, gen.CreateCategoryParams{
		ID:        category.ID,
		GuildID:   category.GuildID,
		Name:      category.Name,
		CreatedAt: category.CreatedAt,
	})
	if err != nil {
		return nil, err
	}
	return &domain.Category{
		ID:        dbCategory.ID,
		GuildID:   dbCategory.GuildID,
		Name:      dbCategory.Name,
		CreatedAt: dbCategory.CreatedAt,
	}, nil
}

func (r *categoryRepository) GetByGuildID(ctx context.Context, guildID uuid.UUID) ([]*domain.Category, error) {
	dbCategories, err := r.queries.GetByGuildID(ctx, guildID)
	if err != nil {
		return nil, err
	}
	categories := make([]*domain.Category, len(dbCategories))
	for i, dbCategory := range dbCategories {
		categories[i] = &domain.Category{
			ID:        dbCategory.ID,
			GuildID:   dbCategory.GuildID,
			Name:      dbCategory.Name,
			CreatedAt: dbCategory.CreatedAt,
		}
	}
	return categories, nil
}

var _ domain.ICategoryRepository = (*categoryRepository)(nil)
