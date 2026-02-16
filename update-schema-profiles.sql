-- Add name and image_url to users table
alter table public.users 
add column if not exists name text,
add column if not exists image_url text;

-- Create avatars bucket
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true) 
on conflict (id) do nothing;

-- RLS Policies for Avatars Bucket

-- 1. Public can view avatars
create policy "Avatars Public Read" 
on storage.objects 
for select 
using (bucket_id = 'avatars');

-- 2. Authenticated users can upload avatars
create policy "Avatars Auth Upload" 
on storage.objects 
for insert 
with check (
  bucket_id = 'avatars' 
  and auth.role() = 'authenticated'
);

-- 3. Users can update their own avatars (optional, depends on how we handle overwrites)
create policy "Avatars Auth Update" 
on storage.objects 
for update
using (
  bucket_id = 'avatars' 
  and auth.uid() = owner
);

-- 4. Users can delete their own avatars
create policy "Avatars Auth Delete" 
on storage.objects 
for delete
using (
  bucket_id = 'avatars' 
  and auth.uid() = owner
);
