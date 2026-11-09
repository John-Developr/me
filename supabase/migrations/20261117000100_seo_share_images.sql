-- ============================================================
-- SEO Settings: optional custom share image per page
-- Requires 20261116000100_seo_settings.sql. Safe to re-run.
--
-- share_image_url — a Media Library image (or /public path) used as the
-- page's link preview instead of the generated card. Empty = generated
-- card (profile photo + the page's SEO title and description).
--
-- Rollback:
--   alter table public.seo_pages drop column if exists share_image_url;
-- ============================================================

alter table public.seo_pages
  add column if not exists share_image_url text check (char_length(share_image_url) <= 2048);
