package handler

import (
	"context"
	"guild-service/internal/domain"
	"guild-service/internal/usecase"
	"log/slog"

	pb "chat-app-proto/gen/guild"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type CategoryHandler struct {
	categoryUsecase usecase.CategoryUsecase
	logger          *slog.Logger
}

func NewCategoryHandler(categoryUsecase usecase.CategoryUsecase, logger *slog.Logger) *CategoryHandler {
	return &CategoryHandler{
		categoryUsecase: categoryUsecase,
		logger:          logger,
	}
}

func (h *CategoryHandler) CreateCategory(ctx context.Context, req *pb.CreateCategoryRequest) (*pb.CreateCategoryResponse, error) {
	guildID, err := uuid.Parse(req.GuildId)
	if err != nil {
		h.logger.Warn("Invalid guild ID format", "guild_id", req.GuildId, "error", err)
		return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidArgument.Error())
	}

	category, err := h.categoryUsecase.CreateCategory(ctx, &usecase.CreateCategoryParams{
		GuildID: guildID,
		Name:    req.Name,
	})
	if err != nil {
		switch err {
		case domain.ErrInvalidCategoryData:
			h.logger.Warn("Invalid category data", "guild_id", guildID)
			return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidCategoryData.Error())
		case domain.ErrGuildNotFound:
			h.logger.Warn("Guild not found", "guild_id", guildID)
			return nil, status.Error(codes.NotFound, domain.ErrGuildNotFound.Error())
		default:
			h.logger.Error("Failed to create category", "guild_id", guildID, "error", err)
			return nil, status.Error(codes.Internal, domain.ErrInternalServerError.Error())
		}
	}

	pbCategory := &pb.Category{
		Id:        category.ID.String(),
		GuildId:   category.GuildID.String(),
		Name:      category.Name,
		CreatedAt: timestamppb.New(category.CreatedAt),
	}

	return &pb.CreateCategoryResponse{
		Category: pbCategory,
	}, nil
}