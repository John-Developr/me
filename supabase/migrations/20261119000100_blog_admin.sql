-- ============================================================
-- Blog admin: drafts, personal posts, admin-only access
-- Requires 20261106000100_admin_access.sql (is_admin, set_updated_at).
-- Safe to re-run.
--
-- ai_blogs (created before migrations were tracked) gets:
--   status     — 'draft' | 'published'. Existing posts stay published;
--                the public blog only shows published posts.
--   source     — 'ai' (Gemini, cron or admin) | 'personal' (written by hand).
--   updated_at — last edit, kept by the set_updated_at trigger.
--
-- RLS: admins get full access from the browser session. The public
-- site and the monthly cron read/write with the service role.
--
-- Rollback (drafts become public again, personal/AI marker is lost):
--   drop policy if exists "ai_blogs: admin full access" on public.ai_blogs;
--   drop trigger if exists ai_blogs_set_updated_at on public.ai_blogs;
--   drop index if exists public.ai_blogs_status_generated_at_idx;
--   alter table public.ai_blogs drop column if exists status,
--     drop column if exists source, drop column if exists updated_at;
-- ============================================================

alter table public.ai_blogs
  add column if not exists status     text        not null default 'published'
                                      check (status in ('draft', 'published')),
  add column if not exists source     text        not null default 'ai'
                                      check (source in ('ai', 'personal')),
  add column if not exists updated_at timestamptz not null default now();

-- Public list/recent queries filter by status and sort by date.
create index if not exists ai_blogs_status_generated_at_idx
  on public.ai_blogs (status, generated_at desc);

drop trigger if exists ai_blogs_set_updated_at on public.ai_blogs;
create trigger ai_blogs_set_updated_at before update on public.ai_blogs
  for each row execute function public.set_updated_at();

alter table public.ai_blogs enable row level security;

drop policy if exists "ai_blogs: admin full access" on public.ai_blogs;
create policy "ai_blogs: admin full access" on public.ai_blogs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
