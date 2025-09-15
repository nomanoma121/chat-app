package channel

import "github.com/google/uuid"

type Channel struct {
	ID        uuid.UUID
	GuildID   uuid.UUID
	Name      string
	Order     int
	CreatedAt int64
	UpdatedAt int64
}
