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

func NewMember(guildID, userID uuid.UUID, nickname string) *Member {
	return &Member{
		GuildID:   guildID,
		UserID:    userID,
		Nickname:  nickname,
		JoinedAt:  time.Now(),
		UpdatedAt: time.Now(),
	}
}

func (m *Member) Add(guildID, userID uuid.UUID, nickname string) {
	m.GuildID = guildID
	m.UserID = userID
	m.Nickname = nickname
	m.JoinedAt = time.Now()
	m.UpdatedAt = time.Now()
}

