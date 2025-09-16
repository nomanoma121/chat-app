package usecase

import (
	"guild-service/internal/domain/category"

	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

type CategoryUsecase interface {
	CreateCategory(input *CreateCategoryInput) (*category.Category, error)
}

type categoryUsecase struct {
	categoryRepo category.ICategoryRepository
	validator    *validator.Validate
}

func NewCategoryUsecase(categoryRepo category.ICategoryRepository, validator *validator.Validate) CategoryUsecase {
	return &categoryUsecase{
		categoryRepo: categoryRepo,
		validator:    validator,
	}
}

type CreateCategoryInput struct {
	GuildID string `validate:"required,uuid4"`
	Name    string `validate:"required,min=1,max=100"`
	Order   int    `validate:"gte=0"`
}

func (u *categoryUsecase) CreateCategory(input *CreateCategoryInput) (*category.Category, error) {
	if err := u.validator.Struct(input); err != nil {
		return nil, err
	}

	categoryInput := &category.CreateCategoryInput{
		ID:    uuid.New(),
		GuildID: uuid.MustParse(input.GuildID),
		Name:  input.Name,
		Order: input.Order,
	}

	return u.categoryRepo.Create(categoryInput)
}

var _ CategoryUsecase = (*categoryUsecase)(nil)
