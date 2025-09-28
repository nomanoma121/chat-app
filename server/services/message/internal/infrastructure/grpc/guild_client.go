package grpc

import (
	pb "chat-app-proto/gen/guild"
	"context"
	"message-service/internal/domain"

	"github.com/google/uuid"
	"google.golang.org/grpc"
)

type guildServiceClient struct {
	client pb.GuildServiceClient
}

func NewGuildServiceClient(conn *grpc.ClientConn) *guildServiceClient {
	return &guildServiceClient{
		client: pb.NewGuildServiceClient(conn),
	}
}

func (c *guildServiceClient) CheckChannelAccess(ctx context.Context, userID, channelID uuid.UUID) (bool, error) {
	resp, err := c.client.CheckChannelAccess(ctx, &pb.CheckChannelAccessRequest{
		UserId:    userID.String(),
		ChannelId: channelID.String(),
	})
	if err != nil {
		return false, err
	}
	return resp.HasAccess, nil
}

var _ domain.IGuildService = (*guildServiceClient)(nil)
