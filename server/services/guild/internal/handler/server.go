package handler

import (
	"context"

	pb "chat-app-proto/gen/guild"
)

type GuildServiceHandler struct {
	pb.UnimplementedGuildServiceServer
	guildHandler    *guildHandler
	categoryHandler *categoryHandler
	channelHandler  *channelHandler
	inviteHandler   *inviteHandler
}

type NewGuildServiceHandlerParams struct {
	GuildHandler    *guildHandler
	CategoryHandler *categoryHandler
	ChannelHandler  *channelHandler
	InviteHandler   *inviteHandler
}

func NewGuildServiceHandler(params *NewGuildServiceHandlerParams) *GuildServiceHandler {
	return &GuildServiceHandler{
		guildHandler:    params.GuildHandler,
		categoryHandler: params.CategoryHandler,
		channelHandler:  params.ChannelHandler,
		inviteHandler:   params.InviteHandler,
	}
}

func (h *GuildServiceHandler) CreateGuild(ctx context.Context, req *pb.CreateGuildRequest) (*pb.CreateGuildResponse, error) {
	return h.guildHandler.CreateGuild(ctx, req)
}

func (h *GuildServiceHandler) GetGuildByID(ctx context.Context, req *pb.GetGuildByIDRequest) (*pb.GetGuildByIDResponse, error) {
	return h.guildHandler.GetGuildByID(ctx, req)
}

func (h *GuildServiceHandler) ListMyGuilds(ctx context.Context, req *pb.ListMyGuildsRequest) (*pb.ListMyGuildsResponse, error) {
	return h.guildHandler.GetMyGuilds(ctx, req)
}

func (h *GuildServiceHandler) UpdateGuild(ctx context.Context, req *pb.UpdateGuildRequest) (*pb.UpdateGuildResponse, error) {
	return h.guildHandler.UpdateGuild(ctx, req)
}

func (h *GuildServiceHandler) GetGuildOverview(ctx context.Context, req *pb.GetGuildOverviewRequest) (*pb.GetGuildOverviewResponse, error) {
	return h.guildHandler.GetGuildOverview(ctx, req)
}

func (h *GuildServiceHandler) CreateCategory(ctx context.Context, req *pb.CreateCategoryRequest) (*pb.CreateCategoryResponse, error) {
	return h.categoryHandler.CreateCategory(ctx, req)
}

func (h *GuildServiceHandler) CreateChannel(ctx context.Context, req *pb.CreateChannelRequest) (*pb.CreateChannelResponse, error) {
	return h.channelHandler.CreateChannel(ctx, req)
}

func (h *GuildServiceHandler) CreateGuildInvite(ctx context.Context, req *pb.CreateGuildInviteRequest) (*pb.CreateGuildInviteResponse, error) {
	return h.inviteHandler.CreateGuildInvite(ctx, req)
}

func (h *GuildServiceHandler) GetGuildInvites(ctx context.Context, req *pb.GetGuildInvitesRequest) (*pb.GetGuildInvitesResponse, error) {
	return h.inviteHandler.GetGuildInvites(ctx, req)
}

func (h *GuildServiceHandler) JoinGuild(ctx context.Context, req *pb.JoinGuildRequest) (*pb.JoinGuildResponse, error) {
	return h.inviteHandler.JoinGuild(ctx, req)
}


var _ pb.GuildServiceServer = (*GuildServiceHandler)(nil)
