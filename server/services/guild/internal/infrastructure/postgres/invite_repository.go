package postgres

import (
	"context"
	"guild-service/internal/domain"
	"guild-service/internal/infrastructure/postgres/gen"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
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
		GuildID:     invite.GuildID,
		CreatorID:   invite.CreatorID,
		InviteCode:  invite.InviteCode,
		MaxUses:     invite.MaxUses,
		CurrentUses: invite.CurrentUses,
		ExpiresAt:   pgtype.Timestamp{Time: invite.ExpiresAt, Valid: true},
		CreatedAt:   pgtype.Timestamp{Time: invite.CreatedAt, Valid: true},
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
		ExpiresAt:   dbInvite.ExpiresAt.Time,
		CreatedAt:   dbInvite.CreatedAt.Time,
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
			ExpiresAt:   dbInvite.ExpiresAt.Time,
			CreatedAt:   dbInvite.CreatedAt.Time,
		}
	}
	return invites, nil
}

func (r *inviteRepository) IncrementUses(ctx context.Context, inviteCode string) error {
	return r.queries.IncrementInviteUses(ctx, inviteCode)
}

var _ domain.IInviteRepository = (*inviteRepository)(nil)
