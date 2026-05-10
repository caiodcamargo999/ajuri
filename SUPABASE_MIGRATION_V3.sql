-- 1. Create Profiles Table (if not exists)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'collaborator', 'enterprise', 'cofounder')),
  email text
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Policies for Profiles
-- Drop existing policies first to avoid "already exists" error
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- 4. Create Collaborators Table
create table if not exists public.collaborators (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  email text not null
);

-- 5. Enable RLS for Collaborators
alter table public.collaborators enable row level security;

-- 6. Policies for Collaborators
drop policy if exists "Owners can view their collaborators" on public.collaborators;
create policy "Owners can view their collaborators" on public.collaborators
  for select using (auth.uid() = owner_id);

drop policy if exists "Owners can insert collaborators" on public.collaborators;
create policy "Owners can insert collaborators" on public.collaborators
  for insert with check (auth.uid() = owner_id);

drop policy if exists "Owners can delete their collaborators" on public.collaborators;
create policy "Owners can delete their collaborators" on public.collaborators
  for delete using (auth.uid() = owner_id);

-- 7. Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email, 'user')
  on conflict (id) do nothing; -- Prevent error if profile exists
  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. Petitions Table (Minhas Petições)
create table if not exists public.petitions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  title text not null,
  content jsonb, -- Storing rich text or structured content
  status text default 'draft' check (status in ('draft', 'completed', 'archived')),
  type text -- e.g., 'civil', 'trabalhista', etc.
);

-- Enable RLS
alter table public.petitions enable row level security;

-- Policies
drop policy if exists "Users can view own petitions" on public.petitions;
create policy "Users can view own petitions" on public.petitions
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own petitions" on public.petitions;
create policy "Users can insert own petitions" on public.petitions
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own petitions" on public.petitions;
create policy "Users can update own petitions" on public.petitions
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own petitions" on public.petitions;
create policy "Users can delete own petitions" on public.petitions
  for delete using (auth.uid() = user_id);
