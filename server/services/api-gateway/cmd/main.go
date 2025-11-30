package main

import (
	"api-gateway/internal/interceptor"
	"api-gateway/internal/utils"
	"context"
	"fmt"
	"net/http"
	"os"
	"shared/logger"
	"time"

	mdw "api-gateway/internal/middleware"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth/v5"
	grpcprom "github.com/grpc-ecosystem/go-grpc-middleware/providers/prometheus"
	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/oklog/run"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/joho/godotenv"

	guildpb "chat-app-proto/gen/guild"
	mediapb "chat-app-proto/gen/media"
	messagepb "chat-app-proto/gen/message"
	userpb "chat-app-proto/gen/user"
	_ "net/http/pprof"
)

var (
	USER_SERVICE_ENDPOINT    string
	GUILD_SERVICE_ENDPOINT   string
	MESSAGE_SERVICE_ENDPOINT string
	MEDIA_SERVICE_ENDPOINT   string
	REALTIME_SERVICE_URL     string
	tokenAuth                *jwtauth.JWTAuth
)

func init() {
	_ = godotenv.Load()

	USER_SERVICE_ENDPOINT = os.Getenv("USER_SERVICE_URL")
	GUILD_SERVICE_ENDPOINT = os.Getenv("GUILD_SERVICE_URL")
	MESSAGE_SERVICE_ENDPOINT = os.Getenv("MESSAGE_SERVICE_URL")
	MEDIA_SERVICE_ENDPOINT = os.Getenv("MEDIA_SERVICE_URL")
}

func main() {
	go func() {
		fmt.Println(http.ListenAndServe(":6060", nil))
	}()
	log := logger.Default("api-gateway")

	tokenAuth = jwtauth.New("HS256", []byte(os.Getenv("JWT_SECRET")), nil)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	reg := prometheus.NewRegistry()
	clMetrics := grpcprom.NewClientMetrics()
	reg.MustRegister(clMetrics)
	reg.MustRegister(collectors.NewProcessCollector(collectors.ProcessCollectorOpts{}))
	reg.MustRegister(collectors.NewGoCollector())

	grpcGatewayMux := runtime.NewServeMux(
		runtime.WithErrorHandler(utils.CustomErrorHandler),
	)

	opts := []grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithChainUnaryInterceptor(
			interceptor.JWTToMetadata(),
			clMetrics.UnaryClientInterceptor(),
		),
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
	err = mediapb.RegisterMediaServiceHandlerFromEndpoint(ctx, grpcGatewayMux, MEDIA_SERVICE_ENDPOINT, opts)
	if err != nil {
		log.Error("Failed to register media service handler", "error", err, "endpoint", MEDIA_SERVICE_ENDPOINT)
		os.Exit(1)
	}
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type"},
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

	g := &run.Group{}
	apiSrv := &http.Server{Addr: ":8000", Handler: r}
	g.Add(func() error {
		log.Info("starting HTTP server", "addr", apiSrv.Addr)
		return apiSrv.ListenAndServe()
	}, func(err error) {
		log.Info("shutting down HTTP server", "addr", apiSrv.Addr)
		if err := apiSrv.Shutdown(ctx); err != nil {
			log.Error("HTTP server shutdown error", "error", err)
		}
	})

	g.Add(func() error {
		m := http.NewServeMux()
		m.Handle("/metrics", promhttp.HandlerFor(reg, promhttp.HandlerOpts{}))
		metricsSrv := &http.Server{
			Addr:    ":2112",
			Handler: m,
		}
		log.Info("starting Metrics server", "addr", metricsSrv.Addr)
		return metricsSrv.ListenAndServe()
	}, func(error) {
		log.Info("shutting down Metrics server")
	})

	if err := g.Run(); err != nil {
		log.Error("API Gateway exited with error", "error", err)
	}
}
