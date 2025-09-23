package main

import (
	"context"
	"message-service/internal/handler"
	"message-service/internal/infrastructure/postgres"
	"message-service/internal/infrastructure/postgres/gen"
	"message-service/internal/usecase"
	"net"
	"os"
	"shared/logger"
	"time"

	pb "chat-app-proto/gen/message"

	"github.com/go-playground/validator"
	"github.com/joho/godotenv"

	"github.com/jackc/pgx/v5"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

var db *pgx.Conn

func init() {
	_ = godotenv.Load()

	log := logger.Default("user-service")
	dsn := os.Getenv("DATABASE_URL")

	log.Info("Connecting to database...")
	var err error
	for i := 0; i < 30; i++ {
		db, err = pgx.Connect(context.Background(), dsn)
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
	log := logger.Default("user-service")
	defer func() {
		if err := db.Close(context.Background()); err != nil {
			log.Error("Failed to close database connection", "error", err)
		}
	}()
	messageRepo := postgres.NewPostgresMessageRepository(gen.New(db))
	validate := validator.New()
	messageUsecase := usecase.NewMessageUsecase(messageRepo, validate)
	messageHandler := handler.NewMessageHandler(messageUsecase, log)
	server := grpc.NewServer()
	pb.RegisterMessageServiceServer(server, messageHandler)
	reflection.Register(server)

	port := 50053
	lis, err := net.Listen("tcp", ":50053")
	if err != nil {
		log.Error("Failed to listen", "port", port, "error", err)
		os.Exit(1)
	}

	log.Info("Message service starting", "port", port)
	if err := server.Serve(lis); err != nil {
		log.Error("Failed to serve", "error", err)
		os.Exit(1)
	}
}
