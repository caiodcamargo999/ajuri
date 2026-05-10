-- 1. Create Profiles Table (Public Profile Information)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  email text,
  updated_at timestamp with time zone
);
-- Enable RLS
alter table public.profiles enable row level security;
-- Policies
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
-- removido o sub-select desnecessario "(select auth.uid())" para otimização do banco
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
-- removido o sub-select "(select auth.uid())"
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- 2. Create Clients Table
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  email text,
  phone text,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.clients enable row level security;
-- removido o sub-select "(select auth.uid())"
create policy "Users can manage their own clients" on public.clients using (auth.uid() = user_id);

-- 3. Create Petitions Table
create table public.petitions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  client_id uuid references public.clients,
  type text,
  status text default 'draft',
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.petitions enable row level security;
-- removido o sub-select "(select auth.uid())"
create policy "Users can manage their own petitions" on public.petitions using (auth.uid() = user_id);

-- 4. Create Lawsuits Table
create table public.lawsuits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  client_id uuid references public.clients,
  number text,
  court text,
  status text default 'ongoing',
  last_update timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.lawsuits enable row level security;
-- removido o sub-select "(select auth.uid())"
create policy "Users can manage their own lawsuits" on public.lawsuits using (auth.uid() = user_id);

-- 5. Trigger to automatically create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();