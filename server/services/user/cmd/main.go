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
	"google.golang.org/grpc/reflection"
)

func main() {
	dsn := "postgres://user:password@localhost:5432/chat_app?sslmode=disable"
	db, err := pgx.Connect(context.Background(), dsn)
	if err != nil {
		panic(err)
	}
	defer db.Close(context.Background())

	fmt.Println("Connected to PostgreSQL")

	userRepo := postgres.NewPostgresUserRepository(generated.New(db))
	userUsecase := usecase.NewUserUsecase(userRepo)
	userHandler := handler.NewUserHandler(userUsecase)

	server := grpc.NewServer()
	pb.RegisterUserServiceServer(server, userHandler)
	reflection.Register(server)

	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", 50051))
	if err != nil {
		panic(err)
	}

	server.Serve(lis)
}
