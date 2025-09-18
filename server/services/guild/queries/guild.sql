-- name: CreateGuild :one
INSERT INTO guilds (id, owner_id, name, description, icon_url, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, NOW())
RETURNING id, owner_id, name, description, icon_url, created_at;

-- name: UpdateGuild :one
UPDATE guilds
SET name = $2, description = $3, icon_url = $4, updated_at = NOW()
WHERE id = $1
RETURNING id, owner_id, name, description, icon_url, created_at;

-- name: GetGuildByID :one
SELECT id, owner_id, name, description, icon_url, created_at FROM guilds WHERE id = $1;
