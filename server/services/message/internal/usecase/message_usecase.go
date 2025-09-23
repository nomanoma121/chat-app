package usecase

import (
	"context"
	"message-service/internal/domain"
	"time"

	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

type MessageUsecase interface {
	Create(ctx context.Context, params *CreateParams) (*domain.Message, error)
	GetByChannelID(ctx context.Context, channelID uuid.UUID) ([]*domain.Message, error)
}

type CreateParams struct {
	ChannelID uuid.UUID  `validate:"required"`
	SenderID  uuid.UUID  `validate:"required"`
	Content   string     `validate:"required,min=1,max=500"`
	ReplyID   *uuid.UUID `validate:"omitempty"`
}

type messageUsecase struct {
	messageRepo domain.IMessageRepository
	validator   *validator.Validate
}

func NewMessageUsecase(messageRepo domain.IMessageRepository, validator *validator.Validate) MessageUsecase {
	return &messageUsecase{
		messageRepo: messageRepo,
		validator:   validator,
	}
}

func (u *messageUsecase) Create(ctx context.Context, params *CreateParams) (*domain.Message, error) {
	if err := u.validator.Struct(params); err != nil {
		return nil, domain.ErrInvalidUserData
	}
	message := domain.Message{
		ID:        uuid.New(),
		ChannelID: params.ChannelID,
		SenderID:  params.SenderID,
		Content:   params.Content,
		ReplyID:   params.ReplyID,
		CreatedAt: time.Now(),
	}
	return u.messageRepo.Create(ctx, &message)
}

func (u *messageUsecase) GetByChannelID(ctx context.Context, channelID uuid.UUID) ([]*domain.Message, error) {
	return u.messageRepo.GetByChannelID(ctx, channelID)
}

var _ MessageUsecase = (*messageUsecase)(nil)
