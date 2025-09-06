package handler

import (
	"context"
	"user-service/internal/domain"
	"user-service/internal/usecase"

	pb "../../../../api/gen"
	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type UserHandler struct {
	pb.UnimplementedUserServiceServer
	userUsecase usecase.UserUsecase
}

func NewUserHandler(userUsecase usecase.UserUsecase) *UserHandler {
	return &UserHandler{
		userUsecase: userUsecase,
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
		return nil, status.Error(codes.Internal, err.Error())
	}

	pbUser := &pb.User{
		Id:        user.ID.String(),
		DisplayId: user.DisplayId,
		Name:      user.Name,
		Bio:       user.Bio,
		IconUrl:   user.IconURL,
	}

	if user.CreatedAt != nil {
		pbUser.CreatedAt = timestamppb.New(*user.CreatedAt)
	}
	if user.UpdatedAt != nil {
		pbUser.UpdatedAt = timestamppb.New(*user.UpdatedAt)
	}

	return &pb.RegisterResponse{User: pbUser}, nil
}

func (h *UserHandler) GetUserByID(ctx context.Context, req *pb.GetUserByIDRequest) (*pb.GetUserByIDResponse, error) {
	userID, err := uuid.Parse(req.Id)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid user ID")
	}

	user, err := h.userUsecase.GetUserByID(ctx, userID)
	if err != nil {
		return nil, status.Error(codes.NotFound, "user not found")
	}

	pbUser := &pb.User{
		Id:        user.ID.String(),
		DisplayId: user.DisplayId,
		Name:      user.Name,
		Bio:       user.Bio,
		IconUrl:   user.IconURL,
	}

	if user.CreatedAt != nil {
		pbUser.CreatedAt = timestamppb.New(*user.CreatedAt)
	}
	if user.UpdatedAt != nil {
		pbUser.UpdatedAt = timestamppb.New(*user.UpdatedAt)
	}

	return &pb.GetUserByIDResponse{User: pbUser}, nil
}