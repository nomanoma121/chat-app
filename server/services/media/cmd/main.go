package main

import (
	"context"
	"media-service/internal/handler"
	"media-service/internal/infrastructure/rustfs"
	"media-service/internal/seeder"
	"net"
	"net/http"
	"os"
	"shared/logger"
	"syscall"

	pb "chat-app-proto/gen/media"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	grpcprom "github.com/grpc-ecosystem/go-grpc-middleware/providers/prometheus"
	"github.com/joho/godotenv"
	"github.com/oklog/run"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

const (
	BUCKET_NAME = "chat-app-bucket"
	grpcAddr    = ":50055"
	httpAddr    = ":2112"
)

func init() {
	_ = godotenv.Load()

	log := logger.Default("media-service")
	log.Info("Starting Media Service...")
}

func main() {
	log := logger.Default("media-service")
	ctx := context.Background()

	srvMetrics := grpcprom.NewServerMetrics(
		grpcprom.WithServerHandlingTimeHistogram(),
	)
	reg := prometheus.NewRegistry()
	reg.MustRegister(srvMetrics)
	reg.MustRegister(collectors.NewProcessCollector(collectors.ProcessCollectorOpts{}))
	reg.MustRegister(collectors.NewGoCollector())

	rustfsEndpoint := os.Getenv("RUSTFS_ENDPOINT")

	sdkConfig, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("us-east-1"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			os.Getenv("AWS_ACCESS_KEY_ID"),
			os.Getenv("AWS_SECRET_ACCESS_KEY"),
			"",
		)),
	)
	if err != nil {
		log.Error("Could not load AWS SDK config", "error", err)
		os.Exit(1)
	}

	s3Client := s3.NewFromConfig(sdkConfig, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(rustfsEndpoint)
		o.UsePathStyle = true
	})

	mediaRepo := rustfs.NewRustFSMediaRepository(s3Client, BUCKET_NAME)
	mediaHandler := handler.NewMediaHandler(mediaRepo)

	grpcSrv := grpc.NewServer(
		grpc.ChainUnaryInterceptor(
			srvMetrics.UnaryServerInterceptor(),
		),
	)
	srvMetrics.InitializeMetrics(grpcSrv)

	pb.RegisterMediaServiceServer(grpcSrv, mediaHandler)
	reflection.Register(grpcSrv)

	log.Info("Media service starting")

	seeder := seeder.NewSeeder(mediaRepo)
	if err := seeder.SeedUserIcons(ctx); err != nil {
		log.Error("Failed to seed user icons", "error", err)
	} else {
		log.Info("User icons seeded successfully")
	}
	if err := seeder.SeedGuildIcons(ctx); err != nil {
		log.Error("Failed to seed guild icons", "error", err)
	} else {
		log.Info("Guild icons seeded successfully")
	}

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
