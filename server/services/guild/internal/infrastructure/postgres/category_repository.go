package postgres

import (
	"context"

	"guild-service/internal/domain/category"
	"guild-service/internal/infrastructure/postgres/generated"

	"github.com/google/uuid"
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

func (r *categoryRepository) Create(input *category.CreateCategoryInput) (*category.Category, error) {
	dbCategory, err := r.queries.CreateCategory(context.Background(), generated.CreateCategoryParams{
		ID:      uuid.New(),
		GuildID: input.GuildID,
		Name:    input.Name,
		Order:   int32(input.Order),
	})
	if err != nil {
		return nil, err
	}
	return &category.Category{
		ID:        dbCategory.ID,
		GuildID:   dbCategory.GuildID,
		Name:      dbCategory.Name,
		Order:     int(dbCategory.Order),
		CreatedAt: dbCategory.CreatedAt.Time,
		UpdatedAt: dbCategory.UpdatedAt.Time,
	}, nil
}

var _ category.ICategoryRepository = (*categoryRepository)(nil)
