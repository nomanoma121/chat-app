package postgres

import (
	"context"
	"guild-service/internal/domain"
	"guild-service/internal/infrastructure/postgres/gen"

	"github.com/google/uuid"
)

type inviteRepository struct {
	queries *gen.Queries
}

func NewPostgresInviteRepository(queries *gen.Queries) *inviteRepository {
	return &inviteRepository{
		queries: queries,
	}
}

func (r *inviteRepository) Create(ctx context.Context, invite *domain.Invite) (*domain.Invite, error) {

	return &domain.Invite{}, nil
}

func (r *inviteRepository) GetByGuildID(ctx context.Context, guildID uuid.UUID) ([]*domain.Invite, error) {
	return []*domain.Invite{}, nil
}

func (r *inviteRepository) IncrementUses(ctx context.Context, inviteCode string) error {
	return nil
}

var _ domain.IInviteRepository = (*inviteRepository)(nil)
