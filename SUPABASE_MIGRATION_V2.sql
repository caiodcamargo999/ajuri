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
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

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
create policy "Owners can view their collaborators" on public.collaborators
  for select using (auth.uid() = owner_id);

create policy "Owners can insert collaborators" on public.collaborators
  for insert with check (auth.uid() = owner_id);

create policy "Owners can delete their collaborators" on public.collaborators
  for delete using (auth.uid() = owner_id);

-- 7. Trigger to auto-create profile on signup (Execute this block in SQL Editor)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. Set Co-Founders (Run this line after Caio and Wallacy have signed up/logged in once)
-- update public.profiles set role = 'cofounder' where email in ('caiorarity@gmail.com', 'EMAIL_DO_WALLACY');
