package postgres

import (
	"context"
	"guild-service/internal/domain"
	"guild-service/internal/infrastructure/postgres/gen"

	"github.com/google/uuid"
)

type memberRepository struct {
	queries *gen.Queries
}

func NewPostgresMemberRepository(queries *gen.Queries) *memberRepository {
	return &memberRepository{
		queries: queries,
	}
}

func (r *memberRepository) Add(ctx context.Context, member *domain.Member) (*domain.Member, error) {
	dbMember, err := r.queries.AddMember(ctx, gen.AddMemberParams{
		GuildID:  member.GuildID,
		UserID:   member.UserID,
		JoinedAt: member.JoinedAt,
	})
	if err != nil {
		return nil, err
	}
	return &domain.Member{
		GuildID:  dbMember.GuildID,
		UserID:   dbMember.UserID,
		JoinedAt: dbMember.JoinedAt,
	}, nil
}

func (r *memberRepository) GetMembersByGuildID(ctx context.Context, guildID uuid.UUID) ([]domain.Member, error) {
	dbMembers, err := r.queries.GetMembersByGuildID(ctx, guildID)
	if err != nil {
		return nil, err
	}

	members := make([]domain.Member, len(dbMembers))
	for i, m := range dbMembers {
		members[i] = domain.Member{
			GuildID:  m.GuildID,
			UserID:   m.UserID,
			JoinedAt: m.JoinedAt,
		}
	}

	return members, nil
}

// TODO: N+1の原因なので、JOINとかでほかのクエリと一緒に取得するようにする
func (r *memberRepository) CountByGuildID(ctx context.Context, guildID uuid.UUID) (int32, error) {
	count, err := r.queries.CountByGuildID(ctx, guildID)
	if err != nil {
		return 0, err
	}
	return int32(count), nil
}

var _ domain.IMemberRepository = (*memberRepository)(nil)
