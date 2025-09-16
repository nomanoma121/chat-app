package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Member struct {
	UserID   uuid.UUID
	GuildID  uuid.UUID
	Nickname string
	JoinedAt time.Time
}

type IMemberRepository interface {
	AddMember(ctx context.Context, member *Member) (*Member, error)
}
