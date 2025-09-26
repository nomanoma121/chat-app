package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Invite struct {
	InviteCode  string
	GuildID     uuid.UUID
	CreatorID   uuid.UUID
	MaxUses     int32
	CurrentUses int32
	ExpiresAt   time.Time
	CreatedAt   time.Time
}

type IInviteRepository interface {
	Create(cxt context.Context, invite *Invite) (*Invite, error)
	GetByGuildID(cxt context.Context, guildID uuid.UUID) ([]*Invite, error)
	IncrementUses(cxt context.Context, code string) error
}
