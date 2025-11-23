package grpc

import (
	pb "chat-app-proto/gen/media"
	"context"
	"guild-service/internal/domain"

	"google.golang.org/grpc"
)

type mediaServiceClient struct {
	client pb.MediaServiceClient
}

func NewMediaServiceClient(conn *grpc.ClientConn) *mediaServiceClient {
	return &mediaServiceClient{
		client: pb.NewMediaServiceClient(conn),
	}
}

func (c *mediaServiceClient) GetPresignedUploadURL(ctx context.Context, mediaType domain.MediaType, filename string) (string, error) {
	req := &pb.GetPresignedUploadURLRequest{
		MediaType: pb.MediaType(mediaType),
		Filename: filename,
	}
	res, err := c.client.GetPresignedUploadURL(ctx, req)
	if err != nil {
		return "", err
	}
	return res.UploadUrl, nil
}

var _ domain.IMediaService = (*mediaServiceClient)(nil)
