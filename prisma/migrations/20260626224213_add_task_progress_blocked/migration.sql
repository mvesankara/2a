-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_profile_id_fkey";

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "is_blocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "profile_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
