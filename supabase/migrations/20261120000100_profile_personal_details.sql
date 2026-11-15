-- ============================================================
-- Personal details on the owner profile (for the chat assistant)
-- Requires 20261106000200_portfolio_content.sql. Safe to re-run.
--
-- The chat answers from live database data (app/getChatKnowledge.ts).
-- Birthdate and civil status used to be typed into
-- src/docs/system-instruction.md; they now live on the profile and
-- are edited in Admin → Personal Profile → Personal details.
-- They are read only by the chat (never rendered on the site).
-- No seed: fill them in the admin, so the values stay out of the repo.
--
-- Rollback:
--   alter table public.profiles drop column if exists civil_status;
--   alter table public.profiles drop column if exists birthdate;
-- ============================================================

alter table public.profiles
  add column if not exists birthdate date
    check (birthdate >= date '1900-01-01');  -- "not in the future" is checked by the form/API (current_date isn't allowed to vary in a CHECK)

alter table public.profiles
  add column if not exists civil_status text
    check (char_length(civil_status) <= 40);
