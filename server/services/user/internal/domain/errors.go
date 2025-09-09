package domain

import "errors"

var (
	ErrUserNotFound           = errors.New("user not found")
	ErrEmailAlreadyExists     = errors.New("email already exists")
	ErrDisplayIDAlreadyExists = errors.New("display ID already exists")
	ErrInvalidUserData        = errors.New("invalid user data")
	ErrInvalidUserID          = errors.New("invalid user ID")
	ErrInternalServerError     = errors.New("internal server error")
	ErrInvalidCredentials    = errors.New("invalid credentials")
)
