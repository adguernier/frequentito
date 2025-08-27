-- Presence planning for Frequentito
-- Each user can record their presence for a given day: morning and/or afternoon.

create table public.presences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default (now() at time zone 'utc')::date,
  am boolean not null default false,
  pm boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day)
);

create index presences_day_idx on public.presences(day);
create index presences_user_day_idx on public.presences(user_id, day);

-- Generic updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_presences_updated_at
before update on public.presences
for each row
execute procedure public.set_updated_at();

alter table public.presences enable row level security;

-- Allow everyone logged-in to read all presences (team visibility)
create policy "presences_select_all_authenticated"
  on public.presences for select
  to authenticated
  using (true);

-- Allow a user to manage their own record
create policy "presences_insert_own"
  on public.presences for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "presences_update_own"
  on public.presences for update
  to authenticated
  using (auth.uid() = user_id);

create policy "presences_delete_own"
  on public.presences for delete
  to authenticated
  using (auth.uid() = user_id);

-- Helper: upsert the current user's presence for a day
create or replace function public.upsert_my_presence(
  p_day date,
  p_am boolean,
  p_pm boolean,
  p_note text default null
)
returns public.presences
language plpgsql
as $$
declare
  rec public.presences;
  v_day date := coalesce(p_day, (now() at time zone 'utc')::date);
begin
  insert into public.presences (user_id, day, am, pm, note)
  values (auth.uid(), v_day, coalesce(p_am,false), coalesce(p_pm,false), p_note)
  on conflict (user_id, day)
  do update set
    am = excluded.am,
    pm = excluded.pm,
    note = excluded.note
  returning * into rec;

  return rec;
end;
$$;

grant execute on function public.upsert_my_presence(date, boolean, boolean, text) to authenticated;
