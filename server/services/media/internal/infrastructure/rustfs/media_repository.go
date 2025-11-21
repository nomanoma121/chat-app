package rustfs

import (
	"context"
	"media-service/internal/handler"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type RustFSMediaRepository struct {
	client     *s3.Client
	bucketName string
}

func NewRustFSMediaRepository(client *s3.Client, bucketName string) *RustFSMediaRepository {
	return &RustFSMediaRepository{
		client:     client,
		bucketName: bucketName,
	}
}

func (r *RustFSMediaRepository) GeneratePresignedURL(ctx context.Context, params handler.GeneratePresignedURLParamas) (string, error) {
	presignClient := s3.NewPresignClient(r.client)
	request, err := presignClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(r.bucketName),
		Key:    aws.String(params.ObjectKey),
	}, s3.WithPresignExpires(params.Expires))

	if err != nil {
		return "", err
	}

	return request.URL, nil
}

var _ handler.MediaRepository = (*RustFSMediaRepository)(nil)
