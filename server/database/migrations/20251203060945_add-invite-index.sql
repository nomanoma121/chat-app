-- Drop index "idx_user_created_at" from table: "guilds"
DROP INDEX "public"."idx_user_created_at";
-- Create index "idx_guild_id" to table: "invites"
CREATE INDEX "idx_guild_id" ON "public"."invites" ("guild_id");
-- Drop index "idx_display_id" from table: "users"
DROP INDEX "public"."idx_display_id";
-- Drop index "idx_email" from table: "users"
DROP INDEX "public"."idx_email";
