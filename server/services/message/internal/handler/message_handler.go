package handler

import (
	"context"
	"log/slog"
	"message-service/internal/domain"
	"message-service/internal/usecase"
	"shared/metadata"

	pb "chat-app-proto/gen/message"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type MessageHandler struct {
	pb.UnimplementedMessageServiceServer
	messageUsecase usecase.MessageUsecase
	logger         *slog.Logger
}

func NewMessageHandler(messageUsecase usecase.MessageUsecase, logger *slog.Logger) *MessageHandler {
	return &MessageHandler{
		messageUsecase: messageUsecase,
		logger:         logger,
	}
}

func (h *MessageHandler) Create(ctx context.Context, req *pb.CreateMessageRequest) (*pb.CreateMessageResponse, error) {
	senderIDStr, err := metadata.GetUserIDFromMetadata(ctx)
	if err != nil {
		h.logger.Warn("Failed to get user ID from metadata", "error", err)
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}
	senderID, err := uuid.Parse(senderIDStr)
	if err != nil {
		h.logger.Warn("Invalid user ID format", "user_id", senderIDStr, "error", err)
		return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidUserData.Error())
	}
	channelID, err := uuid.Parse(req.ChannelId)
	if err != nil {
		h.logger.Warn("Invalid channel ID format", "channel_id", req.ChannelId, "error", err)
		return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidUserData.Error())
	}

	var replyID *uuid.UUID
	if req.ReplyId != nil {
		parsedReplyID, err := uuid.Parse(*req.ReplyId)
		if err != nil {
			h.logger.Warn("Invalid reply ID format", "reply_id", *req.ReplyId, "error", err)
			return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidUserData.Error())
		}
		replyID = &parsedReplyID
	}

	usecaseParams := &usecase.CreateParams{
		ChannelID: channelID,
		SenderID:  senderID,
		Content:   req.Content,
		ReplyID:   replyID,
	}

	message, err := h.messageUsecase.Create(ctx, usecaseParams)
	if err != nil {
		switch err {
		case domain.ErrInvalidUserData:
			h.logger.Warn("Create message failed: invalid user data")
			return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidUserData.Error())
		default:
			h.logger.Error("Create message failed: unexpected error", "error", err)
			return nil, status.Error(codes.Internal, "failed to create message")
		}
	}

	pbMessage := &pb.Message{
		Id:        message.ID.String(),
		ChannelId: message.ChannelID.String(),
		SenderId:  message.SenderID.String(),
		Content:   message.Content,
		CreatedAt: timestamppb.New(message.CreatedAt),
	}

	if message.ReplyID != nil {
		replyIDStr := message.ReplyID.String()
		pbMessage.ReplyId = &replyIDStr
	}

	return &pb.CreateMessageResponse{Message: pbMessage}, nil
}

func (h *MessageHandler) GetByChannelID(ctx context.Context, req *pb.GetMessagesByChannelIDRequest) (*pb.GetMessagesByChannelIDResponse, error) {
	channelID, err := uuid.Parse(req.ChannelId)
	if err != nil {
		h.logger.Warn("Invalid channel ID format", "channel_id", req.ChannelId, "error", err)
		return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidUserData.Error())
	}
	messages, err := h.messageUsecase.GetByChannelID(ctx, channelID)
	if err != nil {
		h.logger.Error("Get messages by channel ID failed: unexpected error", "error", err)
		return nil, status.Error(codes.Internal, "failed to get messages")
	}

	pbMessages := make([]*pb.Message, len(messages))
	for i, message := range messages {
		pbMessages[i] = &pb.Message{
			Id:        message.ID.String(),
			ChannelId: message.ChannelID.String(),
			SenderId:  message.SenderID.String(),
			Content:   message.Content,
			CreatedAt: timestamppb.New(message.CreatedAt),
		}

		if message.ReplyID != nil {
			replyIDStr := message.ReplyID.String()
			pbMessages[i].ReplyId = &replyIDStr
		}
	}

	return &pb.GetMessagesByChannelIDResponse{Messages: pbMessages}, nil
}
