package usecase

import (
	"context"
	"guild-service/internal/domain"

	"github.com/google/uuid"
)

type GuildUsecase interface {
	Create(ctx context.Context, req *domain.GuildRequest) (*domain.Guild, error)
	Update(ctx context.Context, user *domain.GuildRequest) (*domain.Guild, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Guild, error)
}

type Config struct {
	JWTSecret string
}

type guildUsecase struct {
	guildRepo domain.GuildRepository
	config    Config
}

func NewGuildUsecase(guildRepo domain.GuildRepository, config Config) GuildUsecase {
	return &guildUsecase{
		guildRepo: guildRepo,
		config:    config,
	}
}

func (u *guildUsecase) Create(ctx context.Context, req *domain.GuildRequest) (*domain.Guild, error) {
	if err := req.Validate(); err != nil {
		return nil, domain.ErrInvalidGuildData
	}

	guild := &domain.GuildRequest{
		ID:          uuid.New(),
		Name:        req.Name,
		Description: req.Description,
	}

	createdGuild, err := u.guildRepo.Create(ctx, guild)
	if err != nil {
		return nil, err
	}

	return createdGuild, nil
}

func (u *guildUsecase) Update(ctx context.Context, req *domain.GuildRequest) (*domain.Guild, error) {
	if err := req.Validate(); err != nil {
		return nil, domain.ErrInvalidGuildData
	}
	return u.guildRepo.Update(ctx, req)
}

func (u *guildUsecase) GetByID(ctx context.Context, id uuid.UUID) (*domain.Guild, error) {
	return u.guildRepo.GetGuildByID(ctx, id)
}

var _ GuildUsecase = (*guildUsecase)(nil)
