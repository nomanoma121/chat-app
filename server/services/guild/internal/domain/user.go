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
	Exists(userID uuid.UUID) (bool, error)
	GetUserByID(userID uuid.UUID) (User, error)
	GetUsersByIDs(ids []uuid.UUID) ([]*User, error)
}
