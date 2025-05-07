/*
  Warnings:

  - You are about to drop the column `payment_status` on the `invitations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "payment_status",
ALTER COLUMN "invitation_status" SET DEFAULT 'PENDING';
