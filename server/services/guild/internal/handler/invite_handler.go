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
	creatorID, err := getUserID(ctx, h.logger)
	if err != nil {
		return nil, err
	}

	guildID, err := uuid.Parse(req.GuildId)
	if err != nil {
		h.logger.Warn("Invalid guild ID format", "guild_id", req.GuildId, "error", err)
		return nil, err
	}

	var expiresAt *time.Time
	if req.ExpiresAt != nil {
		t := req.ExpiresAt.AsTime()
		expiresAt = &t
	}

	invite, err := h.inviteUsecase.Create(ctx, &usecase.CreateInviteParams{
		CreatorID: creatorID,
		GuildID:   guildID,
		MaxUses:   req.MaxUses,
		ExpiresAt: expiresAt,
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
	userID, err := getUserID(ctx, h.logger)
	if err != nil {
		return nil, err
	}
	
	guildID, err := uuid.Parse(req.GuildId)
	if err != nil {
		h.logger.Warn("Invalid guild ID format", "guild_id", req.GuildId, "error", err)
		return nil, err
	}

	invites, err := h.inviteUsecase.GetByGuildID(ctx, userID, guildID)
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
			InviteCode: invite.InviteCode,
			GuildId:    invite.GuildID.String(),
			CreatorId:  invite.CreatorID.String(),
			Creator: &pb.User{
				Id:        invite.Creator.ID.String(),
				Name:      invite.Creator.Name,
				DisplayId: invite.Creator.DisplayId,
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

func (h *inviteHandler) GetGuildByInviteCode(ctx context.Context, req *pb.GetGuildByInviteCodeRequest) (*pb.GetGuildByInviteCodeResponse, error) {
	invite, err := h.inviteUsecase.GetByInviteCode(ctx, req.InviteCode)
	if err != nil {
		h.logger.Error("Failed to get invite by code", "code", req.InviteCode, "error", err)
		return nil, err
	}

	var expiresAtPb *timestamppb.Timestamp
	if invite.ExpiresAt != nil {
		expiresAtPb = timestamppb.New(*invite.ExpiresAt)
	}

	pbInvite := &pb.Invite{
		InviteCode:  invite.InviteCode,
		GuildId:     invite.GuildID.String(),
		CreatorId:   invite.CreatorID.String(),
		MaxUses:     invite.MaxUses,
		CurrentUses: invite.CurrentUses,
		ExpiresAt:   expiresAtPb,
		CreatedAt:   timestamppb.New(invite.CreatedAt),
	}

	if invite.Creator != nil {
		pbInvite.Creator = &pb.User{
			Id:        invite.Creator.ID.String(),
			Name:      invite.Creator.Name,
			DisplayId: invite.Creator.DisplayId,
			IconUrl:   invite.Creator.IconURL,
			CreatedAt: timestamppb.New(invite.Creator.CreatedAt),
		}
	}

	if invite.Guild != nil {
		pbInvite.Guild = &pb.Guild{
			Id:               invite.Guild.ID.String(),
			OwnerId:          invite.Guild.OwnerID.String(),
			Name:             invite.Guild.Name,
			Description:      invite.Guild.Description,
			DefaultChannelId: invite.Guild.DefaultChannelID.String(),
			MemberCount:      invite.Guild.MemberCount,
			IconUrl:          invite.Guild.IconURL,
			CreatedAt:        timestamppb.New(invite.Guild.CreatedAt),
		}
	}

	return &pb.GetGuildByInviteCodeResponse{
		Invite: pbInvite,
	}, nil
}

var _ pb.GuildServiceServer = (*inviteHandler)(nil)
