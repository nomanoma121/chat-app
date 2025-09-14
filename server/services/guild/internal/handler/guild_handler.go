package handler

import (
	"context"
	"log/slog"
	"shared/metadata"
	"time"
	"guild-service/internal/domain"
	"guild-service/internal/usecase"

	pb "chat-app-proto/gen/user"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type GuildHandler struct {
	pb.UnimplementedGuildServiceServer
	guildUsecase usecase.GuildUsecase
	logger       *slog.Logger
}

func NewGuildHandler(guildUsecase usecase.GuildUsecase, logger *slog.Logger) *GuildHandler {
	return &GuildHandler{
		guildUsecase: guildUsecase,
		logger:      logger,
	}
}

func (h *GuildHandler) Create(ctx context.Context, req *pb.CreateGuildRequest) (*pb.CreateGuildResponse, error) {
	domainReq := &domain.GuildRequest{
		Name:        req.Name,
		Description: req.Description,
	}

	guild, err := h.guildUsecase.Create(ctx, domainReq)

	if err != nil {
		switch err {
		case domain.ErrEmailAlreadyExists:
			h.logger.Warn("Registration failed: email already exists")
			return nil, status.Error(codes.AlreadyExists, domain.ErrEmailAlreadyExists.Error())
		case domain.ErrDisplayIDAlreadyExists:
			h.logger.Warn("Registration failed: display ID already exists")
			return nil, status.Error(codes.AlreadyExists, domain.ErrDisplayIDAlreadyExists.Error())
		case domain.ErrInvalidUserData:
			h.logger.Warn("Registration failed: invalid user data")
			return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidUserData.Error())
		default:
			h.logger.Error("Registration failed: unexpected error", "error", err)
			return nil, status.Error(codes.Internal, "failed to register user")
		}
	}

	pbGuild := &pb.Guild{
		Id:        guild.ID.String(),
		DisplayId: guild.DisplayId,
		Name:      guild.Name,
		Bio:       guild.Bio,
		IconUrl:   guild.IconURL,
		CreatedAt: timestamppb.New(guild.CreatedAt),
		UpdatedAt: timestamppb.New(guild.UpdatedAt),
	}
	return &pb.RegisterResponse{Guild: pbGuild}, nil
}


func (h *UserHandler) GetUserByID(ctx context.Context, req *pb.GetUserByIDRequest) (*pb.GetUserByIDResponse, error) {
	userID, err := uuid.Parse(req.Id)
	if err != nil {
		h.logger.Warn("Invalid UUID format", "error", err)
		return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidUserID.Error())
	}

	user, err := h.userUsecase.GetUserByID(ctx, userID)
	if err != nil {
		switch err {
		case domain.ErrUserNotFound:
			h.logger.Warn("User not found")
			return nil, status.Error(codes.NotFound, domain.ErrUserNotFound.Error())
		case domain.ErrInvalidUserID:
			h.logger.Warn("Invalid user ID format")
			return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidUserID.Error())
		default:
			h.logger.Error("Failed to get user: unexpected error", "error", err)
			return nil, status.Error(codes.Internal, "failed to get user")
		}
	}

	pbUser := &pb.User{
		Id:        user.ID.String(),
		DisplayId: user.DisplayId,
		Name:      user.Name,
		Bio:       user.Bio,
		IconUrl:   user.IconURL,
		CreatedAt: timestamppb.New(user.CreatedAt),
		UpdatedAt: timestamppb.New(user.UpdatedAt),
	}
	return &pb.GetUserByIDResponse{User: pbUser}, nil
}


func (h *UserHandler) Update(ctx context.Context, req *pb.UpdateRequest) (*pb.UpdateResponse, error) {
	userIDStr, err := metadata.GetUserIDFromMetadata(ctx)
	if err != nil {
		h.logger.Warn("Failed to get user ID from metadata", "error", err)
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		h.logger.Warn("Invalid user ID format", "user_id", userIDStr, "error", err)
		return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidUserData.Error())
	}

	domainReq := &domain.UpdateRequest{
		ID:      userID,
		Name:    req.Name,
		Bio:     req.Bio,
		IconURL: req.IconUrl,
	}

	updatedUser, err := h.userUsecase.Update(ctx, domainReq)
	if err != nil {
		switch err {
		case domain.ErrUserNotFound:
			h.logger.Warn("User not found", "user_id", userID)
			return nil, status.Error(codes.NotFound, domain.ErrUserNotFound.Error())
		case domain.ErrInvalidUserData:
			h.logger.Warn("Invalid user data", "user_id", userID)
			return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidUserData.Error())
		default:
			h.logger.Error("Failed to update user", "user_id", userID, "error", err)
			return nil, status.Error(codes.Internal, domain.ErrInternalServerError.Error())
		}
	}

	pbUser := &pb.User{
		Id:        updatedUser.ID.String(),
		DisplayId: updatedUser.DisplayId,
		Name:      updatedUser.Name,
		Bio:       updatedUser.Bio,
		IconUrl:   updatedUser.IconURL,
		CreatedAt: timestamppb.New(updatedUser.CreatedAt),
		UpdatedAt: timestamppb.New(updatedUser.UpdatedAt),
	}

	return &pb.UpdateResponse{User: pbUser}, nil
}
