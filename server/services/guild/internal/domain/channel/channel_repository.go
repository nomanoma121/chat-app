package channel

import (
	"github.com/google/uuid"
)

type CreateChannelInput struct {
	ID         uuid.UUID
	CategoryID uuid.UUID
	Name       string
	Order      int
}

type IChannelRepository interface {
	Create(channel *CreateChannelInput) (*Channel, error)
}
