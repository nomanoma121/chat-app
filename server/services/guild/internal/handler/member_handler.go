package handler

// 追加処理にはまだ必要ないのでコメントアウト

// import (
// 	"context"
// 	"shared/metadata"
// 	pb "chat-app-proto/gen/guild"
// 	"guild-service/internal/usecase"

// 	"golang.org/x/exp/slog"
// 	"google.golang.org/protobuf/types/known/timestamppb"
// )

// type memberHandler struct {
// 	pb.UnimplementedGuildServiceServer
// 	memberUsecase usecase.MemberUsecase
// 	logger        *slog.Logger
// }

// func NewMemberHandler(memberUsecase usecase.MemberUsecase, logger *slog.Logger) *memberHandler {
// 	return &memberHandler{
// 		memberUsecase: memberUsecase,
// 		logger:        logger,
// 	}
// }

// func (h *memberHandler) AddMember(ctx context.Context, req *pb.AddMemberRequest) (*pb.AddMemberResponse, error) {
// 	userIDStr, err := metadata.GetUserIDFromMetadata(ctx)
// 	if err != nil {
// 		h.logger.Warn("Failed to get user ID from metadata", "error", err)
// 		return nil, err
// 	}

// 	input := &usecase.AddMemberParams{
// 		GuildID:  req.GuildId,
// 		UserID:   userIDStr,
// 		Nickname: req.Nickname,
// 	}

// 	member, err := h.memberUsecase.AddMember(ctx, input)
// 	if err != nil {
// 		h.logger.Error("Failed to add member", "guild_id", req.GuildId, "user_id", userIDStr, "error", err)
// 		return nil, err
// 	}

// 	return &pb.AddMemberResponse{
// 		Member: &pb.Member{
// 			GuildId:   member.GuildID.String(),
// 			UserId:    member.UserID.String(),
// 			Nickname:  member.Nickname,
// 			JoinedAt:  timestamppb.New(member.JoinedAt),
// 		},
// 	}, nil
// }

// var _ pb.MemberServiceServer = (*memberHandler)(nil)
