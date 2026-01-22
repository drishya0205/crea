-- Enable pgvector extension
create extension if not exists vector;

-- 1. Identity Bucket (Users & Settings)
-- Tied to Supabase Auth 'auth.users' by reference ideally, but simplified here
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  operating_mode text default 'grounded', -- 'grounded' or 'strategic'
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Operating System (Structured Rules)
-- Stored as JSONB in a dedicated table or within user_profiles. 
-- Dedicated table allows versioning or multiple OS configs.
create table if not exists public.operating_systems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles(id) on delete cascade,
  work_hours jsonb, -- e.g. {"start": "09:00", "end": "18:00"}
  tone_guidelines text, -- e.g. "Direct, professional, no fluff"
  approval_rules jsonb,
  created_at timestamptz default now()
);

-- 3. Vision & 4. Projects (Projects Table)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles(id) on delete cascade,
  name text not null,
  description text,
  vision_statement text, -- The "Vision" bucket aspect
  status text default 'active', -- active, on_hold, completed, archived
  deadline timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Tasks (Tasks Table - strict state machine)
create type task_status as enum ('backlog', 'next', 'doing', 'done');

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  status task_status default 'backlog',
  priority text default 'medium', -- low, medium, high, urgent
  due_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Calendar (Events)
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles(id) on delete cascade,
  title text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  description text,
  location text,
  is_all_day boolean default false,
  created_at timestamptz default now()
);

-- 7. Decisions (The "Anti-Gaslight" ledger)
create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  decision_text text not null,
  context text, -- Why was this decided?
  decided_at timestamptz default now(),
  tags text[]
);

-- Memory Fragments (Vector Store for Unstructured Data)
create table if not exists public.memory_fragments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles(id) on delete cascade,
  content text not null,
  embedding vector(1536), -- Assuming OpenAI ada-002 dims
  source_type text, -- 'chat', 'document', 'note'
  metadata jsonb,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists decisions_user_id_idx on public.decisions(user_id);

-- Enable Row Level Security (RLS) - Templates
alter table public.user_profiles enable row level security;
alter table public.operating_systems enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.calendar_events enable row level security;
alter table public.decisions enable row level security;
alter table public.memory_fragments enable row level security;

-- Policy template: Users can only see their own data
-- create policy "Users can view own data" on public.projects for select using (auth.uid() = user_id);
