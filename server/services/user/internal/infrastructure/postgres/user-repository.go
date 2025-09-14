package postgres

import (
	"context"

	"user-service/internal/domain"
	"user-service/internal/infrastructure/postgres/generated"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type userRepository struct {
	queries *generated.Queries
}

func NewPostgresUserRepository(queries *generated.Queries) *userRepository {
	return &userRepository{
		queries: queries,
	}
}

func (r *userRepository) Create(ctx context.Context, user *domain.User) (*domain.User, error) {
	dbUser, err := r.queries.CreateUser(ctx, generated.CreateUserParams{
		ID:           user.ID,
		DisplayID:    user.DisplayId,
		Username:     user.Name,
		Email:        user.Email,
		PasswordHash: user.Password,
		Bio:          user.Bio,
		IconUrl:      user.IconURL,
	})
	if err != nil {
		return nil, err
	}
	return &domain.User{
		ID:        dbUser.ID,
		DisplayId: dbUser.DisplayID,
		Name:      dbUser.Username,
		Email:     dbUser.Email,
		Password:  dbUser.PasswordHash,
		Bio:       dbUser.Bio,
		IconURL:   dbUser.IconUrl,
		CreatedAt: dbUser.CreatedAt.Time,
		UpdatedAt: dbUser.UpdatedAt.Time,
	}, nil
}

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	dbUser, err := r.queries.FindByEmail(ctx, email)
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
		Password:  dbUser.PasswordHash,
		Bio:       dbUser.Bio,
		IconURL:   dbUser.IconUrl,
		CreatedAt: dbUser.CreatedAt.Time,
		UpdatedAt: dbUser.UpdatedAt.Time,
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
		Password:  dbUser.PasswordHash,
		Bio:       dbUser.Bio,
		IconURL:   dbUser.IconUrl,
		CreatedAt: dbUser.CreatedAt.Time,
		UpdatedAt: dbUser.UpdatedAt.Time,
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

func (r *userRepository) Update(ctx context.Context, user *domain.UpdateRequest) (*domain.User, error) {
	dbUser, err := r.queries.UpdateUser(ctx, generated.UpdateUserParams{
		ID:       user.ID,
		Username: user.Name,
		Bio:      user.Bio,
		IconUrl:  user.IconURL,
	})

	if err != nil {
		return nil, err
	}

	return &domain.User{
		ID:        dbUser.ID,
		DisplayId: dbUser.DisplayID,
		Name:      dbUser.Username,
		Email:     dbUser.Email,
		Password:  dbUser.PasswordHash,
		Bio:       dbUser.Bio,
		IconURL:   dbUser.IconUrl,
		CreatedAt: dbUser.CreatedAt.Time,
		UpdatedAt: dbUser.UpdatedAt.Time,
	}, nil
}

var _ domain.UserRepository = (*userRepository)(nil)
