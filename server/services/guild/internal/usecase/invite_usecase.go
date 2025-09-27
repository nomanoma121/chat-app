package usecase

import (
	"context"
	"guild-service/internal/domain"
	"time"

	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

const (
	INITIAL_INVITE_USES = 0
)

type InviteUsecase interface {
	Create(ctx context.Context, params *CreateInviteParams) (*domain.Invite, error)
	GetByGuildID(ctx context.Context, guildID uuid.UUID) ([]*domain.Invite, error)
	JoinGuild(ctx context.Context, params *JoinGuildParams) (*domain.Member, error)
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
	CreatorID uuid.UUID  `validate:"required"`
	GuildID   uuid.UUID  `validate:"required"`
	MaxUses   *int32     `validate:"omitempty,gt=0"`
	ExpiresAt *time.Time `validate:"omitempty"`
}

func (u *inviteUsecase) Create(ctx context.Context, params *CreateInviteParams) (*domain.Invite, error) {
	if err := u.validator.Struct(params); err != nil {
		return nil, domain.ErrInvalidChannelData
	}
	inviteCode, err := domain.GenerateInviteCode()
	if err != nil {
		return nil, err
	}

	invite := &domain.Invite{
		InviteCode:  inviteCode,
		GuildID:     params.GuildID,
		CreatorID:   params.CreatorID,
		MaxUses:     params.MaxUses,
		CurrentUses: INITIAL_INVITE_USES,
		ExpiresAt:   params.ExpiresAt,
		CreatedAt:   time.Now(),
	}

	return u.store.Invites().Create(ctx, invite)
}

func (u *inviteUsecase) GetByGuildID(ctx context.Context, guildID uuid.UUID) ([]*domain.Invite, error) {
	return u.store.Invites().GetByGuildID(ctx, guildID)
}

type JoinGuildParams struct {
	InviteCode string `validate:"required"`
	UserID     uuid.UUID `validate:"required"`
}

func (u *inviteUsecase) JoinGuild(ctx context.Context, params *JoinGuildParams) (*domain.Member, error) {
	if err := u.validator.Struct(params); err != nil {
		return nil, domain.ErrInvalidChannelData
	}
	if !domain.ValidateInviteCode(params.InviteCode) {
		return nil, domain.ErrInvalidInviteCode
	}

	var member *domain.Member
	err := u.store.ExecTx(ctx, func(tx domain.IStore) error {
		invite, err := tx.Invites().IncrementUses(ctx, params.InviteCode)
		if err != nil {
			return err
		}

		member, err = tx.Members().Add(
			ctx,
			&domain.Member{
				GuildID:  invite.GuildID,
				UserID:   params.UserID,
				Nickname: "",
				JoinedAt: time.Now(),
			},
		)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return member, nil
}

var _ InviteUsecase = (*inviteUsecase)(nil)
