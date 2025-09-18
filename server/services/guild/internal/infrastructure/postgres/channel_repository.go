package postgres

import (
	"context"
	"guild-service/internal/domain"
	"guild-service/internal/infrastructure/postgres/gen"
	"github.com/jackc/pgx/v5/pgtype"
)

type channelRepository struct {
	queries *gen.Queries
}

func NewPostgresChannelRepository(queries *gen.Queries) *channelRepository {
	return &channelRepository{
		queries: queries,
	}
}

func (r *channelRepository) Create(ctx context.Context, channel *domain.Channel) (*domain.Channel, error) {
	dbChannel, err := r.queries.CreateChannel(ctx, gen.CreateChannelParams{
		ID:         channel.ID,
		CategoryID: channel.CategoryID,
		Name:       channel.Name,
		CreatedAt:  pgtype.Timestamp{Time: channel.CreatedAt, Valid: true},
	})
	if err != nil {
		return nil, err
	}
	return &domain.Channel{
		ID:         dbChannel.ID,
		CategoryID: dbChannel.CategoryID,
		Name:       dbChannel.Name,
		CreatedAt:  dbChannel.CreatedAt.Time,
	}, nil
}

var _ domain.IChannelRepository = (*channelRepository)(nil)
