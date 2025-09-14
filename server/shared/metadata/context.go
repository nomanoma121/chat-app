package metadata

import (
	"context"
	"errors"
	"strconv"
	"time"

	"google.golang.org/grpc/metadata"
)

var (
	ErrMetadataNotFound = errors.New("metadata not found in context")
	ErrUserIDNotFound   = errors.New("user_id not found in metadata")
)

type JWTClaims struct {
	UserID string
	Exp    time.Time
	Iat    time.Time
}

func GetJWTClaimsFromMetadata(ctx context.Context) (*JWTClaims, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, ErrMetadataNotFound
	}

	userIDs := md.Get("user_id")
	if len(userIDs) == 0 {
		return nil, ErrUserIDNotFound
	}

	claims := &JWTClaims{
		UserID: userIDs[0],
	}

	if expValues := md.Get("exp"); len(expValues) > 0 {
		if expTimestamp, err := strconv.ParseInt(expValues[0], 10, 64); err == nil {
			claims.Exp = time.Unix(expTimestamp, 0)
		}
	}

	if iatValues := md.Get("iat"); len(iatValues) > 0 {
		if iatTimestamp, err := strconv.ParseInt(iatValues[0], 10, 64); err == nil {
			claims.Iat = time.Unix(iatTimestamp, 0)
		}
	}

	return claims, nil
}

func GetUserIDFromMetadata(ctx context.Context) (string, error) {
	claims, err := GetJWTClaimsFromMetadata(ctx)
	if err != nil {
		return "", err
	}
	return claims.UserID, nil
}
