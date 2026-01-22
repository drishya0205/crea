-- Enable RLS (already done, but ensuring)
alter table public.tasks enable row level security;
alter table public.memory_fragments enable row level security;

-- Create permissive policies for Development (Allows Anon/Public access)
-- WARNING: These are for local dev only. In prod, strict user_id checks are needed.

-- TASKS Table
create policy "Allow sending tasks" 
on public.tasks 
for insert 
with check (true);

create policy "Allow viewing tasks" 
on public.tasks 
for select 
using (true);

create policy "Allow updating tasks" 
on public.tasks 
for update 
using (true);

-- MEMORY FRAGMENTS Table
create policy "Allow logging memory" 
on public.memory_fragments 
for insert 
with check (true);

create policy "Allow viewing memory" 
on public.memory_fragments 
for select 
using (true);
