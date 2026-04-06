-- Migration 007: database functions and triggers
--
-- Functions that exist on the live DB:
--   - handle_new_user()      TRIGGER   (documented in 001_profiles.sql)
--   - claim_next_task()      FUNCTION  (scraper agent queue — not used by frontend)
--   - rls_auto_enable()      EVENT TRIGGER
--
-- Functions MISSING from live DB but required by frontend:
--   - increment_likes()      FUNCTION  (called by usePosts.ts)
--
-- Apply increment_likes to live DB: YES (safe, additive, fixes usePosts.ts)

-- ─────────────────────────────────────────────
-- increment_likes
-- Safely increments likes on a post.
-- Called by: usePosts.ts → supabase.rpc('increment_likes', { post_id })
-- ─────────────────────────────────────────────
create or replace function public.increment_likes(post_id uuid)
returns void
language sql
security definer
as $$
  update public.posts
  set likes = likes + 1
  where id = post_id;
$$;

-- Grant execute to anonymous users (public can like posts)
grant execute on function public.increment_likes(uuid) to anon;
grant execute on function public.increment_likes(uuid) to authenticated;

-- ─────────────────────────────────────────────
-- handle_new_user (reference — defined in 001_profiles.sql)
-- ─────────────────────────────────────────────
-- This trigger runs on auth.users INSERT and inserts into profiles.
-- See 001_profiles.sql for full definition.
-- Already active on live DB.

-- ─────────────────────────────────────────────
-- claim_next_task (scraper system — not used by frontend)
-- ─────────────────────────────────────────────
-- Provides atomic task claiming for the AI scraper agent system.
-- See agent_tasks table. Not relevant to BELIVE frontend.
-- Documented here for completeness:
--
-- create or replace function public.claim_next_task(p_agent_name text)
-- returns setof agent_tasks language plpgsql as $$
-- declare target_id uuid;
-- begin
--   select id into target_id from agent_tasks
--   where status = 'pending' order by created_at limit 1 for update skip locked;
--   if target_id is not null then
--     return query
--     update agent_tasks set status = 'processing',
--       assigned_agent = p_agent_name, updated_at = now()
--     where id = target_id returning *;
--   end if;
-- end; $$;
