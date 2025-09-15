package postgres

import (
	"context"
	"guild-service/internal/domain/member"
	"guild-service/internal/infrastructure/postgres/generated"
)

type memberRepository struct {
	queries *generated.Queries
}

func NewMemberRepository(queries *generated.Queries) *memberRepository {
	return &memberRepository{
		queries: queries,
	}
}

func (r *memberRepository) AddMember(ctx context.Context, input *member.AddMemberInput) (*member.Member, error) {
	dbMember, err := r.queries.AddMember(ctx, generated.AddMemberParams{
		GuildID:  input.GuildID,
		UserID:   input.UserID,
		Nickname: input.Nickname,
	})
	if err != nil {
		return nil, err
	}
	return &member.Member{
		GuildID:   dbMember.GuildID,
		UserID:    dbMember.UserID,
		Nickname:  dbMember.Nickname,
		JoinedAt:  dbMember.JoinedAt.Time,
		UpdatedAt: dbMember.UpdatedAt.Time,
	}, nil
}

var _ member.IMemberRepository = (*memberRepository)(nil)
