-- name: CreateMessage :one
INSERT INTO messages (id, channel_id, sender_id, content, reply_id, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, NOW())
RETURNING id, channel_id, sender_id, content, reply_id, created_at;

-- name: GetMessagesByChannelID :many
SELECT id, channel_id, sender_id, content, reply_id, created_at
FROM messages
WHERE channel_id = $1
ORDER BY created_at ASC;
