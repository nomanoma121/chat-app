package main

import (
	"context"
	"media-service/internal/handler"
	"media-service/internal/infrastructure/rustfs"
	"media-service/internal/seeder"
	"net"
	"os"
	"shared/logger"

	pb "chat-app-proto/gen/media"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/joho/godotenv"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

const (
	BUCKET_NAME = "chat-app-bucket"
)

func init() {
	_ = godotenv.Load()

	log := logger.Default("media-service")
	log.Info("Starting Media Service...")
}

func main() {
	log := logger.Default("media-service")
	ctx := context.Background()

	rustfsEndpoint := os.Getenv("RUSTFS_ENDPOINT")

	sdkConfig, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("us-east-1"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			os.Getenv("AWS_ACCESS_KEY_ID"),
			os.Getenv("AWS_SECRET_ACCESS_KEY"),
			"",
		)),
	)
	if err != nil {
		log.Error("Could not load AWS SDK config", "error", err)
		os.Exit(1)
	}

	s3Client := s3.NewFromConfig(sdkConfig, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(rustfsEndpoint)
		o.UsePathStyle = true
	})

	mediaRepo := rustfs.NewRustFSMediaRepository(s3Client, BUCKET_NAME)
	mediaHandler := handler.NewMediaHandler(mediaRepo)
	server := grpc.NewServer()
	pb.RegisterMediaServiceServer(server, mediaHandler)
	reflection.Register(server)

	port := 50055
	lis, err := net.Listen("tcp", ":50055")
	if err != nil {
		log.Error("Failed to listen", "port", port, "error", err)
		os.Exit(1)
	}

	log.Info("Media service starting", "port", port)

	seeder := seeder.NewSeeder(mediaRepo)
	if err := seeder.SeedUserIcons(ctx); err != nil {
		log.Error("Failed to seed user icons", "error", err)
	} else {
		log.Info("User icons seeded successfully")
	}
	if err := seeder.SeedGuildIcons(ctx); err != nil {
		log.Error("Failed to seed guild icons", "error", err)
	} else {
		log.Info("Guild icons seeded successfully")
	}

	if err := server.Serve(lis); err != nil {
		log.Error("Failed to serve", "error", err)
		os.Exit(1)
	}
}
