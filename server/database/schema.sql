-- Add new schema named "public"
CREATE SCHEMA IF NOT EXISTS "public";
-- Create "users" table
CREATE TABLE "public"."users" (
  "id" uuid NOT NULL,
  "display_id" character varying(100) NOT NULL,
  "username" character varying(100) NOT NULL,
  "email" character varying(100) NOT NULL,
  "password_hash" character varying(100) NOT NULL,
  "bio" text NOT NULL,
  "icon_url" character varying(100) NOT NULL,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "displayId" UNIQUE ("display_id"),
  CONSTRAINT "email" UNIQUE ("email")
);
