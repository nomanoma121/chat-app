package domain

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID
	DisplayId string
	Name      string
	Bio       string
	IconURL   string
	CreatedAt time.Time
}

type IUserService interface {
	GetUsersByIDs(ids []uuid.UUID) ([]*User, error)
}
