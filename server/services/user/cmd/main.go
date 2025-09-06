package main

import (
	"context"
	"fmt"
	"net"
	"user-service/internal/handler"
	"user-service/internal/infrastructure/postgres"
	"user-service/internal/infrastructure/postgres/generated"
	"user-service/internal/usecase"

	pb "chat-app-proto/gen"
	"github.com/jackc/pgx/v5"
	"google.golang.org/grpc"
)

func main() {
	dsn := "postgres://postgres:password@localhost:5432/chatapp?sslmode=disable"
	db, err := pgx.Connect(context.Background(), dsn)
	if err != nil {
		panic(err)
	}
	defer db.Close(context.Background())

	userRepo := postgres.NewPostgresUserRepository(generated.New(db))
	userUsecase := usecase.NewUserUsecase(userRepo)
	userHandler := handler.NewUserHandler(userUsecase)

	server := grpc.NewServer()
	pb.RegisterUserServiceServer(server, userHandler)

	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", 50051))
	if err != nil {
		panic(err)
	}

	server.Serve(lis)
}
