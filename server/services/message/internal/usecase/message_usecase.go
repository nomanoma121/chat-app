package usecase

import (
	"context"
	"regexp"
	"time"
	"message-service/internal/domain"

	"github.com/go-playground/validator"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type MessageUsecase interface {
	Create(ctx context.Context, params *CreateParams) (*domain.Message, error)
	GetMessagesByChannelID(ctx context.Context, channelID uuid.UUID, limit, offset int) ([]*domain.Message, error)
}

type CreateParams struct {
	ChannelID uuid.UUID `validate:"required"`
	SenderID  uuid.UUID `validate:"required"`
	Content   string    `validate:"required,min=1,max=500"`
	ReplyID   *uuid.UUID `validate:"omitempty"`
}
type messageUsecase struct {
	messageRepo domain.IMessageRepository
	validator   *validator.Validate
}

func NewMessageUsecase(messageRepo domain.IMessageRepository, validator *validator.Validate) MessageUsecase {
	if err != nil {
		return nil
	}
	return &messageUsecase{
		messageRepo: messageRepo,
		validator: validator,
	}
}

func (u *messageUsecase) Register(ctx context.Context, params *RegisterParams) (*domain.Message, error) {
	if err := u.validator.Struct(params); err != nil {
		return nil, domain.ErrInvalidUserData
	}
	exists, err := u.messageRepo.ExistsByEmail(ctx, params.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, domain.ErrEmailAlreadyExists
	}
	exists, err = u.messageRepo.ExistsByDisplayId(ctx, params.DisplayId)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, domain.ErrDisplayIDAlreadyExists
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(params.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
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

var _ MessageUsecase = (*messageUsecase)(nil)
