-- AI action audit log + pending confirmations.
-- Backs Johan's write-tool surface: every action by an admin via /ai logs here.

create extension if not exists "pgcrypto";

create table if not exists public.ai_action_log (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.ai_chat_threads(id) on delete cascade,
  message_id uuid references public.ai_chat_messages(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  tool_name text not null,
  params jsonb not null default '{}'::jsonb,
  result jsonb,
  success boolean,
  error text,
  affected_ids text[] default '{}',
  duration_ms integer,
  idempotency_key text,
  created_at timestamptz not null default now(),
  finalized_at timestamptz
);

-- Idempotency: same tool + same assistant message can't double-execute on success.
create unique index if not exists ai_action_log_idem_idx
  on public.ai_action_log (tool_name, idempotency_key)
  where idempotency_key is not null and success is true;

create index if not exists ai_action_log_thread_idx
  on public.ai_action_log (thread_id, created_at desc);

create table if not exists public.ai_pending_actions (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.ai_chat_threads(id) on delete cascade,
  message_id uuid references public.ai_chat_messages(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  tool_name text not null,
  params jsonb not null,
  human_summary text not null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','cancelled','executed','expired')),
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists ai_pending_actions_thread_idx
  on public.ai_pending_actions (thread_id, status, created_at desc);

alter table public.ai_action_log      enable row level security;
alter table public.ai_pending_actions enable row level security;

drop policy if exists "team action log"      on public.ai_action_log;
drop policy if exists "team pending actions" on public.ai_pending_actions;

create policy "team action log"
  on public.ai_action_log for all to authenticated
  using (true) with check (true);

create policy "team pending actions"
  on public.ai_pending_actions for all to authenticated
  using (true) with check (true);
