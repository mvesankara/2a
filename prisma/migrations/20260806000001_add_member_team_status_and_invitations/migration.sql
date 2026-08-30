-- AlterTable: add team and status to project_members
ALTER TABLE "project_members" ADD COLUMN IF NOT EXISTS "team" TEXT;
ALTER TABLE "project_members" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'actif';

-- AlterTable: normalize role default
ALTER TABLE "project_members" ALTER COLUMN "role" SET DEFAULT 'Membre';

-- AddUniqueConstraint on project_members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_members_project_id_profile_id_key'
  ) THEN
    ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_profile_id_key" UNIQUE ("project_id", "profile_id");
  END IF;
END $$;

-- CreateTable: project_invitations
CREATE TABLE IF NOT EXISTS "project_invitations" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Membre',
    "specialty" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invited_by_profile_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_invitations_pkey" PRIMARY KEY ("id")
);

-- AddUniqueConstraint on project_invitations
ALTER TABLE "project_invitations" DROP CONSTRAINT IF EXISTS "project_invitations_project_id_email_key";
ALTER TABLE "project_invitations" ADD CONSTRAINT "project_invitations_project_id_email_key" UNIQUE ("project_id", "email");

-- AddForeignKey
ALTER TABLE "project_invitations" DROP CONSTRAINT IF EXISTS "project_invitations_project_id_fkey";
ALTER TABLE "project_invitations" ADD CONSTRAINT "project_invitations_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "project_invitations" DROP CONSTRAINT IF EXISTS "project_invitations_invited_by_profile_id_fkey";
ALTER TABLE "project_invitations" ADD CONSTRAINT "project_invitations_invited_by_profile_id_fkey"
  FOREIGN KEY ("invited_by_profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
