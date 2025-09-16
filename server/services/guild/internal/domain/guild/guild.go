package guild

import (
	"time"

	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

var validate = validator.New()

type Guild struct {
	id          uuid.UUID
	ownerID     uuid.UUID
	name        string
	description string
	iconURL     string
	createdAt   time.Time
}

type NewGuildDTO struct {
	OwnerID     uuid.UUID `validate:"required,uuid4"`
	Name        string    `validate:"required,min=2,max=20"`
	Description string    `validate:"required,min=2,max=100"`
	IconURL     string    `validate:"required,url"`
}

func (d *NewGuildDTO) Validate() error {
	return validate.Struct(d)
}

func NewGuild(dto *NewGuildDTO) (*Guild, error) {
	if err := dto.Validate(); err != nil {
		return nil, err
	}
	return &Guild{
		id:          uuid.New(),
		ownerID:     dto.OwnerID,
		name:        dto.Name,
		description: dto.Description,
		iconURL:     dto.IconURL,
		createdAt:   time.Now(),
	}, nil
}
