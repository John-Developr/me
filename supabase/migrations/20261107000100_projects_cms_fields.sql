-- ============================================================
-- Projects CMS fields
-- Requires 20261106000200_portfolio_content.sql. Safe to re-run.
--
-- Adds what the public /projects page shows but the first schema
-- didn't store, and allows only one featured project at a time.
--
-- Rollback (drops the three columns' data):
--   drop index if exists public.projects_one_featured_idx;
--   alter table public.projects drop column if exists note,
--     drop column if exists live_label, drop column if exists source_label;
-- ============================================================

alter table public.projects
  add column if not exists note         text check (char_length(note)         <= 200),
  add column if not exists live_label   text check (char_length(live_label)   <= 40),
  add column if not exists source_label text check (char_length(source_label) <= 40);

-- At most one featured project (the big card at the top of /projects).
create unique index if not exists projects_one_featured_idx
  on public.projects ((true))
  where is_featured;

-- Public page and admin list both sort by display order.
create index if not exists projects_sort_order_idx on public.projects (sort_order, created_at);
