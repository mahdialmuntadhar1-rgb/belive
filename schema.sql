-- Canonical Supabase schema for Iraq Business Verification & Enrichment
-- This is the single production schema definition.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.raw_business_records (
  id uuid primary key default gen_random_uuid(),
  agent_name text not null,
  source text not null,
  external_id text,
  payload jsonb not null,
  is_demo boolean not null default false,
  collected_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  business_id text not null unique,
  name jsonb not null,
  category text not null,
  subcategory text,
  governorate text not null,
  city text not null,
  district text,
  contact jsonb not null default '{}'::jsonb,
  location jsonb not null default '{}'::jsonb,
  social jsonb not null default '{}'::jsonb,
  confidence_score numeric(4,3) not null default 0,
  verification_status text not null default 'pending_review' check (verification_status in ('pending_review','approved','rejected')),
  review_state text not null default 'raw' check (review_state in ('raw','candidate','published')),
  source_records jsonb not null default '[]'::jsonb,
  agent_notes text,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists businesses_name_city_phone_idx
on public.businesses ((lower(coalesce(name->>'en', ''))), lower(city), (coalesce(contact->>'phone', '')));

create index if not exists businesses_status_idx on public.businesses (verification_status, review_state);
create index if not exists businesses_geo_idx on public.businesses (governorate, city, district);
create index if not exists businesses_category_idx on public.businesses (category, subcategory);

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  agent_name text not null unique,
  governorate text not null,
  categories text[] not null default '{}',
  source_adapters text[] not null default '{}',
  status text not null default 'idle' check (status in ('idle','running','completed','error')),
  last_run timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_tasks (
  id bigint generated always as identity primary key,
  task_type text not null,
  category text,
  governorate text,
  city text,
  status text not null default 'pending' check (status in ('pending','processing','completed','failed')),
  assigned_agent text,
  retry_count int not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_logs (
  id bigint generated always as identity primary key,
  agent_name text not null,
  action text not null,
  result text,
  details text,
  created_at timestamptz not null default now()
);

create trigger set_updated_at_businesses
before update on public.businesses
for each row execute function public.set_updated_at();

create trigger set_updated_at_agents
before update on public.agents
for each row execute function public.set_updated_at();

create trigger set_updated_at_agent_tasks
before update on public.agent_tasks
for each row execute function public.set_updated_at();

alter table public.raw_business_records enable row level security;
alter table public.businesses enable row level security;
alter table public.agents enable row level security;
alter table public.agent_tasks enable row level security;
alter table public.agent_logs enable row level security;

-- Read access for authenticated dashboard users.
drop policy if exists "read_businesses" on public.businesses;
create policy "read_businesses" on public.businesses for select to authenticated using (true);

drop policy if exists "read_agents" on public.agents;
create policy "read_agents" on public.agents for select to authenticated using (true);

-- Service role writes (backend).
drop policy if exists "service_role_all_businesses" on public.businesses;
create policy "service_role_all_businesses" on public.businesses
for all to service_role using (true) with check (true);

drop policy if exists "service_role_all_agents" on public.agents;
create policy "service_role_all_agents" on public.agents
for all to service_role using (true) with check (true);

drop policy if exists "service_role_all_tasks" on public.agent_tasks;
create policy "service_role_all_tasks" on public.agent_tasks
for all to service_role using (true) with check (true);

drop policy if exists "service_role_all_logs" on public.agent_logs;
create policy "service_role_all_logs" on public.agent_logs
for all to service_role using (true) with check (true);

drop policy if exists "service_role_all_raw_records" on public.raw_business_records;
create policy "service_role_all_raw_records" on public.raw_business_records
for all to service_role using (true) with check (true);
