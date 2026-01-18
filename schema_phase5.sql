-- Phase 5: Gamification & Shop Schema

-- 1. Shop System
create table if not exists shop_items (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    category text not null check (category in ('helmet', 'suit', 'pet', 'background')),
    cost integer not null default 0,
    asset_url text not null, -- URL to image or CSS class
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists purchased_items (
    id uuid default gen_random_uuid() primary key,
    child_id uuid references child_profiles(id) on delete cascade not null,
    item_id uuid references shop_items(id) on delete cascade not null,
    purchased_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(child_id, item_id)
);

-- 2. Daily Challenges & Streaks
create table if not exists daily_challenges (
    id uuid default gen_random_uuid() primary key,
    child_id uuid references child_profiles(id) on delete cascade not null,
    challenge_date date default current_date not null,
    
    math_completed boolean default false,
    language_completed boolean default false,
    logic_completed boolean default false,
    
    rewards_claimed boolean default false,
    
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(child_id, challenge_date)
);

-- 3. Profile Updates (Add columns if they don't exist)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'child_profiles' and column_name = 'streak_count') then
        alter table child_profiles add column streak_count integer default 0;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'child_profiles' and column_name = 'last_played_date') then
        alter table child_profiles add column last_played_date date;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'child_profiles' and column_name = 'equipped_helmet') then
        alter table child_profiles add column equipped_helmet text; -- Store asset URL or ID
    end if;
     if not exists (select 1 from information_schema.columns where table_name = 'child_profiles' and column_name = 'equipped_pet') then
        alter table child_profiles add column equipped_pet text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'child_profiles' and column_name = 'equipped_suit') then
        alter table child_profiles add column equipped_suit text;
    end if;
      if not exists (select 1 from information_schema.columns where table_name = 'child_profiles' and column_name = 'equipped_background') then
        alter table child_profiles add column equipped_background text;
    end if;
end $$;

-- 4. RLS Policies

-- Shop Items: Readable by all, manageable by no-one (seeded by admin/sql)
alter table shop_items enable row level security;
create policy "Shop items are viewable by everyone" on shop_items for select using (true);

-- Purchased Items: Viewable by parent's children
alter table purchased_items enable row level security;

create policy "Parents can view purchases of their children" on purchased_items
    for select using (
        exists (
            select 1 from child_profiles
            where child_profiles.id = purchased_items.child_id
            and child_profiles.parent_id = auth.uid()
        )
    );

create policy "Parents can insert purchases for their children" on purchased_items
    for insert with check (
        exists (
            select 1 from child_profiles
            where child_profiles.id = purchased_items.child_id
            and child_profiles.parent_id = auth.uid()
        )
    );

-- Daily Challenges: Viewable/updatable by parent's children (simulated)
alter table daily_challenges enable row level security;

create policy "Parents can view challenges of their children" on daily_challenges
    for select using (
        exists (
            select 1 from child_profiles
            where child_profiles.id = daily_challenges.child_id
            and child_profiles.parent_id = auth.uid()
        )
    );

create policy "Parents can update challenges for their children" on daily_challenges
    for all using (
        exists (
            select 1 from child_profiles
            where child_profiles.id = daily_challenges.child_id
            and child_profiles.parent_id = auth.uid()
        )
    );

-- 5. Seed Data for Shop
insert into shop_items (name, category, cost, asset_url) values
('Gouden Helm', 'helmet', 50, 'https://cdn-icons-png.flaticon.com/128/2592/2592898.png'),
('Ruimte Pak', 'suit', 100, 'https://cdn-icons-png.flaticon.com/128/3028/3028468.png'),
('Huisdier Robot', 'pet', 200, 'https://cdn-icons-png.flaticon.com/128/4614/4614054.png'),
('Blauwe Helm', 'helmet', 30, 'https://cdn-icons-png.flaticon.com/128/2592/2592920.png'),
('Laser Bril', 'helmet', 40, 'https://cdn-icons-png.flaticon.com/128/6532/6532938.png');
