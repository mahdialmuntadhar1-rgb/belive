-- Ensure business_postcards table has nullable columns for flexible data insertion
-- This migration only modifies columns that are likely to exist

BEGIN;

-- Try to relax constraints on optional fields (these may or may not exist)
-- Using conditional logic where possible

-- If category_tag exists, make it nullable
DO $$
BEGIN
    ALTER TABLE business_postcards ALTER COLUMN category_tag DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN
    -- Column doesn't exist, skip
    NULL;
END $$;

-- If neighborhood exists, make it nullable
DO $$
BEGIN
    ALTER TABLE business_postcards ALTER COLUMN neighborhood DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN
    NULL;
END $$;

-- If governorate exists, make it nullable
DO $$
BEGIN
    ALTER TABLE business_postcards ALTER COLUMN governorate DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN
    NULL;
END $$;

-- If city exists, make it nullable
DO $$
BEGIN
    ALTER TABLE business_postcards ALTER COLUMN city DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN
    NULL;
END $$;

-- If lat exists, make it nullable
DO $$
BEGIN
    ALTER TABLE business_postcards ALTER COLUMN lat DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN
    NULL;
END $$;

-- If lng exists, make it nullable
DO $$
BEGIN
    ALTER TABLE business_postcards ALTER COLUMN lng DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN
    NULL;
END $$;

-- If rating exists, make it nullable
DO $$
BEGIN
    ALTER TABLE business_postcards ALTER COLUMN rating DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN
    NULL;
END $$;

-- If address exists, make it nullable
DO $$
BEGIN
    ALTER TABLE business_postcards ALTER COLUMN address DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN
    NULL;
END $$;

-- Refresh the Supabase API schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
