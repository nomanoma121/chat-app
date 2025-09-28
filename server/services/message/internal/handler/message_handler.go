package handler

import (
	"context"
	"log/slog"
	"message-service/internal/domain"
	"message-service/internal/usecase"

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

func (h *MessageHandler) Create(ctx context.Context, req *pb.CreateRequest) (*pb.CreateResponse, error) {
	senderID, err := getUserID(ctx, h.logger)
	if err != nil {
		return nil, err
	}

	channelID, err := uuid.Parse(req.ChannelId)
	if err != nil {
		h.logger.Warn("Invalid channel ID format", "channel_id", req.ChannelId, "error", err)
		return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidMessageData.Error())
	}

	var replyID *uuid.UUID
	if req.ReplyId != nil {
		parsedReplyID, err := uuid.Parse(*req.ReplyId)
		if err != nil {
			h.logger.Warn("Invalid reply ID format", "reply_id", *req.ReplyId, "error", err)
			return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidMessageData.Error())
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
		case domain.ErrInvalidMessageData:
			h.logger.Warn("Create message failed: invalid message data")
			return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidMessageData.Error())
		case domain.ErrChannelNotFound:
			h.logger.Warn("Create message failed: channel not found or access denied", "channel_id", channelID, "user_id", senderID)
			return nil, status.Error(codes.NotFound, domain.ErrChannelNotFound.Error())
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

	return &pb.CreateResponse{Message: pbMessage}, nil
}

func (h *MessageHandler) GetByChannelID(ctx context.Context, req *pb.GetByChannelIDRequest) (*pb.GetByChannelIDResponse, error) {
	userID, err := getUserID(ctx, h.logger)
	if err != nil {
		return nil, err
	}

	channelID, err := uuid.Parse(req.ChannelId)
	if err != nil {
		h.logger.Warn("Invalid channel ID format", "channel_id", req.ChannelId, "error", err)
		return nil, status.Error(codes.InvalidArgument, domain.ErrInvalidMessageData.Error())
	}
	messages, err := h.messageUsecase.GetByChannelID(ctx, userID, channelID)
	if err != nil {
		switch err {
		case domain.ErrChannelNotFound:
			h.logger.Warn("Get messages failed: channel not found or access denied", "channel_id", channelID, "user_id", userID)
			return nil, status.Error(codes.NotFound, domain.ErrChannelNotFound.Error())
		default:
			h.logger.Error("Get messages failed: unexpected error", "error", err)
			return nil, status.Error(codes.Internal, "failed to get messages")
		}
	}

	pbMessages := make([]*pb.Message, len(messages))
	for i, message := range messages {
		pbMessage := &pb.Message{
			Id:        message.ID.String(),
			ChannelId: message.ChannelID.String(),
			SenderId:  message.SenderID.String(),
			Content:   message.Content,
			CreatedAt: timestamppb.New(message.CreatedAt),
		}

		if message.Sender != nil {
			pbMessage.Sender = &pb.User{
				Id:        message.Sender.ID.String(),
				DisplayId: message.Sender.DisplayId,
				Name:      message.Sender.Name,
				IconUrl:   message.Sender.IconURL,
				CreatedAt: timestamppb.New(message.Sender.CreatedAt),
			}
		}

		if message.ReplyID != nil {
			replyIDStr := message.ReplyID.String()
			pbMessage.ReplyId = &replyIDStr
		}

		pbMessages[i] = pbMessage
	}

	return &pb.GetByChannelIDResponse{Messages: pbMessages}, nil
}
