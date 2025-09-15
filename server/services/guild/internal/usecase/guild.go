package usecase

import (
	"context"
	"guild-service/internal/domain"
	"guild-service/internal/domain/model"
	"guild-service/internal/domain/repository"

	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

var validate = validator.New()

type GuildUsecase interface {
	Create(ctx context.Context, req *CreateGuildRequest) (*model.Guild, error)
	Update(ctx context.Context, user *UpdateGuildRequest) (*model.Guild, error)
	GetByID(ctx context.Context, id uuid.UUID) (*model.Guild, error)
}

type Config struct {
	JWTSecret string
}

type guildUsecase struct {
	guildRepo repository.GuildRepository
	config    Config
}

func NewGuildUsecase(guildRepo repository.GuildRepository, config Config) GuildUsecase {
	return &guildUsecase{
		guildRepo: guildRepo,
		config:    config,
	}
}

type CreateGuildRequest struct {
	OwnerID     uuid.UUID `validate:"required"`
	Name        string    `validate:"required,min=2,max=20"`
	Description string    `validate:"required,max=200"`
	IconURL     string    `validate:"required,url"`
}

func (r *CreateGuildRequest) Validate() error {
	return validate.Struct(r)
}

func (u *guildUsecase) Create(ctx context.Context, req *CreateGuildRequest) (*model.Guild, error) {
	if err := req.Validate(); err != nil {
		return nil, domain.ErrInvalidGuildData
	}

	guild := &repository.CreateGuildInput{
		ID:          uuid.New(),
		OwnerID:     req.OwnerID,
		Name:        req.Name,
		Description: req.Description,
		IconURL:     req.IconURL,
	}

	createdGuild, err := u.guildRepo.Create(ctx, guild)
	if err != nil {
		return nil, err
	}

	return createdGuild, nil
}

type UpdateGuildRequest struct {
	ID          uuid.UUID `validate:"required"`
	Name        string    `validate:"required,min=2,max=20"`
	Description string    `validate:"required,max=200"`
	IconURL     string    `validate:"required,url"`
}

func (r *UpdateGuildRequest) Validate() error {
	return validate.Struct(r)
}

func (u *guildUsecase) Update(ctx context.Context, req *UpdateGuildRequest) (*model.Guild, error) {
	if err := req.Validate(); err != nil {
		return nil, domain.ErrInvalidGuildData
	}

	return u.guildRepo.Update(ctx, &repository.UpdateGuildInput{
		ID:          req.ID,
		Name:        req.Name,
		Description: req.Description,
		IconURL:     req.IconURL,
	})
}

func (u *guildUsecase) GetByID(ctx context.Context, id uuid.UUID) (*model.Guild, error) {
	return u.guildRepo.GetGuildByID(ctx, id)
}

var _ GuildUsecase = (*guildUsecase)(nil)
