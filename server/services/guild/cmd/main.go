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
	"time"

	pb "chat-app-proto/gen/guild"

	"github.com/go-playground/validator"
	"github.com/joho/godotenv"

	"github.com/jackc/pgx/v5/pgxpool"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/reflection"
)

var db *pgxpool.Pool

func init() {
	_ = godotenv.Load()

	log := logger.Default("guild-service")
	dsn := os.Getenv("DATABASE_URL")

	log.Info("Connecting to database...")
	var err error
	for i := 0; i < 30; i++ {
		db, err = pgxpool.New(context.Background(), dsn)
		if err == nil {
			break
		}
		log.Warn("Failed to connect to database, retrying...", "attempt", i+1, "error", err)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		log.Error("Failed to connect to database after retries", "error", err)
		os.Exit(1)
	}
	log.Info("Connected to PostgreSQL", "database", "chat_app")
}

func main() {
	log := logger.Default("guild-service")
	defer func() {
		db.Close()
	}()

	validate := validator.New()

	userServiceURL := os.Getenv("USER_SERVICE_URL")
	userConn, err := grpc.NewClient(userServiceURL, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Error("Failed to connect to user service", "error", err)
		os.Exit(1)
	}
	defer func() {
		if err := userConn.Close(); err != nil {
			log.Error("Failed to close user service connection", "error", err)
		}
	}()

	userClient := user.NewUserServiceClient(userConn)
	store := postgres.NewPostgresStore(db)

	guildUsecase := usecase.NewGuildUsecase(store, userClient, validate)
	categoryUsecase := usecase.NewCategoryUsecase(store, validate)
	channelUsecase := usecase.NewChannelUsecase(store, validate)
	inviteUsecase := usecase.NewInviteUsecase(store, validate)

	guildHandler := handler.NewGuildServiceHandler(&handler.NewGuildServiceHandlerParams{
		GuildHandler:    handler.NewGuildHandler(guildUsecase, log),
		CategoryHandler: handler.NewCategoryHandler(categoryUsecase, log),
		ChannelHandler:  handler.NewChannelHandler(channelUsecase, log),
		InviteHandler:   handler.NewInviteHandler(inviteUsecase, log),
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
