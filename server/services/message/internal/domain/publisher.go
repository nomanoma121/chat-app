package domain

import (
	"context"
)

type IPublisher interface {
	Publish(ctx context.Context, message *Message) error
}
