package postgres

import (
	"context"

	"guild-service/internal/domain"
	"guild-service/internal/domain/model"
	"guild-service/internal/domain/repository"
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

func (r *guildRepository) Create(ctx context.Context, guild *repository.CreateGuildInput) (*model.Guild, error) {
	dbGuild, err := r.queries.CreateGuild(ctx, generated.CreateGuildParams{
		ID:          guild.ID,
		OwnerID:     guild.OwnerID,
		Name:        guild.Name,
		Description: guild.Description,
		IconUrl:     guild.IconURL,
	})
	if err != nil {
		return nil, err
	}
	return &model.Guild{
		ID:          dbGuild.ID,
		OwnerID:     dbGuild.OwnerID,
		Name:        dbGuild.Name,
		Description: dbGuild.Description,
		IconURL:     dbGuild.IconUrl,
		CreatedAt:   dbGuild.CreatedAt.Time,
		UpdatedAt:   dbGuild.UpdatedAt.Time,
	}, nil
}

func (r *guildRepository) GetGuildByID(ctx context.Context, id uuid.UUID) (*model.Guild, error) {
	dbGuild, err := r.queries.GetGuildByID(ctx, id)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, domain.ErrGuildNotFound
		}
		return nil, err
	}
	return &model.Guild{
		ID:          dbGuild.ID,
		OwnerID:     dbGuild.OwnerID,
		Name:        dbGuild.Name,
		Description: dbGuild.Description,
		IconURL:     dbGuild.IconUrl,
		CreatedAt:   dbGuild.CreatedAt.Time,
		UpdatedAt:   dbGuild.UpdatedAt.Time,
	}, nil
}

func (r *guildRepository) Update(ctx context.Context, guild *repository.UpdateGuildInput) (*model.Guild, error) {
	dbGuild, err := r.queries.UpdateGuild(ctx, generated.UpdateGuildParams{
		ID:          guild.ID,
		Name:        guild.Name,
		Description: guild.Description,
		IconUrl:     guild.IconURL,
	})
	if err != nil {
		return nil, err
	}
	return &model.Guild{
		ID:          dbGuild.ID,
		OwnerID:     dbGuild.OwnerID,
		Name:        dbGuild.Name,
		Description: dbGuild.Description,
		IconURL:     dbGuild.IconUrl,
		CreatedAt:   dbGuild.CreatedAt.Time,
		UpdatedAt:   dbGuild.UpdatedAt.Time,
	}, nil
}

var _ repository.GuildRepository = (*guildRepository)(nil)
