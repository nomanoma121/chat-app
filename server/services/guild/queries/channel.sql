-- name: CreateChannel :one
INSERT INTO channels (id, category_id, name, created_at, updated_at)
VALUES ($1, $2, $3, $4, NOW())
RETURNING id, category_id, name, created_at;

-- name: GetByCategoryID :many
SELECT id, category_id, name, created_at
FROM channels
WHERE category_id = $1;
