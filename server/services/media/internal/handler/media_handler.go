package handler

import (
	pb "chat-app-proto/gen/media"
	"context"
	"errors"
	"net/url"
	"time"
)

const (
	// 15 minute
	EXPIRES_DURATION = time.Duration(15 * time.Minute)

	GUILD_ICON_KEY = "guild_icon"
	USER_ICON_KEY  = "user_icon"
)

type GeneratePresignedURLParamas struct {
	ObjectKey string
	Expires   time.Duration
}

type MediaRepository interface {
	GeneratePresignedURL(context.Context, GeneratePresignedURLParamas) (string, error)
}

type MediaHandler struct {
	pb.UnimplementedMediaServiceServer
	mediaRepo MediaRepository
	objectStoreEndpoint url.URL
}

func NewMediaHandler(mediaRepo MediaRepository, objectStoreEndpoint url.URL) *MediaHandler {
	return &MediaHandler{
		mediaRepo: mediaRepo,
		objectStoreEndpoint: objectStoreEndpoint,
	}
}

func (h *MediaHandler) GetPresignedUploadURL(ctx context.Context, req *pb.GetPresignedUploadURLRequest) (*pb.GetPresignedUploadURLResponse, error) {
	var objectKey string
	switch req.MediaType {
	case pb.MediaType_MEDIA_TYPE_UNSPECIFIED:
		return nil, errors.New("media type unspecified")
	case pb.MediaType_MEDIA_TYPE_GUILD_ICON:
		objectKey = GUILD_ICON_KEY
	case pb.MediaType_MEDIA_TYPE_USER_ICON:
		objectKey = USER_ICON_KEY
	}

	presignedURL, err := h.mediaRepo.GeneratePresignedURL(ctx, GeneratePresignedURLParamas{
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

	// 登録したドメインに置き換える
	parsedPresignedURL.Host = h.objectStoreEndpoint.Host
	parsedPresignedURL.Scheme = h.objectStoreEndpoint.Scheme

	return &pb.GetPresignedUploadURLResponse{
		UploadUrl: parsedPresignedURL.String(),
	}, nil
}

var _ pb.MediaServiceServer = (*MediaHandler)(nil)
