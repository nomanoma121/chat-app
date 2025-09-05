-- name: CreateUser :one
INSERT INTO users (display_id, username, email, password_hash, bio, icon_url, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
RETURNING *;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: ExistsByEmail :one
SELECT COUNT(*) FROM users WHERE email = $1;

-- name: ExistsByDisplayId :one
SELECT COUNT(*) FROM users WHERE display_id = $1;

-- name: UpdateUser :one
UPDATE users 
SET username = $2, bio = $3, icon_url = $4, updated_at = NOW()
WHERE id = $1
RETURNING (id, updated_at);
