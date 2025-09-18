package grpc

import (
	pb "chat-app-proto/gen/user"
	"context"

	"github.com/google/uuid"
	"google.golang.org/grpc"

	"guild-service/internal/domain"
)

type userServiceClient struct {
	client pb.UserServiceClient
}

func NewUserServiceClient(conn *grpc.ClientConn) *userServiceClient {
	return &userServiceClient{
		client: pb.NewUserServiceClient(conn),
	}
}

func (c *userServiceClient) Exists(userID uuid.UUID) (bool, error) {
	req := &pb.ExistsRequest{
		UserId: userID.String(),
	}
	res, err := c.client.Exists(context.Background(), req)
	if err != nil {
		return false, err
	}
	return res.Exists, nil
}

var _ domain.IUserService = (*userServiceClient)(nil)
