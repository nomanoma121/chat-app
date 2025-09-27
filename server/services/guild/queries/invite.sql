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

-- name: GetInviteByInviteCode :one
-- GuildをJoinして取得
SELECT
  i.guild_id, i.creator_id, i.invite_code, i.max_uses, i.current_uses, i.expires_at, i.created_at, g.name AS "guild.name", g.description AS "guild.description", g.icon_url AS "guild.icon_url", g.owner_id AS "guild.owner_id", g.created_at AS "guild.created_at"
FROM invites i
JOIN guilds g ON i.guild_id = g.id
WHERE i.invite_code = $1;
