package domain

import (
	"context"
)

type IStore interface {
	Guilds() IGuildRepository
	Channels() IChannelRepository
	Categories() ICategoryRepository
	Members() IMemberRepository
	ExecTx(ctx context.Context, fn func(IStore) error) error
}
