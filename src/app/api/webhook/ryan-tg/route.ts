import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import {
  isAuthorizedUser,
  answerCallback,
  markStatusOnMessage,
  editDraftMessage,
  sendEditPrompt,
  type DraftMessageInput,
} from '@/lib/agents/ryan-tg'
import {
  approveDraft,
  denyDraft,
  applyEditToDraft,
  loadDraftWithLead,
  type PendingDraftRow,
} from '@/lib/agents/plusvibe'
import { getSupabaseAdmin } from '@/lib/supabase'

// Telegram webhook for the Ryan email approval bot.
// Handles two event types:
//   1. callback_query — Approve / Edit / Deny button taps
//   2. message — replies to our force-reply edit prompt (or direct
//      replies to a draft message)
// Anything else is acknowledged and ignored.

export async function POST(req: NextRequest) {
  // setWebhook was called with secret_token; Telegram echoes it back in
  // this header. Reject if it doesn't match.
  const expectedSecret = process.env.RYAN_DRAFT_WEBHOOK_SECRET
  if (expectedSecret) {
    const got = req.headers.get('x-telegram-bot-api-secret-token')
    if (got !== expectedSecret) {
      return NextResponse.json({ ok: false, error: 'invalid secret' }, { status: 401 })
    }
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: true }) // ignore malformed; Telegram doesn't retry on 200
  }

  // Always 200 to Telegram, do work in background. Avoids retries / spinning buttons.
  after(async () => {
    try {
      if (body.callback_query) {
        await handleCallbackQuery(body.callback_query)
      } else if (body.message) {
        await handleMessage(body.message)
      }
    } catch (err) {
      console.error('[ryan-tg-webhook] handler error', err)
    }
  })

  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ status: 'ok', agent: 'Ryan Email Approval Bot' })
}

// ─── Helpers ────────────────────────────────────────────────────────

function rowToDraftInput(
  draft: PendingDraftRow,
  lead: { first_name: string | null; lead_email: string; company_name: string | null; campaign_name: string | null; reply_count: number } | null,
): DraftMessageInput {
  return {
    draftId: draft.id,
    leadName: lead?.first_name ?? null,
    leadEmail: draft.to_email || lead?.lead_email || '',
    companyName: lead?.company_name ?? null,
    campaignName: lead?.campaign_name ?? null,
    replyCount: lead?.reply_count ?? 0,
    classification: draft.classification || 'UNKNOWN',
    objectionType: draft.objection_type,
    language: draft.language,
    inboundText: draft.inbound_text,
    draftHtml: draft.draft_html,
  }
}

function jakartaTimeShort(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

function escapeTgHtml(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function actorLabel(username: string | null, tgUserId: number): string {
  return username ? `@${escapeTgHtml(username)}` : `tg:${tgUserId}`
}

// ─── Handlers ───────────────────────────────────────────────────────

async function handleCallbackQuery(cbq: any): Promise<void> {
  const data = String(cbq.data || '')
  const colonIdx = data.indexOf(':')
  if (colonIdx === -1) {
    await answerCallback(cbq.id, 'malformed callback')
    return
  }
  const action = data.slice(0, colonIdx)
  const draftId = data.slice(colonIdx + 1)

  const tgUserId: number = cbq.from?.id
  const username: string | null = cbq.from?.username || cbq.from?.first_name || null

  if (!isAuthorizedUser(tgUserId)) {
    await answerCallback(cbq.id, 'You are not authorized.', { showAlert: true })
    return
  }

  const chatId: number = cbq.message?.chat?.id
  const messageId: number = cbq.message?.message_id
  if (!chatId || !messageId) {
    await answerCallback(cbq.id, 'no message context')
    return
  }

  if (action === 'approve') {
    const result = await approveDraft(draftId, { tgUserId, username })
    if (!result.ok) {
      await answerCallback(cbq.id, result.reason || 'failed', { showAlert: true })
      return
    }
    const ctx = await loadDraftWithLead(draftId)
    if (ctx) {
      await markStatusOnMessage(
        chatId,
        messageId,
        rowToDraftInput(ctx.draft, ctx.lead),
        `✅ <b>Sent</b> at ${jakartaTimeShort()} by ${actorLabel(username, tgUserId)}`,
      )
    }
    await answerCallback(cbq.id, 'Sent ✅')
    return
  }

  if (action === 'deny') {
    const result = await denyDraft(draftId, { tgUserId, username })
    if (!result.ok) {
      await answerCallback(cbq.id, result.reason || 'failed', { showAlert: true })
      return
    }
    const ctx = await loadDraftWithLead(draftId)
    if (ctx) {
      await markStatusOnMessage(
        chatId,
        messageId,
        rowToDraftInput(ctx.draft, ctx.lead),
        `❌ <b>Denied</b> at ${jakartaTimeShort()} by ${actorLabel(username, tgUserId)}`,
      )
    }
    await answerCallback(cbq.id, 'Denied')
    return
  }

  if (action === 'edit') {
    const { messageId: promptMessageId } = await sendEditPrompt(chatId, messageId, draftId)
    // Remember which prompt belongs to which draft so a reply event can
    // be matched back. Atomic-ish: only update if still pending.
    await getSupabaseAdmin()
      .from('email_pending_drafts')
      .update({ tg_edit_prompt_message_id: promptMessageId })
      .eq('id', draftId)
      .eq('status', 'pending')
    await answerCallback(cbq.id, 'Reply with the edited draft ✏️')
    return
  }

  await answerCallback(cbq.id, 'unknown action')
}

async function handleMessage(message: any): Promise<void> {
  // We only care about replies to our prompt or to the draft message
  // itself. Ignore everything else.
  const replyTo = message.reply_to_message
  if (!replyTo) return

  const tgUserId: number = message.from?.id
  const username: string | null = message.from?.username || message.from?.first_name || null
  if (!isAuthorizedUser(tgUserId)) return

  const newText = String(message.text || '').trim()
  if (!newText) return

  const supabase = getSupabaseAdmin()

  // Try matching the replied-to message id against an outstanding edit
  // prompt first; fall back to matching against the draft message itself
  // (so users can reply directly to the draft without tapping Edit first).
  const { data: byPrompt } = await supabase
    .from('email_pending_drafts')
    .select('id, tg_chat_id, tg_message_id, status')
    .eq('tg_chat_id', message.chat.id)
    .eq('tg_edit_prompt_message_id', replyTo.message_id)
    .eq('status', 'pending')
    .maybeSingle()

  let draftId: string | null = (byPrompt as any)?.id ?? null
  if (!draftId) {
    const { data: byDraft } = await supabase
      .from('email_pending_drafts')
      .select('id')
      .eq('tg_chat_id', message.chat.id)
      .eq('tg_message_id', replyTo.message_id)
      .eq('status', 'pending')
      .maybeSingle()
    draftId = (byDraft as any)?.id ?? null
  }

  if (!draftId) return // not a reply to anything we care about

  const result = await applyEditToDraft(draftId, newText, { tgUserId, username })
  if (!result.ok) return

  const ctx = await loadDraftWithLead(draftId)
  if (!ctx) return

  // Re-render the original draft message with the new text + same buttons
  await editDraftMessage(
    Number(ctx.draft.tg_chat_id),
    Number(ctx.draft.tg_message_id),
    rowToDraftInput(ctx.draft, ctx.lead),
  )
}
