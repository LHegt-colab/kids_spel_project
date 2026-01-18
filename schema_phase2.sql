-- CHILD SETTINGS
create table public.child_settings (
  child_id uuid references public.child_profiles(id) on delete cascade not null primary key,
  daily_limit_minutes int default 30,
  enabled_modules jsonb default '["math-adventure","math-race","word-hunt","sentence-builder","read-choose","mystery-island","time-money","daily-challenge","avatar-rewards"]'::jsonb,
  difficulty_caps jsonb default '{}'::jsonb,
  rewards_enabled boolean default true,
  sound_enabled boolean default true,
  reporting_level text check (reporting_level in ('simple', 'detailed')) default 'simple',
  updated_at timestamp with time zone
);

-- RLS for child_settings
alter table public.child_settings enable row level security;

-- Policies (inherited access via child_profiles -> parent_id)
-- Note: Simplified policy for now, checking if auth.uid() is the parent of the child
create policy "Parents can view their children settings"
on public.child_settings for select
using (
  exists (
    select 1 from public.child_profiles
    where id = public.child_settings.child_id
    and parent_id = auth.uid()
  )
);

create policy "Parents can update their children settings"
on public.child_settings for update
using (
  exists (
    select 1 from public.child_profiles
    where id = public.child_settings.child_id
    and parent_id = auth.uid()
  )
);

create policy "Parents can insert their children settings"
on public.child_settings for insert
with check (
  exists (
    select 1 from public.child_profiles
    where id = child_id
    and parent_id = auth.uid()
  )
);

-- DAILY USAGE
create table public.daily_usage (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.child_profiles(id) on delete cascade not null,
  date date default CURRENT_DATE,
  minutes_used int default 0,
  unique(child_id, date)
);

alter table public.daily_usage enable row level security;

create policy "Parents can view usage" 
on public.daily_usage for select 
using (
  exists (
    select 1 from public.child_profiles where id = daily_usage.child_id and parent_id = auth.uid()
  )
);

-- Allow upsert for usage tracking (technically child triggers this via client, or server function. 
-- For V1 client-side update: Authenticated user is the PARENT, but they are "acting" as the child.
-- As long as parent is logged in, they can update.
create policy "Parents can update usage" 
on public.daily_usage for update
using (
  exists (
    select 1 from public.child_profiles where id = daily_usage.child_id and parent_id = auth.uid()
  )
);

create policy "Parents can insert usage" 
on public.daily_usage for insert
with check (
  exists (
    select 1 from public.child_profiles where id = daily_usage.child_id and parent_id = auth.uid()
  )
);

-- GAME SESSIONS
create table public.game_sessions (
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

create policy "Parents can view sessions"
on public.game_sessions for select
using (
  exists (
    select 1 from public.child_profiles where id = game_sessions.child_id and parent_id = auth.uid()
  )
);

create policy "Parents can insert sessions"
on public.game_sessions for insert
with check (
  exists (
    select 1 from public.child_profiles where id = child_id and parent_id = auth.uid()
  )
);

create policy "Parents can update sessions"
on public.game_sessions for update
using (
  exists (
    select 1 from public.child_profiles where id = child_id and parent_id = auth.uid()
  )
);

-- ANSWERS LOG
create table public.answers_log (
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

create policy "Parents can view logs"
on public.answers_log for select
using (
  exists (
    select 1 from public.game_sessions 
    join public.child_profiles on public.game_sessions.child_id = public.child_profiles.id
    where public.game_sessions.id = answers_log.session_id
    and public.child_profiles.parent_id = auth.uid()
  )
);

create policy "Parents can insert logs"
on public.answers_log for insert
with check (
  exists (
    select 1 from public.game_sessions 
    join public.child_profiles on public.game_sessions.child_id = public.child_profiles.id
    where public.game_sessions.id = session_id
    and public.child_profiles.parent_id = auth.uid()
  )
);

-- DAILY CHALLENGES
create table public.daily_challenges (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.child_profiles(id) on delete cascade not null,
  date date default CURRENT_DATE,
  tasks jsonb default '[]'::jsonb,
  unique(child_id, date)
);

alter table public.daily_challenges enable row level security;

create policy "Parents can view challenges"
on public.daily_challenges for select
using (
  exists (
    select 1 from public.child_profiles where id = daily_challenges.child_id and parent_id = auth.uid()
  )
);

create policy "Parents can insert challenges"
on public.daily_challenges for insert
with check (
  exists (
    select 1 from public.child_profiles where id = daily_challenges.child_id and parent_id = auth.uid()
  )
);

create policy "Parents can update challenges"
on public.daily_challenges for update
using (
  exists (
    select 1 from public.child_profiles where id = daily_challenges.child_id and parent_id = auth.uid()
  )
);
