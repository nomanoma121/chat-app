package member

import (
	"context"

	"github.com/google/uuid"
)

type AddMemberInput struct {
	UserID   uuid.UUID
	GuildID  uuid.UUID
	Nickname string
}

type IMemberRepository interface {
	AddMember(ctx context.Context, member *AddMemberInput) (*Member, error)
}
