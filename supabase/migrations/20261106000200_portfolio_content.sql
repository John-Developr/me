-- ============================================================
-- Portfolio content (Admin Dashboard, part 2 of 3)
-- Requires 20261106000100_admin_access.sql. Safe to re-run.
--
-- Minimum schema the CMS needs: profile, projects, experiences,
-- skills (+ categories), and contact messages. Nothing is seeded —
-- the public site still reads its static data files until each
-- management screen is built, so the dashboard shows only what is
-- actually stored here.
--
-- RLS: admins (public.is_admin()) get full access. No public read
-- policies yet — they will be added when the public site switches
-- to these tables. Contact messages are inserted by the server
-- (service role) from /api/contact.
--
-- Rollback (DESTROYS the data in these tables — export first):
--   drop table if exists public.skills, public.skill_categories,
--     public.experiences, public.projects, public.profiles,
--     public.contact_messages;
-- ============================================================

-- ─── Profile (single owner profile) ─────────────────────────
create table if not exists public.profiles (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        unique references auth.users (id) on delete set null,
  full_name    text        check (char_length(full_name)    <= 120),
  headline     text        check (char_length(headline)     <= 160),
  bio          text        check (char_length(bio)          <= 5000),
  avatar_url   text        check (char_length(avatar_url)   <= 2048),
  email        text        check (char_length(email)        <= 254),
  phone        text        check (char_length(phone)        <= 40),
  location     text        check (char_length(location)     <= 120),
  resume_url   text        check (char_length(resume_url)   <= 2048),
  website_url  text        check (char_length(website_url)  <= 2048),
  github_url   text        check (char_length(github_url)   <= 2048),
  linkedin_url text        check (char_length(linkedin_url) <= 2048),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── Projects ───────────────────────────────────────────────
create table if not exists public.projects (
  id           uuid        primary key default gen_random_uuid(),
  slug         text        not null unique
                           check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title        text        not null check (char_length(btrim(title)) between 1 and 160),
  tagline      text        check (char_length(tagline)      <= 200),
  description  text        check (char_length(description)  <= 5000),
  kind         text        check (char_length(kind)         <= 60),
  role         text        check (char_length(role)         <= 120),
  organization text        check (char_length(organization) <= 160),
  period       text        check (char_length(period)       <= 60),
  highlights   text[]      not null default '{}',
  tech         text[]      not null default '{}',
  logo_url     text        check (char_length(logo_url)     <= 2048),
  image_url    text        check (char_length(image_url)    <= 2048),
  live_url     text        check (char_length(live_url)     <= 2048),
  source_url   text        check (char_length(source_url)   <= 2048),
  status       text        not null default 'draft' check (status in ('draft', 'published')),
  is_featured  boolean     not null default false,
  sort_order   integer     not null default 0,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists projects_status_idx     on public.projects (status);
create index if not exists projects_updated_at_idx on public.projects (updated_at desc);
create index if not exists projects_created_at_idx on public.projects (created_at desc);

-- Stamp published_at the first time a project is published.
create or replace function public.set_project_published_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists projects_set_published_at on public.projects;
create trigger projects_set_published_at
  before insert or update on public.projects
  for each row execute function public.set_project_published_at();

-- ─── Work experience ────────────────────────────────────────
create table if not exists public.experiences (
  id              uuid        primary key default gen_random_uuid(),
  company         text        not null check (char_length(btrim(company))  between 1 and 160),
  position        text        not null check (char_length(btrim(position)) between 1 and 160),
  employment_type text        check (char_length(employment_type) <= 60),
  location        text        check (char_length(location)        <= 120),
  start_date      date        not null,
  end_date        date,       -- null = current role
  description     text        check (char_length(description)     <= 5000),
  logo_url        text        check (char_length(logo_url)        <= 2048),
  sort_order      integer     not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint experiences_dates_check check (end_date is null or end_date >= start_date)
);

create index if not exists experiences_start_date_idx on public.experiences (start_date desc);
create index if not exists experiences_created_at_idx on public.experiences (created_at desc);

-- ─── Skills ─────────────────────────────────────────────────
create table if not exists public.skill_categories (
  id          uuid        primary key default gen_random_uuid(),
  slug        text        not null unique
                          check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  name        text        not null check (char_length(btrim(name)) between 1 and 80),
  description text        check (char_length(description) <= 300),
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.skills (
  id          uuid        primary key default gen_random_uuid(),
  category_id uuid        references public.skill_categories (id) on delete set null,
  name        text        not null check (char_length(btrim(name)) between 1 and 80),
  logo_url    text        check (char_length(logo_url) <= 2048),
  is_core     boolean     not null default false,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint skills_category_name_key unique (category_id, name)
);

create index if not exists skills_category_id_idx on public.skills (category_id);
create index if not exists skills_created_at_idx  on public.skills (created_at desc);

-- ─── Contact messages ───────────────────────────────────────
-- Same limits as ContactService. No IP or user agent is stored.
create table if not exists public.contact_messages (
  id           uuid        primary key default gen_random_uuid(),
  first_name   text        check (char_length(first_name)   <= 100),
  last_name    text        check (char_length(last_name)    <= 100),
  email        text        not null check (char_length(email) <= 254),
  subject      text        not null check (char_length(subject) <= 200),
  inquiry_type text        check (char_length(inquiry_type) <= 100),
  budget       text        check (char_length(budget)       <= 100),
  message      text        not null check (char_length(message) <= 5000),
  status       text        not null default 'new' check (status in ('new', 'read', 'archived')),
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists contact_messages_status_created_idx
  on public.contact_messages (status, created_at desc);

-- ─── updated_at triggers ────────────────────────────────────
drop trigger if exists profiles_set_updated_at         on public.profiles;
drop trigger if exists projects_set_updated_at         on public.projects;
drop trigger if exists experiences_set_updated_at      on public.experiences;
drop trigger if exists skill_categories_set_updated_at on public.skill_categories;
drop trigger if exists skills_set_updated_at           on public.skills;

create trigger profiles_set_updated_at         before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger projects_set_updated_at         before update on public.projects
  for each row execute function public.set_updated_at();
create trigger experiences_set_updated_at      before update on public.experiences
  for each row execute function public.set_updated_at();
create trigger skill_categories_set_updated_at before update on public.skill_categories
  for each row execute function public.set_updated_at();
create trigger skills_set_updated_at           before update on public.skills
  for each row execute function public.set_updated_at();

-- ─── Row Level Security ─────────────────────────────────────
alter table public.profiles         enable row level security;
alter table public.projects         enable row level security;
alter table public.experiences      enable row level security;
alter table public.skill_categories enable row level security;
alter table public.skills           enable row level security;
alter table public.contact_messages enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['profiles', 'projects', 'experiences', 'skill_categories', 'skills']
  loop
    execute format('drop policy if exists "%1$s: admin full access" on public.%1$I', t);
    execute format(
      'create policy "%1$s: admin full access" on public.%1$I
         for all to authenticated
         using (public.is_admin())
         with check (public.is_admin())',
      t
    );
  end loop;
end;
$$;

-- Messages: admins can read, triage and delete; inserts come from the server only.
drop policy if exists "contact_messages: admin read"   on public.contact_messages;
drop policy if exists "contact_messages: admin update" on public.contact_messages;
drop policy if exists "contact_messages: admin delete" on public.contact_messages;

create policy "contact_messages: admin read"   on public.contact_messages
  for select to authenticated using (public.is_admin());
create policy "contact_messages: admin update" on public.contact_messages
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "contact_messages: admin delete" on public.contact_messages
  for delete to authenticated using (public.is_admin());
