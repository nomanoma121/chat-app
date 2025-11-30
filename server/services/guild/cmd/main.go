package main

import (
	"context"
	"fmt"
	"guild-service/internal/handler"
	user "guild-service/internal/infrastructure/grpc"
	"guild-service/internal/infrastructure/postgres"
	"guild-service/internal/usecase"
	"net"
	"net/http"
	"os"
	"shared/logger"
	"syscall"
	"time"

	pb "chat-app-proto/gen/guild"

	"github.com/go-playground/validator"
	grpcprom "github.com/grpc-ecosystem/go-grpc-middleware/providers/prometheus"
	"github.com/joho/godotenv"
	"github.com/oklog/run"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	_ "net/http/pprof"

	"github.com/jackc/pgx/v5/pgxpool"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/reflection"
)

var db *pgxpool.Pool

const (
	grpcAddr = ":50052"
	httpAddr = ":2112"
)

func init() {
	_ = godotenv.Load()

	log := logger.Default("guild-service")
	dsn := os.Getenv("DATABASE_URL")

	log.Info("Connecting to database...")
	var err error
	for i := 0; i < 30; i++ {
		db, err = pgxpool.New(context.Background(), dsn)
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
		fmt.Println(http.ListenAndServe("localhost:6060", nil))
	}()

	log := logger.Default("guild-service")
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

	validate := validator.New()

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

	userClient := user.NewUserServiceClient(userConn)
	store := postgres.NewPostgresStore(db)

	guildUsecase := usecase.NewGuildUsecase(store, userClient, validate)
	categoryUsecase := usecase.NewCategoryUsecase(store, validate)
	channelUsecase := usecase.NewChannelUsecase(store, validate)
	inviteUsecase := usecase.NewInviteUsecase(store, userClient, validate)

	guildHandler := handler.NewGuildServiceHandler(&handler.NewGuildServiceHandlerParams{
		GuildHandler:    handler.NewGuildHandler(guildUsecase, log),
		CategoryHandler: handler.NewCategoryHandler(categoryUsecase, log),
		ChannelHandler:  handler.NewChannelHandler(channelUsecase, log),
		InviteHandler:   handler.NewInviteHandler(inviteUsecase, log),
	})

	grpcSrv := grpc.NewServer(
		grpc.ChainUnaryInterceptor(
			srvMetrics.UnaryServerInterceptor(),
		),
	)
	srvMetrics.InitializeMetrics(grpcSrv)

	pb.RegisterGuildServiceServer(grpcSrv, guildHandler)
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
