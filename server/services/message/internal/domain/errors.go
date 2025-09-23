package domain

import "errors"

var (
	ErrInvalidMessageData     = errors.New("invalid message data")
	ErrInvalidUserID          = errors.New("invalid user ID")
	ErrInternalServerError    = errors.New("internal server error")
	ErrInvalidCredentials     = errors.New("invalid credentials")
)
