-- name: CreateGuildInvite :one
INSERT INTO invites (guild_id, creator_id, invite_code, max_uses, current_uses, expires_at, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING guild_id, creator_id, invite_code, max_uses, current_uses, expires_at, created_at;

-- name: GetGuildInvitesByGuildID :many
SELECT guild_id, creator_id, invite_code, max_uses, current_uses, expires_at, created_at
FROM invites
WHERE guild_id = $1;

-- name: IncrementInviteUses :one
UPDATE invites
SET current_uses = current_uses + 1
WHERE invite_code = $1 AND (max_uses IS NULL OR current_uses < max_uses) AND (expires_at IS NULL OR expires_at > NOW())
RETURNING guild_id, creator_id, invite_code, max_uses, current_uses, expires_at, created_at;
