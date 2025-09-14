package usecase

import (
	"context"
	"time"
	"guild-service/internal/domain"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type GuildUsecase interface {
	Create(ctx context.Context, req *domain.RegisterRequest) (*domain.User, error)
	Update(ctx context.Context, user *domain.UpdateRequest) (*domain.User, error)
}

type Config struct {
	JWTSecret string
}

type userUsecase struct {
	userRepo domain.UserRepository
	config   Config
}

func NewUserUsecase(userRepo domain.UserRepository, config Config) UserUsecase {
	return &userUsecase{
		userRepo: userRepo,
		config:   config,
	}
}

func (u *userUsecase) Register(ctx context.Context, req *domain.RegisterRequest) (*domain.User, error) {
	if err := req.Validate(); err != nil {
		return nil, domain.ErrInvalidUserData
	}
	exists, err := u.userRepo.ExistsByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, domain.ErrEmailAlreadyExists
	}
	exists, err = u.userRepo.ExistsByDisplayId(ctx, req.DisplayId)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, domain.ErrDisplayIDAlreadyExists
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

	return u.userRepo.Create(ctx, &user)
}

func (u *userUsecase) Update(ctx context.Context, req *domain.UpdateRequest) (*domain.User, error) {
	if err := req.Validate(); err != nil {
		return nil, domain.ErrInvalidUserData
	}

	return u.userRepo.Update(ctx, req)
}

var _ GuildUsecase = (*guildUsecase)(nil)
