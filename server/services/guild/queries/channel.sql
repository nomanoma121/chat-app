-- name: CreateChannel: one
INSERT INTO channels (id, category_id, name, order, created_at, updated_at)
VALUES ($1, $2, $3, $4, NOW(), NOW())
RETURNING *;
