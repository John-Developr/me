-- ============================================================
-- Media Library: storage bucket, asset table, usage, activity
-- Requires 20261106000300_activity_logs.sql. Safe to re-run.
--
-- Files live in the public Storage bucket "media" (anyone can view
-- them by URL, like files in /public). Only admins can upload,
-- replace, list or delete. Each file has a row in media_assets.
--
-- Allowed: PNG, JPEG, WebP, GIF, AVIF, PDF — max 4 MB per file
-- (Vercel limits request bodies to 4.5 MB). SVG is not allowed:
-- it can carry scripts.
--
-- Rollback (deletes the asset records; empty the bucket in the
-- dashboard first if you also want the files gone):
--   drop trigger if exists media_assets_log_activity on public.media_assets;
--   drop function if exists public.media_storage_usage();
--   drop table if exists public.media_assets;
--   drop policy if exists "media: admin read"   on storage.objects;
--   drop policy if exists "media: admin insert" on storage.objects;
--   drop policy if exists "media: admin update" on storage.objects;
--   drop policy if exists "media: admin delete" on storage.objects;
--   delete from storage.buckets where id = 'media';  -- only when empty
-- ============================================================

-- ─── Bucket ─────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 4194304,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif', 'application/pdf']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Admins manage objects in the media bucket. Public viewing goes through
-- the bucket's public URLs, which don't need a policy.
drop policy if exists "media: admin read"   on storage.objects;
drop policy if exists "media: admin insert" on storage.objects;
drop policy if exists "media: admin update" on storage.objects;
drop policy if exists "media: admin delete" on storage.objects;

create policy "media: admin read" on storage.objects
  for select to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "media: admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "media: admin update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());
create policy "media: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- ─── Asset records ──────────────────────────────────────────
create table if not exists public.media_assets (
  id          uuid        primary key default gen_random_uuid(),
  path        text        not null unique check (char_length(path) between 1 and 500),
  file_name   text        not null check (char_length(file_name) between 1 and 255),
  mime_type   text        not null check (mime_type in
                ('image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif', 'application/pdf')),
  size_bytes  bigint      not null check (size_bytes > 0 and size_bytes <= 4194304),
  width       integer     check (width  is null or width  between 1 and 20000),
  height      integer     check (height is null or height between 1 and 20000),
  alt_text    text        check (char_length(alt_text) <= 300),
  -- Original /public path when imported with "Import site images" (prevents duplicates).
  source_path text        unique check (char_length(source_path) <= 500),
  uploaded_by uuid        references auth.users (id) on delete set null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists media_assets_created_at_idx on public.media_assets (created_at desc);
create index if not exists media_assets_mime_type_idx  on public.media_assets (mime_type);

drop trigger if exists media_assets_set_updated_at on public.media_assets;
create trigger media_assets_set_updated_at before update on public.media_assets
  for each row execute function public.set_updated_at();

alter table public.media_assets enable row level security;

drop policy if exists "media_assets: admin full access" on public.media_assets;
create policy "media_assets: admin full access" on public.media_assets
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ─── Storage usage (for the "X GB of Y GB" gauge) ───────────
-- Real bytes stored in the media bucket. Returns zeros for non-admins.
create or replace function public.media_storage_usage()
returns table (total_bytes bigint, file_count bigint)
language sql
stable
security definer
set search_path = public, storage
as $$
  select coalesce(sum((o.metadata ->> 'size')::bigint), 0)::bigint,
         count(*)::bigint
  from storage.objects o
  where o.bucket_id = 'media' and public.is_admin();
$$;

revoke execute on function public.media_storage_usage() from public, anon;
grant  execute on function public.media_storage_usage() to authenticated, service_role;

-- ─── Activity log: record uploads and deletions ─────────────
alter table public.activity_logs drop constraint if exists activity_logs_entity_type_check;
alter table public.activity_logs add constraint activity_logs_entity_type_check
  check (entity_type in ('profile', 'project', 'experience', 'skill', 'skill_category', 'contact_message', 'media'));

create or replace function public.log_content_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row         jsonb := to_jsonb(coalesce(new, old));
  v_entity_type text;
  v_label       text;
  v_action      text;
  v_description text;
begin
  -- Skip no-op updates (only updated_at changed).
  if tg_op = 'UPDATE' and (to_jsonb(new) - 'updated_at') = (to_jsonb(old) - 'updated_at') then
    return new;
  end if;

  v_entity_type := case tg_table_name
    when 'profiles'         then 'profile'
    when 'projects'         then 'project'
    when 'experiences'      then 'experience'
    when 'skills'           then 'skill'
    when 'skill_categories' then 'skill_category'
    when 'contact_messages' then 'contact_message'
    when 'media_assets'     then 'media'
  end;

  v_action := case tg_op
    when 'INSERT' then 'created'
    when 'UPDATE' then 'updated'
    when 'DELETE' then 'deleted'
  end;

  -- Publishing is more useful in the feed than a generic "updated".
  if tg_table_name = 'projects' then
    if tg_op = 'INSERT' and new.status = 'published' then
      v_action := 'published';
    elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
      v_action := case when new.status = 'published' then 'published' else 'unpublished' end;
    end if;
  end if;

  v_label := case tg_table_name
    when 'projects'         then v_row ->> 'title'
    when 'experiences'      then concat_ws(' at ', v_row ->> 'position', v_row ->> 'company')
    when 'skills'           then v_row ->> 'name'
    when 'skill_categories' then v_row ->> 'name'
    when 'media_assets'     then v_row ->> 'file_name'
    else null
  end;

  if tg_table_name = 'contact_messages' then
    -- Only arrivals are logged; triage (read/archive) is not activity.
    if tg_op <> 'INSERT' then
      return coalesce(new, old);
    end if;
    v_action      := 'received';
    v_description := left(concat('New ', coalesce(nullif(v_row ->> 'inquiry_type', ''), 'contact'),
                                 ' message: ', v_row ->> 'subject'), 500);
  elsif tg_table_name = 'profiles' then
    v_description := case v_action when 'created' then 'Profile created' when 'deleted' then 'Profile deleted' else 'Profile updated' end;
  elsif tg_table_name = 'media_assets' then
    v_description := left(concat(
      case v_action when 'created' then 'Media uploaded' when 'deleted' then 'Media deleted' else 'Media updated' end,
      ': ', v_label
    ), 500);
  else
    v_description := left(concat(
      case v_entity_type
        when 'project'        then 'Project'
        when 'experience'     then 'Work experience'
        when 'skill'          then 'Skill'
        when 'skill_category' then 'Skill category'
      end,
      ' ', v_action, ': ', v_label
    ), 500);
  end if;

  insert into public.activity_logs (user_id, action, entity_type, entity_id, description)
  values (auth.uid(), v_action, v_entity_type, (v_row ->> 'id')::uuid, v_description);

  return coalesce(new, old);
end;
$$;

revoke execute on function public.log_content_activity() from public, anon, authenticated;

drop trigger if exists media_assets_log_activity on public.media_assets;
create trigger media_assets_log_activity
  after insert or update or delete on public.media_assets
  for each row execute function public.log_content_activity();
