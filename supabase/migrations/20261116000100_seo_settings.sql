-- ============================================================
-- SEO Settings: site-wide fields + per-page titles/descriptions
-- Requires 20261115000100_site_settings.sql. Safe to re-run: seeds
-- only fill empty values, so admin edits are never overwritten.
--
-- site_settings (one row):
--   site_name           — title suffix "Page | <site name>" and og:site_name
--   twitter_handle      — twitter:creator, e.g. @johncarlo_dev
--   google_verification — Google Search Console meta tag
--   allow_indexing      — false adds noindex to every page
--
-- seo_pages (one row per public page): the full <title>, description
-- and keywords used for search results and social cards.
--
-- Seeded from the metadata in src/app/{page,projects,tech-stack,blog,contact}.
--
-- Rollback:
--   drop table if exists public.seo_pages;
--   alter table public.site_settings drop column if exists site_name,
--     drop column if exists twitter_handle, drop column if exists google_verification,
--     drop column if exists allow_indexing;
-- ============================================================

alter table public.site_settings
  add column if not exists site_name           text    check (char_length(site_name) between 1 and 60),
  add column if not exists twitter_handle      text    check (twitter_handle ~ '^@[A-Za-z0-9_]{1,15}$'),
  add column if not exists google_verification text    check (google_verification ~ '^[A-Za-z0-9_-]{10,100}$'),
  add column if not exists allow_indexing      boolean not null default true;

update public.site_settings
set site_name           = coalesce(site_name, 'John Carlo Ylanan'),
    twitter_handle      = coalesce(twitter_handle, '@johncarlo_dev'),
    google_verification = coalesce(google_verification, 'googlec34b432acc53a5cc')
where id;

create table if not exists public.seo_pages (
  key         text        primary key check (key in ('home', 'projects', 'tech-stack', 'blog', 'contact')),
  title       text        not null check (char_length(btrim(title)) between 1 and 70),
  description text        not null check (char_length(btrim(description)) between 1 and 200),
  keywords    text[]      not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists seo_pages_set_updated_at on public.seo_pages;
create trigger seo_pages_set_updated_at before update on public.seo_pages
  for each row execute function public.set_updated_at();

alter table public.seo_pages enable row level security;

drop policy if exists "seo_pages: admin full access" on public.seo_pages;
create policy "seo_pages: admin full access" on public.seo_pages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.seo_pages (key, title, description, keywords) values
  ('home',
   'John Carlo Ylanan — Web & Mobile Developer',
   'John Carlo A. Ylanan is a Web & Mobile Developer based in Cebu, Philippines. Specializing in React, Next.js, Swift, and Node.js — building scalable, high-performance applications.',
   array['John Carlo Ylanan', 'John Carlo Ylanan portfolio', 'web and mobile developer Cebu Philippines',
         'React Next.js developer Philippines', 'Swift iOS developer Philippines', 'freelance web developer Philippines',
         'full stack developer portfolio', 'Node.js developer Philippines', 'hire web developer Cebu',
         'software engineer portfolio Philippines']),
  ('projects',
   'Projects | John Carlo Ylanan',
   'Explore web and mobile projects built by John Carlo Ylanan — showcasing how I solve problems, write code, and use modern frameworks and tools to build applications that scale.',
   array['John Carlo Ylanan', 'Projects', 'Portfolio Projects', 'Web Development Projects', 'Mobile App Projects',
         'React Projects', 'Next.js Projects', 'Swift iOS Projects', 'Software Engineer Portfolio']),
  ('tech-stack',
   'Tech Stack | John Carlo Ylanan',
   'Explore the technologies, tools, and frameworks I use as an iOS and web developer. From Swift and React to modern backend solutions, discover how I build scalable and high-performance applications.',
   array['John Carlo Ylanan', 'Tech Stack', 'iOS Developer', 'Swift Developer', 'React Developer', 'Next.js',
         'Web Development', 'Mobile Development', 'Software Engineer Portfolio']),
  ('blog',
   'Blog | John Carlo Ylanan',
   'Explore articles on web development, iOS development, technology trends, and personal growth. Learn from real-world experiences, coding tips, and insights by John Carlo Ylanan.',
   array['John Carlo Ylanan Blog', 'Web Development Blog', 'iOS Development Blog', 'React Tips', 'Swift Programming',
         'Software Engineering Articles', 'Tech Blog Philippines', 'Programming Tutorials']),
  ('contact',
   'Contact John Carlo — Web & Mobile Developer',
   'Hire John Carlo A. Ylanan, a Web & Mobile Developer based in Cebu, Philippines. Open for freelance projects, collaborations, and full-time opportunities.',
   array['hire web developer Philippines', 'hire mobile developer Philippines', 'freelance developer Cebu',
         'React developer for hire', 'Next.js developer freelance', 'John Carlo Ylanan contact',
         'web and mobile developer portfolio', 'software engineer Philippines'])
on conflict (key) do nothing;
