/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `participants` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `participants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "participants_token_key" ON "participants"("token");

-- CreateIndex
CREATE INDEX "participants_token_idx" ON "participants"("token");
