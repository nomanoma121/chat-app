package domain

import "errors"

var (
	ErrGuildNotFound       = errors.New("guild not found")
	ErrInvalidGuildData    = errors.New("invalid guild data")
	ErrInvalidGuildID      = errors.New("invalid guild ID")
	ErrInternalServerError = errors.New("internal server error")
	ErrInvalidCredentials  = errors.New("invalid credentials")
)
