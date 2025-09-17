-- Modify "categories" table
ALTER TABLE "public"."categories" DROP COLUMN "position";
-- Modify "members" table
ALTER TABLE "public"."members" ALTER COLUMN "nickname" SET NOT NULL;
