package main

import (
	"context"
	"guild-service/internal/handler"
	"guild-service/internal/infrastructure/postgres"
	"guild-service/internal/infrastructure/postgres/generated"
	"guild-service/internal/usecase"
	"net"
	"os"
	"shared/logger"

	pb "chat-app-proto/gen/guild"

	"github.com/go-playground/validator"
	"github.com/joho/godotenv"

	"github.com/jackc/pgx/v5"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

func init() {
	_ = godotenv.Load()
}

func main() {
	log := logger.Default("guild-service")

	dsn := "postgres://user:password@localhost:5432/chat_app?sslmode=disable"

	db, err := pgx.Connect(context.Background(), dsn)
	if err != nil {
		log.Error("Failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer db.Close(context.Background())

	log.Info("Connected to PostgreSQL", "database", "chat_app")

	validate := validator.New()

	guildRepo := postgres.NewPostgresGuildRepository(generated.New(db))
	guildUsecase := usecase.NewGuildUsecase(guildRepo, validate)
	guildHandler := handler.NewGuildHandler(guildUsecase, log)

	categoryRepo := postgres.NewPostgresCategoryRepository(generated.New(db))
	categoryUsecase := usecase.NewCategoryUsecase(categoryRepo, validate)
	categoryHandler := handler.NewCategoryHandler(categoryUsecase, log)

	channelRepo := postgres.NewPostgresChannelRepository(generated.New(db))
	channelUsecase := usecase.NewChannelUsecase(channelRepo, validate)
	channelHandler := handler.NewChannelHandler(channelUsecase, log)

	postgres.NewPostgresMemberRepository(generated.New(db))

	server := grpc.NewServer()
	pb.RegisterGuildServiceServer(server, guildHandler)
	pb.RegisterGuildServiceServer(server, categoryHandler)
	pb.RegisterGuildServiceServer(server, channelHandler)
	reflection.Register(server)

	port := 50052
	lis, err := net.Listen("tcp", ":50052")
	if err != nil {
		log.Error("Failed to listen", "port", port, "error", err)
		os.Exit(1)
	}

	log.Info("Guild service starting", "port", port)
	if err := server.Serve(lis); err != nil {
		log.Error("Failed to serve", "error", err)
		os.Exit(1)
	}
}
