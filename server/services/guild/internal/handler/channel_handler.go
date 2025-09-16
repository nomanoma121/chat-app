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

type ChannelHandler struct {
	channelUsecase usecase.ChannelUsecase
	logger         *slog.Logger
}

func NewChannelHandler(channelUsecase usecase.ChannelUsecase, logger *slog.Logger) *ChannelHandler {
	return &ChannelHandler{
		channelUsecase: channelUsecase,
		logger:         logger,
	}
}

func (h *ChannelHandler) CreateChannel(ctx context.Context, req *pb.CreateChannelRequest) (*pb.CreateChannelResponse, error) {
	categoryID, err := uuid.Parse(req.CategoryId)
	if err != nil {
		h.logger.Warn("Invalid category ID format", "category_id", req.CategoryId, "error", err)
		return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidArgument.Error())
	}

	channel, err := h.channelUsecase.Create(ctx, &usecase.CreateChannelParams{
		CategoryID: categoryID,
		Name:       req.Name,
	})
	if err != nil {
		switch err {
		case domain.ErrInvalidChannelData:
			h.logger.Warn("Invalid channel data", "category_id", categoryID)
			return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidChannelData.Error())
		case domain.ErrCategoryNotFound:
			h.logger.Warn("Category not found", "category_id", categoryID)
			return nil, status.Error(codes.NotFound, domain.ErrCategoryNotFound.Error())
		default:
			h.logger.Error("Failed to create channel", "category_id", categoryID, "error", err)
			return nil, status.Error(codes.Internal, domain.ErrInternalServerError.Error())
		}
	}

	pbChannel := &pb.Channel{
		Id:         channel.ID.String(),
		CategoryId: channel.CategoryID.String(),
		Name:       channel.Name,
		CreatedAt:  timestamppb.New(channel.CreatedAt),
	}

	return &pb.CreateChannelResponse{Channel: pbChannel}, nil
}