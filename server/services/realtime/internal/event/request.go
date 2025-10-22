package event

import "github.com/google/uuid"

type SubscribeChannels struct {
	UserID     uuid.UUID   `json:"user_id"`
	ChannelIDs []uuid.UUID `json:"channel_ids"`
}

func (e SubscribeChannels) GetChannelIDs() []uuid.UUID {
	return e.ChannelIDs
}

func (e SubscribeChannels) GetUserID() uuid.UUID {
	return e.UserID
}
