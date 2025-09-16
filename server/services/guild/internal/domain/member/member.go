package member

import (
	"time"

	"github.com/go-playground/validator"
	"github.com/google/uuid"
)

var validate = validator.New()

type Member struct {
	userID   uuid.UUID
	guildID  uuid.UUID
	nickname string
	joinedAt time.Time
}

type NewMemberDTO struct {
	UserID   uuid.UUID `validate:"required,uuid4"`
	GuildID  uuid.UUID `validate:"required,uuid4"`
	Nickname string    `validate:"required,min=1,max=20"`
}

func (m *NewMemberDTO) Validate() error {
	return validate.Struct(m)
}

func NewMember(dto *NewMemberDTO) (*Member, error) {
	if err := dto.Validate(); err != nil {
		return nil, err
	}
	return &Member{
		userID:   dto.UserID,
		guildID:  dto.GuildID,
		nickname: dto.Nickname,
		joinedAt: time.Now(),
	}, nil
}
