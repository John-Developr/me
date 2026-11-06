-- ============================================================
-- Import the existing projects (one-time)
-- Requires 20261107000100_projects_cms_fields.sql. Safe to re-run:
-- rows whose slug already exists are left untouched, so edits made
-- in the admin are never overwritten.
--
-- Content copied from src/containers/projects-page/projectsData.ts
-- (the static data the public /projects page used before the CMS).
--
-- Rollback (removes only these four, if you want to start over):
--   delete from public.projects
--   where slug in ('gordon-bostic', 'nativecamp', 'portfolio', 'covid-tracker');
-- ============================================================

insert into public.projects
  (slug, title, tagline, description, kind, role, organization, period,
   highlights, tech, logo_url, image_url, live_url, live_label, source_url, source_label,
   note, status, is_featured, sort_order)
values
  (
    'gordon-bostic',
    'Gordon Bostic',
    'Book Author of Poetic Novels',
    'A website for author Gordon Bostic, built to showcase his poetic novels — like Mantis Squad — alongside his story, reader reviews, and articles.',
    null, null, null, null,
    array['Book showcase with direct “Buy Now” links',
          'About the Author, Books, Reviews, and Articles sections',
          'Contact page for readers'],
    array['Next.js', 'TypeScript', 'Node.js'],
    null, '/images/Featured.jpg',
    'https://gordon-bostic.vercel.app', 'Open Live Site',
    'https://github.com/John-Developr/gordon-bostic', 'View Source Code',
    null, 'published',
    -- featured only if nothing else is (one featured project allowed)
    not exists (select 1 from public.projects where is_featured),
    0
  ),
  (
    'nativecamp',
    'NativeCamp',
    'Large-scale online teaching platform',
    'I started on the web platform — full-stack features, APIs, and performance — and now build and maintain its iOS app.',
    'Professional Work', 'Web Developer → iOS Developer', 'Forty Degrees Celsius, Inc.', '2023 – Present',
    array['Designed and delivered APIs and full-stack features for the web platform',
          'Optimized SQL and performance on AWS, Docker, and Redis infrastructure',
          'Build iOS features in Swift, SwiftUI, and Objective-C with REST APIs and Socket.io',
          'Improve app performance and resolve crash reports'],
    array['Swift', 'SwiftUI', 'Objective-C', 'Socket.io', 'AWS', 'Docker', 'Redis'],
    '/images/NativeCamp.png', null,
    'https://nativecamp.net', 'Visit NativeCamp',
    null, null,
    'Proprietary codebase — source isn''t public.', 'published', false, 1
  ),
  (
    'portfolio',
    'This Portfolio',
    'Personal site with an AI assistant and AI-written blog',
    'The site you''re on. A Next.js app with a Gemini-powered assistant, a blog that writes itself each month, and a light/dark liquid-glass UI.',
    'Personal Project', 'Design & Development', null, '2026',
    array['“Chat with John” assistant on Google Gemini, with rate limiting and API-key fallback',
          'Monthly AI-generated blog posts via a Vercel Cron job, stored in Supabase',
          'Server-rendered pages, per-post metadata, sitemap, and generated share images'],
    array['Next.js', 'React', 'TypeScript', 'Supabase', 'Gemini', 'Vercel'],
    '/images/Avatar.jpg', null,
    null, null,
    'https://github.com/John-Developr/me', 'View Source Code',
    null, 'published', false, 2
  ),
  (
    'covid-tracker',
    'COVID Tracker',
    'Real-time community exposure map',
    'Built for our thesis during the pandemic: an app that let users monitor affected individuals within a 200-meter radius in real time on Google Maps, helping communities stay informed and safe.',
    'Academic Project', 'Thesis Project', 'University of Cebu', null,
    array[]::text[],
    array['Google Maps'],
    '/images/company/UC.png', null,
    null, null,
    null, null,
    'Academic project — not publicly hosted.', 'published', false, 3
  )
on conflict (slug) do nothing;
