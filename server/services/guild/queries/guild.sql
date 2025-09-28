-- name: CreateGuild :one
INSERT INTO guilds (id, owner_id, name, description, icon_url, default_channel_id, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
RETURNING id, owner_id, name, description, icon_url, default_channel_id, created_at;

-- name: UpdateGuild :one
UPDATE guilds
SET name = $2, description = $3, icon_url = $4, default_channel_id = $5, updated_at = NOW()
WHERE id = $1
RETURNING id, owner_id, name, description, icon_url, default_channel_id, created_at;

-- name: GetGuildByID :one
SELECT id, owner_id, name, description, icon_url, default_channel_id, created_at FROM guilds WHERE id = $1;

-- name: GetMyGuilds :many
SELECT g.id, g.owner_id, g.name, g.description, g.icon_url, g.default_channel_id, g.created_at
FROM guilds g
JOIN members m ON g.id = m.guild_id
WHERE m.user_id = $1
ORDER BY g.created_at DESC;

-- name: IsOwner :one
SELECT EXISTS (
    SELECT 1
    FROM guilds
    WHERE id = $1 AND owner_id = $2
);
