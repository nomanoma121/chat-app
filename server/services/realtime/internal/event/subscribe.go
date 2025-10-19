package event

import "github.com/google/uuid"

type SubscribeChannels struct {
	ChannelIDs []uuid.UUID `json:"channel_ids"`
}
