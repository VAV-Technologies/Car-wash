import type { ActionContext } from '../actions/_shared'
import { getSupabaseAdmin } from '@/lib/supabase'

export function getAuthorizedTelegramIds(): Set<number> {
  const raw = process.env.TELEGRAM_AUTHORIZED_USER_IDS ?? ''
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n)),
  )
}

export function isAuthorized(tgUserId: number | undefined | null): boolean {
  if (typeof tgUserId !== 'number') return false
  return getAuthorizedTelegramIds().has(tgUserId)
}

// Synthetic ActionContext for Telegram users. user_id is null (not a Supabase
// auth user); tg_user_id holds the Telegram identity. user_email is a synthetic
// "tg-<id>@castudio.local" so audit-log display still has something.
export function tgUserToActionContext(
  tgUserId: number,
  displayName: string | null,
  threadId: string,
  assistantMessageId: string,
): ActionContext {
  return {
    userId: null as any, // ai_action_log.user_id is FK with ON DELETE SET NULL; null is fine
    userEmail: `tg-${tgUserId}@castudio.local`,
    threadId,
    assistantMessageId,
    supabaseAdmin: getSupabaseAdmin(),
    tgUserId,
    tgDisplayName: displayName,
  } as ActionContext
}
