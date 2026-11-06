-- ============================================================
-- Admin access (Admin Dashboard, part 1 of 3)
-- Run in Supabase → SQL Editor (or `supabase db push`). Safe to re-run.
--
-- Who is an admin: a Supabase Auth user listed in public.admin_users.
-- RLS policies on admin data call public.is_admin(), so the dashboard is
-- protected by the database itself, not only by hidden UI.
--
-- After running, grant access to your account (Auth → Users → copy the id):
--   insert into public.admin_users (user_id) values ('<your-auth-user-id>');
--
-- Rollback (destroys admin grants only, no portfolio data):
--   drop function if exists public.is_admin();
--   drop table if exists public.admin_users;
--   drop function if exists public.set_updated_at();
-- ============================================================

create table if not exists public.admin_users (
  user_id    uuid        primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- A signed-in user may only see their own row (lets the app ask "am I an admin?").
-- No insert/update/delete policies: grants are managed with SQL / the service role.
drop policy if exists "admin_users: read own row" on public.admin_users;
create policy "admin_users: read own row"
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());

-- True when the current request's user is an admin.
-- security definer so it can read admin_users regardless of the caller's RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant  execute on function public.is_admin() to authenticated, service_role;

-- Shared trigger function: keeps updated_at current on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
