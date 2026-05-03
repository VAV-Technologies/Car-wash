-- AI Chat (web-based Johan): shared team workspace with multi-thread persistence.
-- Replaces the WhatsApp transport for Johan. The agent's brain (DRAFT/REFERENCE
-- modes, customer-lock, slash commands) lives in src/lib/agents/johan/.

create extension if not exists "pgcrypto";

create table if not exists public.ai_chat_threads (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  title text not null default 'New chat',
  metadata jsonb not null default '{"context_phone":null,"context_lang":"id"}'::jsonb,
  archived_at timestamptz,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_chat_threads_active_idx
  on public.ai_chat_threads (last_message_at desc)
  where archived_at is null;

create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.ai_chat_threads(id) on delete cascade,
  role text not null check (role in ('user','assistant','tool','system')),
  content text not null default '',
  tool_calls jsonb,
  tool_call_id text,
  tool_name text,
  metadata jsonb,
  finalized_at timestamptz,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists ai_chat_messages_thread_idx
  on public.ai_chat_messages (thread_id, created_at asc);

alter table public.ai_chat_threads  enable row level security;
alter table public.ai_chat_messages enable row level security;

drop policy if exists "team threads"  on public.ai_chat_threads;
drop policy if exists "team messages" on public.ai_chat_messages;

create policy "team threads"
  on public.ai_chat_threads
  for all
  to authenticated
  using (true)
  with check (true);

create policy "team messages"
  on public.ai_chat_messages
  for all
  to authenticated
  using (true)
  with check (true);

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists ai_chat_threads_touch on public.ai_chat_threads;
create trigger ai_chat_threads_touch
  before update on public.ai_chat_threads
  for each row execute function public.touch_updated_at();

drop table if exists public.johan_conversations cascade;
