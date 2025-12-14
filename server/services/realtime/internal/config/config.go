package config

import "os"

type Config struct {
	Port      string
	RedisAddr string
	JWTSecret string
}

func Load() *Config {
	return &Config{
		Port:      getEnv("REALTIME_SERVICE_PORT", "50053"),
		RedisAddr: getEnv("REDIS_ADDR", "localhost:6379"),
		JWTSecret: getEnv("JWT_SECRET", "mysecret"),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
