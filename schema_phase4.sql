-- Phase 4: Language Content Libraries

-- Table for Spelling Words
create table if not exists library_words (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  word text not null,
  category text default 'general', -- e.g., 'space', 'animals', 'hard_g'
  difficulty_level text default 'age_6_7', -- age_band
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table for Sentences
create table if not exists library_sentences (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  sentence_text text not null,
  difficulty_level text default 'age_6_7',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table for Reading Texts
create table if not exists library_texts (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  difficulty_level text default 'age_6_7',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table for Questions linked to Texts
create table if not exists library_questions (
  id uuid default gen_random_uuid() primary key,
  text_id uuid references library_texts(id) on delete cascade not null,
  question text not null,
  options jsonb not null, -- JSON array of strings e.g. ["Option A", "Option B"]
  correct_answer text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table library_words enable row level security;
alter table library_sentences enable row level security;
alter table library_texts enable row level security;
alter table library_questions enable row level security;

-- Policies for Library Words
create policy "Users can view their own words"
  on library_words for select
  using (auth.uid() = profile_id);

create policy "Users can insert their own words"
  on library_words for insert
  with check (auth.uid() = profile_id);

create policy "Users can update their own words"
  on library_words for update
  using (auth.uid() = profile_id);

create policy "Users can delete their own words"
  on library_words for delete
  using (auth.uid() = profile_id);

-- Policies for Library Sentences
create policy "Users can view their own sentences"
  on library_sentences for select
  using (auth.uid() = profile_id);

create policy "Users can insert their own sentences"
  on library_sentences for insert
  with check (auth.uid() = profile_id);

create policy "Users can update their own sentences"
  on library_sentences for update
  using (auth.uid() = profile_id);

create policy "Users can delete their own sentences"
  on library_sentences for delete
  using (auth.uid() = profile_id);

-- Policies for Library Texts
create policy "Users can view their own texts"
  on library_texts for select
  using (auth.uid() = profile_id);

create policy "Users can insert their own texts"
  on library_texts for insert
  with check (auth.uid() = profile_id);

create policy "Users can update their own texts"
  on library_texts for update
  using (auth.uid() = profile_id);

create policy "Users can delete their own texts"
  on library_texts for delete
  using (auth.uid() = profile_id);

-- Policies for Library Questions
-- Access controlled via the parent text's ownership, but simpler to just match profile_id if we added it.
-- However, since `library_texts` is already secured, we can check if the text_id belongs to a text owned by the user.
-- For simplicity in V1 Supabase policies, a direct join in policy can be heavy.
-- Let's stick to standard RLS: authenticated users can read (or filtered),
-- but really we want parents to only see THEIR stuff.
-- Let's just create public access for now OR (better) add profile_id to questions too?
-- No, let's use a subquery check.

create policy "Users can view questions for their texts"
  on library_questions for select
  using (
    exists (
      select 1 from library_texts
      where library_texts.id = library_questions.text_id
      and library_texts.profile_id = auth.uid()
    )
  );

create policy "Users can insert questions for their texts"
  on library_questions for insert
  with check (
    exists (
      select 1 from library_texts
      where library_texts.id = library_questions.text_id
      and library_texts.profile_id = auth.uid()
    )
  );

create policy "Users can update questions for their texts"
  on library_questions for update
  using (
    exists (
      select 1 from library_texts
      where library_texts.id = library_questions.text_id
      and library_texts.profile_id = auth.uid()
    )
  );

create policy "Users can delete questions for their texts"
  on library_questions for delete
  using (
    exists (
      select 1 from library_texts
      where library_texts.id = library_questions.text_id
      and library_texts.profile_id = auth.uid()
    )
  );
