package main

import (
	"context"
	"net"
	"os"
	"shared/logger"
	"user-service/internal/handler"
	"user-service/internal/infrastructure/postgres"
	"user-service/internal/infrastructure/postgres/generated"
	"user-service/internal/usecase"

	pb "chat-app-proto/gen/user"

	"github.com/joho/godotenv"

	"github.com/jackc/pgx/v5"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

func init() {
	_ = godotenv.Load()
}

func main() {
	log := logger.Default("user-service")

	dsn := "postgres://user:password@localhost:5432/chat_app?sslmode=disable"

	db, err := pgx.Connect(context.Background(), dsn)
	if err != nil {
		log.Error("Failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer db.Close(context.Background())

	log.Info("Connected to PostgreSQL", "database", "chat_app")

	userRepo := postgres.NewPostgresUserRepository(generated.New(db))
	userUsecase := usecase.NewUserUsecase(userRepo, usecase.Config{
		JWTSecret: os.Getenv("JWT_SECRET"),
	})
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
