-- Migration 001: profiles table
-- User profile data linked to Supabase Auth
--
-- Run order: first (depends only on auth.users)
-- Safe to run on fresh instance only — existing live DB already has this table.

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  city        text,
  role        text not null default 'user',
  created_at  timestamptz default now()
);

-- NOTE: The live profiles table does NOT have an `email` or `avatar_url` column.
-- authStore.ts currently tries to insert `email` — this will silently fail.
-- Fix is tracked in Phase 3 (Auth).

-- Trigger: auto-create profile row on new auth.users signup
-- This exists on the live DB. Included here for fresh-instance setup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Attach trigger to auth.users (only if not already present)
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'on_auth_user_created'
      and tgrelid = 'auth.users'::regclass
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end;
$$;

-- RLS (already enabled on live DB)
alter table public.profiles enable row level security;

create policy if not exists "Users read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy if not exists "Users insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy if not exists "Users update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);
