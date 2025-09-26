-- Add avatar metadata columns if they do not exist
alter table public.profiles
  add column if not exists avatar_width int,
  add column if not exists avatar_height int,
  add column if not exists avatar_color text;

-- Replace broad insert policy with per-user path naming enforcement
-- Drop old insert policy if it exists
drop policy if exists "Authenticated can upload to avatars" on storage.objects;

-- New insert policy: only allow inserting into avatars bucket where the path starts with the user's uuid
-- storage.objects.name is the path (folder/filename)
create policy "User folder insert avatars"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and position('/' in name) > 0
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- Ensure update policy also enforces same prefix (re-create if needed)
drop policy if exists "Owners can update their avatars" on storage.objects;
create policy "Owners can update their avatars"
  on storage.objects for update to authenticated
  using (bucket_id='avatars' and owner = auth.uid() and split_part(name,'/',1)=auth.uid()::text)
  with check (bucket_id='avatars' and owner = auth.uid() and split_part(name,'/',1)=auth.uid()::text);

-- Recreate delete policy with same constraint for consistency
drop policy if exists "Owners can delete their avatars" on storage.objects;
create policy "Owners can delete their avatars"
  on storage.objects for delete to authenticated
  using (bucket_id='avatars' and owner = auth.uid() and split_part(name,'/',1)=auth.uid()::text);
