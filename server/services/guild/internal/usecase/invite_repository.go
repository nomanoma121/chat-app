package usecase

import (
	"context"
	"guild-service/internal/domain"

	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

type InviteUsecase interface {
	Create(ctx context.Context, params *CreateInviteParams) (*domain.Invite, error)
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
	CategoryID uuid.UUID `validate:"required"`
	Name       string    `validate:"required,min=1,max=100"`
}

func (u *inviteUsecase) Create(ctx context.Context, params *CreateInviteParams) (*domain.Invite, error) {
	if err := u.validator.Struct(params); err != nil {
		return nil, domain.ErrInvalidChannelData
	}

	return u.store.Invites().Create(ctx, &domain.Invite{})
}

var _ InviteUsecase = (*inviteUsecase)(nil)
