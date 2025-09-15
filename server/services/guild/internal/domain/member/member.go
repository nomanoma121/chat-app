package member

import (
	"time"

	"github.com/google/uuid"
)

type Member struct {
	UserID    uuid.UUID `db:"user_id"`
	GuildID   uuid.UUID `db:"guild_id"`
	Nickname  string    `db:"nickname"`
	Order     int       `db:"order"`
	JoinedAt  time.Time `db:"joined_at"`
	UpdatedAt time.Time `db:"updated_at"`
}
