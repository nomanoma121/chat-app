-- name: CreateCategory :one
INSERT INTO categories (id, guild_id, name, created_at, updated_at)
VALUES ($1, $2, $3, $4, NOW())
RETURNING id, guild_id, name, created_at;

-- name: GetByGuildID :many
SELECT id, guild_id, name, created_at
FROM categories
WHERE guild_id = $1;

-- name: GetGuildIDByCategoryID :one
SELECT guild_id
FROM categories
WHERE id = $1;
