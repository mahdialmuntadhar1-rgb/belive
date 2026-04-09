# Supabase Signup Fix Handover

## Issue summary

Observed runtime error during email/password registration:

- `Database error saving new user`

In this repository, frontend signup was sending **extended business-owner metadata** (`role`, `business_name`, `phone`, `governorate`, `category`, `city`, `description`) directly in `supabase.auth.signUp(...)`. If your Supabase project has an `auth.users` trigger that consumes this metadata (or inserts into business/profile tables), any schema mismatch or permission error in that trigger path can hard-fail Auth signup.

### What was changed in code (surgical)

1. Signup now sends only **minimal safe Auth metadata** (`full_name`) to `supabase.auth.signUp(...)`.
2. Business-owner onboarding data is stored client-side as pending onboarding state, then synced to `public.profiles` only **after auth succeeds**.
3. No business-table creation is attempted in the critical auth-signup path.
4. Error logging now prints full Supabase error payload (`message`, `code`, `status`, `details`, `hint`) for faster diagnosis.

---

## Supabase Dashboard checks (do these first)

1. **Auth logs**
   - Supabase Dashboard → Logs → Auth
   - Filter around failed signup timestamps.
   - Confirm exact internal error tied to signup.

2. **Database/Postgres logs**
   - Supabase Dashboard → Logs → Postgres
   - Look for trigger/function exceptions after `insert into auth.users`.

3. **Table + function privileges**
   - Ensure trigger function owner/permissions can write to `public.profiles`.
   - Prefer `security definer` function with controlled `search_path`.

---

## SQL: inspect current `auth.users` triggers

```sql
-- 1) List triggers on auth.users
select
  n.nspname as table_schema,
  c.relname as table_name,
  t.tgname as trigger_name,
  pg_get_triggerdef(t.oid, true) as trigger_definition,
  p.proname as function_name,
  pn.nspname as function_schema
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
join pg_proc p on p.oid = t.tgfoid
join pg_namespace pn on pn.oid = p.pronamespace
where n.nspname = 'auth'
  and c.relname = 'users'
  and not t.tgisinternal
order by t.tgname;
```

```sql
-- 2) Show function body used by auth.users triggers
select
  pn.nspname as function_schema,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_sql
from pg_proc p
join pg_namespace pn on pn.oid = p.pronamespace
where p.oid in (
  select t.tgfoid
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'auth'
    and c.relname = 'users'
    and not t.tgisinternal
)
order by pn.nspname, p.proname;
```

```sql
-- 3) Inspect profiles shape/constraints (common mismatch source)
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
order by ordinal_position;
```

```sql
-- 4) Quick look at constraints on profiles
select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.profiles'::regclass
order by conname;
```

---

## Minimal safe trigger replacement (recommended)

> Goal: keep `auth.users` trigger tiny and resilient. Do **not** create business records here.

```sql
-- Optional: remove old trigger first (adjust name if different)
drop trigger if exists on_auth_user_created on auth.users;

-- Create/replace minimal function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id)
  do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    role = coalesce(excluded.role, public.profiles.role),
    updated_at = now();

  return new;
end;
$$;

-- Recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
```

---

## Rollback notes

If needed, rollback by:

1. Restoring previous trigger function SQL from your migration history or SQL editor history.
2. Recreating prior trigger definition.
3. Re-running signup test with Auth + Postgres logs open.

For safer rollout:

- Apply in staging first.
- Keep old function text saved before replacement.
- Verify both **signup** and **login** flows after deploy.

---

## Verification checklist

- [ ] New email/password signup succeeds.
- [ ] `public.profiles` row exists for new user.
- [ ] No business rows are created during auth signup trigger.
- [ ] Business onboarding still works as a post-auth step.
- [ ] Auth + Postgres logs clean during signup.
