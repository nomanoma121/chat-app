package event

import (
	"github.com/google/uuid"
)

type AuthRequest struct {
	Token string `json:"token"`
}

type AuthError struct {
	Message string `json:"message"`
}

type AuthSuccess struct {
	UserID uuid.UUID `json:"user_id"`
}
