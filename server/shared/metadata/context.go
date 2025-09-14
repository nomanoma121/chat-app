package metadata

import (
	"context"
	"errors"

	"google.golang.org/grpc/metadata"
)

var (
	ErrMetadataNotFound = errors.New("metadata not found in context")
	ErrUserIDNotFound   = errors.New("user_id not found in metadata")
)

// GetUserIDFromMetadata extracts user_id from gRPC incoming metadata
func GetUserIDFromMetadata(ctx context.Context) (string, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return "", ErrMetadataNotFound
	}

	userIDs := md.Get("user_id")
	if len(userIDs) == 0 {
		return "", ErrUserIDNotFound
	}

	return userIDs[0], nil
}