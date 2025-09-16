package postgres

import (
	"context"

	"guild-service/internal/domain"
	"guild-service/internal/infrastructure/postgres/generated"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type categoryRepository struct {
	queries *generated.Queries
	db      *pgxpool.Pool
}

func NewPostgresCategoryRepository(queries *generated.Queries, db *pgxpool.Pool) *categoryRepository {
	return &categoryRepository{
		queries: queries,
		db:      db,
	}
}

func (r *categoryRepository) Create(ctx context.Context, category *domain.Category) (*domain.Category, error) {
	dbCategory, err := r.queries.CreateCategory(ctx, generated.CreateCategoryParams{
		ID:      category.ID,
		GuildID: category.GuildID,
		Name:    category.Name,
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
