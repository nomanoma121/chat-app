package handler

import (
	"context"
	"guild-service/internal/domain"
	"log/slog"
	"shared/metadata"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func getUserID(ctx context.Context, logger *slog.Logger) (uuid.UUID, error) {
	userIDStr, err := metadata.GetUserIDFromMetadata(ctx)
	if err != nil {
		logger.Warn("Failed to get user ID from metadata", "error", err)
		return uuid.Nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		logger.Warn("Invalid user ID format", "user_id", userIDStr, "error", err)
		return uuid.Nil, status.Error(codes.InvalidArgument, domain.ErrInvalidGuildData.Error())
	}
	return userID, nil
}
