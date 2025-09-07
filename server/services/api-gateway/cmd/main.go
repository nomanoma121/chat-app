package main

import (
	"context"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	userpb "chat-app-proto/gen/user"
)

var (
	USER_SERVICE_ENDPOINT = "localhost:50051"
)

func main() {
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	grpcGatewayMux := runtime.NewServeMux()

	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	err := userpb.RegisterUserServiceHandlerFromEndpoint(ctx, grpcGatewayMux, USER_SERVICE_ENDPOINT, opts)
	if err != nil {
		log.Fatalf("failed to register user service handler: %v", err)
	}

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Mount("/", grpcGatewayMux)

	log.Println("API Gateway listening on :8000")
	if err := http.ListenAndServe(":8000", r); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
