package postgres

import (
	"context"

	"user-service/internal/domain"
	"user-service/internal/infrastructure/postgres/generated"
	"user-service/internal/interface/repository"

	"github.com/google/uuid"
)

func stringToPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

type userRepository struct {
	queries *generated.Queries
}

func NewPostgresUserRepository(queries *generated.Queries) *userRepository {
	return &userRepository{
		queries: queries,
	}
}

func (r *userRepository) Create(ctx context.Context, user *domain.User) (repository.CreateUserResponse, error) {
	dbUser, err := r.queries.CreateUser(ctx, generated.CreateUserParams{
		DisplayID:    user.DisplayId,
		Username:     user.Name,
		Email:        user.Email,
		PasswordHash: user.Password,
		Bio:          user.Bio,
		IconUrl:      user.IconURL,
	})
	if err != nil {
		return repository.CreateUserResponse{}, err
	}
	return repository.CreateUserResponse{
		ID:        dbUser.ID,
		CreatedAt: dbUser.CreatedAt.Time,
	}, nil
}

func (r *userRepository) GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {

}

func (r *userRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {

}

func (r *userRepository) ExistsByDisplayId(ctx context.Context, displayId string) (bool, error) {

}

func (r *userRepository) Update(ctx context.Context, user *domain.User) error {

}
