package postgres

import (
	"context"

	"guild-service/internal/domain"
	"guild-service/internal/domain/guild"
	"guild-service/internal/infrastructure/postgres/generated"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type guildRepository struct {
	queries *generated.Queries
}

func NewPostgresGuildRepository(queries *generated.Queries) *guildRepository {
	return &guildRepository{
		queries: queries,
	}
}

func (r *guildRepository) Create(ctx context.Context, input *guild.CreateGuildInput) (*guild.Guild, error) {
	dbGuild, err := r.queries.CreateGuild(ctx, generated.CreateGuildParams{
		ID:          input.ID,
		OwnerID:     input.OwnerID,
		Name:        input.Name,
		Description: input.Description,
		IconUrl:     input.IconURL,
	})
	if err != nil {
		return nil, err
	}
	return &guild.Guild{
		ID:          dbGuild.ID,
		OwnerID:     dbGuild.OwnerID,
		Name:        dbGuild.Name,
		Description: dbGuild.Description,
		IconURL:     dbGuild.IconUrl,
		CreatedAt:   dbGuild.CreatedAt.Time,
		UpdatedAt:   dbGuild.UpdatedAt.Time,
	}, nil
}

func (r *guildRepository) GetGuildByID(ctx context.Context, id uuid.UUID) (*guild.Guild, error) {
	dbGuild, err := r.queries.GetGuildByID(ctx, id)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, domain.ErrGuildNotFound
		}
		return nil, err
	}
	return &guild.Guild{
		ID:          dbGuild.ID,
		OwnerID:     dbGuild.OwnerID,
		Name:        dbGuild.Name,
		Description: dbGuild.Description,
		IconURL:     dbGuild.IconUrl,
		CreatedAt:   dbGuild.CreatedAt.Time,
		UpdatedAt:   dbGuild.UpdatedAt.Time,
	}, nil
}

func (r *guildRepository) Update(ctx context.Context, input *guild.UpdateGuildInput) (*guild.Guild, error) {
	dbGuild, err := r.queries.UpdateGuild(ctx, generated.UpdateGuildParams{
		ID:          input.ID,
		Name:        input.Name,
		Description: input.Description,
		IconUrl:     input.IconURL,
	})
	if err != nil {
		return nil, err
	}
	return &guild.Guild{
		ID:          dbGuild.ID,
		OwnerID:     dbGuild.OwnerID,
		Name:        dbGuild.Name,
		Description: dbGuild.Description,
		IconURL:     dbGuild.IconUrl,
		CreatedAt:   dbGuild.CreatedAt.Time,
		UpdatedAt:   dbGuild.UpdatedAt.Time,
	}, nil
}

var _ guild.IGuildRepository = (*guildRepository)(nil)
