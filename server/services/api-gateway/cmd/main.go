package main

import (
	"context"
	"net/http"
	"os"
	"shared/logger"

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
	log := logger.Default("api-gateway")

	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	grpcGatewayMux := runtime.NewServeMux()

	endpoint := USER_SERVICE_ENDPOINT

	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	err := userpb.RegisterUserServiceHandlerFromEndpoint(ctx, grpcGatewayMux, endpoint, opts)
	if err != nil {
		log.Error("Failed to register user service handler", "error", err, "endpoint", endpoint)
		os.Exit(1)
	}

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Mount("/", grpcGatewayMux)

	port := "8000"
	log.Info("API Gateway starting", "port", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Error("Failed to serve", "error", err, "port", port)
		os.Exit(1)
	}
}
