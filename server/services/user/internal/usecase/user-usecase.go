package usecase

import (
	"context"
	"errors"
	"user-service/internal/domain"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserUsecase interface {
	Register(ctx context.Context, req *domain.RegisterRequest) (*domain.User, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
}

type userUsecase struct {
	userRepo domain.UserRepository
}

func (u *userUsecase) Register(ctx context.Context, req *domain.RegisterRequest) (*domain.User, error) {
	exists, err := u.userRepo.ExistsByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("email already exists")
	}
	exists, err = u.userRepo.ExistsByDisplayId(ctx, req.DisplayId)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("display ID already exists")
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}	

	user := domain.User{
		ID:        uuid.New(),
		DisplayId: req.DisplayId,
		Name:      req.Name,
		Email:     req.Email,
		Password:  string(passwordHash),
		Bio:       req.Bio,
		IconURL:   req.IconURL,
	}

	if err := user.Validate(); err != nil {
		return nil, errors.New("invalid user data: " + err.Error())
	}

	return u.userRepo.Create(ctx, &user)
}

func (u *userUsecase) GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	user, err := u.userRepo.GetUserByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func NewUserUsecase(userRepo domain.UserRepository) UserUsecase {
	return &userUsecase{
		userRepo: userRepo,
	}
}

var _ UserUsecase = (*userUsecase)(nil)
