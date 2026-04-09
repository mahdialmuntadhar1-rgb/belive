# SUPABASE_SIGNUP_FIX

## Problem

Signup fails with:

- `Database error saving new user`

This error happens inside Supabase Auth when inserting into `auth.users`. In practice, this almost always means an `auth.users` trigger/function failed or violated a table constraint in downstream writes.

## Root cause category

**Broken DB trigger on `auth.users` (or trigger-driven schema mismatch/constraint failure).**

In this codebase, signup is now constrained to minimal metadata (`full_name`, `role`) so frontend metadata is not the broad failure surface anymore.

## What this repo now does (safe flow)

1. **Signup**: only `supabase.auth.signUp(...)` with minimal metadata.
2. **Profile sync**: performed after auth/session handling via `profiles` upsert.
3. **Business creation**: not done in signup path.

## How to debug in Supabase

1. Supabase Dashboard → **Logs → Auth**
   - Find the failed signup request timestamp.
2. Supabase Dashboard → **Logs → Postgres**
   - Look for trigger/function exception right after `insert into auth.users`.
3. Supabase SQL Editor:
   - Inspect triggers and function bodies.
   - Inspect `public.profiles` columns + constraints.

## SQL to inspect triggers

```sql
select tgname, proname
from pg_trigger t
join pg_proc p on t.tgfoid = p.oid
where tgrelid = 'auth.users'::regclass;
```

### Optional deeper inspection

```sql
select
  p.proname,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
where p.oid in (
  select t.tgfoid
  from pg_trigger t
  where t.tgrelid = 'auth.users'::regclass
);
```

```sql
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
order by ordinal_position;
```

## Final safe trigger (minimal)

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
```

### Attach trigger (if needed)

```sql
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
```
