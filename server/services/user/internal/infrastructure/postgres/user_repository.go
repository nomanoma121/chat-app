package postgres

import (
	"context"
	"user-service/internal/domain"
	"user-service/internal/infrastructure/postgres/gen"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type userRepository struct {
	queries *gen.Queries
}

func NewPostgresUserRepository(queries *gen.Queries) *userRepository {
	return &userRepository{
		queries: queries,
	}
}

func (r *userRepository) Create(ctx context.Context, user *domain.CreateUserParams) (*domain.User, error) {
	dbUser, err := r.queries.CreateUser(ctx, gen.CreateUserParams{
		ID:           user.ID,
		DisplayID:    user.DisplayId,
		Username:     user.Name,
		Email:        user.Email,
		PasswordHash: user.Password,
		Bio:          user.Bio,
		IconUrl:      user.IconURL,
		CreatedAt:    pgtype.Timestamp{Time: user.CreatedAt, Valid: true},
	})
	if err != nil {
		return nil, err
	}
	return &domain.User{
		ID:        dbUser.ID,
		DisplayId: dbUser.DisplayID,
		Name:      dbUser.Username,
		Email:     dbUser.Email,
		Bio:       dbUser.Bio,
		IconURL:   dbUser.IconUrl,
		CreatedAt: dbUser.CreatedAt.Time,
	}, nil
}

func (r *userRepository) GetPasswordByEmail(ctx context.Context, email string) (*domain.GetPasswordByEmailParams, error) {
	password, err := r.queries.GetPasswordByEmail(ctx, email)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, domain.ErrUserNotFound
		}
		return nil, err
	}
	return &domain.GetPasswordByEmailParams{
		ID:           password.ID,
		PasswordHash: password.PasswordHash,
	}, nil
}

func (r *userRepository) GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	dbUser, err := r.queries.GetUserByID(ctx, id)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, domain.ErrUserNotFound
		}
		return nil, err
	}
	return &domain.User{
		ID:        dbUser.ID,
		DisplayId: dbUser.DisplayID,
		Name:      dbUser.Username,
		Email:     dbUser.Email,
		Bio:       dbUser.Bio,
		IconURL:   dbUser.IconUrl,
		CreatedAt: dbUser.CreatedAt.Time,
	}, nil
}

func (r *userRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	count, err := r.queries.ExistsByEmail(ctx, email)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *userRepository) ExistsByDisplayId(ctx context.Context, displayId string) (bool, error) {
	count, err := r.queries.ExistsByDisplayId(ctx, displayId)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *userRepository) Update(ctx context.Context, user *domain.User) (*domain.User, error) {
	dbUser, err := r.queries.UpdateUser(ctx, gen.UpdateUserParams{
		ID:        user.ID,
		DisplayID: user.DisplayId,
		Username:  user.Name,
		Bio:       user.Bio,
		IconUrl:   user.IconURL,
	})
	if err != nil {
		return nil, err
	}

	return &domain.User{
		ID:        dbUser.ID,
		DisplayId: dbUser.DisplayID,
		Name:      dbUser.Username,
		Email:     dbUser.Email,
		Bio:       dbUser.Bio,
		IconURL:   dbUser.IconUrl,
		CreatedAt: dbUser.CreatedAt.Time,
	}, nil
}

var _ domain.UserRepository = (*userRepository)(nil)
