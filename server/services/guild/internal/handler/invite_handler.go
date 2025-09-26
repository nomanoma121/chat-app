package handler

import (
	pb "chat-app-proto/gen/guild"
	"log/slog"
)

type inviteHandler struct {
	pb.UnimplementedGuildServiceServer
	inviteUsecase usecase.InviteUsecase
	logger        *slog.Logger
}

func NewInviteHandler(inviteUsecase usecase.InviteUsecase, logger *slog.Logger) *inviteHandler {
	return &inviteHandler{
		inviteUsecase: inviteUsecase,
		logger:        logger,
	}
}

func (h *inviteHandler) CreateGuildInvite(ctx context.Context, req *pb.CreateGuildInviteRequest) (*pb.CreateGuildInviteResponse, error) {

	return nil, nil
}

func (h *inviteHandler) GetGuildInvites(ctx context.Context, req *pb.GetGuildInvitesRequest) (*pb.GetGuildInvitesResponse, error) {
	
	return nil, nil
}

func (h *inviteHandler) JoinGuild(ctx context.Context, req *pb.JoinGuildRequest) (*pb.JoinGuildResponse, error) {

	return nil, nil
}
