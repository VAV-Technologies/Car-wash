import { loadPending, markPendingStatus } from './confirmations'

export interface ThreadMetadata {
  context_phone: string | null
  context_lang: 'id' | 'en'
  pendingConfirmedFor?: string | null
}

export interface SlashResult {
  metadataPatch: Partial<ThreadMetadata> | null
  replyText: string
  shouldRunLLM: boolean
  shouldClearMessages?: boolean
  hideUserMessage?: boolean
}

export async function parseSlashCommand(
  text: string,
  metadata: ThreadMetadata,
  threadId: string,
): Promise<SlashResult | null> {
  const trimmed = text.trim()
  if (!trimmed.startsWith('/')) return null

  const [cmdRaw, ...rest] = trimmed.split(/\s+/)
  const cmd = cmdRaw.toLowerCase()
  const arg = rest.join(' ').trim()

  switch (cmd) {
    case '/reset':
      return {
        metadataPatch: { context_phone: null, pendingConfirmedFor: null },
        replyText: 'Reset ✓ — pesan dibersihkan, context customer dihapus.',
        shouldRunLLM: false,
        shouldClearMessages: true,
      }
    case '/customer': {
      const digits = arg.replace(/\D/g, '')
      if (!digits) {
        return { metadataPatch: null, replyText: 'Usage: /customer 6281234567890', shouldRunLLM: false }
      }
      return {
        metadataPatch: { context_phone: digits },
        replyText: `Locked onto ${digits} ✓ — draft / action berikutnya pakai context customer ini.`,
        shouldRunLLM: false,
      }
    }
    case '/clear-context':
      return {
        metadataPatch: { context_phone: null },
        replyText: 'Context customer cleared ✓',
        shouldRunLLM: false,
      }
    case '/lang': {
      const lang = arg.toLowerCase()
      if (lang !== 'id' && lang !== 'en') {
        return { metadataPatch: null, replyText: 'Usage: /lang id atau /lang en', shouldRunLLM: false }
      }
      return {
        metadataPatch: { context_lang: lang },
        replyText: `Lang: ${lang} ✓`,
        shouldRunLLM: false,
      }
    }
    case '/whoami':
      return {
        metadataPatch: null,
        replyText: `Locked customer: ${metadata.context_phone ?? 'none'}\nLang: ${metadata.context_lang}`,
        shouldRunLLM: false,
      }
    case '/confirm': {
      const pendingId = arg.trim()
      if (!pendingId) {
        return {
          metadataPatch: null,
          replyText: 'Usage: /confirm <pending_id>',
          shouldRunLLM: false,
        }
      }
      const pending = await loadPending(pendingId, threadId)
      if (!pending) {
        return {
          metadataPatch: null,
          replyText: 'Confirmation expired or not found.',
          shouldRunLLM: false,
        }
      }
      if (pending.status === 'expired') {
        return {
          metadataPatch: null,
          replyText: 'Confirmation expired (15 minutes max). Ask Johan again.',
          shouldRunLLM: false,
        }
      }
      if (pending.status !== 'pending') {
        return {
          metadataPatch: null,
          replyText: `Already ${pending.status}.`,
          shouldRunLLM: false,
        }
      }
      await markPendingStatus(pendingId, 'confirmed')
      return {
        metadataPatch: { pendingConfirmedFor: pendingId },
        replyText: '',
        shouldRunLLM: true,
        hideUserMessage: true,
      }
    }
    case '/cancel-action': {
      const pendingId = arg.trim()
      if (!pendingId) {
        return {
          metadataPatch: null,
          replyText: 'Usage: /cancel-action <pending_id>',
          shouldRunLLM: false,
        }
      }
      const pending = await loadPending(pendingId, threadId)
      if (!pending) {
        return {
          metadataPatch: null,
          replyText: 'Pending action not found.',
          shouldRunLLM: false,
        }
      }
      if (pending.status === 'pending') {
        await markPendingStatus(pendingId, 'cancelled')
      }
      return {
        metadataPatch: null,
        replyText: 'Cancelled. Nothing was changed.',
        shouldRunLLM: false,
        hideUserMessage: true,
      }
    }
    case '/help':
      return {
        metadataPatch: null,
        replyText: [
          'Johan — three modes:',
          '• DRAFT (MODE A): I write a customer-ready reply in Shera\'s voice. Triggers: "balas dia", "draft a reply", customer locked.',
          '• REFERENCE (MODE B): I answer biz questions for you. Triggers: "what is", "how much", "do we serve".',
          '• ACTION (MODE C): I do things in the system. Triggers: "create / reschedule / cancel / mark / change / reassign". Destructive actions show Yes/No buttons.',
          '',
          'Slash commands:',
          '/customer 628xxx — lock onto a customer',
          '/clear-context — unlock customer',
          '/lang id|en — set draft language',
          '/reset — clear messages in this thread',
          '/whoami — show current lock + lang',
        ].join('\n'),
        shouldRunLLM: false,
      }
    default:
      return {
        metadataPatch: null,
        replyText: `Unknown command: ${cmd}. Try /help.`,
        shouldRunLLM: false,
      }
  }
}
