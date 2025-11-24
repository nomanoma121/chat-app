package domain

import "context"

type MediaType = int32

const (
	MEDIA_TYPE_GUILD_ICON MediaType = 1
)

type IMediaService interface {
	GetPresignedUploadURL(context.Context, MediaType, string) (string, error)
}
