-- Fix production signup/profile creation flow for email+password auth.
-- Safe to run multiple times.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user',
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('user', 'business_owner'))
);

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists role text,
  add column if not exists email text,
  add column if not exists avatar_url text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.profiles
set role = 'user'
where role is null or role not in ('user', 'business_owner');

alter table public.profiles
  alter column role set default 'user',
  alter column role set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('user', 'business_owner'));
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- Replace potentially broken policies with explicit self-service policies.
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Robust trigger for auth signup -> profile creation.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata jsonb;
  chosen_role text;
  chosen_name text;
begin
  metadata := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  chosen_role := coalesce(metadata->>'role', metadata->>'account_type', 'user');
  if chosen_role not in ('user', 'business_owner') then
    chosen_role := 'user';
  end if;

  chosen_name := nullif(trim(coalesce(metadata->>'full_name', metadata->>'name', '')), '');
  if chosen_name is null then
    chosen_name := split_part(coalesce(new.email, ''), '@', 1);
  end if;

  insert into public.profiles (id, full_name, role, email)
  values (new.id, chosen_name, chosen_role, new.email)
  on conflict (id)
  do update set
    full_name = excluded.full_name,
    role = excluded.role,
    email = excluded.email,
    updated_at = now();

  return new;
exception
  when others then
    raise log 'handle_new_user failed for user %: %', new.id, sqlerrm;
    return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
