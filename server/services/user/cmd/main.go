package main

import (
	"database/sql"
	"fmt"
	"net"
	"user-service/internal/handler"
	"user-service/internal/infrastructure/postgres"
	"user-service/internal/usecase"

	pb "../../api/gen"
	_ "github.com/lib/pq"
	"google.golang.org/grpc"
)

func main() {
	dsn := "host=localhost port=5432 user=postgres password=password dbname=chatapp sslmode=disable"
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	userRepo := postgres.NewUserRepository(db)
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
