-- Bootstrap public content tables for Iraq Compass.
-- Safe to run multiple times.

create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id text primary key,
  name text not null,
  "nameAr" text,
  "nameKu" text,
  "imageUrl" text,
  "coverImage" text,
  "isPremium" boolean not null default false,
  "isFeatured" boolean not null default false,
  category text not null,
  subcategory text,
  rating numeric(3,2) not null default 0,
  distance numeric(8,2),
  status text,
  "isVerified" boolean not null default false,
  "reviewCount" integer not null default 0,
  governorate text,
  city text,
  address text,
  phone text,
  whatsapp text,
  website text,
  description text,
  "descriptionAr" text,
  "descriptionKu" text,
  "openHours" text,
  "priceRange" smallint,
  tags text[] default '{}',
  lat double precision,
  lng double precision
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  "businessId" text not null,
  "businessName" text not null,
  "businessAvatar" text,
  caption text not null default '',
  "imageUrl" text,
  "createdAt" timestamptz not null default now(),
  likes integer not null default 0,
  "isVerified" boolean not null default false,
  governorate text
);

-- Create indexes for better query performance
create index if not exists idx_businesses_category on public.businesses(category);
create index if not exists idx_businesses_governorate on public.businesses(governorate);
create index if not exists idx_businesses_city on public.businesses(city);
create index if not exists idx_businesses_rating on public.businesses(rating);
create index if not exists idx_businesses_isFeatured on public.businesses("isFeatured");
create index if not exists idx_businesses_isVerified on public.businesses("isVerified");

create index if not exists idx_posts_businessId on public.posts("businessId");
create index if not exists idx_posts_createdAt on public.posts("createdAt" desc);
create index if not exists idx_posts_governorate on public.posts(governorate);

-- Enable Row Level Security (RLS)
alter table if exists public.businesses enable row level security;
alter table if exists public.posts enable row level security;

-- Create policies for public read access
-- Allow anonymous users to read all businesses
create policy if not exists "Allow public read access on businesses"
  on public.businesses
  for select
  to anon
  using (true);

-- Allow authenticated users to read all businesses
create policy if not exists "Allow authenticated read access on businesses"
  on public.businesses
  for select
  to authenticated
  using (true);

-- Allow anonymous users to read all posts
create policy if not exists "Allow public read access on posts"
  on public.posts
  for select
  to anon
  using (true);

-- Allow authenticated users to read all posts
create policy if not exists "Allow authenticated read access on posts"
  on public.posts
  for select
  to authenticated
  using (true);

-- Allow authenticated users to create posts (for business owners)
create policy if not exists "Allow authenticated insert on posts"
  on public.posts
  for insert
  to authenticated
  with check (true);

-- Comments for documentation
comment on table public.businesses is 'Iraqi businesses directory table with bilingual support';
comment on table public.posts is 'Business posts/updates feed';
comment on column public.businesses.nameAr is 'Business name in Arabic';
comment on column public.businesses.nameKu is 'Business name in Kurdish';
comment on column public.businesses.descriptionAr is 'Business description in Arabic';
comment on column public.businesses.descriptionKu is 'Business description in Kurdish';
