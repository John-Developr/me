-- ============================================================
-- First-party, privacy-friendly traffic analytics
-- Requires 20261106000100_admin_access.sql. Safe to re-run.
--
-- What is stored per page view: the UTC day, the path, the referrer's
-- host (e.g. "google.com"), and a visitor hash. No cookies, no IP
-- addresses, no user agents.
--
-- The visitor hash = sha256(daily salt + server-side hash of IP + user
-- agent). The salt is random, kept in the database only, and deleted
-- after a day, so a visitor can be counted once per day but can't be
-- recognised across days or traced back to an IP.
--
-- Rollback:
--   drop function if exists public.record_page_view(text, text, text);
--   drop function if exists public.traffic_daily(date, date);
--   drop function if exists public.prune_page_views(integer);
--   drop table if exists public.analytics_page_views, public.analytics_salts;
-- ============================================================

create table if not exists public.analytics_salts (
  day  date primary key,
  salt text not null default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''))
);

-- No policies: only the security-definer functions below touch salts.
alter table public.analytics_salts enable row level security;

create table if not exists public.analytics_page_views (
  id            bigint      generated always as identity primary key,
  day           date        not null default ((now() at time zone 'utc')::date),
  path          text        not null check (char_length(path) between 1 and 200),
  visitor_hash  text        not null check (char_length(visitor_hash) = 64),
  referrer_host text        check (char_length(referrer_host) <= 255),
  created_at    timestamptz not null default now()
);

create index if not exists analytics_page_views_day_idx         on public.analytics_page_views (day);
create index if not exists analytics_page_views_day_visitor_idx on public.analytics_page_views (day, visitor_hash);

alter table public.analytics_page_views enable row level security;

drop policy if exists "analytics_page_views: admin read" on public.analytics_page_views;
create policy "analytics_page_views: admin read" on public.analytics_page_views
  for select to authenticated using (public.is_admin());

-- ─── Record one page view (server only) ─────────────────────
-- p_visitor_key: hex hash of IP + user agent computed by the server.
-- It is salted again here and never stored as given.
create or replace function public.record_page_view(p_path text, p_visitor_key text, p_referrer_host text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day  date := (now() at time zone 'utc')::date;
  v_salt text;
begin
  if p_path is null or char_length(p_path) not between 1 and 200 or left(p_path, 1) <> '/' then
    return;
  end if;
  if p_visitor_key is null or char_length(p_visitor_key) <> 64 then
    return;
  end if;

  insert into public.analytics_salts (day) values (v_day) on conflict (day) do nothing;
  select salt into v_salt from public.analytics_salts where day = v_day;

  -- Yesterday's salt is kept briefly for requests around midnight; older ones are destroyed.
  delete from public.analytics_salts where day < v_day - 1;

  insert into public.analytics_page_views (day, path, visitor_hash, referrer_host)
  values (
    v_day,
    p_path,
    encode(sha256(convert_to(v_salt || p_visitor_key, 'UTF8')), 'hex'),
    nullif(left(lower(p_referrer_host), 255), '')
  );
end;
$$;

revoke execute on function public.record_page_view(text, text, text) from public, anon, authenticated;
grant  execute on function public.record_page_view(text, text, text) to service_role;

-- ─── Daily totals for the dashboard chart (admins only) ─────
-- One row per day in the range (zeros included). visitors = unique per day.
create or replace function public.traffic_daily(p_from date, p_to date)
returns table (day date, visitors bigint, views bigint)
language sql
stable
security definer
set search_path = public
as $$
  select d::date                          as day,
         count(distinct v.visitor_hash)   as visitors,
         count(v.id)                      as views
  from generate_series(p_from, p_to, interval '1 day') as d
  left join public.analytics_page_views v on v.day = d::date
  where public.is_admin()
    and p_from <= p_to
    and p_to - p_from <= 400
  group by d
  order by d;
$$;

revoke execute on function public.traffic_daily(date, date) from public, anon;
grant  execute on function public.traffic_daily(date, date) to authenticated, service_role;

-- ─── Retention (called by the daily keep-alive cron) ────────
create or replace function public.prune_page_views(p_keep_days integer default 400)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted bigint;
begin
  delete from public.analytics_page_views
  where day < (now() at time zone 'utc')::date - greatest(p_keep_days, 30);
  get diagnostics v_deleted = row_count;

  delete from public.analytics_salts where day < (now() at time zone 'utc')::date - 1;
  return v_deleted;
end;
$$;

revoke execute on function public.prune_page_views(integer) from public, anon, authenticated;
grant  execute on function public.prune_page_views(integer) to service_role;
