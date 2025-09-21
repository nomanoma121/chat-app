-- Modify "guilds" table
ALTER TABLE "public"."guilds" ADD COLUMN "default_channel_id" uuid NOT NULL;
