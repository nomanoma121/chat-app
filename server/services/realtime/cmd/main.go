package main

import (
	"context"
	"log"
	"net/http"
	"realtime-service/internal/config"
	"realtime-service/internal/handler"
	"realtime-service/internal/hub"
	"realtime-service/internal/subscriber"
	"time"

	"github.com/redis/go-redis/v9"
)

func main() {
	cfg := config.Load()

	redisClient := redis.NewClient(&redis.Options{
		Addr: cfg.RedisAddr,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := redisClient.Ping(ctx).Err(); err != nil {
		panic(err)
	}

	hub := hub.NewHub()
	go hub.Run()
	log.Printf("Hub started")

	messageSub := subscriber.NewMessageSubscriber(redisClient, hub)
	go func() {
		if err := messageSub.Start(context.Background()); err != nil {
			log.Printf("Message subscriber error: %v", err)
		}
	}()
	log.Printf("Message subscriber started")

	wsHandler := handler.NewWebSocketHandler(hub, cfg.JWTSecret)
	http.HandleFunc("/ws", wsHandler.ServeHTTP)

	addr := ":" + cfg.Port

	log.Printf("Starting server on %s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatalf("ListenAndServe: %v", err)
	}
}
