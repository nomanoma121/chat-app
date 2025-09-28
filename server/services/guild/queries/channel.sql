-- name: CreateChannel :one
INSERT INTO channels (id, category_id, name, created_at, updated_at)
VALUES ($1, $2, $3, $4, NOW())
RETURNING id, category_id, name, created_at;

-- name: GetByCategoryID :many
SELECT id, category_id, name, created_at
FROM channels
WHERE category_id = $1;

-- name: CheckChannelMember :one
SELECT EXISTS (
    SELECT 1
    FROM members m
    JOIN categories c ON m.guild_id = c.guild_id
    JOIN channels ch ON c.id = ch.category_id
    WHERE m.user_id = $1 AND ch.id = $2
);
