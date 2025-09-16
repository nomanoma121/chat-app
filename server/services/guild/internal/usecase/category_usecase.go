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
	categoryRepo domain.ICategoryRepository
	validator    *validator.Validate
}

func NewCategoryUsecase(categoryRepo domain.ICategoryRepository, validator *validator.Validate) CategoryUsecase {
	return &categoryUsecase{
		categoryRepo: categoryRepo,
		validator:    validator,
	}
}

type CreateCategoryParams struct {
	GuildID string `validate:"required,uuid4"`
	Name    string `validate:"required,min=1,max=100"`
	Order   int    `validate:"gte=0"`
}

func (u *categoryUsecase) CreateCategory(ctx context.Context, req *CreateCategoryParams) (*domain.Category, error) {
	if err := u.validator.Struct(req); err != nil {
		return nil, err
	}

	return u.categoryRepo.Create(ctx, &domain.Category{
		ID:        uuid.New(),
		GuildID:   uuid.MustParse(req.GuildID),
		Name:      req.Name,
		CreatedAt: time.Now(),
	})
}

var _ CategoryUsecase = (*categoryUsecase)(nil)
