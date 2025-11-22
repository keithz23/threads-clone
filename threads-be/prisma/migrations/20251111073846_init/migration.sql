-- CreateEnum
CREATE TYPE "ReplyPolicy" AS ENUM ('ANYONE', 'FOLLOWERS', 'FOLLOWING', 'MENTIONS');

-- AlterTable
ALTER TABLE "post_media" ADD COLUMN     "alt_text" TEXT,
ADD COLUMN     "storage_key" TEXT;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "reply_policy" "ReplyPolicy" NOT NULL DEFAULT 'ANYONE',
ADD COLUMN     "review_approve" BOOLEAN NOT NULL DEFAULT false;
