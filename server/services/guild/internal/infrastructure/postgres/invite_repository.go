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
	dbInvite, err := r.queries.CreateGuildInvite(ctx, gen.CreateGuildInviteParams{
		InviteCode:  invite.InviteCode,
		GuildID:     invite.GuildID,
		CreatorID:   invite.CreatorID,
		MaxUses:     invite.MaxUses,
		CurrentUses: invite.CurrentUses,
		ExpiresAt:   invite.ExpiresAt,
		CreatedAt:   invite.CreatedAt,
	})
	if err != nil {
		return nil, err
	}

	return &domain.Invite{
		GuildID:     dbInvite.GuildID,
		CreatorID:   dbInvite.CreatorID,
		InviteCode:  dbInvite.InviteCode,
		MaxUses:     dbInvite.MaxUses,
		CurrentUses: dbInvite.CurrentUses,
		ExpiresAt:   dbInvite.ExpiresAt,
		CreatedAt:   dbInvite.CreatedAt,
	}, nil
}

func (r *inviteRepository) GetByGuildID(ctx context.Context, guildID uuid.UUID) ([]*domain.Invite, error) {
	dbInvites, err := r.queries.GetGuildInvitesByGuildID(ctx, guildID)
	if err != nil {
		return nil, err
	}
	invites := make([]*domain.Invite, len(dbInvites))
	for i, dbInvite := range dbInvites {
		invites[i] = &domain.Invite{
			GuildID:     dbInvite.GuildID,
			CreatorID:   dbInvite.CreatorID,
			InviteCode:  dbInvite.InviteCode,
			MaxUses:     dbInvite.MaxUses,
			CurrentUses: dbInvite.CurrentUses,
			ExpiresAt:   dbInvite.ExpiresAt,
			CreatedAt:   dbInvite.CreatedAt,
		}
	}
	return invites, nil
}

func (r *inviteRepository) IncrementUses(ctx context.Context, inviteCode string) (*domain.Invite, error) {
	dbInvite, err := r.queries.IncrementInviteUses(ctx, inviteCode)
	if err != nil {
		return nil, err
	}
	return &domain.Invite{
		GuildID:     dbInvite.GuildID,
		CreatorID:   dbInvite.CreatorID,
		InviteCode:  dbInvite.InviteCode,
		MaxUses:     dbInvite.MaxUses,
		CurrentUses: dbInvite.CurrentUses,
		ExpiresAt:   dbInvite.ExpiresAt,
		CreatedAt:   dbInvite.CreatedAt,
	}, nil
}

var _ domain.IInviteRepository = (*inviteRepository)(nil)
