package usecase

import (
	"context"
	"guild-service/internal/domain"
	"time"

	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

type CategoryUsecase interface {
	CreateCategory(ctx context.Context, params *CreateCategoryParams) (*domain.Category, error)
}

type categoryUsecase struct {
	store     domain.IStore
	validator *validator.Validate
}

func NewCategoryUsecase(store domain.IStore, validator *validator.Validate) CategoryUsecase {
	return &categoryUsecase{
		store:     store,
		validator: validator,
	}
}

type CreateCategoryParams struct {
	GuildID uuid.UUID `validate:"required"`
	Name    string    `validate:"required,min=1,max=100"`
}

func (u *categoryUsecase) CreateCategory(ctx context.Context, params *CreateCategoryParams) (*domain.Category, error) {
	if err := u.validator.Struct(params); err != nil {
		return nil, domain.ErrInvalidCategoryData
	}

	return u.store.Categories().Create(ctx, &domain.Category{
		ID:        uuid.New(),
		GuildID:   params.GuildID,
		Name:      params.Name,
		CreatedAt: time.Now(),
	})
}

var _ CategoryUsecase = (*categoryUsecase)(nil)
