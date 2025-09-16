package category

import (
	"time"

	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

var validate = validator.New()

type Category struct {
	id        uuid.UUID
	guildID   uuid.UUID
	name      string
	createdAt time.Time
}

type NewCategoryDTO struct {
	GuildID string `validate:"required,uuid4"`
	Name    string `validate:"required,min=1,max=20"`
}

func (d *NewCategoryDTO) Validate() error {
	return validate.Struct(d)
}

func NewCategory(dto *NewCategoryDTO) (*Category, error) {
	if err := dto.Validate(); err != nil {
		return nil, err
	}
	return &Category{
		id:        uuid.New(),
		guildID:   uuid.MustParse(dto.GuildID),
		name:      dto.Name,
		createdAt: time.Now(),
	}, nil
}
