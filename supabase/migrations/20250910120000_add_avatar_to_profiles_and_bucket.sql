-- Add avatar_url column to profiles
alter table public.profiles
  add column if not exists avatar_url text;

-- Create a public avatars bucket if not exists
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- RLS policies for avatars bucket
-- Allow anyone to view files in the public avatars bucket
create policy "Public read for avatars"
on storage.objects for select
to public
using (bucket_id = 'avatars');

-- Allow authenticated users to upload files to avatars bucket
create policy "Authenticated can upload to avatars"
on storage.objects for insert
to authenticated
with check (bucket_id = 'avatars');

-- Allow owners to update/delete their own files
create policy "Owners can update their avatars"
on storage.objects for update
to authenticated
using (bucket_id = 'avatars' and owner = auth.uid())
with check (bucket_id = 'avatars' and owner = auth.uid());

create policy "Owners can delete their avatars"
on storage.objects for delete
to authenticated
using (bucket_id = 'avatars' and owner = auth.uid());
