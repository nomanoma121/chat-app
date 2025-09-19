package handler

import (
	"context"
	"log/slog"
	"shared/metadata"
	"time"
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
	usecaseParams := &usecase.RegisterParams{
		DisplayId: req.DisplayId,
		Name:      req.Name,
		Email:     req.Email,
		Password:  req.Password,
		Bio:       req.Bio,
		IconURL:   req.IconUrl,
	}

	user, err := h.userUsecase.Register(ctx, usecaseParams)
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

func (h *UserHandler) Login(ctx context.Context, req *pb.LoginRequest) (*pb.LoginResponse, error) {
	usecaseParams := &usecase.LoginParams{
		Email:    req.Email,
		Password: req.Password,
	}

	token, err := h.userUsecase.Login(ctx, usecaseParams)
	if err != nil {
		switch err {
		case domain.ErrInvalidCredentials:
			h.logger.Warn("Login failed: user not found")
			return nil, status.Error(codes.NotFound, domain.ErrInvalidCredentials.Error())
		default:
			h.logger.Error("Login failed: unexpected error", "error", err)
			return nil, status.Error(codes.Internal, "failed to login")
		}
	}

	return &pb.LoginResponse{Token: *token}, nil
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
	}
	return &pb.GetUserByIDResponse{User: pbUser}, nil
}

func (h *UserHandler) AuthMe(ctx context.Context, req *pb.AuthMeRequest) (*pb.AuthMeResponse, error) {
	claims, err := metadata.GetJWTClaimsFromMetadata(ctx)
	if err != nil {
		h.logger.Warn("Failed to get JWT claims from metadata", "error", err)
		return nil, status.Error(codes.Unauthenticated, domain.ErrInvalidCredentials.Error())
	}

	h.logger.Info("AuthMe called", "user_id", claims.UserID)

	return &pb.AuthMeResponse{
		UserId: claims.UserID,
		Exp:    claims.Exp.Format(time.RFC3339),
		Iat:    claims.Iat.Format(time.RFC3339),
	}, nil
}

func (h *UserHandler) GetCurrentUser(ctx context.Context, req *pb.GetCurrentUserRequest) (*pb.GetCurrentUserResponse, error) {
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

	user, err := h.userUsecase.GetUserByID(ctx, userID)
	if err != nil {
		switch err {
		case domain.ErrUserNotFound:
			h.logger.Warn("User not found", "user_id", userID)
			return nil, status.Error(codes.NotFound, domain.ErrUserNotFound.Error())
		default:
			h.logger.Error("Failed to get current user", "user_id", userID, "error", err)
			return nil, status.Error(codes.Internal, domain.ErrInternalServerError.Error())
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

	return &pb.GetCurrentUserResponse{User: pbUser}, nil
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

	usecaseParams := &usecase.UpdateParams{
		ID:      userID,
		Name:    req.Name,
		Bio:     req.Bio,
		IconURL: req.IconUrl,
	}

	updatedUser, err := h.userUsecase.Update(ctx, usecaseParams)
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
	}

	return &pb.UpdateResponse{User: pbUser}, nil
}

func (h *UserHandler) Exists(ctx context.Context, req *pb.ExistsRequest) (*pb.ExistsResponse, error) {
	userID, err := uuid.Parse(req.UserId)
	if err != nil {
		h.logger.Warn("Invalid user ID format", "user_id", req.UserId, "error", err)
		return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidUserID.Error())
	}

	_, err = h.userUsecase.GetUserByID(ctx, userID)
	if err != nil {
		switch err {
		case domain.ErrUserNotFound:
			return &pb.ExistsResponse{Exists: false}, nil
		default:
			h.logger.Error("Failed to check user existence", "user_id", userID, "error", err)
			return nil, status.Error(codes.Internal, "failed to check user existence")
		}
	}

	return &pb.ExistsResponse{Exists: true}, nil
}
