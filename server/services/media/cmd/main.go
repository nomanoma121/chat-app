package cmd

import (
	"context"
	"fmt"
	"media-service/internal/handler"
	"media-service/internal/infrastructure/rustfs"
	"net"
	"os"
	"shared/logger"

	pb "chat-app-proto/gen/media"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/joho/godotenv"

	"github.com/jackc/pgx/v5/pgxpool"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

var db *pgxpool.Pool

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
	sdkConfig, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		fmt.Println("Could not load AWS SDK config:", err)
		return
	}

	s3Client := s3.NewFromConfig(sdkConfig)
	mediaRepo := rustfs.NewRustFSMediaRepository(s3Client, BUCKET_NAME)
	mediaHandler := handler.NewMediaHandler(mediaRepo)
	server := grpc.NewServer()
	pb.RegisterMediaServiceServer(server, mediaHandler)
	reflection.Register(server)

	port := 50051
	lis, err := net.Listen("tcp", ":50055")
	if err != nil {
		log.Error("Failed to listen", "port", port, "error", err)
		os.Exit(1)
	}

	log.Info("Media service starting", "port", port)
	if err := server.Serve(lis); err != nil {
		log.Error("Failed to serve", "error", err)
		os.Exit(1)
	}
}
