-- Rename a column from "author_id" to "sender_id"
ALTER TABLE "public"."messages" RENAME COLUMN "author_id" TO "sender_id";
-- Modify "messages" table
ALTER TABLE "public"."messages" DROP CONSTRAINT "author", ADD CONSTRAINT "sender" FOREIGN KEY ("sender_id") REFERENCES "public"."users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
