package category

import (
	"github.com/google/uuid"
)

type Category struct {
	ID        uuid.UUID
	GuildID   uuid.UUID
	Name      string
	Order     int
	CreatedAt int64
	UpdatedAt int64
}
