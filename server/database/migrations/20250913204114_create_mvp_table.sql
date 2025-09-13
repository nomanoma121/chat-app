-- Modify "users" table
ALTER TABLE "public"."users" ALTER COLUMN "bio" SET NOT NULL, ALTER COLUMN "icon_url" TYPE character varying(255), ALTER COLUMN "icon_url" SET NOT NULL, ADD CONSTRAINT "displayId" UNIQUE ("display_id"), ADD CONSTRAINT "email" UNIQUE ("email");
-- Create "guilds" table
CREATE TABLE "public"."guilds" (
  "id" uuid NOT NULL,
  "name" character varying(100) NOT NULL,
  "owner_id" uuid NOT NULL,
  "description" text NOT NULL,
  "icon_url" character varying(255) NOT NULL,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "owner" FOREIGN KEY ("owner_id") REFERENCES "public"."users" ("id") ON UPDATE NO ACTION ON DELETE RESTRICT
);
-- Create "categories" table
CREATE TABLE "public"."categories" (
  "id" uuid NOT NULL,
  "guild_id" uuid NOT NULL,
  "position" integer NOT NULL,
  "name" character varying(100) NOT NULL,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "guild" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create "channels" table
CREATE TABLE "public"."channels" (
  "id" uuid NOT NULL,
  "name" character varying(100) NOT NULL,
  "category_id" uuid NOT NULL,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "category" FOREIGN KEY ("category_id") REFERENCES "public"."categories" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create "invites" table
CREATE TABLE "public"."invites" (
  "invite_code" character varying(16) NOT NULL,
  "creator_id" uuid NOT NULL,
  "guild_id" uuid NOT NULL,
  "max_uses" integer NOT NULL DEFAULT -1,
  "current_uses" integer NOT NULL DEFAULT 0,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp NOT NULL,
  PRIMARY KEY ("invite_code"),
  CONSTRAINT "creator" FOREIGN KEY ("creator_id") REFERENCES "public"."users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "guild" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create "members" table
CREATE TABLE "public"."members" (
  "user_id" uuid NOT NULL,
  "guild_id" uuid NOT NULL,
  "nickname" character varying(100) NULL,
  "joined_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL,
  PRIMARY KEY ("user_id", "guild_id"),
  CONSTRAINT "guild" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds" ("id") ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT "user" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create "messages" table
CREATE TABLE "public"."messages" (
  "id" uuid NOT NULL,
  "author_id" uuid NOT NULL,
  "channel_id" uuid NOT NULL,
  "content" text NOT NULL,
  "reply_id" uuid NULL,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "author" FOREIGN KEY ("author_id") REFERENCES "public"."users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "channel" FOREIGN KEY ("channel_id") REFERENCES "public"."channels" ("id") ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT "reply" FOREIGN KEY ("reply_id") REFERENCES "public"."messages" ("id") ON UPDATE NO ACTION ON DELETE SET NULL
);
