-- Relax NOT NULL constraints on business_postcards table to allow flexible data population
-- This enables the Shaku Maku feed to post without requiring all metadata fields

BEGIN;

-- Alter business_postcards table to make columns nullable
ALTER TABLE business_postcards
  ALTER COLUMN category_tag DROP NOT NULL,
  ALTER COLUMN neighborhood DROP NOT NULL,
  ALTER COLUMN governorate DROP NOT NULL,
  ALTER COLUMN city DROP NOT NULL,
  ALTER COLUMN lat DROP NOT NULL,
  ALTER COLUMN lng DROP NOT NULL,
  ALTER COLUMN rating DROP NOT NULL,
  ALTER COLUMN address DROP NOT NULL;

-- Ensure coordinate column names are standardized (lat/lng)
-- If the table uses different column names, rename them here
-- (This is a safeguard; adjust if your actual column names differ)

-- Refresh the Supabase API schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
