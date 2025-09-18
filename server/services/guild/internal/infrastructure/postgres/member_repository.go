package postgres

import (
	"context"
	"guild-service/internal/domain"
	"guild-service/internal/infrastructure/postgres/gen"

	"github.com/jackc/pgx/v5/pgtype"
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
		Nickname: member.Nickname,
		JoinedAt: pgtype.Timestamp{Time: member.JoinedAt, Valid: true},
	})
	if err != nil {
		return nil, err
	}
	return &domain.Member{
		GuildID:  dbMember.GuildID,
		UserID:   dbMember.UserID,
		Nickname: dbMember.Nickname,
		JoinedAt: dbMember.JoinedAt.Time,
	}, nil
}

var _ domain.IMemberRepository = (*memberRepository)(nil)
