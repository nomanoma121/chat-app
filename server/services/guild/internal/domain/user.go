package domain

import (
	"github.com/google/uuid"
)

type IUserService interface {
	Exists(userID uuid.UUID) (bool, error)
}
