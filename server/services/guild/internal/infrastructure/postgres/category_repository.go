package postgres

import (
	"context"
	"guild-service/internal/domain"
	"guild-service/internal/infrastructure/postgres/gen"
	"github.com/jackc/pgx/v5/pgtype"
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
		CreatedAt: pgtype.Timestamp{Time: category.CreatedAt, Valid: true},
	})
	if err != nil {
		return nil, err
	}
	return &domain.Category{
		ID:        dbCategory.ID,
		GuildID:   dbCategory.GuildID,
		Name:      dbCategory.Name,
		CreatedAt: dbCategory.CreatedAt.Time,
	}, nil
}

var _ domain.ICategoryRepository = (*categoryRepository)(nil)
