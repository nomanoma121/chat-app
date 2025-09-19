package usecase

import (
	"context"
	"regexp"
	"time"
	"user-service/internal/domain"

	"github.com/go-playground/validator"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserUsecase interface {
	Register(ctx context.Context, params *RegisterParams) (*domain.User, error)
	Login(ctx context.Context, params *LoginParams) (*string, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
	Update(ctx context.Context, params *UpdateParams) (*domain.User, error)
}

type Config struct {
	JWTSecret string
}

type RegisterParams struct {
	DisplayId string `validate:"required,min=3,max=20,display_id"`
	Name      string `validate:"required,min=1,max=15"`
	Email     string `validate:"required,email"`
	Password  string `validate:"required,min=8"`
	Bio       string `validate:"omitempty,max=500"`
	IconURL   string `validate:"omitempty,url"`
}

type LoginParams struct {
	Email    string `validate:"required,email"`
	Password string `validate:"required,min=8"`
}

type UpdateParams struct {
	ID      uuid.UUID `validate:"required"`
	Name    string    `validate:"required,min=1,max=15"`
	Bio     string    `validate:"omitempty,max=500"`
	IconURL string    `validate:"omitempty,url"`
}

type userUsecase struct {
	userRepo  domain.UserRepository
	config    Config
	validator *validator.Validate
}

func validateDisplayId(fl validator.FieldLevel) bool {
	// 英数字、ドット、アンダースコア、ハイフン
	matched, _ := regexp.MatchString(`^[a-zA-Z0-9_.-]+$`, fl.Field().String())
	return matched
}

func NewUserUsecase(userRepo domain.UserRepository, config Config, validator *validator.Validate) UserUsecase {
	// TODO: もうちょいいい書き方ありそう
	err := validator.RegisterValidation("display_id", validateDisplayId)
	if err != nil {
		return nil
	}
	return &userUsecase{
		userRepo:  userRepo,
		config:    config,
		validator: validator,
	}
}

func (u *userUsecase) Register(ctx context.Context, params *RegisterParams) (*domain.User, error) {
	if err := u.validator.Struct(params); err != nil {
		return nil, domain.ErrInvalidUserData
	}
	exists, err := u.userRepo.ExistsByEmail(ctx, params.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, domain.ErrEmailAlreadyExists
	}
	exists, err = u.userRepo.ExistsByDisplayId(ctx, params.DisplayId)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, domain.ErrDisplayIDAlreadyExists
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(params.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := domain.User{
		ID:        uuid.New(),
		DisplayId: params.DisplayId,
		Name:      params.Name,
		Email:     params.Email,
		Password:  string(passwordHash),
		Bio:       params.Bio,
		IconURL:   params.IconURL,
	}

	return u.userRepo.Create(ctx, &user)
}

func (u *userUsecase) Login(ctx context.Context, params *LoginParams) (*string, error) {
	if err := u.validator.Struct(params); err != nil {
		return nil, domain.ErrInvalidUserData
	}
	user, err := u.userRepo.FindByEmail(ctx, params.Email)
	if err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(params.Password)); err != nil {
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

func (u *userUsecase) Update(ctx context.Context, params *UpdateParams) (*domain.User, error) {
	if err := u.validator.Struct(params); err != nil {
		return nil, domain.ErrInvalidUserData
	}

	return u.userRepo.Update(ctx, &domain.User{
		ID:      params.ID,
		Name:    params.Name,
		Bio:     params.Bio,
		IconURL: params.IconURL,
	})
}

func (u *userUsecase) GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	user, err := u.userRepo.GetUserByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return user, nil
}

var _ UserUsecase = (*userUsecase)(nil)
