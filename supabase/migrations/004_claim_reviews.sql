-- Migration 004: business_claims and reviews tables
-- Owner claim flow and user review system
-- Both tables exist on the live DB (0 rows — not yet used).

-- ─────────────────────────────────────────────
-- BUSINESS CLAIMS
-- Allows a business_owner to claim ownership of a listing.
-- Admin approves/rejects via status field.
-- ─────────────────────────────────────────────
create table if not exists public.business_claims (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid,                          -- references businesses.id (note: businesses.id is text, but this is uuid — mismatch to fix in Phase 6)
  user_id     uuid references auth.users(id),
  status      text default 'pending',        -- 'pending' | 'approved' | 'rejected'
  note        text,
  created_at  timestamptz default now()
);

-- NOTE: business_claims.business_id is uuid but businesses.id is text.
-- This type mismatch means FK cannot be enforced at DB level.
-- Tracked as Phase 6 fix.

alter table public.business_claims enable row level security;

-- Users can submit claims
create policy if not exists "Users insert claims"
  on public.business_claims for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can see their own claims
create policy if not exists "Users read own claims"
  on public.business_claims for select
  to authenticated
  using (auth.uid() = user_id);

-- Admin (mahdialmuntadhar1@gmail.com) can manage all claims
create policy if not exists "Admin manages all claims"
  on public.business_claims for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'mahdialmuntadhar1@gmail.com');

-- ─────────────────────────────────────────────
-- REVIEWS
-- Star ratings and comments left by users
-- ─────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid,                          -- same text/uuid mismatch as above
  user_id     uuid references auth.users(id),
  rating      integer check (rating >= 1 and rating <= 5),
  comment     text,
  created_at  timestamptz default now()
);

alter table public.reviews enable row level security;

-- Anyone can read reviews
create policy if not exists "Anyone reads reviews"
  on public.reviews for select
  to anon
  using (true);

-- Authenticated users can write reviews
create policy if not exists "Auth users write reviews"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update/delete their own
create policy if not exists "Users update own reviews"
  on public.reviews for update
  to authenticated
  using (auth.uid() = user_id);

create policy if not exists "Users delete own reviews"
  on public.reviews for delete
  to authenticated
  using (auth.uid() = user_id);

-- Indexes
create index if not exists claims_business_idx  on public.business_claims(business_id);
create index if not exists claims_user_idx      on public.business_claims(user_id);
create index if not exists claims_status_idx    on public.business_claims(status);
create index if not exists reviews_business_idx on public.reviews(business_id);
