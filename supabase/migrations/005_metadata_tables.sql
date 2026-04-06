-- Migration 005: metadata tables (categories, governorates, cities)
--
-- These tables do NOT exist on the live DB yet.
-- They are required for useMetadata.ts to work correctly.
--
-- Without these tables:
--   - useMetadata.ts falls back to constants.ts
--   - constants.ts has OLD category names ('dining', 'cafe', etc.)
--   - These do NOT match businesses.category ('Restaurants & Dining', etc.)
--   - Category filter UI shows options that return 0 results
--
-- After running this migration + seed files (seed/001 and seed/002),
-- the filter dropdowns will show the correct 10 categories and 17 governorates
-- with Arabic and Kurdish translations.
--
-- Apply to live DB: YES (safe, additive, required for Phase 4)

-- ─────────────────────────────────────────────
-- CATEGORIES
-- One row per category. name_en must match businesses.category exactly.
-- ─────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name_en     text not null unique,   -- must match businesses.category value
  name_ar     text not null,
  name_ku     text not null,
  icon_name   text,                   -- lucide-react icon name (see constants.ts ICON_MAP)
  is_hot      boolean default false,
  created_at  timestamptz default now()
);

alter table public.categories enable row level security;

create policy if not exists "Public read categories"
  on public.categories for select
  to anon
  using (true);

-- ─────────────────────────────────────────────
-- GOVERNORATES
-- One row per Iraqi governorate. name_en must match businesses.governorate exactly.
-- ─────────────────────────────────────────────
create table if not exists public.governorates (
  id          uuid primary key default gen_random_uuid(),
  name_en     text not null unique,   -- must match businesses.governorate value
  name_ar     text not null,
  name_ku     text not null,
  created_at  timestamptz default now()
);

alter table public.governorates enable row level security;

create policy if not exists "Public read governorates"
  on public.governorates for select
  to anon
  using (true);

-- ─────────────────────────────────────────────
-- CITIES
-- One row per city, linked to its governorate.
-- businesses.city is a free-text field — cities table provides display names only.
-- ─────────────────────────────────────────────
create table if not exists public.cities (
  id              uuid primary key default gen_random_uuid(),
  governorate_id  uuid references public.governorates(id) on delete cascade,
  name_en         text not null,
  name_ar         text not null,
  name_ku         text not null,
  created_at      timestamptz default now(),
  unique (governorate_id, name_en)
);

alter table public.cities enable row level security;

create policy if not exists "Public read cities"
  on public.cities for select
  to anon
  using (true);

-- Indexes
create index if not exists categories_name_en_idx   on public.categories(name_en);
create index if not exists governorates_name_en_idx on public.governorates(name_en);
create index if not exists cities_gov_idx           on public.cities(governorate_id);
