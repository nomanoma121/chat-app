package usecase

import (
	"context"
	"time"
	"user-service/internal/domain"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserUsecase interface {
	Register(ctx context.Context, req *domain.RegisterRequest) (*domain.User, error)
	Login(ctx context.Context, req *domain.LoginRequest) (*string, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
	Update(ctx context.Context, user *domain.UpdateRequest) error
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

func (u *userUsecase) Login(ctx context.Context, req *domain.LoginRequest) (*string, error) {
	if err := req.Validate(); err != nil {
		return nil, domain.ErrInvalidUserData
	}
	user, err := u.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID.String(),
		"iat":     time.Now().Unix(),
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, err := token.SignedString([]byte(u.config.JWTSecret))
	if err != nil {
		return nil, err
	}

	return &tokenString, nil
}

func (u *userUsecase) Update(ctx context.Context, req *domain.UpdateRequest) error {
	if err := req.Validate(); err != nil {
		return domain.ErrInvalidUserData
	}

	return u.userRepo.Update(ctx, req)
}

func (u *userUsecase) GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	user, err := u.userRepo.GetUserByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return user, nil
}

var _ UserUsecase = (*userUsecase)(nil)
