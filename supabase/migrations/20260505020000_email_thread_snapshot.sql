-- Capture the full email thread once at queue time so the Telegram post
-- can render the full history (Plusvibe webhook only sends the latest
-- reply). Also track the thread message IDs separately from the draft
-- message ID so the bot can target only the draft message for
-- approve/edit/deny actions.

alter table public.email_pending_drafts
  add column if not exists thread_snapshot jsonb,
  add column if not exists tg_thread_message_ids bigint[];
