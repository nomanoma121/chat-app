package main

import (
	"context"
	"net"
	"net/http"
	"os"
	"shared/logger"
	"syscall"
	"time"
	"user-service/internal/handler"
	"user-service/internal/infrastructure/postgres"
	"user-service/internal/infrastructure/postgres/gen"
	"user-service/internal/usecase"

	grpcprom "github.com/grpc-ecosystem/go-grpc-middleware/providers/prometheus"
	"github.com/oklog/run"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	pb "chat-app-proto/gen/user"

	"github.com/go-playground/validator"
	"github.com/joho/godotenv"

	"github.com/jackc/pgx/v5/pgxpool"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

var db *pgxpool.Pool

const (
	grpcAddr = ":50051"
	httpAddr = ":2112"
)

func init() {
	_ = godotenv.Load()

	log := logger.Default("user-service")
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
	log := logger.Default("user-service")
	defer func() {
		db.Close()
	}()

	srvMetrics := grpcprom.NewServerMetrics()
	reg := prometheus.NewRegistry()
	reg.MustRegister(srvMetrics)
	reg.MustRegister(collectors.NewProcessCollector(collectors.ProcessCollectorOpts{}))
	reg.MustRegister(collectors.NewGoCollector())

	userRepo := postgres.NewPostgresUserRepository(gen.New(db))
	validate := validator.New()
	userUsecase := usecase.NewUserUsecase(userRepo, usecase.Config{
		JWTSecret: os.Getenv("JWT_SECRET"),
	}, validate)
	userHandler := handler.NewUserHandler(userUsecase, log)

	grpcSrv := grpc.NewServer(
		grpc.ChainUnaryInterceptor(srvMetrics.UnaryServerInterceptor()),
	)
	srvMetrics.InitializeMetrics(grpcSrv)

	pb.RegisterUserServiceServer(grpcSrv, userHandler)
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
