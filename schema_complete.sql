-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Parents)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  pin_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 2. CHILD PROFILES
create table if not exists public.child_profiles (
  id uuid default uuid_generate_v4() primary key,
  parent_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  age_band text check (age_band in ('6-7', '8-9', '10')),
  avatar_id text,
  weekly_goal_minutes int default 60,
  total_stars int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.child_profiles enable row level security;

create policy "Parents can view own children" on public.child_profiles
  for select using (auth.uid() = parent_id);

create policy "Parents can insert own children" on public.child_profiles
  for insert with check (auth.uid() = parent_id);

create policy "Parents can update own children" on public.child_profiles
  for update using (auth.uid() = parent_id);

create policy "Parents can delete own children" on public.child_profiles
  for delete using (auth.uid() = parent_id);

-- 3. CHILD SETTINGS
create table if not exists public.child_settings (
  child_id uuid references public.child_profiles(id) on delete cascade not null primary key,
  daily_limit_minutes int default 30,
  enabled_modules jsonb default '["math-adventure","math-race","word-hunt","sentence-builder","read-choose","mystery-island","time-money","daily-challenge","avatar-rewards"]'::jsonb,
  difficulty_caps jsonb default '{}'::jsonb,
  rewards_enabled boolean default true,
  sound_enabled boolean default true,
  reporting_level text check (reporting_level in ('simple', 'detailed')) default 'simple',
  updated_at timestamp with time zone
);

alter table public.child_settings enable row level security;

create policy "Parents can view their children settings" on public.child_settings
  for select using (exists (select 1 from public.child_profiles where id = public.child_settings.child_id and parent_id = auth.uid()));

create policy "Parents can update their children settings" on public.child_settings
  for update using (exists (select 1 from public.child_profiles where id = public.child_settings.child_id and parent_id = auth.uid()));

create policy "Parents can insert their children settings" on public.child_settings
  for insert with check (exists (select 1 from public.child_profiles where id = child_id and parent_id = auth.uid()));

-- 4. DAILY USAGE
create table if not exists public.daily_usage (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.child_profiles(id) on delete cascade not null,
  date date default CURRENT_DATE,
  minutes_used int default 0,
  unique(child_id, date)
);

alter table public.daily_usage enable row level security;

create policy "Parents can view usage" on public.daily_usage
  for select using (exists (select 1 from public.child_profiles where id = daily_usage.child_id and parent_id = auth.uid()));

create policy "Parents can update usage" on public.daily_usage
  for update using (exists (select 1 from public.child_profiles where id = daily_usage.child_id and parent_id = auth.uid()));

create policy "Parents can insert usage" on public.daily_usage
  for insert with check (exists (select 1 from public.child_profiles where id = daily_usage.child_id and parent_id = auth.uid()));

-- 5. GAME SESSIONS
create table if not exists public.game_sessions (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.child_profiles(id) on delete cascade not null,
  module_id text not null,
  start_time timestamp with time zone default timezone('utc'::text, now()) not null,
  end_time timestamp with time zone,
  duration_seconds int default 0,
  score int default 0,
  meta jsonb default '{}'::jsonb
);

alter table public.game_sessions enable row level security;

create policy "Parents can view sessions" on public.game_sessions
  for select using (exists (select 1 from public.child_profiles where id = game_sessions.child_id and parent_id = auth.uid()));

create policy "Parents can insert sessions" on public.game_sessions
  for insert with check (exists (select 1 from public.child_profiles where id = child_id and parent_id = auth.uid()));

create policy "Parents can update sessions" on public.game_sessions
  for update using (exists (select 1 from public.child_profiles where id = child_id and parent_id = auth.uid()));

-- 6. ANSWERS LOG
create table if not exists public.answers_log (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.game_sessions(id) on delete cascade not null,
  question_id text,
  is_correct boolean,
  answer text,
  correct_answer text,
  response_time_ms int,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.answers_log enable row level security;

create policy "Parents can view logs" on public.answers_log
  for select using (exists (select 1 from public.game_sessions join public.child_profiles on public.game_sessions.child_id = public.child_profiles.id where public.game_sessions.id = answers_log.session_id and public.child_profiles.parent_id = auth.uid()));

create policy "Parents can insert logs" on public.answers_log
  for insert with check (exists (select 1 from public.game_sessions join public.child_profiles on public.game_sessions.child_id = public.child_profiles.id where public.game_sessions.id = session_id and public.child_profiles.parent_id = auth.uid()));

-- 7. DAILY CHALLENGES
create table if not exists public.daily_challenges (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.child_profiles(id) on delete cascade not null,
  date date default CURRENT_DATE,
  tasks jsonb default '[]'::jsonb,
  unique(child_id, date)
);

alter table public.daily_challenges enable row level security;

create policy "Parents can view challenges" on public.daily_challenges
  for select using (exists (select 1 from public.child_profiles where id = daily_challenges.child_id and parent_id = auth.uid()));

create policy "Parents can insert challenges" on public.daily_challenges
  for insert with check (exists (select 1 from public.child_profiles where id = daily_challenges.child_id and parent_id = auth.uid()));

create policy "Parents can update challenges" on public.daily_challenges
  for update using (exists (select 1 from public.child_profiles where id = daily_challenges.child_id and parent_id = auth.uid()));

-- 8. TRIGGER FOR NEW USER (If not already exists)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid error on replay
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
