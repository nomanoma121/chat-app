-- Create index "idx_guild" to table: "categories"
CREATE INDEX "idx_guild" ON "public"."categories" ("guild_id");
-- Create index "idx_category" to table: "channels"
CREATE INDEX "idx_category" ON "public"."channels" ("category_id");
-- Create index "idx_user_created_at" to table: "guilds"
CREATE INDEX "idx_user_created_at" ON "public"."guilds" ("owner_id", "created_at");
-- Modify "members" table
ALTER TABLE "public"."members" DROP CONSTRAINT "members_pkey", ADD PRIMARY KEY ("guild_id", "user_id");
-- Create index "idx_members_user_id" to table: "members"
CREATE INDEX "idx_members_user_id" ON "public"."members" ("user_id");
