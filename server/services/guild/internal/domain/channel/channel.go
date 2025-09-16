package channel

import (
	"time"

	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

var validate = validator.New()

type Channel struct {
	id         uuid.UUID
	categoryID uuid.UUID
	name       string
	createdAt  time.Time
}

type NewChannelDTO struct {
	CategoryID string `validate:"required,uuid4"`
	Name       string `validate:"required,min=1,max=20"`
}

func (d *NewChannelDTO) Validate() error {
	return validate.Struct(d)
}

func NewChannel(dto *NewChannelDTO) (*Channel, error) {
	if err := dto.Validate(); err != nil {
		return nil, err
	}
	return &Channel{
		id:         uuid.New(),
		categoryID: uuid.MustParse(dto.CategoryID),
		name:       dto.Name,
		createdAt:  time.Now(),
	}, nil
}
