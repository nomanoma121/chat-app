package member

import (
	"github.com/google/uuid"
)

type MemberInput struct {
	UserID   uuid.UUID
	GuildID  uuid.UUID
	Nickname string
}

type IMemberRepository interface {
	Create(member *MemberInput) (*Member, error)
}
