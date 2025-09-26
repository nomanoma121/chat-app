package usecase

import (
	"context"
	"guild-service/internal/domain"
	"time"

	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

type InviteUsecase interface {
	Create(ctx context.Context, params *CreateInviteParams) (*domain.Invite, error)
	GetByGuildID(ctx context.Context, guildID uuid.UUID) ([]*domain.Invite, error)
	JoinGuild(ctx context.Context, inviteCode string) (*domain.Guild, error)
}

type inviteUsecase struct {
	store     domain.IStore
	validator *validator.Validate
}

func NewInviteUsecase(store domain.IStore, validator *validator.Validate) InviteUsecase {
	return &inviteUsecase{
		store:     store,
		validator: validator,
	}
}

type CreateInviteParams struct {
	CreatorID uuid.UUID `validate:"required"`
	GuildID   uuid.UUID `validate:"required"`
	MaxUses   *int32    `validate:"omitempty,gt=0"`
	ExpiresAt time.Time `validate:"required"`
}

func (u *inviteUsecase) Create(ctx context.Context, params *CreateInviteParams) (*domain.Invite, error) {
	if err := u.validator.Struct(params); err != nil {
		return nil, domain.ErrInvalidChannelData
	}

	invite := &domain.Invite{
		InviteCode:  uuid.New().String(),
		GuildID:     params.GuildID,
		CreatorID:   params.CreatorID,
		MaxUses:     params.MaxUses,
		CurrentUses: 0,
		ExpiresAt:   time.Now().Add(24 * time.Hour),
		CreatedAt:   time.Now(),
	}

	return u.store.Invites().Create(ctx, invite)
}

func (u *inviteUsecase) GetByGuildID(ctx context.Context, guildID uuid.UUID) ([]*domain.Invite, error) {
	return u.store.Invites().GetByGuildID(ctx, guildID)
}

func (u *inviteUsecase) JoinGuild(ctx context.Context, code string) (*domain.Guild, error) {
	// トランザクション処理でギルドに参加する
}

var _ InviteUsecase = (*inviteUsecase)(nil)
