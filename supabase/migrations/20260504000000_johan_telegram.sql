-- Johan's Telegram I/O state.
-- Each authorized Telegram user has one row tracking their active thread,
-- abort flag (for /stop), and last-seen timestamp.

create table if not exists public.johan_telegram_state (
  tg_user_id        bigint primary key,
  display_name      text,
  active_thread_id  uuid references public.ai_chat_threads(id) on delete set null,
  abort_run_at      timestamptz,
  last_seen_at      timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

create index if not exists johan_telegram_state_thread_idx
  on public.johan_telegram_state (active_thread_id);

-- Audit log: when Johan is invoked from Telegram, user_id is null and
-- tg_user_id holds the Telegram user. Keeps audit attributable without
-- creating synthetic Supabase auth users.
alter table public.ai_action_log
  add column if not exists tg_user_id bigint;

create index if not exists ai_action_log_tg_user_idx
  on public.ai_action_log (tg_user_id, created_at desc);

-- RLS: service role bypasses; the Telegram webhook always uses service role.
alter table public.johan_telegram_state enable row level security;

drop policy if exists "team johan telegram state" on public.johan_telegram_state;

create policy "team johan telegram state"
  on public.johan_telegram_state for all to authenticated
  using (true) with check (true);
