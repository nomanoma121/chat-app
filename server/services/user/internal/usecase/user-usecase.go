package usecase

import (
	"context"
	"time"
	"user-service/internal/domain"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserUsecase interface {
	Register(ctx context.Context, req *domain.RegisterRequest) (*domain.User, error)
	Login(ctx context.Context, req *domain.LoginRequest) (*string, error)
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

	if err := user.Validate(); err != nil {
		return nil, domain.ErrInvalidUserData
	}

	return u.userRepo.Create(ctx, &user)
}

func (u *userUsecase) Login(ctx context.Context, req *domain.LoginRequest) (*string, error) {
	user, err := u.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, err
	}

	claims := jwt.MapClaims{
		"user_id": user.ID.String(),
		"display_id": user.DisplayId,
		"name": user.Name,
		"iat":     time.Now().Unix(),
		"exp":     jwt.TimeFunc().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// jwtを生成
	tokenString, err := token.SignedString([]byte("secret"))
	if err != nil {
		return nil, err
	}

	return &tokenString, nil
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
