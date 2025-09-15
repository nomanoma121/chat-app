-- name: AddMember :one
INSERT INTO members (guild_id, user_id, nickname, joined_at, updated_at)
VALUES ($1, $2, $3, NOW(), NOW())
RETURNING *;
