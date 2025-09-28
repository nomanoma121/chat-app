package domain

import "errors"

var (
	// Not Found
	ErrGuildNotFound    = errors.New("guild not found")
	ErrUserNotFound     = errors.New("user not found")
	ErrCategoryNotFound = errors.New("category not found")
	ErrChannelNotFound  = errors.New("channel not found")
	ErrMemberNotFound   = errors.New("member not found")

	// Conflict
	ErrInvalidGuildData    = errors.New("invalid guild data")
	ErrInvalidCategoryData = errors.New("invalid category data")
	ErrInvalidChannelData  = errors.New("invalid channel data")
	ErrMemberAlreadyExists = errors.New("member already exists")

	// Bad Request
	ErrInvalidCredential = errors.New("invalid credential")
	ErrInvalidArgument   = errors.New("invalid argument")
	ErrInvalidGuildID    = errors.New("invalid guild ID")
	ErrInvalidCategoryID = errors.New("invalid category ID")
	ErrInvalidChannelID  = errors.New("invalid channel ID")
	ErrInvalidMemberID   = errors.New("invalid member ID")
	ErrInvalidInviteData = errors.New("invalid invite data")
	ErrInvalidInviteCode = errors.New("invalid invite code")

	// 403
	ErrPermissionDenied = errors.New("permission denied")

	// Internal Server Error
	ErrInternalServerError = errors.New("internal server error")
)
