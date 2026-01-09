-- Re-create portal_users table to ensure schema is correct (Dropping first to fix missing role column)
drop table if exists public.portal_users;

create table public.portal_users (
  id uuid default gen_random_uuid() primary key,
  username text not null,
  email text not null unique,
  password text not null,
  role text default 'admin' not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.portal_users enable row level security;

-- Allow public read access (needed for login check)
create policy "Allow public read access"
on public.portal_users
for select
to anon, authenticated
using (true);

-- Allow public insert/update/delete (needed for admin settings page to manage users)
create policy "Allow public write access"
on public.portal_users
for all
to anon, authenticated
using (true);

-- Insert initial admin users
insert into public.portal_users (username, email, password, role, avatar_url) values
  ('msdigimark', 'headofms@msdigimark.org', '$msdigimark@2026', 'superadmin', null),
  ('Saisankeet', 'saisankeet@msdigimark.org', '$saisankeet@14', 'admin', null),
  ('Britto', 'britto@msdigimark.org', '$britto@19', 'admin', null),
  ('Arivalagan', 'arivalagan@msdigimark.org', '$arivu@18', 'admin', null),
  ('Abdul Razaak', 'abdulrazaak@msdigimark.org', '$razaak@23', 'admin', null),
  ('Joel Kevin', 'joelkevin@msdigimark.org', '$joel@12', 'admin', null),
  ('Baptis', 'baptis@msdigimark.org', '$baptis@06', 'admin', null),
  ('Rahul ji', 'rahulji@msdigimark.org', '$rahul@2026', 'admin', null),
  ('Sangeeth', 'sangeeth@msdigimark.org', '$sangeeth@2026', 'admin', null),
  ('Giruba Shankar', 'girubashankar@msdigimark.org', '$shankar@03', 'admin', null),
  ('Fayeeth', 'fayeeth@msdigimark.org', '$fayeeth@27', 'admin', null)
on conflict (email) do nothing;
