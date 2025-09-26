package domain

import (
	"context"

	"github.com/google/uuid"
)

type Invite struct {
	ID          string
	GuildID     string
	CreatorID   string
	MaxUses     int32
	CurrentUses int32
	ExpiresAt   int32
	Code        string
}

type IInviteRepository interface {
	Create(cxt context.Context, invite *Invite) (*Invite, error)
	GetByGuildID(cxt context.Context, guildID uuid.UUID) ([]*Invite, error)
	IncrementUses(cxt context.Context, code string) error
}
