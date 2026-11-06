-- ============================================================
-- Profile: booking and social links (header, footer, home page)
-- Requires 20261108000100_profile_singleton_seed.sql. Safe to re-run.
--
-- booking_url — "Schedule a Call" buttons (Calendly or similar)
-- facebook_url, instagram_url, x_url — footer icons (hidden when empty)
--
-- The existing profile gets the links the site already used
-- (src/config/networkDefine.ts) only where the field is still empty.
--
-- Rollback:
--   alter table public.profiles
--     drop column if exists booking_url, drop column if exists facebook_url,
--     drop column if exists instagram_url, drop column if exists x_url;
-- ============================================================

alter table public.profiles
  add column if not exists booking_url   text check (char_length(booking_url)   <= 2048),
  add column if not exists facebook_url  text check (char_length(facebook_url)  <= 2048),
  add column if not exists instagram_url text check (char_length(instagram_url) <= 2048),
  add column if not exists x_url         text check (char_length(x_url)         <= 2048);

update public.profiles
set booking_url  = coalesce(booking_url,  'https://calendly.com/johncarlo-fullstackdev/30min'),
    facebook_url = coalesce(facebook_url, 'https://www.facebook.com/johncarlo.devolpr')
where booking_url is null or facebook_url is null;
