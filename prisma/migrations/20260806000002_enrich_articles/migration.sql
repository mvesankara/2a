ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "category"          TEXT;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "image_url"         TEXT;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "views"             INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "likes"             INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "author_profile_id" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'articles_author_profile_id_fkey'
  ) THEN
    ALTER TABLE "articles" ADD CONSTRAINT "articles_author_profile_id_fkey"
      FOREIGN KEY ("author_profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
