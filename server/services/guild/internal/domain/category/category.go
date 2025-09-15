package category

import (
	"time"

	"github.com/google/uuid"
)

type Category struct {
	ID        uuid.UUID
	GuildID   uuid.UUID
	Name      string
	Order     int
	CreatedAt time.Time
	UpdatedAt time.Time
}
