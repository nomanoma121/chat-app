package main

import (
	"api-gateway/internal/interceptor"
	"api-gateway/internal/utils"
	"context"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"shared/logger"

	mdw "api-gateway/internal/middleware"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth/v5"
	"github.com/golang-jwt/jwt"
	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/joho/godotenv"

	guildpb "chat-app-proto/gen/guild"
	messagepb "chat-app-proto/gen/message"
	userpb "chat-app-proto/gen/user"
)

var (
	USER_SERVICE_ENDPOINT    string
	GUILD_SERVICE_ENDPOINT   string
	MESSAGE_SERVICE_ENDPOINT string
	REALTIME_SERVICE_URL     string
	tokenAuth                *jwtauth.JWTAuth
)

func init() {
	_ = godotenv.Load()

	USER_SERVICE_ENDPOINT = os.Getenv("USER_SERVICE_URL")
	GUILD_SERVICE_ENDPOINT = os.Getenv("GUILD_SERVICE_URL")
	MESSAGE_SERVICE_ENDPOINT = os.Getenv("MESSAGE_SERVICE_URL")
	REALTIME_SERVICE_URL = os.Getenv("REALTIME_SERVICE_URL")
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
	err = messagepb.RegisterMessageServiceHandlerFromEndpoint(ctx, grpcGatewayMux, MESSAGE_SERVICE_ENDPOINT, opts)
	if err != nil {
		log.Error("Failed to register message service handler", "error", err, "endpoint", MESSAGE_SERVICE_ENDPOINT)
		os.Exit(1)
	}

	realtimeTarget, err := url.Parse(REALTIME_SERVICE_URL)
	if err != nil {
		log.Error("Failed to parse realtime service URL", "error", err, "url", REALTIME_SERVICE_URL)
		os.Exit(1)
	}
	wsProxy := httputil.NewSingleHostReverseProxy(realtimeTarget)

	originalDirector := wsProxy.Director
	wsProxy.Director = func(req *http.Request) {
		originalDirector(req)
		req.Header.Set("X-Forwarded-Host", req.Host)
	}

	wsProxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Error("WebSocket proxy error", "error", err)
		http.Error(w, "WebSocket connection failed", http.StatusBadGateway)
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

	// Realtime Serviceにプロキシ
	r.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		token, ok := r.Context().Value(jwtauth.TokenCtxKey).(*jwt.Token)
		if !ok || token == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, "Invalid token claims", http.StatusUnauthorized)
			return
		}

		if userID, ok := claims["user_id"].(string); ok {
			r.Header.Set("X-User-ID", userID)
		}

		wsProxy.ServeHTTP(w, r)
	})

	r.Mount("/", grpcGatewayMux)

	port := "8000"
	log.Info("API Gateway starting", "port", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Error("Failed to serve", "error", err, "port", port)
		os.Exit(1)
	}
}
