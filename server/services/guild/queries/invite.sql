-- name: CreateGuildInvite :one
INSERT INTO guild_invites (guild_id, creator_id, code, max_uses, uses, expires_at, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7)

