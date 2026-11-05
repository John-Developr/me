-- ============================================================
-- Rate limiting for /api/chat and /api/contact
-- Run once in Supabase → SQL Editor. Safe to re-run.
-- ============================================================

-- One row per (scope + hashed IP). Raw IPs are never stored.
create table if not exists public.rate_limits (
  key          text        primary key,
  count        integer     not null default 0,
  window_start timestamptz not null default now()
);

-- RLS on with no policies: only the server (service role) can touch it.
alter table public.rate_limits enable row level security;

-- Atomically counts a request and reports whether it is within the limit.
-- A fixed window per key: the counter resets once the window has passed.
create or replace function public.check_rate_limit(
  p_key            text,
  p_limit          integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits as r (key, count, window_start)
  values (p_key, 1, now())
  on conflict (key) do update set
    count = case
      when r.window_start < now() - make_interval(secs => p_window_seconds) then 1
      else r.count + 1
    end,
    window_start = case
      when r.window_start < now() - make_interval(secs => p_window_seconds) then now()
      else r.window_start
    end
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

-- Only the service role may call it (not anon/browser clients).
revoke execute on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant  execute on function public.check_rate_limit(text, integer, integer) to service_role;
