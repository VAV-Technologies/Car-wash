// Inline keyboard for action confirmations.
// Shown when Johan calls propose_action — the team taps Confirm or Cancel.

export interface InlineKeyboardButton {
  text: string
  callback_data: string
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][]
}

export function buildConfirmKeyboard(pendingId: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: '✓ Confirm', callback_data: `confirm:${pendingId}` },
        { text: '✗ Cancel', callback_data: `cancel:${pendingId}` },
      ],
    ],
  }
}

// Parse the callback_data from a button tap.
export function parseCallbackData(
  data: string,
): { action: 'confirm' | 'cancel' | 'thread'; arg: string } | null {
  const idx = data.indexOf(':')
  if (idx <= 0) return null
  const action = data.slice(0, idx)
  const arg = data.slice(idx + 1)
  if (action !== 'confirm' && action !== 'cancel' && action !== 'thread') return null
  return { action, arg }
}

export function buildConfirmCardText(toolName: string, humanSummary: string): string {
  const escapedTool = toolName.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)
  const escapedSummary = humanSummary.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)
  return `🔔 <b>Confirm action:</b> <code>${escapedTool}</code>\n\n${escapedSummary}`
}
