package main

import (
	"context"
	"fmt"
	"net/http"
	"realtime-service/internal/config"
	"realtime-service/internal/handler"
	"realtime-service/internal/hub"
	"realtime-service/internal/metrics"
	"realtime-service/internal/subscriber"
	"shared/logger"
	"syscall"
	"time"

	"github.com/oklog/run"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/redis/go-redis/v9"

	_ "net/http/pprof"
)

func main() {
	go func() {
		fmt.Println(http.ListenAndServe("localhost:6060", nil))
	}()

	cfg := config.Load()
	log := logger.Default("realtime-service")

	wsMetrics := metrics.NewWebSocketMetrics()

	reg := prometheus.NewRegistry()
	reg.MustRegister(collectors.NewProcessCollector(collectors.ProcessCollectorOpts{}))
	reg.MustRegister(collectors.NewGoCollector())
	reg.MustRegister(wsMetrics)

	redisClient := redis.NewClient(&redis.Options{
		Addr: cfg.RedisAddr,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := redisClient.Ping(ctx).Err(); err != nil {
		panic(err)
	}

	hub := hub.NewHub(wsMetrics)
	go hub.Run()
	log.Info("Hub started")

	messageSub := subscriber.NewMessageSubscriber(redisClient, hub)
	go func() {
		if err := messageSub.Start(context.Background()); err != nil {
			log.Error("Message subscriber error: %v", err)
		}
	}()
	log.Info("Message subscriber started")

	wsHandler := handler.NewWebSocketHandler(hub, cfg.JWTSecret)
	wsMux := http.NewServeMux()
	wsMux.HandleFunc("/ws", wsHandler.ServeHTTP)

	addr := ":" + cfg.Port

	g := &run.Group{}
	wsSrv := &http.Server{Addr: addr, Handler: wsMux}
	g.Add(func() error {
		log.Info("Starting server", "addr", addr)
		return wsSrv.ListenAndServe()
	}, func(err error) {
		if err := wsSrv.Shutdown(ctx); err != nil {
			log.Error("Failed to stop server", "err", err)
		}
	})

	metricsSrv := &http.Server{Addr: ":2112"}
	g.Add(func() error {
		m := http.NewServeMux()
		m.Handle("/metrics", promhttp.HandlerFor(reg, promhttp.HandlerOpts{}))
		metricsSrv.Handler = m
		log.Info("starting metrics server", "addr", metricsSrv.Addr)
		return metricsSrv.ListenAndServe()
	}, func(error) {
		if err := metricsSrv.Close(); err != nil {
			log.Error("failed to stop metrics server", "err", err)
		}
	})

	g.Add(run.SignalHandler(context.Background(), syscall.SIGINT, syscall.SIGTERM))

	if err := g.Run(); err != nil {
		log.Error("Server exited with error", "err", err)
	}
}
