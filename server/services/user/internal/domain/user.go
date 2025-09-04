package domain

import (
	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

var validate = validator.New()

type User struct {
	ID uuid.UUID `validate:"required,uuid"`
	// 半角英数字、ドット、アンダースコア、ハイフンのみ
	DisplayId string `validate:"required,min=3,max=20,regexp=^[a-zA-Z0-9_.-]+$"`
	Name      string `validate:"required,min=1,max=15"`
	Email     string `validate:"required,email"`
	Password  string `validate:"required,min=8"`
	Bio       string `validate:"omitempty,max=500"`
	IconURL   string `validate:"omitempty,url"`
	CreatedAt *int64
	UpdatedAt *int64
}

type RegisterRequest struct {
	DisplayId string `validate:"required,min=3,max=20,regexp=^[a-zA-Z0-9_.-]+$"`
	Name      string `validate:"required,min=1,max=15"`
	Email     string `validate:"required,email"`
	Password  string `validate:"required,min=8"`
	Bio       string `validate:"omitempty,max=500"`
	IconURL   string `validate:"omitempty,url"`
}

func NewUser(user User) *User {
	return &User{
		ID:        user.ID,
		DisplayId: user.DisplayId,
		Name:      user.Name,
		Email:     user.Email,
		Password:  user.Password,
		Bio:       user.Bio,
		IconURL:   user.IconURL,
	}
}

func (u *User) Validate() error {
	return validate.Struct(u)
}
