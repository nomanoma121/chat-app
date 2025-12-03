package main

import (
	"context"
	"fmt"
	"message-service/internal/handler"
	user "message-service/internal/infrastructure/grpc"
	"message-service/internal/infrastructure/postgres"
	"message-service/internal/infrastructure/postgres/gen"
	rds "message-service/internal/infrastructure/redis"
	"message-service/internal/usecase"
	"net"
	"net/http"
	"os"
	"shared/logger"
	"syscall"
	"time"

	pb "chat-app-proto/gen/message"

	"github.com/go-playground/validator"
	grpcprom "github.com/grpc-ecosystem/go-grpc-middleware/providers/prometheus"
	"github.com/joho/godotenv"
	"github.com/oklog/run"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/reflection"

	_ "net/http/pprof"
)

var db *pgxpool.Pool

const (
	grpcAddr = ":50053"
	httpAddr = ":2112"
)

func init() {
	_ = godotenv.Load()

	log := logger.Default("message-service")
	dsn := os.Getenv("DATABASE_URL")

	log.Info("Connecting to database...")

	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		log.Error("Failed to parse database config", "error", err)
		os.Exit(1)
	}

	config.MaxConns = 500
	config.MinConns = 10
	config.MaxConnLifetime = time.Hour
	config.MaxConnIdleTime = 30 * time.Minute

	for i := 0; i < 30; i++ {
		db, err = pgxpool.NewWithConfig(context.Background(), config)
		if err == nil {
			break
		}
		log.Warn("Failed to connect to database, retrying...", "attempt", i+1, "error", err)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		log.Error("Failed to connect to database after retries", "error", err)
		os.Exit(1)
	}
	log.Info("Connected to PostgreSQL", "database", "chat_app")
}

func main() {
	go func() {
		fmt.Println(http.ListenAndServe(":6060", nil))
	}()

	log := logger.Default("message-service")
	defer func() {
		db.Close()
	}()

	srvMetrics := grpcprom.NewServerMetrics(
		grpcprom.WithServerHandlingTimeHistogram(),
	)
	reg := prometheus.NewRegistry()
	reg.MustRegister(srvMetrics)
	reg.MustRegister(collectors.NewProcessCollector(collectors.ProcessCollectorOpts{}))
	reg.MustRegister(collectors.NewGoCollector())

	redisAddr := os.Getenv("REDIS_ADDR")
	redisClient := redis.NewClient(&redis.Options{
		Addr:         redisAddr,
		PoolSize:     200,
		MinIdleConns: 20,
	})

	userServiceURL := os.Getenv("USER_SERVICE_URL")
	userConn, err := grpc.NewClient(userServiceURL, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Error("Failed to connect to user service", "error", err)
		os.Exit(1)
	}
	defer func() {
		if err := userConn.Close(); err != nil {
			log.Error("Failed to close user service connection", "error", err)
		}
	}()
	log.Info("Connected to user service", "url", userServiceURL)

	guildServiceURL := os.Getenv("GUILD_SERVICE_URL")
	guildConn, err := grpc.NewClient(guildServiceURL, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Error("Failed to connect to guild service", "error", err)
		os.Exit(1)
	}
	defer func() {
		if err := guildConn.Close(); err != nil {
			log.Error("Failed to close guild service connection", "error", err)
		}
	}()
	log.Info("Connected to guild service", "url", guildServiceURL)

	messageRepo := postgres.NewPostgresMessageRepository(gen.New(db))
	userSvc := rds.NewCachedUserClient(redisClient, user.NewUserServiceClient(userConn))

	guildSvc := user.NewGuildServiceClient(guildConn)
	redisPub := rds.NewRedisPublisher(redisClient)

	validate := validator.New()

	messageUsecase := usecase.NewMessageUsecase(usecase.MessageUsecaseParams{
		MessageRepo: messageRepo,
		UserSvc:     userSvc,
		GuildSvc:    guildSvc,
		Publisher:   redisPub,
		Validator:   validate,
	})

	messageHandler := handler.NewMessageHandler(messageUsecase, log)

	grpcSrv := grpc.NewServer(
		grpc.ChainUnaryInterceptor(
			srvMetrics.UnaryServerInterceptor(),
		),
	)
	srvMetrics.InitializeMetrics(grpcSrv)

	pb.RegisterMessageServiceServer(grpcSrv, messageHandler)
	reflection.Register(grpcSrv)

	g := &run.Group{}
	g.Add(func() error {
		l, err := net.Listen("tcp", grpcAddr)
		if err != nil {
			return err
		}
		log.Info("starting gRPC server", "addr", l.Addr().String())
		return grpcSrv.Serve(l)
	}, func(err error) {
		grpcSrv.GracefulStop()
		grpcSrv.Stop()
	})

	httpSrv := &http.Server{Addr: httpAddr}
	g.Add(func() error {
		m := http.NewServeMux()
		m.Handle("/metrics", promhttp.HandlerFor(reg, promhttp.HandlerOpts{}))
		httpSrv.Handler = m
		log.Info("starting HTTP server", "addr", httpSrv.Addr)
		return httpSrv.ListenAndServe()
	}, func(error) {
		if err := httpSrv.Close(); err != nil {
			log.Error("failed to stop web server", "err", err)
		}
	})

	g.Add(run.SignalHandler(context.Background(), syscall.SIGINT, syscall.SIGTERM))

	if err := g.Run(); err != nil {
		log.Error("program interrupted", "err", err)
		os.Exit(1)
	}
}
