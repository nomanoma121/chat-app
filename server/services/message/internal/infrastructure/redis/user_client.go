package redis

import (
	"context"
	"encoding/json"
	"message-service/internal/domain"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type CachedUserClient struct {
	redis  *redis.Client
	client domain.IUserService
}

func NewCachedUserClient(redis *redis.Client, client domain.IUserService) *CachedUserClient {
	return &CachedUserClient{
		redis:  redis,
		client: client,
	}
}

func (c *CachedUserClient) GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	cacheKey := "user:" + id.String()
	cachedData, err := c.redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var user domain.User
		if err := json.Unmarshal([]byte(cachedData), &user); err == nil {
			return &user, nil
		}
	}

	user, err := c.client.GetUserByID(ctx, id)
	if err != nil {
		return nil, err
	}

	data, err := json.Marshal(user)
	if err == nil {
		_ = c.redis.Set(ctx, cacheKey, data, 10*time.Minute).Err()
	}

	return user, nil
}

func (c *CachedUserClient) GetUsersByIDs(ctx context.Context, ids []uuid.UUID) ([]*domain.User, error) {
	userMap := make(map[string]*domain.User)
	var idsToFetch []uuid.UUID

	for _, id := range ids {
		cacheKey := "user:" + id.String()
		cachedData, err := c.redis.Get(ctx, cacheKey).Result()
		if err == nil {
			var user domain.User
			if err := json.Unmarshal([]byte(cachedData), &user); err == nil {
				userMap[id.String()] = &user
				continue
			}
		}
		idsToFetch = append(idsToFetch, id)
	}

	if len(idsToFetch) > 0 {
		fetchedUsers, err := c.client.GetUsersByIDs(ctx, idsToFetch)
		if err != nil {
			return nil, err
		}

		for _, user := range fetchedUsers {
			userMap[user.ID.String()] = user
			data, err := json.Marshal(user)
			if err == nil {
				cacheKey := "user:" + user.ID.String()
				_ = c.redis.Set(ctx, cacheKey, data, 10*time.Minute).Err()
			}
		}
	}

	users := make([]*domain.User, 0, len(ids))
	for _, id := range ids {
		if user, ok := userMap[id.String()]; ok {
			users = append(users, user)
		}
	}

	return users, nil
}

var _ domain.IUserService = (*CachedUserClient)(nil)
