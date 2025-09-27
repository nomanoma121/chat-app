package grpc

import (
	pb "chat-app-proto/gen/user"
	"context"
	"guild-service/internal/domain"

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

func (c *userServiceClient) GetUserByID(userID uuid.UUID) (domain.User, error) {
	req := &pb.GetUserByIDRequest{
		Id: userID.String(),
	}
	res, err := c.client.GetUserByID(context.Background(), req)
	if err != nil {
		return domain.User{}, err
	}

	id, err := uuid.Parse(res.User.Id)
	if err != nil {
		return domain.User{}, err
	}

	return domain.User{
		ID:        id,
		DisplayId: res.User.DisplayId,
		Name:      res.User.Name,
		Bio:       res.User.Bio,
		IconURL:   res.User.IconUrl,
		CreatedAt: res.User.CreatedAt.AsTime(),
	}, nil
}

func (c *userServiceClient) GetUsersByIDs(ids []uuid.UUID) ([]*domain.User, error) {
	strIDs := make([]string, len(ids))
	for i, id := range ids {
		strIDs[i] = id.String()
	}

	req := &pb.GetUsersByIDsRequest{
		UserIds: strIDs,
	}
	res, err := c.client.GetUsersByIDs(context.Background(), req)
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
