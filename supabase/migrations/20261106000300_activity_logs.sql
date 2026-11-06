-- ============================================================
-- Activity log (Admin Dashboard, part 3 of 3)
-- Requires 20261106000200_portfolio_content.sql. Safe to re-run.
--
-- Changes to portfolio content are recorded automatically by
-- database triggers, so every writer (future admin screens, SQL
-- editor, scripts) is logged the same way. user_id is the signed-in
-- user (auth.uid()); it is null for service-role / SQL-editor writes.
--
-- Updates that only touch updated_at are not logged.
--
-- Rollback (removes the log and its triggers; content is untouched):
--   drop trigger if exists profiles_log_activity         on public.profiles;
--   drop trigger if exists projects_log_activity         on public.projects;
--   drop trigger if exists experiences_log_activity      on public.experiences;
--   drop trigger if exists skill_categories_log_activity on public.skill_categories;
--   drop trigger if exists skills_log_activity           on public.skills;
--   drop trigger if exists contact_messages_log_activity on public.contact_messages;
--   drop function if exists public.log_content_activity();
--   drop table if exists public.activity_logs;
-- ============================================================

create table if not exists public.activity_logs (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users (id) on delete set null,
  action      text        not null
              check (action in ('created', 'updated', 'deleted', 'published', 'unpublished', 'received')),
  entity_type text        not null
              check (entity_type in ('profile', 'project', 'experience', 'skill', 'skill_category', 'contact_message')),
  entity_id   uuid,
  description text        not null check (char_length(description) <= 500),
  created_at  timestamptz not null default now()
);

create index if not exists activity_logs_created_at_idx on public.activity_logs (created_at desc);
create index if not exists activity_logs_entity_idx     on public.activity_logs (entity_type, entity_id);

alter table public.activity_logs enable row level security;

-- Admins can read the log. Nobody writes to it directly from the browser:
-- rows come from the trigger below (security definer) or the service role.
drop policy if exists "activity_logs: admin read" on public.activity_logs;
create policy "activity_logs: admin read" on public.activity_logs
  for select to authenticated using (public.is_admin());

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

do $$
declare
  t text;
begin
  foreach t in array array['profiles', 'projects', 'experiences', 'skill_categories', 'skills', 'contact_messages']
  loop
    execute format('drop trigger if exists %1$s_log_activity on public.%1$I', t);
    execute format(
      'create trigger %1$s_log_activity
         after insert or update or delete on public.%1$I
         for each row execute function public.log_content_activity()',
      t
    );
  end loop;
end;
$$;
