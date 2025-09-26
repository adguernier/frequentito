-- Add notifications_enabled preference to profiles
alter table public.profiles
  add column if not exists notifications_enabled boolean not null default true;

-- (Optional) Backfill could go here if needed; default handles existing rows.
