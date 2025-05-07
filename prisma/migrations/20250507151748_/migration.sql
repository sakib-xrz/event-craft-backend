-- AlterTable
ALTER TABLE "invitations" ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
