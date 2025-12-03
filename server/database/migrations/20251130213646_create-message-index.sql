-- Create index "idx_channel_created_at" to table: "messages"
CREATE INDEX "idx_channel_created_at" ON "public"."messages" ("channel_id", "created_at");
