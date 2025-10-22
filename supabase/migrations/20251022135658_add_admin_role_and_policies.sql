-- Add roles column to profiles table (array of text for multiple roles)
alter table public.profiles add column roles text[] not null default '{}';

-- Create a function to check if current user has a specific role
create or replace function public.has_role(role_name text)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role_name = any(roles)
  );
$$;

-- Create a function to check if current user is admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select public.has_role('admin');
$$;

-- Only admins can update profiles
create policy "Enable admins to update any profile"
  on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Only admins can insert profiles
create policy "Enable admins to insert profiles"
  on public.profiles
  for insert
  to authenticated
  with check (public.is_admin());

-- Only admins can delete profiles
create policy "Enable admins to delete profiles"
  on public.profiles
  for delete
  to authenticated
  using (public.is_admin());

-- Only admins can update any presence
create policy "Enable admins to update presences"
  on public.presences
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Only admins can insert presences
create policy "Enable admins to create presences"
  on public.presences
  for insert
  to authenticated
  with check (public.is_admin());

-- Only admins can delete any presence
create policy "Enable admins to delete presences"
  on public.presences
  for delete
  to authenticated
  using (public.is_admin());