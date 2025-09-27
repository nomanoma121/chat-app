-- name: AddMember :one
INSERT INTO members (guild_id, user_id, joined_at, updated_at)
VALUES ($1, $2, $3, NOW())
RETURNING guild_id, user_id, joined_at;

-- name: GetMembersByGuildID :many
SELECT guild_id, user_id, joined_at
FROM members
WHERE guild_id = $1;

-- name: CountByGuildID :one
SELECT COUNT(*) AS count
FROM members
WHERE guild_id = $1;
