-- Add this to your Supabase SQL Editor
-- Result Interface: id, content, similarity, metadata

create or replace function match_memory_fragments (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  user_id_filter uuid
)
returns table (
  id uuid,
  content text,
  similarity float,
  metadata jsonb
)
language plpgsql
as $$
begin
  return query
  select
    memory_fragments.id,
    memory_fragments.content,
    1 - (memory_fragments.embedding <=> query_embedding) as similarity,
    memory_fragments.metadata
  from memory_fragments
  where 1 - (memory_fragments.embedding <=> query_embedding) > match_threshold
  and memory_fragments.user_id = user_id_filter
  order by memory_fragments.embedding <=> query_embedding
  limit match_count;
end;
$$;
