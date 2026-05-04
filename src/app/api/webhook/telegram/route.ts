import { NextRequest, NextResponse } from 'next/server'
import { isAuthorized } from '@/lib/agents/johan/telegram/auth'
import {
  handleMessage,
  handleCallbackQuery,
  type TelegramUpdate,
} from '@/lib/agents/johan/telegram/handler'

// Vercel function timeout — Johan's LLM runs cap at 90s; allow extra for tools.
export const maxDuration = 300

export async function POST(req: NextRequest) {
  // ── Validate Telegram secret token ──
  const secret = req.headers.get('x-telegram-bot-api-secret-token')
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!expected || secret !== expected) {
    console.warn('[telegram-webhook] missing or invalid secret token')
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  let update: TelegramUpdate
  try {
    update = (await req.json()) as TelegramUpdate
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 })
  }

  // ── Authorization check ──
  const fromId = update.message?.from?.id ?? update.callback_query?.from.id
  if (!isAuthorized(fromId)) {
    // Silent drop. No reply, no DB write, no information leak.
    return NextResponse.json({ ok: true, skipped: 'unauthorized' })
  }

  // ── DM-only filter for messages ──
  // (Callback queries don't have chat.type at the top level; the inner
  // message's chat is checked downstream where needed.)
  if (update.message && update.message.chat.type !== 'private') {
    return NextResponse.json({ ok: true, skipped: 'non-private chat' })
  }

  try {
    if (update.message) {
      await handleMessage(update)
    } else if (update.callback_query) {
      await handleCallbackQuery(update)
    }
  } catch (err: any) {
    console.error('[telegram-webhook] handler error:', err?.message || err)
    // Return 200 so Telegram doesn't retry; we logged the error.
    return NextResponse.json({ ok: false, error: 'handler error' })
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ status: 'ok', agent: 'Johan (Telegram)' })
}
