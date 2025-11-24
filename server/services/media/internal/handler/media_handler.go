package handler

import (
	pb "chat-app-proto/gen/media"
	"context"
	"errors"
	"media-service/internal/constants"
	"net/url"
	"time"
)

const (
	// 15 minute
	EXPIRES_DURATION = 15 * time.Minute
)

type GeneratePresignedURLParams struct {
	ObjectKey string
	Expires   time.Duration
}

type MediaRepository interface {
	GeneratePresignedURL(context.Context, GeneratePresignedURLParams) (string, error)
}

type MediaHandler struct {
	pb.UnimplementedMediaServiceServer
	mediaRepo MediaRepository
}

func NewMediaHandler(mediaRepo MediaRepository) *MediaHandler {
	return &MediaHandler{
		mediaRepo: mediaRepo,
	}
}

func (h *MediaHandler) GetPresignedUploadURL(ctx context.Context, req *pb.GetPresignedUploadURLRequest) (*pb.GetPresignedUploadURLResponse, error) {
	var objectKey string
	switch req.MediaType {
	case pb.MediaType_MEDIA_TYPE_UNSPECIFIED:
		return nil, errors.New("media type unspecified")
	case pb.MediaType_MEDIA_TYPE_GUILD_ICON:
		objectKey = constants.GUILD_ICON_PATH + req.Filename
	case pb.MediaType_MEDIA_TYPE_USER_ICON:
		objectKey = constants.USER_ICON_PATH + req.Filename
	}

	presignedURL, err := h.mediaRepo.GeneratePresignedURL(ctx, GeneratePresignedURLParams{
		ObjectKey: objectKey,
		Expires:   EXPIRES_DURATION,
	})
	if err != nil {
		return nil, err
	}

	parsedPresignedURL, err := url.Parse(presignedURL)
	if err != nil {
		return nil, err
	}

	return &pb.GetPresignedUploadURLResponse{
		UploadUrl: parsedPresignedURL.String(),
	}, nil
}

var _ pb.MediaServiceServer = (*MediaHandler)(nil)
