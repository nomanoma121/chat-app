package usecase

import (
	"context"
	"errors"
	"user-service/internal/domain"
	"user-service/internal/interface/repository"

	"github.com/google/uuid"
)

type UserUsecase interface {
	Register(ctx context.Context, req *domain.RegisterRequest) (domain.User, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (domain.User, error)
}

type userUsecase struct {
	userRepo repository.UserRepository
}

func (u *userUsecase) Register(ctx context.Context, req *domain.RegisterRequest) (*repository.CreateUserResponse, error) {
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
	if !exists {
		return nil, errors.New("display ID already exists")
	}
	user := domain.User{
		DisplayId: req.DisplayId,
		Name:      req.Name,
		Email:     req.Email,
		Password:  req.Password,
		Bio:       req.Bio,
		IconURL:   req.IconURL,
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
