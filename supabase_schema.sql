-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table if not exists memory_fragments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(), -- Optional if you want RLS
  content text,
  metadata jsonb,
  embedding vector(1536), -- 1536 is the dimension for text-embedding-3-small
  source_type text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create a function to search for documents
create or replace function match_memory_fragments (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  user_id_filter uuid default null
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    memory_fragments.id,
    memory_fragments.content,
    memory_fragments.metadata,
    1 - (memory_fragments.embedding <=> query_embedding) as similarity
  from memory_fragments
  where 1 - (memory_fragments.embedding <=> query_embedding) > match_threshold
  and (user_id_filter is null or memory_fragments.user_id = user_id_filter)
  order by memory_fragments.embedding <=> query_embedding
  limit match_count;
end;
$$;
