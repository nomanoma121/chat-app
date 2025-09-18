package main

import (
	"context"
	"guild-service/internal/handler"
	user "guild-service/internal/infrastructure/grpc"
	"guild-service/internal/infrastructure/postgres"
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

	userConn, err := grpc.NewClient("localhost:50051", grpc.WithInsecure())
	if err != nil {
		log.Error("Failed to connect to user service", "error", err)
		os.Exit(1)
	}
	defer userConn.Close()

	userClient := user.NewUserServiceClient(userConn)
	store := postgres.NewPostgresStore(db)

	guildUsecase := usecase.NewGuildUsecase(store, userClient, validate)
	categoryUsecase := usecase.NewCategoryUsecase(store, validate)
	channelUsecase := usecase.NewChannelUsecase(store, validate)

	guildHandler := handler.NewGuildServiceHandler(&handler.NewGuildServiceHandlerParams{
		GuildHandler:    handler.NewGuildHandler(guildUsecase, log),
		CategoryHandler: handler.NewCategoryHandler(categoryUsecase, log),
		ChannelHandler:  handler.NewChannelHandler(channelUsecase, log),
	})

	server := grpc.NewServer()
	pb.RegisterGuildServiceServer(server, guildHandler)
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
