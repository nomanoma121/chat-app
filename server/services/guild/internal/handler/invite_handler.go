package handler

import (
	pb "chat-app-proto/gen/guild"
	"context"
	"guild-service/internal/usecase"
	"log/slog"
	"shared/metadata"
	"time"

	"github.com/google/uuid"
	"google.golang.org/protobuf/types/known/timestamppb"
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
	creatorIDStr, err := metadata.GetUserIDFromMetadata(ctx)
	if err != nil {
		h.logger.Warn("Failed to get user ID from metadata", "error", err)
		return nil, err
	}

	creatorID, err := uuid.Parse(creatorIDStr)
	if err != nil {
		h.logger.Warn("Invalid user ID format", "user_id", creatorIDStr, "error", err)
		return nil, err
	}

	guildID, err := uuid.Parse(req.GuildId)
	if err != nil {
		h.logger.Warn("Invalid guild ID format", "guild_id", req.GuildId, "error", err)
		return nil, err
	}

	var expiresAt time.Time
	if req.ExpiresAt != nil {
		expiresAt = req.ExpiresAt.AsTime()
	}

	invite, err := h.inviteUsecase.Create(ctx, &usecase.CreateInviteParams{
		CreatorID: creatorID,
		GuildID:   guildID,
		MaxUses:   req.MaxUses,
		ExpiresAt: &expiresAt,
	})
	if err != nil {
		h.logger.Error("Failed to create invite", "creator_id", creatorID, "error", err)
		return nil, err
	}

	var expiresAtPb *timestamppb.Timestamp
	if invite.ExpiresAt != nil {
		expiresAtPb = timestamppb.New(*invite.ExpiresAt)
	}

	return &pb.CreateGuildInviteResponse{
		Invite: &pb.Invite{
			InviteCode:  invite.InviteCode,
			GuildId:     invite.GuildID.String(),
			CreatorId:   invite.CreatorID.String(),
			MaxUses:     invite.MaxUses,
			CurrentUses: invite.CurrentUses,
			ExpiresAt:   expiresAtPb,
			CreatedAt:   timestamppb.New(invite.CreatedAt),
		},
	}, nil
}

func (h *inviteHandler) GetGuildInvites(ctx context.Context, req *pb.GetGuildInvitesRequest) (*pb.GetGuildInvitesResponse, error) {
	guildID, err := uuid.Parse(req.GuildId)
	if err != nil {
		h.logger.Warn("Invalid guild ID format", "guild_id", req.GuildId, "error", err)
		return nil, err
	}

	invites, err := h.inviteUsecase.GetByGuildID(ctx, guildID)
	if err != nil {
		h.logger.Error("Failed to get invites", "guild_id", req.GuildId, "error", err)
		return nil, err
	}

	pbInvites := make([]*pb.Invite, len(invites))
	for i, invite := range invites {
		var expiresAt *timestamppb.Timestamp
		if invite.ExpiresAt != nil {
			expiresAt = timestamppb.New(*invite.ExpiresAt)
		}

		pbInvites[i] = &pb.Invite{
			InviteCode:  invite.InviteCode,
			GuildId:     invite.GuildID.String(),
			CreatorId:   invite.CreatorID.String(),
			Creator: &pb.User{
				Id:        invite.Creator.ID.String(),
				Username:  invite.Creator.Name,
				IconUrl:   invite.Creator.IconURL,
				CreatedAt: timestamppb.New(invite.Creator.CreatedAt),
			},
			MaxUses:     invite.MaxUses,
			CurrentUses: invite.CurrentUses,
			ExpiresAt:   expiresAt,
			CreatedAt:   timestamppb.New(invite.CreatedAt),
		}
	}

	return &pb.GetGuildInvitesResponse{
		Invites: pbInvites,
	}, nil
}

func (h *inviteHandler) JoinGuild(ctx context.Context, req *pb.JoinGuildRequest) (*pb.JoinGuildResponse, error) {
	userIDStr, err := metadata.GetUserIDFromMetadata(ctx)
	if err != nil {
		h.logger.Warn("Failed to get user ID from metadata", "error", err)
		return nil, err
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		h.logger.Warn("Invalid user ID format", "user_id", userIDStr, "error", err)
		return nil, err
	}
	member, err := h.inviteUsecase.JoinGuild(ctx, &usecase.JoinGuildParams{
		InviteCode: req.InviteCode,
		UserID:     userID,
	})
	if err != nil {
		h.logger.Error("Failed to join guild", "code", req.InviteCode, "error", err)
		return nil, err
	}

	pbMember := &pb.Member{
		GuildId:  member.GuildID.String(),
		UserId:   member.UserID.String(),
		JoinedAt: timestamppb.New(member.JoinedAt),
	}

	return &pb.JoinGuildResponse{
		Member: pbMember,
	}, nil
}

var _ pb.GuildServiceServer = (*inviteHandler)(nil)
