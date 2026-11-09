-- ============================================================
-- Analytics details: location + device per page view (no IPs)
-- Requires 20261111000100_analytics.sql. Safe to re-run.
--
-- Adds coarse, non-identifying details to each page view:
--   country (ISO code), region, city — from Vercel's request geolocation
--   device (desktop/mobile/tablet), browser and OS family — names only,
--   no versions or full user-agent strings
-- IP addresses are still never stored.
--
-- Adds admin-only reports: traffic_breakdown() and recent_visitors().
-- Older rows have no details and show as "Unknown".
--
-- Rollback:
--   drop function if exists public.traffic_breakdown(date, date, text, integer);
--   drop function if exists public.recent_visitors(integer);
--   drop function if exists public.record_page_view(text, text, text, text, text, text, text, text, text);
--   (the 3-argument record_page_view keeps working; re-run 20261111000100_analytics.sql to restore its original body)
--   alter table public.analytics_page_views
--     drop column if exists country, drop column if exists region, drop column if exists city,
--     drop column if exists device, drop column if exists browser, drop column if exists os;
-- ============================================================

alter table public.analytics_page_views
  add column if not exists country text check (country ~ '^[A-Z]{2}$'),
  add column if not exists region  text check (char_length(region) <= 80),
  add column if not exists city    text check (char_length(city)   <= 120),
  add column if not exists device  text check (device in ('desktop', 'mobile', 'tablet')),
  add column if not exists browser text check (char_length(browser) <= 40),
  add column if not exists os      text check (char_length(os)      <= 40);

create index if not exists analytics_page_views_created_idx on public.analytics_page_views (created_at desc);

-- ─── Record one page view (server only) ─────────────────────
-- New 9-argument version with details. The visitor key is salted as before.
-- No parameter defaults, so a 3-argument call still resolves to the old
-- function below (kept for the currently deployed site; it forwards here).
create or replace function public.record_page_view(
  p_path          text,
  p_visitor_key   text,
  p_referrer_host text,
  p_country       text,
  p_region        text,
  p_city          text,
  p_device        text,
  p_browser       text,
  p_os            text
)
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
  delete from public.analytics_salts where day < v_day - 1;

  insert into public.analytics_page_views
    (day, path, visitor_hash, referrer_host, country, region, city, device, browser, os)
  values (
    v_day,
    p_path,
    encode(sha256(convert_to(v_salt || p_visitor_key, 'UTF8')), 'hex'),
    nullif(left(lower(p_referrer_host), 255), ''),
    case when upper(p_country) ~ '^[A-Z]{2}$' then upper(p_country) end,
    nullif(left(p_region, 80), ''),
    nullif(left(p_city, 120), ''),
    case when p_device in ('desktop', 'mobile', 'tablet') then p_device end,
    nullif(left(p_browser, 40), ''),
    nullif(left(p_os, 40), '')
  );
end;
$$;

revoke execute on function public.record_page_view(text, text, text, text, text, text, text, text, text) from public, anon, authenticated;
grant  execute on function public.record_page_view(text, text, text, text, text, text, text, text, text) to service_role;

-- Old 3-argument version (used by deployments before this change):
-- forwards to the new one without details, so tracking never stops
-- regardless of whether the migration or the new code ships first.
create or replace function public.record_page_view(p_path text, p_visitor_key text, p_referrer_host text)
returns void
language sql
security definer
set search_path = public
as $$
  select public.record_page_view(p_path, p_visitor_key, p_referrer_host, null, null, null, null, null, null);
$$;

revoke execute on function public.record_page_view(text, text, text) from public, anon, authenticated;
grant  execute on function public.record_page_view(text, text, text) to service_role;

-- ─── Top values for one dimension (admins only) ─────────────
-- visitors = unique visitors per day, summed (same as the chart).
create or replace function public.traffic_breakdown(p_from date, p_to date, p_dimension text, p_limit integer default 10)
returns table (label text, visitors bigint, views bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_expr text;
begin
  if not public.is_admin() or p_from > p_to or p_to - p_from > 400 then
    return;
  end if;

  v_expr := case p_dimension
    when 'country'  then 'country'
    when 'city'     then 'nullif(concat_ws('', '', city, country), '''')'
    when 'device'   then 'device'
    when 'browser'  then 'browser'
    when 'os'       then 'os'
    when 'referrer' then 'referrer_host'
    when 'path'     then 'path'
  end;

  if v_expr is null then
    raise exception 'Unknown dimension: %', p_dimension;
  end if;

  return query execute format(
    'select coalesce(%s, '''')::text as label,
            count(distinct (day, visitor_hash))::bigint as visitors,
            count(*)::bigint as views
     from public.analytics_page_views
     where day between $1 and $2
     group by 1
     order by 2 desc, 3 desc, 1
     limit $3', v_expr)
  using p_from, p_to, least(greatest(coalesce(p_limit, 10), 1), 50);
end;
$$;

revoke execute on function public.traffic_breakdown(date, date, text, integer) from public, anon;
grant  execute on function public.traffic_breakdown(date, date, text, integer) to authenticated, service_role;

-- ─── Recent visitors (admins only) ──────────────────────────
-- One row per visitor per day (the hash itself is never returned).
create or replace function public.recent_visitors(p_limit integer default 50)
returns table (
  day           date,
  first_seen    timestamptz,
  last_seen     timestamptz,
  page_views    bigint,
  paths         text[],
  referrer_host text,
  country       text,
  region        text,
  city          text,
  device        text,
  browser       text,
  os            text
)
language sql
stable
security definer
set search_path = public
as $$
  select v.day,
         min(v.created_at),
         max(v.created_at),
         count(*),
         (array_agg(v.path order by v.created_at))[1:15],
         (array_agg(v.referrer_host order by v.created_at) filter (where v.referrer_host is not null))[1],
         (array_agg(v.country order by v.created_at) filter (where v.country is not null))[1],
         (array_agg(v.region  order by v.created_at) filter (where v.region  is not null))[1],
         (array_agg(v.city    order by v.created_at) filter (where v.city    is not null))[1],
         (array_agg(v.device  order by v.created_at) filter (where v.device  is not null))[1],
         (array_agg(v.browser order by v.created_at) filter (where v.browser is not null))[1],
         (array_agg(v.os      order by v.created_at) filter (where v.os      is not null))[1]
  from public.analytics_page_views v
  where public.is_admin()
  group by v.day, v.visitor_hash
  order by max(v.created_at) desc
  limit least(greatest(coalesce(p_limit, 50), 1), 200);
$$;

revoke execute on function public.recent_visitors(integer) from public, anon;
grant  execute on function public.recent_visitors(integer) to authenticated, service_role;
