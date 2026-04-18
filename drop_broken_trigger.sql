-- Drop the auth trigger that's causing signup to fail
-- The code has fallback logic (polling + manual profile creation), so this trigger is not required

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
