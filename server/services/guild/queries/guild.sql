-- name: CreateGuild :one
INSERT INTO guilds (id, owner_id, name, description, icon_url, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
RETURNING *;

-- name: UpdateGuild :one
UPDATE guilds
SET name = $2, description = $3, icon_url = $4, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: GetGuildByID :one
SELECT * FROM guilds WHERE id = $1;
