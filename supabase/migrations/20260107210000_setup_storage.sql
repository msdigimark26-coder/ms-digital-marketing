-- Create a new storage bucket for admin avatars if it doesn't exist
insert into storage.buckets (id, name, public)
values ('admin-avatars', 'admin-avatars', true)
on conflict (id) do nothing;

-- Remove potential conflicting policies from previous attempts
drop policy if exists "Admin Avatars Read Access" on storage.objects;
drop policy if exists "Admin Avatars Insert Access" on storage.objects;
drop policy if exists "Admin Avatars Update Access" on storage.objects;

-- (Also drop the generic ones we might have created in the previous failed step to clean up)
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Public Upload" on storage.objects;
drop policy if exists "Public Update" on storage.objects;

-- Create specific policies for this bucket

-- 1. Read Access (Select)
create policy "Admin Avatars Read Access"
on storage.objects for select
using ( bucket_id = 'admin-avatars' );

-- 2. Upload Access (Insert) - Uses WITH CHECK
create policy "Admin Avatars Insert Access"
on storage.objects for insert
with check ( bucket_id = 'admin-avatars' );

-- 3. Update Access (Update)
create policy "Admin Avatars Update Access"
on storage.objects for update
using ( bucket_id = 'admin-avatars' );
