/*
  Warnings:

  - A unique constraint covering the columns `[event_id,receiver_id]` on the table `invitations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_virtual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
ALTER COLUMN "venue" DROP NOT NULL;

-- AlterTable
ALTER TABLE "invitations" ADD COLUMN     "joined_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "full_name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "invitations_event_id_idx" ON "invitations"("event_id");

-- CreateIndex
CREATE INDEX "invitations_receiver_id_idx" ON "invitations"("receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_event_id_receiver_id_key" ON "invitations"("event_id", "receiver_id");

-- CreateIndex
CREATE INDEX "participants_event_id_idx" ON "participants"("event_id");

-- CreateIndex
CREATE INDEX "participants_user_id_idx" ON "participants"("user_id");

-- CreateIndex
CREATE INDEX "payments_event_id_idx" ON "payments"("event_id");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX "reviews_event_id_idx" ON "reviews"("event_id");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
