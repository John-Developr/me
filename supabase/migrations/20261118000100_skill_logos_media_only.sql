-- ============================================================
-- Skill logos: Media Library only
-- Requires 20261113000100_skills.sql. Safe to re-run.
--
-- Skill logos must be files in the Supabase Storage bucket "media"
-- (picked or uploaded in Admin → Media Library), not local /public
-- paths like /images/tech/react.png, which are no longer shipped.
--
-- If any skill still points at a local path, this stops with a
-- message: open Admin → Media Library → "Import site images" first
-- (it uploads the files and repoints the skills), then run it again.
--
-- Rollback:
--   alter table public.skills drop constraint if exists skills_logo_media_only;
-- ============================================================

do $$
declare
  local_count integer;
begin
  select count(*) into local_count from public.skills where logo_url like '/%';
  if local_count > 0 then
    raise exception '% skill logo(s) still use a local /public path. Run "Import site images" in Admin → Media Library, then re-run this migration.', local_count;
  end if;
end $$;

alter table public.skills drop constraint if exists skills_logo_media_only;
alter table public.skills
  add constraint skills_logo_media_only
  check (logo_url is null or logo_url ~ '^https://[^/\s]+/storage/v1/object/public/media/[^\s]+$');
