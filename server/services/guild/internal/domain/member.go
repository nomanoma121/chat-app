package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Member struct {
	UserID   uuid.UUID
	GuildID  uuid.UUID
	User     *User
	JoinedAt time.Time
}

type IMemberRepository interface {
	Add(ctx context.Context, member *Member) (*Member, error)
	GetMembersByGuildID(ctx context.Context, guildID uuid.UUID) ([]Member, error)
	CountByGuildID(ctx context.Context, guildID uuid.UUID) (int32, error)
}
