-- Add owner_id column to businesses table for business ownership feature
-- This migration is safe to run even if the column already exists

-- 1. Add owner_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE businesses ADD COLUMN owner_id UUID;
  END IF;
END $$;

-- 2. Add comment to the column
COMMENT ON COLUMN businesses.owner_id IS 'Optional owner UUID - links to auth.users when claimed by business_owner';

-- 3. Create index for faster owner lookups (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);

-- 4. Add foreign key constraint to auth.users (safe - no data loss)
-- This ensures owner_id references a valid user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'businesses_owner_id_fkey'
    AND table_name = 'businesses'
  ) THEN
    ALTER TABLE businesses
    ADD CONSTRAINT businesses_owner_id_fkey
    FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Verification query
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'businesses' AND column_name = 'owner_id';
