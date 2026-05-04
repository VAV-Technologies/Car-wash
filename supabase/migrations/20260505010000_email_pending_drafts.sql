-- Email draft approval queue.
-- Replaces immediate replyToEmail() with a human-in-the-loop step: each
-- AI-generated draft lands here, gets posted to a Telegram group with
-- approve/edit/deny buttons, and only goes out to the lead once a human
-- approves (or edits + approves).

create table if not exists public.email_pending_drafts (
  id uuid primary key default gen_random_uuid(),
  email_lead_id uuid references public.email_leads(id) on delete cascade,

  -- Plusvibe context (snapshotted so the send call works even if the lead
  -- row mutates between queue and approve)
  last_email_id text not null,
  subject text,
  from_email text,
  to_email text,

  -- Inputs
  inbound_text text not null,
  classification text,
  classification_summary text,
  objection_type text,
  language text,

  -- Draft state
  draft_html text not null,
  edit_history jsonb not null default '[]'::jsonb,

  -- Flow: pending → approved → sent  (or denied, or error)
  status text not null default 'pending'
    check (status in ('pending','approved','denied','sent','error')),
  actioned_at timestamptz,
  actioned_by_tg_user_id bigint,
  actioned_by_tg_username text,
  send_error text,

  -- Telegram correlation. tg_message_id is the draft message that holds
  -- the buttons. tg_edit_prompt_message_id is set while a force-reply
  -- prompt is outstanding so a reply event can be matched back to this
  -- draft.
  tg_chat_id bigint,
  tg_message_id bigint,
  tg_edit_prompt_message_id bigint,

  created_at timestamptz not null default now()
);

create index if not exists email_pending_drafts_status_idx
  on public.email_pending_drafts (status, created_at desc);
create index if not exists email_pending_drafts_lead_idx
  on public.email_pending_drafts (email_lead_id, created_at desc);
create index if not exists email_pending_drafts_tg_msg_idx
  on public.email_pending_drafts (tg_chat_id, tg_message_id);
create index if not exists email_pending_drafts_tg_prompt_idx
  on public.email_pending_drafts (tg_chat_id, tg_edit_prompt_message_id);

alter table public.email_pending_drafts enable row level security;
-- Service role bypasses RLS; the webhook always uses service role.
