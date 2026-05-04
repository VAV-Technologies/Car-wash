import { editMessageText, sendMessage } from '@/lib/agents/telegram-client'
import { markdownToTelegramHtml, truncateForTelegram } from './markdown'

const EDIT_THROTTLE_MS = 1500
const MAX_MSG_CHARS = 3500
const TYPING_INDICATOR = '…'

// EditStreamer accumulates tokens from runJohan and pushes them to a Telegram
// message via throttled editMessageText calls. When the buffer exceeds
// MAX_MSG_CHARS, it finalizes the current message and starts a new one.
export class EditStreamer {
  private chatId: number
  private currentMessageId: number | null = null
  private currentText = ''
  private allText = ''
  private lastEditAt = 0
  private pendingEditTimer: NodeJS.Timeout | null = null
  private finalized = false

  constructor(chatId: number, initialMessageId: number) {
    this.chatId = chatId
    this.currentMessageId = initialMessageId
  }

  // Call repeatedly with token chunks.
  async append(text: string): Promise<void> {
    if (this.finalized) return
    this.currentText += text
    this.allText += text
    if (this.currentText.length >= MAX_MSG_CHARS) {
      await this.rolloverToNewMessage()
      return
    }
    this.scheduleEdit()
  }

  // Replace the current buffer's rendered content (used for status indicators
  // like "🔍 search_customer…" before reverting to streaming).
  async setStatus(line: string): Promise<void> {
    if (this.finalized || !this.currentMessageId) return
    const html = `<i>${escapeHtml(line)}</i>`
    try {
      await editMessageText(this.chatId, this.currentMessageId, html, undefined, 'HTML')
    } catch {
      // ignore — status indicators are best-effort
    }
  }

  // Force a flush + final edit. Called when runJohan emits 'done'.
  async finalize(finalText?: string): Promise<void> {
    if (this.finalized) return
    this.finalized = true
    if (this.pendingEditTimer) {
      clearTimeout(this.pendingEditTimer)
      this.pendingEditTimer = null
    }
    const text = finalText !== undefined ? finalText.slice(this.currentText.length === 0 ? 0 : 0) : this.currentText
    // If finalText was provided, prefer it (it has post-processing applied like
    // preamble stripping). Otherwise use whatever we accumulated.
    const renderText = finalText ?? this.currentText
    if (!renderText.trim()) {
      await this.editCurrent('<i>(no response)</i>')
      return
    }
    const html = truncateForTelegram(markdownToTelegramHtml(renderText), MAX_MSG_CHARS)
    await this.editCurrent(html)
  }

  // Replace current message with an error notice.
  async error(message: string): Promise<void> {
    this.finalized = true
    if (this.pendingEditTimer) {
      clearTimeout(this.pendingEditTimer)
      this.pendingEditTimer = null
    }
    const html = `<i>⚠️ ${escapeHtml(message.slice(0, 200))}</i>`
    await this.editCurrent(html)
  }

  // Replace with [stopped] indicator.
  async stopped(): Promise<void> {
    this.finalized = true
    if (this.pendingEditTimer) {
      clearTimeout(this.pendingEditTimer)
      this.pendingEditTimer = null
    }
    await this.editCurrent('<i>[stopped]</i>')
  }

  getMessageId(): number | null {
    return this.currentMessageId
  }

  private scheduleEdit(): void {
    if (this.pendingEditTimer) return
    const since = Date.now() - this.lastEditAt
    const delay = Math.max(0, EDIT_THROTTLE_MS - since)
    this.pendingEditTimer = setTimeout(() => {
      this.pendingEditTimer = null
      void this.flush()
    }, delay)
  }

  private async flush(): Promise<void> {
    if (this.finalized || !this.currentMessageId) return
    if (!this.currentText) return
    this.lastEditAt = Date.now()
    const html = truncateForTelegram(markdownToTelegramHtml(this.currentText), MAX_MSG_CHARS)
    await this.editCurrent(html)
  }

  private async editCurrent(html: string): Promise<void> {
    if (!this.currentMessageId) return
    try {
      await editMessageText(this.chatId, this.currentMessageId, html, undefined, 'HTML')
    } catch (err: any) {
      // 400 'message is not modified' is fine — same content, ignore.
      // 400 'can't be edited' (>48h) → send new message instead.
      const msg = String(err?.message || err)
      if (msg.includes("can't be edited") || msg.includes('not found')) {
        const sent = await sendMessage(this.chatId, html, undefined, 'HTML')
        this.currentMessageId = sent.message_id
      } else if (!msg.includes('not modified')) {
        console.error('[telegram-stream] edit failed:', msg)
      }
    }
  }

  private async rolloverToNewMessage(): Promise<void> {
    // Finalize the current message with what we have, then start a fresh one.
    const html = truncateForTelegram(markdownToTelegramHtml(this.currentText), MAX_MSG_CHARS)
    await this.editCurrent(html)
    this.currentText = ''
    const sent = await sendMessage(this.chatId, '…', undefined, 'HTML')
    this.currentMessageId = sent.message_id
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)
}
