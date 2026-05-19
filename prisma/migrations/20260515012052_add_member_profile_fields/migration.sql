-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "address" TEXT,
ADD COLUMN     "date_of_birth" TIMESTAMP(3),
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "how_did_you_hear" TEXT,
ADD COLUMN     "id_document_url" TEXT,
ADD COLUMN     "motivation" TEXT,
ADD COLUMN     "phone" TEXT;
