package postgres

import (
	"context"
	"fmt"
	"guild-service/internal/domain"
	"guild-service/internal/infrastructure/postgres/gen" // sqlcが生成したパッケージ

	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresStore struct {
	db         *pgxpool.Pool
	guilds     domain.IGuildRepository
	channels   domain.IChannelRepository
	categories domain.ICategoryRepository
	members    domain.IMemberRepository
	invites    domain.IInviteRepository
}

func NewPostgresStore(db *pgxpool.Pool) domain.IStore {
	q := gen.New(db)

	return &PostgresStore{
		db:         db,
		guilds:     NewPostgresGuildRepository(q),
		channels:   NewPostgresChannelRepository(q),
		categories: NewPostgresCategoryRepository(q),
		members:    NewPostgresMemberRepository(q),
		invites:    NewPostgresInviteRepository(q),
	}
}

func (s *PostgresStore) Guilds() domain.IGuildRepository {
	return s.guilds
}

func (s *PostgresStore) Channels() domain.IChannelRepository {
	return s.channels
}

func (s *PostgresStore) Categories() domain.ICategoryRepository {
	return s.categories
}

func (s *PostgresStore) Members() domain.IMemberRepository {
	return s.members
}

func (s *PostgresStore) Invites() domain.IInviteRepository {
	return s.invites
}

func (s *PostgresStore) ExecTx(ctx context.Context, fn func(domain.IStore) error) error {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return err
	}

	txQueries := gen.New(tx)

	txStore := &PostgresStore{
		db:         s.db,
		guilds:     NewPostgresGuildRepository(txQueries),
		channels:   NewPostgresChannelRepository(txQueries),
		categories: NewPostgresCategoryRepository(txQueries),
		members:    NewPostgresMemberRepository(txQueries),
		invites:    NewPostgresInviteRepository(txQueries),
	}

	err = fn(txStore)
	if err != nil {
		if rbErr := tx.Rollback(ctx); rbErr != nil {
			return fmt.Errorf("tx err: %v, rb err: %v", err, rbErr)
		}
		return err
	}

	return tx.Commit(ctx)
}

var _ domain.IStore = (*PostgresStore)(nil)
