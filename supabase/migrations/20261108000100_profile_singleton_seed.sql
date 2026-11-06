-- ============================================================
-- Personal profile: one row, seeded from the current site
-- Requires 20261106000200_portfolio_content.sql. Safe to re-run:
-- the seed only inserts when no profile exists, so edits made in
-- the admin are never overwritten.
--
-- Values copied from the home page (DetailSection, AboutSection,
-- ConnectSection) and src/config/networkDefine.ts.
--
-- Rollback:
--   drop index if exists public.profiles_singleton_idx;
--   -- and, to remove the seeded row:
--   -- delete from public.profiles;
-- ============================================================

-- The portfolio has exactly one owner profile.
create unique index if not exists profiles_singleton_idx on public.profiles ((true));

insert into public.profiles
  (full_name, headline, bio, avatar_url, email, phone, location,
   resume_url, website_url, github_url, linkedin_url)
select
  'John Carlo A. Ylanan',
  'Full Stack Developer',
  'Hello there, I''m John Carlo, a 25-year-old web and mobile developer based in Cebu, Philippines. I specialize in building scalable web, software, and mobile applications that work seamlessly across platforms. With a strong foundation in JavaScript, PHP, and other modern technologies, I''m passionate about crafting solutions that are both efficient and impactful.'
    || E'\n\n' ||
    'When I''m not writing code, you''ll find me watching movies, reading, playing video games, exploring new places, going for rides, traveling, or staying active through sports.',
  '/images/Avatar.jpg',
  'johncarlo.fullstackdev@gmail.com',
  '(+632) 9293-1982',
  'Cebu City, Cebu, Philippines, 6000',
  '/documents/resume.pdf',
  null,
  'https://github.com/John-Developr',
  'https://ph.linkedin.com/in/johncarlo-fullstackdev'
where not exists (select 1 from public.profiles);
