-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Parent Data) - extends auth.users
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  full_name text,
  setup_completed boolean default false,
  
  -- Settings
  pin_code text, -- Encrypted or simple hash for parent mode (app level check or simple 4-digit)
  
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view their own profile" 
on public.profiles for select 
using ( auth.uid() = id );

create policy "Users can update their own profile" 
on public.profiles for update 
using ( auth.uid() = id );

create policy "Users can insert their own profile" 
on public.profiles for insert 
with check ( auth.uid() = id );

-- CHILD PROFILES
create table public.child_profiles (
  id uuid default uuid_generate_v4() primary key,
  parent_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  age_band text check (age_band in ('6-7', '8-9', '10')) not null,
  avatar_id text default 'astronaut-1',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Progress / Settings specific to child could go here or in separate tables
  weekly_goal_minutes int default 60,
  total_stars int default 0
);

-- Enable RLS on child_profiles
alter table public.child_profiles enable row level security;

-- Policies for child_profiles
create policy "Parents can view their own children" 
on public.child_profiles for select 
using ( auth.uid() = parent_id );

create policy "Parents can insert their own children" 
on public.child_profiles for insert 
with check ( auth.uid() = parent_id );

create policy "Parents can update their own children" 
on public.child_profiles for update 
using ( auth.uid() = parent_id );

create policy "Parents can delete their own children" 
on public.child_profiles for delete 
using ( auth.uid() = parent_id );

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
