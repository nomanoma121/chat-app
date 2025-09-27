-- Modify "invites" table
ALTER TABLE "public"."invites" ALTER COLUMN "max_uses" DROP NOT NULL, ALTER COLUMN "max_uses" DROP DEFAULT, ALTER COLUMN "expires_at" DROP NOT NULL;
-- Modify "members" table
ALTER TABLE "public"."members" DROP COLUMN "nickname";
