package usecase

import (
	"context"
	"guild-service/internal/domain"
	"sync"
	"time"

	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

type GuildUsecase interface {
	Create(ctx context.Context, params *CreateGuildParams) (*domain.Guild, error)
	Update(ctx context.Context, params *UpdateGuildParams) (*domain.Guild, error)
	GetByID(ctx context.Context, userID, guildID uuid.UUID) (*GetByIDResult, error)
	GetGuildOverview(ctx context.Context, userID, guildID uuid.UUID) (*domain.GuildOverview, error)
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
	UserID           uuid.UUID `validate:"required"`
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
	isOwner, err := u.store.Guilds().IsOwner(ctx, params.ID, params.UserID)
	if err != nil {
		return nil, err
	}
	if !isOwner {
		return nil, domain.ErrPermissionDenied
	}

	return u.store.Guilds().Update(ctx, &domain.Guild{
		ID:               params.ID,
		Name:             params.Name,
		Description:      params.Description,
		IconURL:          params.IconURL,
		DefaultChannelID: params.DefaultChannelID,
	})
}

type GetByIDResult struct {
	*domain.Guild
	MemberCount int32
	Members     []domain.Member
}

func (u *guildUsecase) GetByID(ctx context.Context, userID, guildID uuid.UUID) (*GetByIDResult, error) {
	isMember, err := u.store.Members().IsMember(ctx, guildID, userID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, domain.ErrGuildNotFound
	}

	var guild *domain.Guild
	var members []domain.Member
	var errGuild, errMembers error

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		guild, errGuild = u.store.Guilds().GetByID(ctx, guildID)
	}()

	go func() {
		defer wg.Done()
		members, errMembers = u.store.Members().GetMembersByGuildID(ctx, guildID)
	}()

	wg.Wait()

	if errGuild != nil {
		return nil, errGuild
	}
	if errMembers != nil {
		return nil, errMembers
	}

	memberUserIDs := make([]uuid.UUID, 0, len(members))
	for _, member := range members {
		memberUserIDs = append(memberUserIDs, member.UserID)
	}

	users, err := u.userSvc.GetUsersByIDs(memberUserIDs)
	if err != nil {
		return nil, err
	}

	userMap := make(map[uuid.UUID]*domain.User)
	for _, user := range users {
		userMap[user.ID] = user
	}

	for i, member := range members {
		if user, ok := userMap[member.UserID]; ok {
			members[i].User = user
		}
	}

	return &GetByIDResult{
		Guild:       guild,
		MemberCount: int32(len(members)),
		Members:     members,
	}, nil
}

func (u *guildUsecase) GetGuildOverview(ctx context.Context, userID, guildID uuid.UUID) (*domain.GuildOverview, error) {
	isMember, err := u.store.Members().IsMember(ctx, guildID, userID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, domain.ErrGuildNotFound
	}

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
	guilds, err := u.store.Guilds().GetMyGuilds(ctx, userID)
	if err != nil {
		return nil, err
	}

	for _, guild := range guilds {
		count, err := u.store.Members().CountByGuildID(ctx, guild.ID)
		if err != nil {
			return nil, err
		}
		guild.MemberCount = &count
	}

	return guilds, nil
}

var _ GuildUsecase = (*guildUsecase)(nil)
