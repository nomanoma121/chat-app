package usecase

import (
	"context"
	"guild-service/internal/domain"
	"time"

	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

type GuildUsecase interface {
	Create(ctx context.Context, params *CreateGuildParams) (*domain.Guild, error)
	Update(ctx context.Context, params *UpdateGuildParams) (*domain.Guild, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Guild, error)
}

type guildUsecase struct {
	guildRepo domain.IGuildRepository
	userSvc   domain.IUserService
	validator *validator.Validate
}

func NewGuildUsecase(guildRepo domain.IGuildRepository, userSvc domain.IUserService, validator *validator.Validate) GuildUsecase {
	return &guildUsecase{
		guildRepo: guildRepo,
		userSvc:   userSvc,
		validator: validator,
	}
}

type CreateGuildParams struct {
	OwnerID     uuid.UUID `validate:"required"`
	Name        string    `validate:"required,min=2,max=20"`
	Description string    `validate:"required,max=200"`
	IconURL     string    `validate:"required,url"`
}

func (u *guildUsecase) Create(ctx context.Context, params *CreateGuildParams) (*domain.Guild, error) {
	if err := u.validator.Struct(params); err != nil {
		return nil, domain.ErrInvalidGuildData
	}

	exists, err := u.userSvc.Exists(params.OwnerID)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, domain.ErrUserNotFound
	}

	guild := &domain.Guild{
		ID:          uuid.New(),
		OwnerID:     params.OwnerID,
		Name:        params.Name,
		Description: params.Description,
		IconURL:     params.IconURL,
		CreatedAt:   time.Now(),
	}

	createdGuild, err := u.guildRepo.Create(ctx, guild)
	if err != nil {
		return nil, err
	}

	return createdGuild, nil
}

type UpdateGuildParams struct {
	ID          uuid.UUID `validate:"required"`
	Name        string    `validate:"required,min=2,max=20"`
	Description string    `validate:"required,max=200"`
	IconURL     string    `validate:"required,url"`
}

func (u *guildUsecase) Update(ctx context.Context, params *UpdateGuildParams) (*domain.Guild, error) {
	if err := u.validator.Struct(params); err != nil {
		return nil, domain.ErrInvalidGuildData
	}

	return u.guildRepo.Update(ctx, &domain.Guild{
		ID:          params.ID,
		Name:        params.Name,
		Description: params.Description,
		IconURL:     params.IconURL,
	})
}

func (u *guildUsecase) GetByID(ctx context.Context, id uuid.UUID) (*domain.Guild, error) {
	return u.guildRepo.GetGuildByID(ctx, id)
}

var _ GuildUsecase = (*guildUsecase)(nil)
