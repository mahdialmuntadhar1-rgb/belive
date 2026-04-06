-- Migration 002: businesses table
-- Core business directory — 1,800 rows in production
--
-- IMPORTANT: DO NOT run this on the live instance — data already exists.
-- This file documents the schema for fresh-instance setup and reference.
--
-- Column naming: camelCase with double-quotes (PostgreSQL case-sensitive).
-- The table also has lowercase duplicate columns (namear, imageurl, etc.)
-- which are scraper artifacts — the camelCase versions hold the real data.

create table if not exists public.businesses (
  -- Identity
  id                  text primary key,

  -- Names (trilingual)
  name                text,
  "nameAr"            text,   -- Arabic name  (populated)
  "nameKu"            text,   -- Kurdish name (populated)

  -- Images
  "imageUrl"          text,   -- Primary listing image
  "coverImage"        text,   -- Cover/banner image

  -- Classification
  category            text,   -- e.g. 'Restaurants & Dining' (see seed/001_categories.sql)
  subcategory         text,

  -- Flags
  "isPremium"         boolean default false,
  "isFeatured"        boolean default false,
  "isVerified"        boolean default false,

  -- Metrics
  rating              numeric,
  "reviewCount"       integer,
  "priceRange"        integer,  -- 1-4 scale

  -- Location
  governorate         text,   -- e.g. 'Baghdad' (see seed/002_governorates.sql)
  city                text,
  address             text,
  lat                 numeric,
  lng                 numeric,

  -- Contact
  phone               text,
  whatsapp            text,
  website             text,

  -- Content
  description         text,
  "descriptionAr"     text,
  "descriptionKu"     text,
  "openHours"         text,
  tags                jsonb,

  -- Timestamps
  "createdAt"         timestamptz default now(),

  -- Scraper/pipeline metadata (do not rely on in frontend)
  business_name       text,
  verification_status text default 'pending',
  created_by_agent    text,
  confidence_score    numeric,
  source_name         text,
  external_source_id  text,
  distance            text
);

-- RLS: public read, no public write
alter table public.businesses enable row level security;

create policy if not exists "Public read"
  on public.businesses for select
  to public
  using (true);

-- Owner can update their own claimed business
create policy if not exists "Owner updates own business"
  on public.businesses for update
  to authenticated
  using (
    id in (
      select business_id from public.business_claims
      where user_id = auth.uid() and status = 'approved'
    )
  );

-- Indexes for filter performance
create index if not exists businesses_governorate_idx on public.businesses(governorate);
create index if not exists businesses_category_idx on public.businesses(category);
create index if not exists businesses_featured_idx on public.businesses("isFeatured");
