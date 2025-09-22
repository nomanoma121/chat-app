package handler

import (
	"context"
	"log/slog"
	"shared/metadata"
	"time"
	"message-service/internal/domain"
	"message-service/internal/usecase"

	pb "chat-app-proto/gen/message"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type UserHandler struct {
	pb.UnimplementedMessageServiceServer
	userUsecase usecase.UserUsecase
	logger      *slog.Logger
}

func NewMessageHandler(userUsecase usecase.UserUsecase, logger *slog.Logger) *UserHandler {
	return &UserHandler{
		userUsecase: userUsecase,
		logger:      logger,
	}
}

func (h *UserHandler) Register(ctx context.Context, req *pb.RegisterRequest) (*pb.RegisterResponse, error) {
	usecaseParams := &usecase.RegisterParams{
		DisplayId: req.DisplayId,
		Name:      req.Name,
		Email:     req.Email,
		Password:  req.Password,
		Bio:       req.Bio,
		IconURL:   req.IconUrl,
	}

	user, err := h.messageUsecase.Register(ctx, usecaseParams)
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

	pbUser := &pb.User{
		Id:        user.ID.String(),
		DisplayId: user.DisplayId,
		Name:      user.Name,
		Bio:       user.Bio,
		IconUrl:   user.IconURL,
		CreatedAt: timestamppb.New(user.CreatedAt),
	}
	return &pb.RegisterResponse{User: pbUser}, nil
}

