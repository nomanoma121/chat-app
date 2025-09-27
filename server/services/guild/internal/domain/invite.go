package domain

import (
	"context"
	"fmt"
	"io"
	"time"

	"crypto/rand"

	"github.com/google/uuid"
)

const (
	INVITE_CODE_LENGTH = 8
	CHARSET            = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
)

type Invite struct {
	InviteCode  string
	GuildID     uuid.UUID
	CreatorID   uuid.UUID
	Creator     *User
	MaxUses     *int32
	CurrentUses int32
	ExpiresAt   *time.Time
	CreatedAt   time.Time
}

type IInviteRepository interface {
	Create(cxt context.Context, invite *Invite) (*Invite, error)
	GetByGuildID(cxt context.Context, guildID uuid.UUID) ([]*Invite, error)
	IncrementUses(cxt context.Context, code string) (*Invite, error)
}

func ValidateInviteCode(inviteCode string) bool {
	if len(inviteCode) != INVITE_CODE_LENGTH {
		return false
	}
	for _, c := range inviteCode {
		if !isCharInCharset(c) {
			return false
		}
	}
	return true
}

// Generate 8-character alphanumeric invite code
func GenerateInviteCode() (string, error) {
	inviteCode := make([]byte, INVITE_CODE_LENGTH)
	if _, err := io.ReadFull(rand.Reader, inviteCode); err != nil {
		return "", fmt.Errorf("failed to read random bytes: %w", err)
	}

	for i, b := range inviteCode {
		inviteCode[i] = CHARSET[b%byte(len(CHARSET))]
	}

	return string(inviteCode), nil
}

func isCharInCharset(c rune) bool {
	for _, charsetChar := range CHARSET {
		if c == charsetChar {
			return true
		}
	}
	return false
}
