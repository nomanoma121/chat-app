package usecase

import (
	"guild-service/internal/domain/channel"

	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

type ChannelUsecase interface {
	CreateChannel(input *CreateChannelRequest) (*channel.Channel, error)
}

type channelUsecase struct {
	channelRepo channel.IChannelRepository
	validator   *validator.Validate
}

func NewChannelUsecase(channelRepo channel.IChannelRepository, validator *validator.Validate) ChannelUsecase {
	return &channelUsecase{
		channelRepo: channelRepo,
		validator:   validator,
	}
}

type CreateChannelRequest struct {
	CategoryID string `validate:"required,uuid4"`
	Name       string `validate:"required,min=1,max=100"`
	Order      int    `validate:"gte=0"`
}

func (u *channelUsecase) CreateChannel(input *CreateChannelRequest) (*channel.Channel, error) {
	if err := u.validator.Struct(input); err != nil {
		return nil, err
	}

	channelInput := &channel.CreateChannelInput{
		ID:         uuid.New(),
		CategoryID: uuid.MustParse(input.CategoryID),
		Name:       input.Name,
		Order:      input.Order,
	}

	return u.channelRepo.Create(channelInput)
}

var _ ChannelUsecase = (*channelUsecase)(nil)
