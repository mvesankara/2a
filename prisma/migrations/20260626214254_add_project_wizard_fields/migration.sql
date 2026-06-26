-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "budget" DOUBLE PRECISION,
ADD COLUMN     "budget_sources" TEXT,
ADD COLUMN     "created_by_profile_id" TEXT,
ADD COLUMN     "estimated_duration" TEXT,
ADD COLUMN     "human_resources" TEXT,
ADD COLUMN     "material_resources" TEXT,
ADD COLUMN     "objectives" TEXT,
ADD COLUMN     "planned_activities" TEXT,
ADD COLUMN     "problem_statement" TEXT,
ADD COLUMN     "success_indicators" TEXT,
ADD COLUMN     "target_beneficiaries" TEXT;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_profile_id_fkey" FOREIGN KEY ("created_by_profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
