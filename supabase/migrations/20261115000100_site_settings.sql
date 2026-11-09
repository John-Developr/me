-- ============================================================
-- Site settings (SEO Settings screen) — starts with the favicon
-- Requires 20261106000100_admin_access.sql. Safe to re-run.
--
-- One row (id = true). Empty fields fall back to the defaults in code
-- (e.g. favicon_url null → /favicon.ico). More SEO fields (site title,
-- description, share image) can be added as columns later.
--
-- Rollback:
--   drop table if exists public.site_settings;
-- ============================================================

create table if not exists public.site_settings (
  id          boolean     primary key default true check (id),   -- single row
  favicon_url text        check (char_length(favicon_url) <= 2048),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

insert into public.site_settings (id) values (true) on conflict (id) do nothing;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

-- Admins read and edit. The public site reads it on the server (service role).
drop policy if exists "site_settings: admin full access" on public.site_settings;
create policy "site_settings: admin full access" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
