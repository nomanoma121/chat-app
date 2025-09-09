package main

import (
	"context"
	"net/http"
	"os"
	"shared/logger"

	mdw "api-gateway/internal/middleware"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/jwtauth/v5"
	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/joho/godotenv"

	userpb "chat-app-proto/gen/user"
)

var (
	USER_SERVICE_ENDPOINT = "localhost:50051"
	tokenAuth             *jwtauth.JWTAuth
)

func init() {
	_ = godotenv.Load()
}

func main() {
	log := logger.Default("api-gateway")

	tokenAuth = jwtauth.New("HS256", []byte(os.Getenv("JWT_SECRET")), nil)

	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	grpcGatewayMux := runtime.NewServeMux()

	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	err := userpb.RegisterUserServiceHandlerFromEndpoint(ctx, grpcGatewayMux, USER_SERVICE_ENDPOINT, opts)
	if err != nil {
		log.Error("Failed to register user service handler", "error", err, "endpoint", USER_SERVICE_ENDPOINT)
		os.Exit(1)
	}

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(mdw.JWTAuthorizer(tokenAuth, mdw.Config{
		PublicPaths: mdw.Paths{
			"/api/auth/register": true,
			"/api/auth/login":    true,
		},
	}))

	r.Mount("/", grpcGatewayMux)

	port := "8000"
	log.Info("API Gateway starting", "port", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Error("Failed to serve", "error", err, "port", port)
		os.Exit(1)
	}
}
