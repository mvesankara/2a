-- AlterTable
ALTER TABLE "project_members" ADD COLUMN     "role" TEXT DEFAULT 'Membre actif';

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL DEFAULT 'PDF',
    "url" TEXT,
    "size_bytes" INTEGER,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);
