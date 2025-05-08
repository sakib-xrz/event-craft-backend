/*
  Warnings:

  - Added the required column `type` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "action_url" TEXT,
ADD COLUMN     "related_event_id" TEXT,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "notifications_related_event_id_idx" ON "notifications"("related_event_id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_event_id_fkey" FOREIGN KEY ("related_event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
