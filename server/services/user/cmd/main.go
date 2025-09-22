package main

import (
	"context"
	"net"
	"os"
	"shared/logger"
	"time"
	"user-service/internal/handler"
	"user-service/internal/infrastructure/postgres"
	"user-service/internal/infrastructure/postgres/gen"
	"user-service/internal/usecase"

	pb "chat-app-proto/gen/user"

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
	userRepo := postgres.NewPostgresUserRepository(gen.New(db))
	validate := validator.New()
	userUsecase := usecase.NewUserUsecase(userRepo, usecase.Config{
		JWTSecret: os.Getenv("JWT_SECRET"),
	}, validate)
	userHandler := handler.NewUserHandler(userUsecase, log)

	server := grpc.NewServer()
	pb.RegisterUserServiceServer(server, userHandler)
	reflection.Register(server)

	port := 50051
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Error("Failed to listen", "port", port, "error", err)
		os.Exit(1)
	}

	log.Info("User service starting", "port", port)
	if err := server.Serve(lis); err != nil {
		log.Error("Failed to serve", "error", err)
		os.Exit(1)
	}
}
