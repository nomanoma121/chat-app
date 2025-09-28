package usecase

import (
	"context"
	"guild-service/internal/domain"
	"time"

	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

const (
	INITIAL_INVITE_USES = 0
)

type InviteUsecase interface {
	Create(ctx context.Context, params *CreateInviteParams) (*domain.Invite, error)
	GetByGuildID(ctx context.Context, userID, guildID uuid.UUID) ([]*domain.Invite, error)
	GetByInviteCode(ctx context.Context, inviteCode string) (*domain.Invite, error)
	JoinGuild(ctx context.Context, params *JoinGuildParams) (*domain.Member, error)
}

type inviteUsecase struct {
	store     domain.IStore
	userSvc   domain.IUserService
	validator *validator.Validate
}

func NewInviteUsecase(store domain.IStore, userSvc domain.IUserService, validator *validator.Validate) InviteUsecase {
	return &inviteUsecase{
		store:     store,
		userSvc:   userSvc,
		validator: validator,
	}
}

type CreateInviteParams struct {
	CreatorID uuid.UUID  `validate:"required"`
	GuildID   uuid.UUID  `validate:"required"`
	MaxUses   *int32     `validate:"omitempty,gt=0"`
	ExpiresAt *time.Time `validate:"omitempty"`
}

func (u *inviteUsecase) Create(ctx context.Context, params *CreateInviteParams) (*domain.Invite, error) {
	if err := u.validator.Struct(params); err != nil {
		return nil, domain.ErrInvalidInviteData
	}

	isOwner, err := u.store.Guilds().IsOwner(ctx, params.CreatorID, params.GuildID)
	if err != nil {
		return nil, err
	}
	if !isOwner {
		return nil, domain.ErrPermissionDenied
	}

	inviteCode, err := domain.GenerateInviteCode()
	if err != nil {
		return nil, err
	}
	if params.ExpiresAt != nil && params.ExpiresAt.Before(time.Now()) {
		return nil, domain.ErrInvalidInviteData
	}

	invite := &domain.Invite{
		InviteCode:  inviteCode,
		GuildID:     params.GuildID,
		CreatorID:   params.CreatorID,
		MaxUses:     params.MaxUses,
		CurrentUses: INITIAL_INVITE_USES,
		ExpiresAt:   params.ExpiresAt,
		CreatedAt:   time.Now(),
	}

	return u.store.Invites().Create(ctx, invite)
}

func (u *inviteUsecase) GetByGuildID(ctx context.Context, userID, guildID uuid.UUID) ([]*domain.Invite, error) {
	isMember, err := u.store.Members().IsMember(ctx, userID, guildID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, domain.ErrGuildNotFound
	}

	invites, err := u.store.Invites().GetByGuildID(ctx, guildID)
	if err != nil {
		return nil, err
	}

	creatorIDs := make([]uuid.UUID, 0, len(invites))
	for _, invite := range invites {
		creatorIDs = append(creatorIDs, invite.CreatorID)
	}

	users, err := u.userSvc.GetUsersByIDs(creatorIDs)
	if err != nil {
		return nil, err
	}
	userMap := make(map[uuid.UUID]*domain.User)
	for i := range users {
		userMap[users[i].ID] = users[i]
	}

	for i := range invites {
		if creator, ok := userMap[invites[i].CreatorID]; ok {
			invites[i].Creator = creator
		}
	}

	return invites, nil
}

type JoinGuildParams struct {
	InviteCode string    `validate:"required"`
	UserID     uuid.UUID `validate:"required"`
}

func (u *inviteUsecase) JoinGuild(ctx context.Context, params *JoinGuildParams) (*domain.Member, error) {
	if err := u.validator.Struct(params); err != nil {
		return nil, domain.ErrInvalidInviteData
	}
	if !domain.ValidateInviteCode(params.InviteCode) {
		return nil, domain.ErrInvalidInviteCode
	}

	var member *domain.Member
	err := u.store.ExecTx(ctx, func(tx domain.IStore) error {
		invite, err := tx.Invites().IncrementUses(ctx, params.InviteCode)
		if err != nil {
			return err
		}

		member, err = tx.Members().Add(
			ctx,
			&domain.Member{
				GuildID:  invite.GuildID,
				UserID:   params.UserID,
				JoinedAt: time.Now(),
			},
		)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return member, nil
}

func (u *inviteUsecase) GetByInviteCode(ctx context.Context, inviteCode string) (*domain.Invite, error) {
	if !domain.ValidateInviteCode(inviteCode) {
		return nil, domain.ErrInvalidInviteCode
	}

	invite, err := u.store.Invites().GetByInviteCode(ctx, inviteCode)
	if err != nil {
		return nil, err
	}

	creator, err := u.userSvc.GetUserByID(invite.CreatorID)
	if err != nil {
		return nil, err
	}
	invite.Creator = &creator

	memberCount, err := u.store.Members().CountByGuildID(ctx, invite.GuildID)
	if err != nil {
		return nil, err
	}
	invite.Guild.MemberCount = &memberCount

	return invite, nil
}

var _ InviteUsecase = (*inviteUsecase)(nil)
