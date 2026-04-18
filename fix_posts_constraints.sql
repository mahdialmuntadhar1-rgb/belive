-- Fix posts table not-null constraints on camelCase columns
-- The code uses snake_case (business_id), but the table has not-null constraints on camelCase (businessId, businessName)

-- Drop not-null constraint on businessId (exact column name with capital I)
ALTER TABLE public.posts ALTER COLUMN "businessId" DROP NOT NULL;

-- Drop not-null constraint on businessName (exact column name with capital N)
ALTER TABLE public.posts ALTER COLUMN "businessName" DROP NOT NULL;

-- Drop not-null constraint on businessAvatar (exact column name with capital A)
ALTER TABLE public.posts ALTER COLUMN "businessAvatar" DROP NOT NULL;

-- Drop not-null constraint on imageUrl (exact column name with capital I)
ALTER TABLE public.posts ALTER COLUMN "imageUrl" DROP NOT NULL;
