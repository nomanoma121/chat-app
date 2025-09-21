package postgres

import (
	"context"
	"guild-service/internal/domain"
	"guild-service/internal/infrastructure/postgres/gen"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type guildRepository struct {
	queries *gen.Queries
}

func NewPostgresGuildRepository(queries *gen.Queries) *guildRepository {
	return &guildRepository{
		queries: queries,
	}
}

func (r *guildRepository) Create(ctx context.Context, guild *domain.Guild) (*domain.Guild, error) {
	dbGuild, err := r.queries.CreateGuild(ctx, gen.CreateGuildParams{
		ID:               guild.ID,
		OwnerID:          guild.OwnerID,
		Name:             guild.Name,
		Description:      guild.Description,
		IconUrl:          guild.IconURL,
		DefaultChannelID: guild.DefaultChannelID,
		CreatedAt:        pgtype.Timestamp{Time: guild.CreatedAt, Valid: true},
	})
	if err != nil {
		return nil, err
	}
	return &domain.Guild{
		ID:               dbGuild.ID,
		OwnerID:          dbGuild.OwnerID,
		Name:             dbGuild.Name,
		Description:      dbGuild.Description,
		IconURL:          dbGuild.IconUrl,
		DefaultChannelID: dbGuild.DefaultChannelID,
		CreatedAt:        dbGuild.CreatedAt.Time,
	}, nil
}

func (r *guildRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Guild, error) {
	dbGuild, err := r.queries.GetGuildByID(ctx, id)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, domain.ErrGuildNotFound
		}
		return nil, err
	}
	return &domain.Guild{
		ID:          dbGuild.ID,
		OwnerID:     dbGuild.OwnerID,
		Name:        dbGuild.Name,
		Description: dbGuild.Description,
		IconURL:     dbGuild.IconUrl,
		DefaultChannelID: dbGuild.DefaultChannelID,
		CreatedAt:   dbGuild.CreatedAt.Time,
	}, nil
}

func (r *guildRepository) GetMyGuilds(ctx context.Context, userID uuid.UUID) ([]*domain.Guild, error) {
	dbGuilds, err := r.queries.GetMyGuilds(ctx, userID)
	if err != nil {
		return nil, err
	}
	
	guilds := make([]*domain.Guild, len(dbGuilds))
	for i, dbGuild := range dbGuilds {
		guilds[i] = &domain.Guild{
			ID:               dbGuild.ID,
			OwnerID:          dbGuild.OwnerID,
			Name:             dbGuild.Name,
			Description:      dbGuild.Description,
			IconURL:          dbGuild.IconUrl,
			DefaultChannelID: dbGuild.DefaultChannelID,
			CreatedAt:        dbGuild.CreatedAt.Time,
		}
	}
	return guilds, nil
}

func (r *guildRepository) Update(ctx context.Context, guild *domain.Guild) (*domain.Guild, error) {
	dbGuild, err := r.queries.UpdateGuild(ctx, gen.UpdateGuildParams{
		ID:               guild.ID,
		Name:             guild.Name,
		Description:      guild.Description,
		IconUrl:          guild.IconURL,
		DefaultChannelID: guild.DefaultChannelID,
	})
	if err != nil {
		return nil, err
	}
	return &domain.Guild{
		ID:          dbGuild.ID,
		OwnerID:     dbGuild.OwnerID,
		Name:        dbGuild.Name,
		Description: dbGuild.Description,
		IconURL:     dbGuild.IconUrl,
		DefaultChannelID: dbGuild.DefaultChannelID,
		CreatedAt:   dbGuild.CreatedAt.Time,
	}, nil
}

var _ domain.IGuildRepository = (*guildRepository)(nil)
