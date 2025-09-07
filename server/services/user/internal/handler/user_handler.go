package handler

import (
	"context"
	"log/slog"
	"user-service/internal/domain"
	"user-service/internal/usecase"

	pb "chat-app-proto/gen/user"
	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type UserHandler struct {
	pb.UnimplementedUserServiceServer
	userUsecase usecase.UserUsecase
	logger      *slog.Logger
}

func NewUserHandler(userUsecase usecase.UserUsecase, logger *slog.Logger) *UserHandler {
	return &UserHandler{
		userUsecase: userUsecase,
		logger:      logger,
	}
}

func (h *UserHandler) Register(ctx context.Context, req *pb.RegisterRequest) (*pb.RegisterResponse, error) {
	domainReq := &domain.RegisterRequest{
		DisplayId: req.DisplayId,
		Name:      req.Name,
		Email:     req.Email,
		Password:  req.Password,
		Bio:       req.Bio,
		IconURL:   req.IconUrl,
	}

	user, err := h.userUsecase.Register(ctx, domainReq)

	if err != nil {
		switch err {
		case domain.ErrEmailAlreadyExists:
			h.logger.Warn("Registration failed: email already exists", "display_id", req.DisplayId)
			return nil, status.Error(codes.AlreadyExists, domain.ErrEmailAlreadyExists.Error())
		case domain.ErrDisplayIDAlreadyExists:
			h.logger.Warn("Registration failed: display ID already exists", "display_id", req.DisplayId)
			return nil, status.Error(codes.AlreadyExists, domain.ErrDisplayIDAlreadyExists.Error())
		case domain.ErrInvalidUserData:
			h.logger.Warn("Registration failed: invalid user data", "display_id", req.DisplayId)
			return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidUserData.Error())
		default:
			h.logger.Error("Registration failed: unexpected error", "error", err, "display_id", req.DisplayId)
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
		UpdatedAt: timestamppb.New(user.UpdatedAt),
	}
	return &pb.RegisterResponse{User: pbUser}, nil
}

func (h *UserHandler) GetUserByID(ctx context.Context, req *pb.GetUserByIDRequest) (*pb.GetUserByIDResponse, error) {
	userID, err := uuid.Parse(req.Id)
	if err != nil {
		h.logger.Warn("Invalid UUID format", "user_id", req.Id, "error", err)
		return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidUserID.Error())
	}

	user, err := h.userUsecase.GetUserByID(ctx, userID)
	if err != nil {
		switch err {
		case domain.ErrUserNotFound:
			h.logger.Warn("User not found", "user_id", req.Id)
			return nil, status.Error(codes.NotFound, domain.ErrUserNotFound.Error())
		case domain.ErrInvalidUserID:
			h.logger.Warn("Invalid user ID format", "user_id", req.Id)
			return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidUserID.Error())
		default:
			h.logger.Error("Failed to get user: unexpected error", "error", err, "user_id", req.Id)
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
