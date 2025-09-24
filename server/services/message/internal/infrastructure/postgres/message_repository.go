package postgres

import (
	"context"
	"message-service/internal/domain"
	"message-service/internal/infrastructure/postgres/gen"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type messageRepository struct {
	queries *gen.Queries
}

func NewPostgresMessageRepository(queries *gen.Queries) *messageRepository {
	return &messageRepository{
		queries: queries,
	}
}

func (r *messageRepository) Create(ctx context.Context, message *domain.Message) (*domain.Message, error) {
	dbMessage, err := r.queries.CreateMessage(ctx, gen.CreateMessageParams{
		ID:        message.ID,
		ChannelID: message.ChannelID,
		SenderID:  message.SenderID,
		Content:   message.Content,
		ReplyID:   message.ReplyID,
		CreatedAt: pgtype.Timestamp{Time: message.CreatedAt, Valid: true},
	})
	if err != nil {
		return nil, err
	}
	return &domain.Message{
		ID:        dbMessage.ID,
		ChannelID: dbMessage.ChannelID,
		SenderID:  dbMessage.SenderID,
		Content:   dbMessage.Content,
		ReplyID:   dbMessage.ReplyID,
		CreatedAt: dbMessage.CreatedAt.Time,
	}, nil
}

func (r *messageRepository) GetByChannelID(ctx context.Context, channelID uuid.UUID) ([]*domain.Message, error) {
	dbMessages, err := r.queries.GetMessagesByChannelID(ctx, channelID)
	if err != nil {
		return nil, err
	}

	messages := make([]*domain.Message, len(dbMessages))
	for i, dbMessage := range dbMessages {
		messages[i] = &domain.Message{
			ID:        dbMessage.ID,
			ChannelID: dbMessage.ChannelID,
			SenderID:  dbMessage.SenderID,
			Content:   dbMessage.Content,
			ReplyID:   dbMessage.ReplyID,
			CreatedAt: dbMessage.CreatedAt.Time,
		}
	}
	return messages, nil
}

var _ domain.IMessageRepository = (*messageRepository)(nil)
