// package usecase

// import (
// 	"context"
// 	"guild-service/internal/domain"

// 	"github.com/go-playground/validator"
// 	"github.com/google/uuid"
// )

// var validate = validator.New()

// type MemberUsecase interface {
// 	AddMember(ctx context.Context, params *AddMemberParams) (*domain.Member, error)
// }

// type memberUsecase struct {
// 	memberRepo domain.IMemberRepository
// 	validator  *validator.Validate
// }

// func NewMemberUsecase(memberRepo domain.IMemberRepository, validator *validator.Validate) MemberUsecase {
// 	return &memberUsecase{
// 		memberRepo: memberRepo,
// 		validator:  validator,
// 	}
// }

// type AddMemberParams struct {	
// 	GuildID  string `validate:"required,uuid4"`
// 	UserID   string `validate:"required,uuid4"`
// 	Nickname string `validate:"required,min=2,max=30"`
// }

// func (u *memberUsecase) AddMember(ctx context.Context, params *AddMemberParams) (*domain.Member, error) {
// 	if err := u.validator.Struct(params); err != nil {
// 		return nil, err
// 	}

// 	memberInput := &domain.Member{
// 		GuildID:  uuid.MustParse(params.GuildID),
// 		UserID:   uuid.MustParse(params.UserID),
// 		Nickname: params.Nickname,
// 	}

// 	return u.memberRepo.AddMember(ctx, memberInput)
// }

// var _ MemberUsecase = (*memberUsecase)(nil)
