-- Add geolocation_notifications_enabled preference to profiles
alter table public.profiles
  add column if not exists geolocation_notifications_enabled boolean not null default true;

-- Users must opt-in to geolocation-based notifications
