package channel

import (
	"time"

	"github.com/google/uuid"
)

type Channel struct {
	ID         uuid.UUID
	CategoryID uuid.UUID
	Name       string
	Order      int
	CreatedAt  time.Time
	UpdatedAt  time.Time
}
