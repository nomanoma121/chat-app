package handler

import (
	"context"

	pb "chat-app-proto/gen/guild"
	"guild-service/internal/usecase"
	"log/slog"
)

type GuildServiceHandler struct {
	pb.UnimplementedGuildServiceServer
	guildHandler    *guildHandler
	categoryHandler *CategoryHandler
	channelHandler  *ChannelHandler
	logger          *slog.Logger
}

func NewGuildServiceHandler(
	categoryUsecase usecase.CategoryUsecase,
	channelUsecase usecase.ChannelUsecase,
	guildUsecase usecase.GuildUsecase,
	logger *slog.Logger,
) *GuildServiceHandler {
	return &GuildServiceHandler{
		guildHandler:    NewGuildHandler(guildUsecase, logger),
		categoryHandler: NewCategoryHandler(categoryUsecase, logger),
		channelHandler:  NewChannelHandler(channelUsecase, logger),
		logger:          logger,
	}
}

func (h *GuildServiceHandler) CreateGuild(ctx context.Context, req *pb.CreateGuildRequest) (*pb.CreateGuildResponse, error) {
	return h.guildHandler.CreateGuild(ctx, req)
}

func (h *GuildServiceHandler) GetGuildByID(ctx context.Context, req *pb.GetGuildByIDRequest) (*pb.GetGuildByIDResponse, error) {
	return h.guildHandler.GetGuildByID(ctx, req)
}

func (h *GuildServiceHandler) UpdateGuild(ctx context.Context, req *pb.UpdateGuildRequest) (*pb.UpdateGuildResponse, error) {
	return h.guildHandler.UpdateGuild(ctx, req)
}

func (h *GuildServiceHandler) CreateCategory(ctx context.Context, req *pb.CreateCategoryRequest) (*pb.CreateCategoryResponse, error) {
	return h.categoryHandler.CreateCategory(ctx, req)
}

func (h *GuildServiceHandler) CreateChannel(ctx context.Context, req *pb.CreateChannelRequest) (*pb.CreateChannelResponse, error) {
	return h.channelHandler.CreateChannel(ctx, req)
}

var _ pb.GuildServiceServer = (*GuildServiceHandler)(nil)
