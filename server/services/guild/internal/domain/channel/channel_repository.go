package channel

import (
	"github.com/google/uuid"
)

type ChannelInput struct {
	GuildID uuid.UUID
	Name    string
	Order   int
}

type IChannelRepository interface {
	Create(channel *ChannelInput) (*Channel, error)
}
