-- name: CreateUser :one
INSERT INTO users (id, display_id, username, email, password_hash, bio, icon_url, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
RETURNING id, display_id, username, email, bio, icon_url, created_at;

-- name: GetPasswordByEmail :one
SELECT id, password_hash FROM users WHERE email = $1;

-- name: GetUserByID :one
SELECT id, display_id, username, email, bio, icon_url, created_at FROM users WHERE id = $1;

-- name: ExistsByEmail :one
SELECT COUNT(*) FROM users WHERE email = $1;

-- name: ExistsByDisplayId :one
SELECT COUNT(*) FROM users WHERE display_id = $1;

-- name: UpdateUser :one
UPDATE users
SET display_id = $2, username = $3, bio = $4, icon_url = $5, updated_at = NOW()
WHERE id = $1
RETURNING id, display_id, username, email, bio, icon_url, created_at;

-- name: GetUsersByIDs :many
SELECT id, display_id, username, email, bio, icon_url, created_at FROM users WHERE id = ANY($1::uuid[]);
