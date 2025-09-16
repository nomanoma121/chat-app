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
}

type channelUsecase struct {
	channelRepo domain.IChannelRepository
	validator   *validator.Validate
}

func NewChannelUsecase(channelRepo domain.IChannelRepository, validator *validator.Validate) ChannelUsecase {
	return &channelUsecase{
		channelRepo: channelRepo,
		validator:   validator,
	}
}

type CreateChannelParams struct {
	CategoryID uuid.UUID `validate:"required,uuid4"`
	Name       string    `validate:"required,min=1,max=100"`
}

func (u *channelUsecase) Create(ctx context.Context, params *CreateChannelParams) (*domain.Channel, error) {
	if err := u.validator.Struct(params); err != nil {
		return nil, err
	}

	return u.channelRepo.Create(ctx, &domain.Channel{
		ID:         uuid.New(),
		CategoryID: params.CategoryID,
		Name:       params.Name,
		CreatedAt:  time.Now(),
	})
}

var _ ChannelUsecase = (*channelUsecase)(nil)
