-- Migration 003: content tables (feed / stories / events / deals / postcards)
-- These are the HUMUS social content layer — stories, posts, deals, events.
-- All tables exist on the live DB with sample seed rows.
-- Frontend integration is tracked in Phase 5.
--
-- NOTE: The `posts` table schema uses camelCase.
-- usePosts.ts (BELIVE) currently queries snake_case columns and will fail.
-- Fix is tracked in Phase 5 (Feed / Content System).

-- ─────────────────────────────────────────────
-- POSTS
-- Business status updates / social-style posts
-- ─────────────────────────────────────────────
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  "businessId"    text not null,          -- references businesses.id (text FK)
  "businessName"  text not null,
  "businessAvatar" text,
  caption         text not null default '',
  "imageUrl"      text,
  "createdAt"     timestamptz not null default now(),
  likes           integer not null default 0,
  "isVerified"    boolean not null default false
);

-- NOTE: usePosts.ts currently calls supabase.rpc('increment_likes') which does
-- NOT exist. Use a direct update in the interim, or add the function below.
-- The increment_likes function is defined in 007_functions.sql.

-- ─────────────────────────────────────────────
-- STORIES
-- Short-lived story bubbles (business or community)
-- ─────────────────────────────────────────────
create table if not exists public.stories (
  id          uuid primary key default gen_random_uuid(),
  avatar      text,
  name        text not null,
  viewed      boolean not null default false,
  verified    boolean not null default false,
  thumbnail   text,
  "userName"  text,
  type        text not null check (type in ('business', 'community')),
  "aiVerified" boolean not null default false,
  "isLive"    boolean not null default false,
  media       text[] not null default '{}',
  "timeAgo"   text,
  "createdAt" timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- EVENTS
-- Local events with governorate scoping
-- ─────────────────────────────────────────────
create table if not exists public.events (
  id              uuid primary key default gen_random_uuid(),
  image           text,
  title           text not null,
  "titleKey"      text,
  "aiRecommended" boolean not null default false,
  date            timestamptz not null,
  venue           text not null,
  "venueKey"      text,
  location        text,
  attendees       integer not null default 0,
  price           numeric not null default 0,
  category        text not null,
  governorate     text not null,   -- govscoping: filter by governorate
  accessibility   jsonb not null default '{}'
);

-- ─────────────────────────────────────────────
-- DEALS
-- Time-limited promotions
-- ─────────────────────────────────────────────
create table if not exists public.deals (
  id              uuid primary key default gen_random_uuid(),
  discount        integer not null,
  "businessLogo"  text,
  title           text not null,
  description     text not null,
  "expiresIn"     text not null,
  claimed         integer not null default 0,
  total           integer not null default 0,
  "createdAt"     timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- BUSINESS POSTCARDS
-- Rich visual cards for featured businesses
-- ─────────────────────────────────────────────
create table if not exists public.business_postcards (
  id               text primary key,
  title            text not null,
  city             text not null,
  neighborhood     text not null,
  governorate      text not null,
  category_tag     text not null check (
    category_tag in (
      'Cafe','Restaurant','Bakery','Hotel','Gym',
      'Salon','Pharmacy','Supermarket'
    )
  ),
  phone            text not null,
  website          text,
  instagram        text,
  hero_image       text not null,
  image_gallery    text[] not null default '{}',
  postcard_content text not null,
  google_maps_url  text not null,
  rating           numeric not null default 0,
  review_count     integer not null default 0,
  verified         boolean not null default false,
  "updatedAt"      timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- RLS: all content tables are public read
-- ─────────────────────────────────────────────
alter table public.posts              enable row level security;
alter table public.stories            enable row level security;
alter table public.events             enable row level security;
alter table public.deals              enable row level security;
alter table public.business_postcards enable row level security;

create policy if not exists "public read posts"
  on public.posts for select to anon using (true);

create policy if not exists "public read stories"
  on public.stories for select to anon using (true);

create policy if not exists "public read events"
  on public.events for select to anon using (true);

create policy if not exists "public read deals"
  on public.deals for select to anon using (true);

create policy if not exists "public read business_postcards"
  on public.business_postcards for select to anon using (true);

-- Verified business owners can insert posts
create policy if not exists "Owners insert posts"
  on public.posts for insert
  to authenticated
  with check (
    "businessId" in (
      select business_id from public.business_claims
      where user_id = auth.uid() and status = 'approved'
    )
  );

-- Indexes
create index if not exists posts_businessid_idx  on public.posts("businessId");
create index if not exists posts_createdat_idx   on public.posts("createdAt" desc);
create index if not exists events_governorate_idx on public.events(governorate);
create index if not exists events_date_idx        on public.events(date);
