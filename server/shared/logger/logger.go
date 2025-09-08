package logger

import (
	"log/slog"
	"os"
	"strings"
)

type Config struct {
	Level   string `json:"level" default:"info"`
	Format  string `json:"format" default:"json"`
	Service string `json:"service"`
}

func New(config Config) *slog.Logger {
	var level slog.Level
	switch strings.ToLower(config.Level) {
	case "debug":
		level = slog.LevelDebug
	case "info":
		level = slog.LevelInfo
	case "warn", "warning":
		level = slog.LevelWarn
	case "error":
		level = slog.LevelError
	default:
		level = slog.LevelInfo
	}

	opts := &slog.HandlerOptions{
		Level: level,
	}

	var handler slog.Handler
	if strings.ToLower(config.Format) == "text" {
		handler = slog.NewTextHandler(os.Stdout, opts)
	} else {
		handler = slog.NewJSONHandler(os.Stdout, opts)
	}

	logger := slog.New(handler)

	if config.Service != "" {
		logger = logger.With("service", config.Service)
	}

	return logger
}

func Default(serviceName string) *slog.Logger {
	return New(Config{
		Level:   slog.LevelInfo.String(),
		Format:  "json",
		Service: serviceName,
	})
}
