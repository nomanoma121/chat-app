package usecase

import (
	"context"
	"guild-service/internal/domain"
	"time"

	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

type ChannelUsecase interface {
	Create(ctx context.Context, params *CreateChannelParams) (*domain.Channel, error)
	CheckAccess(ctx context.Context, userID, channelID uuid.UUID) (bool, error)
}

type channelUsecase struct {
	store     domain.IStore
	validator *validator.Validate
}

func NewChannelUsecase(store domain.IStore, validator *validator.Validate) ChannelUsecase {
	return &channelUsecase{
		store:     store,
		validator: validator,
	}
}

type CreateChannelParams struct {
	CategoryID uuid.UUID `validate:"required"`
	UserID     uuid.UUID `validate:"required"`
	Name       string    `validate:"required,min=1,max=100"`
}

func (u *channelUsecase) Create(ctx context.Context, params *CreateChannelParams) (*domain.Channel, error) {
	if err := u.validator.Struct(params); err != nil {
		return nil, domain.ErrInvalidChannelData
	}

	guildID, err := u.store.Categories().GetGuildIDByCategoryID(ctx, params.CategoryID)
	if err != nil {
		return nil, err
	}

	isOwner, err := u.store.Guilds().IsOwner(ctx, params.UserID, guildID)
	if err != nil {
		return nil, err
	}
	if !isOwner {
		return nil, domain.ErrPermissionDenied
	}

	return u.store.Channels().Create(ctx, &domain.Channel{
		ID:         uuid.New(),
		CategoryID: params.CategoryID,
		Name:       params.Name,
		CreatedAt:  time.Now(),
	})
}

func (u *channelUsecase) CheckAccess(ctx context.Context, userID, channelID uuid.UUID) (bool, error) {
	isMember, err := u.store.Channels().CheckChannelMember(ctx, userID, channelID)
	if err != nil {
		return false, err
	}
	return isMember, nil
}

var _ ChannelUsecase = (*channelUsecase)(nil)
