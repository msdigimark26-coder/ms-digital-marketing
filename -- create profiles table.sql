-- create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) not null,
  email text, username text unique, full_name text, avatar_url text,
  metadata jsonb, created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Profiles: insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "Profiles: select own" on public.profiles for select using (auth.uid() = id);
create policy "Profiles: update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- create messages table (if not already created)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  content text not null, inserted_at timestamptz default now()
);
alter table public.messages enable row level security;
create policy "Allow authenticated insert" on public.messages for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);
create policy "Allow authenticated select" on public.messages for select using (auth.role() = 'authenticated' and auth.uid() = user_id);