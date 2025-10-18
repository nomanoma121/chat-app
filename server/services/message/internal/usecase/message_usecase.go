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
	GetByChannelID(ctx context.Context, userID, channelID uuid.UUID) ([]*domain.Message, error)
}

type CreateParams struct {
	ChannelID uuid.UUID  `validate:"required"`
	SenderID  uuid.UUID  `validate:"required"`
	Content   string     `validate:"required,min=1,max=500"`
	ReplyID   *uuid.UUID `validate:"omitempty"`
}

type messageUsecase struct {
	messageRepo domain.IMessageRepository
	userSvc     domain.IUserService
	guildSvc    domain.IGuildService
	publisher   domain.IPublisher
	validator   *validator.Validate
}

type MessageUsecaseParams struct {
	MessageRepo domain.IMessageRepository
	UserSvc     domain.IUserService
	GuildSvc    domain.IGuildService
	Publisher   domain.IPublisher
	Validator   *validator.Validate
}

func NewMessageUsecase(params MessageUsecaseParams) MessageUsecase {
	return &messageUsecase{
		messageRepo: params.MessageRepo,
		userSvc:     params.UserSvc,
		guildSvc:    params.GuildSvc,
		publisher:   params.Publisher,
		validator:   params.Validator,
	}
}

func (u *messageUsecase) Create(ctx context.Context, params *CreateParams) (*domain.Message, error) {
	if err := u.validator.Struct(params); err != nil {
		return nil, domain.ErrInvalidMessageData
	}

	hasAccess, err := u.guildSvc.CheckChannelAccess(ctx, params.SenderID, params.ChannelID)
	if err != nil {
		return nil, err
	}
	if !hasAccess {
		return nil, domain.ErrChannelNotFound
	}

	message := domain.Message{
		ID:        uuid.New(),
		ChannelID: params.ChannelID,
		SenderID:  params.SenderID,
		Content:   params.Content,
		ReplyID:   params.ReplyID,
		CreatedAt: time.Now(),
	}

	createdMessage, err := u.messageRepo.Create(ctx, &message)
	if err != nil {
		return nil, err
	}

	err = u.publisher.Publish(ctx, createdMessage)
	if err != nil {
		return nil, err
	}

	return createdMessage, nil
}

func (u *messageUsecase) GetByChannelID(ctx context.Context, userID, channelID uuid.UUID) ([]*domain.Message, error) {
	hasAccess, err := u.guildSvc.CheckChannelAccess(ctx, userID, channelID)
	if err != nil {
		return nil, err
	}
	if !hasAccess {
		return nil, domain.ErrChannelNotFound
	}

	messages, err := u.messageRepo.GetByChannelID(ctx, channelID)
	if err != nil {
		return nil, err
	}

	userIDSet := make(map[uuid.UUID]struct{})
	for _, msg := range messages {
		userIDSet[msg.SenderID] = struct{}{}
	}
	userIDs := make([]uuid.UUID, 0, len(userIDSet))
	for id := range userIDSet {
		userIDs = append(userIDs, id)
	}

	users, err := u.userSvc.GetUsersByIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}
	userMap := make(map[uuid.UUID]*domain.User)
	for _, user := range users {
		userMap[user.ID] = user
	}
	for _, msg := range messages {
		msg.Sender = userMap[msg.SenderID]
	}
	return messages, nil
}

var _ MessageUsecase = (*messageUsecase)(nil)
