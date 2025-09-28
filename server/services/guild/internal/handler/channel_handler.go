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

type channelHandler struct {
	channelUsecase usecase.ChannelUsecase
	logger         *slog.Logger
}

func NewChannelHandler(channelUsecase usecase.ChannelUsecase, logger *slog.Logger) *channelHandler {
	return &channelHandler{
		channelUsecase: channelUsecase,
		logger:         logger,
	}
}

func (h *channelHandler) CreateChannel(ctx context.Context, req *pb.CreateChannelRequest) (*pb.CreateChannelResponse, error) {
	userID, err := getUserID(ctx, h.logger)
	if err != nil {
		return nil, err
	}
	
	categoryID, err := uuid.Parse(req.CategoryId)
	if err != nil {
		h.logger.Warn("Invalid category ID format", "category_id", req.CategoryId, "error", err)
		return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidArgument.Error())
	}

	channel, err := h.channelUsecase.Create(ctx, &usecase.CreateChannelParams{
		CategoryID: categoryID,
		UserID:     userID,
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

func (h *channelHandler) CheckChannelAccess(ctx context.Context, req *pb.CheckChannelAccessRequest) (*pb.CheckChannelAccessResponse, error) {
	userID, err := uuid.Parse(req.UserId)
	if err != nil {
		h.logger.Warn("Invalid user ID format", "user_id", req.UserId, "error", err)
		return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidArgument.Error())
	}

	channelID, err := uuid.Parse(req.ChannelId)
	if err != nil {
		h.logger.Warn("Invalid channel ID format", "channel_id", req.ChannelId, "error", err)
		return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidArgument.Error())
	}

	hasAccess, err := h.channelUsecase.CheckAccess(ctx, userID, channelID)
	if err != nil {
		switch err {
		case domain.ErrChannelNotFound:
			h.logger.Warn("Channel not found", "channel_id", channelID)
			return nil, status.Error(codes.NotFound, domain.ErrChannelNotFound.Error())
		default:
			h.logger.Error("Failed to check channel access", "user_id", userID, "channel_id", channelID, "error", err)
			return nil, status.Error(codes.Internal, domain.ErrInternalServerError.Error())
		}
	}

	return &pb.CheckChannelAccessResponse{HasAccess: hasAccess}, nil
}
