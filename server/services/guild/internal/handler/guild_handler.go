package handler

import (
	"context"
	"guild-service/internal/domain"
	"guild-service/internal/usecase"
	"log/slog"
	"shared/metadata"

	pb "chat-app-proto/gen/guild"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type guildHandler struct {
	pb.UnimplementedGuildServiceServer
	guildUsecase usecase.GuildUsecase
	logger       *slog.Logger
}

func NewGuildHandler(guildUsecase usecase.GuildUsecase, logger *slog.Logger) *guildHandler {
	return &guildHandler{
		guildUsecase: guildUsecase,
		logger:       logger,
	}
}

func (h *guildHandler) CreateGuild(ctx context.Context, req *pb.CreateGuildRequest) (*pb.CreateGuildResponse, error) {
	userIDStr, err := metadata.GetUserIDFromMetadata(ctx)
	if err != nil {
		h.logger.Warn("Failed to get user ID from metadata", "error", err)
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		h.logger.Warn("Invalid user ID format", "user_id", userIDStr, "error", err)
		return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidGuildData.Error())
	}

	guild, err := h.guildUsecase.Create(ctx, &usecase.CreateGuildParams{
		OwnerID:     userID,
		Name:        req.Name,
		Description: req.Description,
		IconURL:     req.IconUrl,
	})
	if err != nil {
		switch err {
		case domain.ErrInvalidGuildData:
			h.logger.Warn("Invalid guild data", "user_id", userID)
			return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidGuildData.Error())
		default:
			h.logger.Error("Failed to create guild", "user_id", userID, "error", err)
			return nil, status.Error(codes.Internal, domain.ErrInternalServerError.Error())
		}
	}

	pbGuild := &pb.Guild{
		Id:          guild.ID.String(),
		OwnerId:     guild.OwnerID.String(),
		Name:        guild.Name,
		Description: guild.Description,
		IconUrl:     guild.IconURL,
		CreatedAt:   timestamppb.New(guild.CreatedAt),
	}
	return &pb.CreateGuildResponse{Guild: pbGuild}, nil
}

func (h *guildHandler) GetGuildByID(ctx context.Context, req *pb.GetGuildByIDRequest) (*pb.GetGuildByIDResponse, error) {
	guildID, err := uuid.Parse(req.GuildId)
	if err != nil {
		h.logger.Warn("Invalid UUID format", "error", err)
		return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidGuildID.Error())
	}

	guild, err := h.guildUsecase.GetByID(ctx, guildID)
	if err != nil {
		switch err {
		case domain.ErrGuildNotFound:
			h.logger.Warn("Guild not found", "guild_id", guildID)
			return nil, status.Error(codes.NotFound, domain.ErrGuildNotFound.Error())
		default:
			h.logger.Error("Failed to get guild by ID", "guild_id", guildID, "error", err)
			return nil, status.Error(codes.Internal, domain.ErrInternalServerError.Error())
		}
	}

	pbGuild := &pb.Guild{
		Id:          guild.ID.String(),
		OwnerId:     guild.OwnerID.String(),
		Name:        guild.Name,
		Description: guild.Description,
		IconUrl:     guild.IconURL,
		CreatedAt:   timestamppb.New(guild.CreatedAt),
	}
	return &pb.GetGuildByIDResponse{Guild: pbGuild}, nil
}

func (h *guildHandler) UpdateGuild(ctx context.Context, req *pb.UpdateGuildRequest) (*pb.UpdateGuildResponse, error) {
	guildID, err := uuid.Parse(req.GuildId)
	if err != nil {
		h.logger.Warn("Invalid guild ID format", "guild_id", req.GuildId, "error", err)
		return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidGuildID.Error())
	}

	usecaseReq := &usecase.UpdateGuildParams{
		ID:          guildID,
		Name:        req.Name,
		Description: req.Description,
		IconURL:     req.IconUrl,
	}

	updatedGuild, err := h.guildUsecase.Update(ctx, usecaseReq)
	if err != nil {
		switch err {
		case domain.ErrGuildNotFound:
			h.logger.Warn("Guild not found", "guild_id", guildID)
			return nil, status.Error(codes.NotFound, domain.ErrGuildNotFound.Error())
		case domain.ErrInvalidGuildData:
			h.logger.Warn("Invalid guild data", "guild_id", guildID)
			return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidGuildData.Error())
		default:
			h.logger.Error("Failed to update guild", "guild_id", guildID, "error", err)
			return nil, status.Error(codes.Internal, domain.ErrInternalServerError.Error())
		}
	}

	pbGuild := &pb.Guild{
		Id:          updatedGuild.ID.String(),
		OwnerId:     updatedGuild.OwnerID.String(),
		Name:        updatedGuild.Name,
		Description: updatedGuild.Description,
		IconUrl:     updatedGuild.IconURL,
		CreatedAt:   timestamppb.New(updatedGuild.CreatedAt),
	}

	return &pb.UpdateGuildResponse{Guild: pbGuild}, nil
}

// GuildOverview
// guild id から
func (h *guildHandler) GetGuildOverview(ctx context.Context, req *pb.GetGuildOverviewRequest) (*pb.GetGuildOverviewResponse, error) {
	guildID, err := uuid.Parse(req.GuildId)
	if err != nil {
		h.logger.Warn("Invalid guild ID format", "guild_id", req.GuildId, "error", err)
		return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidGuildID.Error())
	}

	guildOverview, err := h.guildUsecase.GetGuildOverview(ctx, guildID)
	if err != nil {
		switch err {
		case domain.ErrGuildNotFound:
			h.logger.Warn("Guild not found", "guild_id", guildID)
			return nil, status.Error(codes.NotFound, domain.ErrGuildNotFound.Error())
		default:
			h.logger.Error("Failed to get guild overview", "guild_id", guildID, "error", err)
			return nil, status.Error(codes.Internal, domain.ErrInternalServerError.Error())
		}
	}

	pbCategories := make([]*pb.CategoryDetail, len(guildOverview.Categories))
	for i, category := range guildOverview.Categories {
		pbChannels := make([]*pb.Channel, len(category.Channels))
		for j, channel := range category.Channels {
			pbChannels[j] = &pb.Channel{
				Id:         channel.ID.String(),
				CategoryId: channel.CategoryID.String(),
				Name:       channel.Name,
				CreatedAt:  timestamppb.New(channel.CreatedAt),
			}
		}

		pbCategories[i] = &pb.CategoryDetail{
			Id:        category.ID.String(),
			GuildId:   category.GuildID.String(),
			Name:      category.Name,
			CreatedAt: timestamppb.New(category.CreatedAt),
			Channels:  pbChannels,
		}
	}

	pbGuild := &pb.GuildDetail{
		Id:          guildOverview.Guild.ID.String(),
		OwnerId:     guildOverview.Guild.OwnerID.String(),
		Name:        guildOverview.Guild.Name,
		Description: guildOverview.Guild.Description,
		IconUrl:     guildOverview.Guild.IconURL,
		CreatedAt:   timestamppb.New(guildOverview.Guild.CreatedAt),
		Categories:  pbCategories,
	}

	return &pb.GetGuildOverviewResponse{Guild: pbGuild}, nil
}
