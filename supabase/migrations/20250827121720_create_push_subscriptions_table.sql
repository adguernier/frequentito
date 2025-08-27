-- Store Web Push subscriptions per user
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions(user_id);

create or replace function public.set_push_sub_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_push_sub_updated_at
before update on public.push_subscriptions
for each row execute procedure public.set_push_sub_updated_at();

alter table public.push_subscriptions enable row level security;

create policy "push_sub_select_own"
  on public.push_subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "push_sub_insert_own"
  on public.push_subscriptions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "push_sub_delete_own"
  on public.push_subscriptions for delete
  to authenticated
  using (auth.uid() = user_id);

-- Add UPDATE policy for push_subscriptions (needed for UPSERT)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='push_subscriptions' and policyname='push_sub_update_own'
  ) then
    create policy "push_sub_update_own"
      on public.push_subscriptions for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Change unique constraint from endpoint-only to (user_id, endpoint) to avoid cross-user conflicts
do $$ begin
  if exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname='public' and t.relname='push_subscriptions' and c.conname='push_subscriptions_endpoint_key'
  ) then
    alter table public.push_subscriptions drop constraint push_subscriptions_endpoint_key;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_indexes where schemaname='public' and tablename='push_subscriptions' and indexname='push_subscriptions_user_endpoint_key'
  ) then
    alter table public.push_subscriptions add unique (user_id, endpoint);
  end if;
end $$;
