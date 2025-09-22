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
	GetGuildOverview(ctx context.Context, guildID uuid.UUID) (*domain.GuildOverview, error)
	GetMyGuilds(ctx context.Context, userID uuid.UUID) ([]*domain.Guild, error)
}

type guildUsecase struct {
	store     domain.IStore
	userSvc   domain.IUserService
	validator *validator.Validate
}

func NewGuildUsecase(store domain.IStore, userSvc domain.IUserService, validator *validator.Validate) GuildUsecase {
	return &guildUsecase{
		store:     store,
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

	channelId := uuid.New()

	guild := &domain.Guild{
		ID:               uuid.New(),
		OwnerID:          params.OwnerID,
		Name:             params.Name,
		Description:      params.Description,
		IconURL:          params.IconURL,
		DefaultChannelID: channelId,
		CreatedAt:        time.Now(),
	}

	category := &domain.Category{
		ID:        uuid.New(),
		GuildID:   guild.ID,
		Name:      domain.DefaultCategoryName,
		CreatedAt: time.Now(),
	}

	channel := &domain.Channel{
		ID:         channelId,
		CategoryID: category.ID,
		Name:       domain.DefaultChannelName,
		CreatedAt:  time.Now(),
	}

	member := &domain.Member{
		GuildID:  guild.ID,
		UserID:   params.OwnerID,
		Nickname: params.Name,
		JoinedAt: time.Now(),
	}

	var createdGuild *domain.Guild
	// ギルド作成時にデフォルトのカテゴリとチャンネルを作成する
	err = u.store.ExecTx(ctx, func(store domain.IStore) error {
		createdGuild, err = store.Guilds().Create(ctx, guild)
		if err != nil {
			return err
		}

		_, err = store.Categories().Create(ctx, category)
		if err != nil {
			return err
		}

		_, err = store.Channels().Create(ctx, channel)
		if err != nil {
			return err
		}

		_, err = store.Members().Add(ctx, member)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return createdGuild, nil
}

type UpdateGuildParams struct {
	ID               uuid.UUID `validate:"required"`
	Name             string    `validate:"required,min=2,max=20"`
	Description      string    `validate:"required,max=200"`
	IconURL          string    `validate:"required,url"`
	DefaultChannelID uuid.UUID `validate:"required"`
}

func (u *guildUsecase) Update(ctx context.Context, params *UpdateGuildParams) (*domain.Guild, error) {
	if err := u.validator.Struct(params); err != nil {
		return nil, domain.ErrInvalidGuildData
	}

	return u.store.Guilds().Update(ctx, &domain.Guild{
		ID:               params.ID,
		Name:             params.Name,
		Description:      params.Description,
		IconURL:          params.IconURL,
		DefaultChannelID: params.DefaultChannelID,
	})
}

func (u *guildUsecase) GetByID(ctx context.Context, id uuid.UUID) (*domain.Guild, error) {
	return u.store.Guilds().GetByID(ctx, id)
}

func (u *guildUsecase) GetGuildOverview(ctx context.Context, guildID uuid.UUID) (*domain.GuildOverview, error) {
	guild, err := u.store.Guilds().GetByID(ctx, guildID)
	if err != nil {
		return nil, err
	}

	categoriesOverview := make([]*domain.CategoryOverview, 0)

	categories, err := u.store.Categories().GetByGuildID(ctx, guildID)
	if err != nil {
		return nil, err
	}

	for _, category := range categories {
		channels, err := u.store.Channels().GetByCategoryID(ctx, category.ID)
		if err != nil {
			return nil, err
		}
		categoriesOverview = append(categoriesOverview, &domain.CategoryOverview{
			Category: category,
			Channels: channels,
		})
	}

	return &domain.GuildOverview{
		Guild:      guild,
		Categories: categoriesOverview,
	}, nil
}

func (u *guildUsecase) GetMyGuilds(ctx context.Context, userID uuid.UUID) ([]*domain.Guild, error) {
	return u.store.Guilds().GetMyGuilds(ctx, userID)
}

var _ GuildUsecase = (*guildUsecase)(nil)
