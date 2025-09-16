package usecase

import (
	"context"
	"guild-service/internal/domain/member"

	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

var validate = validator.New()

type MemberUsecase interface {
	AddMember(ctx context.Context, input *AddMemberInput) (*member.Member, error)
}

type memberUsecase struct {
	memberRepo member.IMemberRepository
	validator  *validator.Validate
}

func NewMemberUsecase(memberRepo member.IMemberRepository, validator *validator.Validate) MemberUsecase {
	return &memberUsecase{
		memberRepo: memberRepo,
		validator:  validator,
	}
}

type AddMemberInput struct {
	GuildID  string `validate:"required,uuid4"`
	UserID   string `validate:"required,uuid4"`
	Nickname string `validate:"required,min=2,max=30"`
}

func (u *memberUsecase) AddMember(ctx context.Context, input *AddMemberInput) (*member.Member, error) {
	if err := u.validator.Struct(input); err != nil {
		return nil, err
	}

	memberInput := &member.AddMemberInput{
		GuildID:  uuid.MustParse(input.GuildID),
		UserID:   uuid.MustParse(input.UserID),
		Nickname: input.Nickname,
	}

	return u.memberRepo.AddMember(ctx, memberInput)
}

var _ MemberUsecase = (*memberUsecase)(nil)
