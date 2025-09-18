package postgres

import (
	"context"
	"fmt"
	"guild-service/internal/domain"
	"guild-service/internal/infrastructure/postgres/gen"

	"github.com/jackc/pgx/v5"
)

type Store interface {
	Guilds() domain.IGuildRepository
	Channels() domain.IChannelRepository
	Categories() domain.ICategoryRepository
	Members() domain.IMemberRepository
	ExecTx(ctx context.Context, fn func(Store) error) error
}

type SQLStore struct {
	db         *pgx.Conn
	guilds     domain.IGuildRepository
	channels   domain.IChannelRepository
	categories domain.ICategoryRepository
	members    domain.IMemberRepository
}

// 3. コンストラクタで、フィールドを初期化する
func NewSQLStore(db *pgx.Conn) Store {
	queries := gen.New(db)
	return &SQLStore{
		db:         db,
		guilds:     NewPostgresGuildRepository(queries),
		channels:   NewPostgresChannelRepository(queries),
		categories: NewPostgresCategoryRepository(queries),
		members:    NewPostgresMemberRepository(queries),
	}
}

func (s *SQLStore) Guilds() domain.IGuildRepository {
	return s.guilds
}

func (s *SQLStore) Channels() domain.IChannelRepository {
	return s.channels
}

func (s *SQLStore) Categories() domain.ICategoryRepository {
	return s.categories
}

func (s *SQLStore) Members() domain.IMemberRepository {
	return s.members
}

func (s *SQLStore) ExecTx(ctx context.Context, fn func(Store) error) error {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return err
	}

	txQueries := gen.New(tx)
	txStore := &SQLStore{
		db:         s.db,
		guilds:     NewPostgresGuildRepository(txQueries),
		channels:   NewPostgresChannelRepository(txQueries),
		categories: NewPostgresCategoryRepository(txQueries),
		members:    NewPostgresMemberRepository(txQueries),
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
