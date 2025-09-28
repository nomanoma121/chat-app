package grpc

import (
	pb "chat-app-proto/gen/user"
	"context"
	"message-service/internal/domain"

	"github.com/google/uuid"
	"google.golang.org/grpc"
)

type userServiceClient struct {
	client pb.UserServiceClient
}

func NewUserServiceClient(conn *grpc.ClientConn) *userServiceClient {
	return &userServiceClient{
		client: pb.NewUserServiceClient(conn),
	}
}

func (c *userServiceClient) GetUsersByIDs(ctx context.Context, ids []uuid.UUID) ([]*domain.User, error) {
	strIDs := make([]string, len(ids))
	for i, id := range ids {
		strIDs[i] = id.String()
	}

	req := &pb.GetUsersByIDsRequest{
		UserIds: strIDs,
	}
	res, err := c.client.GetUsersByIDs(ctx, req)
	if err != nil {
		return nil, err
	}

	users := make([]*domain.User, len(res.Users))
	for i, pbUser := range res.Users {
		userID, err := uuid.Parse(pbUser.Id)
		if err != nil {
			return nil, err
		}
		users[i] = &domain.User{
			ID:        userID,
			DisplayId: pbUser.DisplayId,
			Name:      pbUser.Name,
			Bio:       pbUser.Bio,
			IconURL:   pbUser.IconUrl,
			CreatedAt: pbUser.CreatedAt.AsTime(),
		}
	}

	return users, nil
}

var _ domain.IUserService = (*userServiceClient)(nil)
