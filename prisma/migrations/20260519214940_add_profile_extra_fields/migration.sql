-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "interests" TEXT[],
ADD COLUMN     "membership_expires_at" TIMESTAMP(3),
ADD COLUMN     "membership_type" TEXT,
ADD COLUMN     "organization" TEXT,
ADD COLUMN     "profession" TEXT;
