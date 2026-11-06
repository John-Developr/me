-- ============================================================
-- Work experience timeline: entry types + seed from the home page
-- Requires 20261106000200_portfolio_content.sql. Safe to re-run:
-- the seed only runs while the table is empty, so admin edits are
-- never overwritten.
--
-- The home page "Experience." card is a career timeline that mixes
-- jobs, school and milestones, so each entry has a type:
--   work       — a role at a company (roles at one company are grouped)
--   education  — a degree or course at a school
--   milestone  — a single moment (start date only)
--
-- Seeded from src/containers/home-page/experience-section/ExperienceSection.tsx.
-- Dates are first-of-month; the Forty Degrees Celsius start months were
-- derived from the durations the page showed on 2026-11-06
-- (Web 6 mo, iOS 2 yr 10 mo, AI Engineer 11 mo). Adjust in the admin.
--
-- Rollback:
--   alter table public.experiences drop constraint if exists experiences_milestone_single_date;
--   alter table public.experiences drop column if exists entry_type;
--   -- seeded rows: delete from public.experiences where company in
--   --   ('Forty Degrees Celsius, Inc.', 'Proweaver, Inc.', 'University of Cebu - Main', 'Hello wordl!');
-- ============================================================

alter table public.experiences
  add column if not exists entry_type text not null default 'work'
    check (entry_type in ('work', 'education', 'milestone'));

-- A milestone is a single moment: no end date.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'experiences_milestone_single_date') then
    alter table public.experiences
      add constraint experiences_milestone_single_date
      check (entry_type <> 'milestone' or end_date is null);
  end if;
end;
$$;

create index if not exists experiences_entry_type_idx on public.experiences (entry_type);

insert into public.experiences
  (entry_type, company, position, employment_type, start_date, end_date, logo_url, sort_order)
select * from (values
  ('work',      'Forty Degrees Celsius, Inc.', 'AI Engineer',                 'Full-time', date '2025-12-01', null::date,        '/images/company/Forty.png',     0),
  ('work',      'Forty Degrees Celsius, Inc.', 'iOS Developer',               'Full-time', date '2024-01-01', null::date,        '/images/company/Forty.png',     0),
  ('work',      'Forty Degrees Celsius, Inc.', 'Web Developer',               'Full-time', date '2023-07-01', date '2024-01-01', '/images/company/Forty.png',     0),
  ('work',      'Proweaver, Inc.',             'Full Stack Developer',        'Full-time', date '2021-07-01', date '2023-07-01', '/images/company/Proweaver.png', 0),
  ('education', 'University of Cebu - Main',   'BS Information Technology',   null,        date '2015-07-01', date '2021-07-01', '/images/company/UC.png',        0),
  ('milestone', 'Hello wordl!',                'Wrote my first line of code', null,        date '2015-06-01', null::date,        '/images/company/CodeTag.png',   0)
) as seed(entry_type, company, position, employment_type, start_date, end_date, logo_url, sort_order)
where not exists (select 1 from public.experiences);
