import type { InlineKeyboardMarkup } from './confirm-ui'

export interface ThreadRow {
  id: string
  title: string | null
  last_message_at: string | null
  archived_at?: string | null
}

export function buildThreadsKeyboard(threads: ThreadRow[]): InlineKeyboardMarkup {
  // One button per thread, max ~20 rows. The `thread:<id>` callback_data
  // routes to the thread switcher.
  const rows = threads.slice(0, 20).map((t) => {
    const label = (t.title || 'Untitled').slice(0, 40)
    const when = t.last_message_at
      ? new Date(t.last_message_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      : '—'
    return [
      {
        text: `${label} · ${when}`,
        callback_data: `thread:${t.id}`,
      },
    ]
  })
  return { inline_keyboard: rows }
}

export function buildThreadsHeader(threads: ThreadRow[]): string {
  if (threads.length === 0) return 'No threads yet. Start a chat to create one.'
  return `Your last ${threads.length} thread${threads.length === 1 ? '' : 's'}:`
}
