package main

import (
	"context"
	"net/http"
	"os"
	"shared/logger"

	mdw "api-gateway/internal/middleware"
	"api-gateway/internal/interceptor"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth/v5"
	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/joho/godotenv"
	"api-gateway/internal/utils"

	userpb "chat-app-proto/gen/user"
	guildpb "chat-app-proto/gen/guild"
)

var (
	USER_SERVICE_ENDPOINT  string
	GUILD_SERVICE_ENDPOINT string
	tokenAuth              *jwtauth.JWTAuth
)

func init() {
	_ = godotenv.Load()

	USER_SERVICE_ENDPOINT = os.Getenv("USER_SERVICE_URL")
	GUILD_SERVICE_ENDPOINT = os.Getenv("GUILD_SERVICE_URL")
}

func main() {
	log := logger.Default("api-gateway")

	tokenAuth = jwtauth.New("HS256", []byte(os.Getenv("JWT_SECRET")), nil)

	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	grpcGatewayMux := runtime.NewServeMux(
		runtime.WithErrorHandler(utils.CustomErrorHandler),
	)

	opts := []grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithUnaryInterceptor(interceptor.JWTToMetadata()),
	}
	err := userpb.RegisterUserServiceHandlerFromEndpoint(ctx, grpcGatewayMux, USER_SERVICE_ENDPOINT, opts)
	if err != nil {
		log.Error("Failed to register user service handler", "error", err, "endpoint", USER_SERVICE_ENDPOINT)
		os.Exit(1)
	}
	err = guildpb.RegisterGuildServiceHandlerFromEndpoint(ctx, grpcGatewayMux, GUILD_SERVICE_ENDPOINT, opts)
	if err != nil {
		log.Error("Failed to register guild service handler", "error", err, "endpoint", GUILD_SERVICE_ENDPOINT)
		os.Exit(1)
	}

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders: []string{"Link"},
	}))
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
