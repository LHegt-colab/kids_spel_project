-- 1. Fix Missing Parent PIN Column
alter table public.profiles add column if not exists pin_code text;
alter table public.profiles add column if not exists setup_completed boolean default false;

-- 2. Ensure Phase 5 Child Profile Columns exist (Gamification)
alter table public.child_profiles add column if not exists streak_count integer default 0;
alter table public.child_profiles add column if not exists last_played_date date;
alter table public.child_profiles add column if not exists equipped_helmet text;
alter table public.child_profiles add column if not exists equipped_pet text;
alter table public.child_profiles add column if not exists equipped_suit text;
alter table public.child_profiles add column if not exists equipped_background text;

-- 3. Ensure Shop Tables exist (Phase 5)
create table if not exists public.shop_items (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    category text not null check (category in ('helmet', 'suit', 'pet', 'background')),
    cost integer not null default 0,
    asset_url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.purchased_items (
    id uuid default gen_random_uuid() primary key,
    child_id uuid references public.child_profiles(id) on delete cascade not null,
    item_id uuid references public.shop_items(id) on delete cascade not null,
    purchased_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(child_id, item_id)
);

-- 4. Enable RLS for new tables
alter table public.shop_items enable row level security;
alter table public.purchased_items enable row level security;

-- 5. Add Policies (Safe usage: drop if exists first to avoid dupes or errors)
drop policy if exists "Shop items are viewable by everyone" on public.shop_items;
create policy "Shop items are viewable by everyone" on public.shop_items for select using (true);

drop policy if exists "Parents can view purchases of their children" on public.purchased_items;
create policy "Parents can view purchases of their children" on public.purchased_items
    for select using (
        exists (
            select 1 from public.child_profiles
            where child_profiles.id = purchased_items.child_id
            and child_profiles.parent_id = auth.uid()
        )
    );

drop policy if exists "Parents can insert purchases for their children" on public.purchased_items;
create policy "Parents can insert purchases for their children" on public.purchased_items
    for insert with check (
        exists (
            select 1 from public.child_profiles
            where child_profiles.id = purchased_items.child_id
            and child_profiles.parent_id = auth.uid()
        )
    );
