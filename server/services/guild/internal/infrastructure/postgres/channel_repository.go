package postgres

import (
	"context"
	"guild-service/internal/domain/channel"
	"guild-service/internal/infrastructure/postgres/generated"
)

type channelRepository struct {
	queries *generated.Queries
}

func NewPostgresChannelRepository(queries *generated.Queries) *channelRepository {
	return &channelRepository{
		queries: queries,
	}
}

func (r *channelRepository) Create(input *channel.CreateChannelInput) (*channel.Channel, error) {
	dbChannel, err := r.queries.CreateChannel(context.Background(), generated.CreateChannelParams{
		ID:         input.ID,
		CategoryID: input.CategoryID,
		Name:       input.Name,
		Order:      int32(input.Order),
	})
	if err != nil {
		return nil, err
	}
	return &channel.Channel{
		ID:         dbChannel.ID,
		CategoryID: dbChannel.CategoryID,
		Name:       dbChannel.Name,
		Order:      int(dbChannel.Order),
		CreatedAt:  dbChannel.CreatedAt.Time,
		UpdatedAt:  dbChannel.UpdatedAt.Time,
	}, nil
}

var _ channel.IChannelRepository = (*channelRepository)(nil)
