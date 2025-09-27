package postgres

import (
	"context"
	"guild-service/internal/domain"
	"guild-service/internal/infrastructure/postgres/gen"

	"github.com/google/uuid"
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
		CreatedAt:  channel.CreatedAt,
	})
	if err != nil {
		return nil, err
	}
	return &domain.Channel{
		ID:         dbChannel.ID,
		CategoryID: dbChannel.CategoryID,
		Name:       dbChannel.Name,
		CreatedAt:  dbChannel.CreatedAt,
	}, nil
}

func (r *channelRepository) GetByCategoryID(ctx context.Context, categoryID uuid.UUID) ([]*domain.Channel, error) {
	dbChannels, err := r.queries.GetByCategoryID(ctx, categoryID)
	if err != nil {
		return nil, err
	}
	channels := make([]*domain.Channel, len(dbChannels))
	for i, dbChannel := range dbChannels {
		channels[i] = &domain.Channel{
			ID:         dbChannel.ID,
			CategoryID: dbChannel.CategoryID,
			Name:       dbChannel.Name,
			CreatedAt:  dbChannel.CreatedAt,
		}
	}
	return channels, nil
}

var _ domain.IChannelRepository = (*channelRepository)(nil)
