import { createOpenAIClient, GPT_MODEL } from '@/lib/agents/openai-client'
import type { ChatCompletionTool, ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { SHERA_TOOLS, executeSheraTool } from './shera'

// ---------------------------------------------------------------------------
// System prompt — strict copy-paste-only output
// ---------------------------------------------------------------------------

const JOHAN_SYSTEM_PROMPT = `You are Johan — a private back-office assistant for the Castudio team in Jakarta.
You help the team draft WhatsApp replies to customers. You NEVER speak to customers directly.

OUTPUT RULES (non-negotiable):
- Output is the draft message ONLY. No preamble like "Here's a draft:", no quotes, no commentary, no labels.
- Default language: Bahasa Indonesia, casual-professional, "kak", emoji-light.
- Match Castudio's voice: warm, calm, never pushy.
- Keep drafts 1–4 short sentences. WhatsApp is not email.
- If the team asks a knowledge question (no customer involved), answer concisely as their reference.

WHEN UNSURE:
- Ask ONE short clarifying question. Never two.
- If a customer phone or name is mentioned, use search_customer + get_customer_bookings + get_conversation_history before drafting.
- If you need the customer's number: ask "Customer phone?"
- If you need to know what the customer said: ask "What did they send?"

CASTUDIO BUSINESS:
- Premium mobile car wash and detailing in Jabodetabek, Indonesia.
- Services: standard wash, professional wash, detailing, subscriptions.
- Washers come to the customer's location.

NEVER:
- Never claim you've done something for the team. You only suggest text.
- Never include the customer's phone number in the draft.
- Never reveal internal info (margins, employee names, SOPs).
`

// ---------------------------------------------------------------------------
// Tools — read-only subset of Shera's tools + one Johan-specific tool
// ---------------------------------------------------------------------------

const READ_ONLY_TOOL_NAMES = new Set([
  'search_customer',
  'get_customer_bookings',
  'check_date_availability',
  'get_completed_jobs',
  'get_booking_link_status',
])

const JOHAN_TOOLS: ChatCompletionTool[] = [
  ...SHERA_TOOLS.filter((t) => t.type === 'function' && READ_ONLY_TOOL_NAMES.has(t.function.name)),
  {
    type: 'function',
    function: {
      name: 'get_conversation_history',
      description: "Read the recent WhatsApp conversation history with a specific customer. Use this BEFORE drafting any reply when the team mentions a customer phone number, so you understand the open thread.",
      parameters: {
        type: 'object',
        properties: {
          phone: { type: 'string', description: 'Customer phone number, digits only or with country code' },
          limit: { type: 'number', description: 'Max messages to return (default 20)' },
        },
        required: ['phone'],
      },
    },
  },
]

async function executeJohanTool(name: string, input: Record<string, unknown>): Promise<string> {
  if (name === 'get_conversation_history') {
    const supabase = getSupabaseAdmin()
    const phoneInput = String(input.phone || '').replace(/\D/g, '')
    const limit = Number(input.limit ?? 20)
    if (!phoneInput) return JSON.stringify({ error: 'phone required' })

    const { data } = await supabase
      .from('whatsapp_conversations')
      .select('chat_id, phone, messages, last_message_at')
      .or(`chat_id.ilike.%${phoneInput}%,phone.ilike.%${phoneInput}%`)
      .order('last_message_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!data) return JSON.stringify({ found: false, phone: phoneInput })
    const all = Array.isArray(data.messages) ? data.messages : []
    const tail = all.slice(-limit).map((m: any) => ({
      role: m.role,
      content: String(m.content || '').slice(0, 800),
      timestamp: m.timestamp,
    }))
    return JSON.stringify({
      found: true,
      chat_id: data.chat_id,
      phone: data.phone,
      total_messages: all.length,
      messages: tail,
    })
  }
  // Delegate read tools to Shera's executor (state=undefined skips state gating)
  return executeSheraTool(name, input, undefined, undefined)
}

// ---------------------------------------------------------------------------
// Settings + OpenAI client (mirrors Shera's chain)
// ---------------------------------------------------------------------------

async function getJohanSettings() {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('agent_settings')
    .select('api_key, model, max_tokens, system_prompt')
    .eq('agent_name', 'johan')
    .maybeSingle()

  let apiKey: string | null = null
  if (data?.api_key) {
    try { apiKey = Buffer.from(data.api_key, 'base64').toString('utf-8') } catch {}
  }
  return {
    apiKey,
    model: data?.model || GPT_MODEL,
    maxTokens: data?.max_tokens || 1024,
    systemPrompt: data?.system_prompt || null,
  }
}

async function getJohanOpenAIClient() {
  const settings = await getJohanSettings()
  if (settings.apiKey) return createOpenAIClient(settings.apiKey)

  const admin = getSupabaseAdmin()
  const { data } = await admin
    .from('connectors')
    .select('encrypted_key')
    .eq('is_base_model', true)
    .maybeSingle()
  let apiKey: string | undefined
  if (data?.encrypted_key) {
    try { apiKey = Buffer.from(data.encrypted_key, 'base64').toString('utf-8') } catch {}
  }
  return createOpenAIClient(apiKey)
}

// ---------------------------------------------------------------------------
// Memory
// ---------------------------------------------------------------------------

interface JohanMemory {
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp?: string }>
  contextPhone: string | null
  contextLang: string
  userChatId: string | null
}

async function loadJohanMemory(userPhone: string): Promise<JohanMemory> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('johan_conversations')
    .select('messages, context_phone, context_lang, user_chat_id')
    .eq('user_phone', userPhone)
    .maybeSingle()

  return {
    messages: Array.isArray(data?.messages) ? (data!.messages as JohanMemory['messages']).slice(-30) : [],
    contextPhone: data?.context_phone ?? null,
    contextLang: data?.context_lang ?? 'id',
    userChatId: data?.user_chat_id ?? null,
  }
}

async function saveJohanMemory(
  userPhone: string,
  userChatId: string,
  messages: JohanMemory['messages'],
  contextPhone: string | null,
  contextLang: string,
) {
  const supabase = getSupabaseAdmin()
  const trimmed = messages.slice(-30)
  const { data: existing } = await supabase
    .from('johan_conversations')
    .select('id')
    .eq('user_phone', userPhone)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('johan_conversations')
      .update({
        user_chat_id: userChatId,
        messages: trimmed,
        context_phone: contextPhone,
        context_lang: contextLang,
        last_message_at: new Date().toISOString(),
      })
      .eq('user_phone', userPhone)
  } else {
    await supabase
      .from('johan_conversations')
      .insert({
        user_phone: userPhone,
        user_chat_id: userChatId,
        messages: trimmed,
        context_phone: contextPhone,
        context_lang: contextLang,
        last_message_at: new Date().toISOString(),
      })
  }
}

// ---------------------------------------------------------------------------
// Slash commands
// ---------------------------------------------------------------------------

async function handleSlashCommand(
  userPhone: string,
  userChatId: string,
  text: string,
): Promise<string | null> {
  const trimmed = text.trim()
  if (!trimmed.startsWith('/')) return null

  const [cmdRaw, ...rest] = trimmed.split(/\s+/)
  const cmd = cmdRaw.toLowerCase()
  const arg = rest.join(' ').trim()
  const mem = await loadJohanMemory(userPhone)

  switch (cmd) {
    case '/reset': {
      await saveJohanMemory(userPhone, userChatId, [], null, mem.contextLang)
      return 'Reset ✓ — memori dibersihkan, context customer dihapus.'
    }
    case '/customer': {
      const digits = arg.replace(/\D/g, '')
      if (!digits) return 'Usage: /customer 6281234567890'
      await saveJohanMemory(userPhone, userChatId, mem.messages, digits, mem.contextLang)
      return `Locked onto ${digits} ✓ — draft berikutnya pakai context customer ini.`
    }
    case '/clear-context': {
      await saveJohanMemory(userPhone, userChatId, mem.messages, null, mem.contextLang)
      return 'Context customer cleared ✓'
    }
    case '/lang': {
      const lang = arg.toLowerCase()
      if (lang !== 'id' && lang !== 'en') return 'Usage: /lang id atau /lang en'
      await saveJohanMemory(userPhone, userChatId, mem.messages, mem.contextPhone, lang)
      return `Lang: ${lang} ✓`
    }
    case '/whoami': {
      return `User: ${userPhone}\nMemory: ${mem.messages.length} msg\nLocked customer: ${mem.contextPhone ?? 'none'}\nLang: ${mem.contextLang}`
    }
    case '/help': {
      return [
        'Johan commands:',
        '/customer 628xxx — lock onto a customer',
        '/clear-context — unlock customer',
        '/lang id|en — set draft language',
        '/reset — clear memory',
        '/whoami — debug info',
        '',
        'Ask anything else and I\'ll draft a reply you can copy-paste.',
      ].join('\n')
    }
    default:
      return `Unknown command: ${cmd}. Try /help.`
  }
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

export async function processJohanMessage(
  chatId: string,
  phone: string,
  messageText: string,
): Promise<string> {
  const userPhone = phone.replace(/\D/g, '')

  // Slash command short-circuit (no LLM cost)
  const slash = await handleSlashCommand(userPhone, chatId, messageText)
  if (slash !== null) return slash

  const mem = await loadJohanMemory(userPhone)

  // Build dynamic context block
  const now = new Date()
  const jakartaTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(now)

  const settings = await getJohanSettings()
  const customSysPrompt = settings.systemPrompt || JOHAN_SYSTEM_PROMPT
  const dynamicContext = [
    '',
    '--- Real-time context ---',
    `Now (Jakarta): ${jakartaTime}`,
    `Locked customer: ${mem.contextPhone ?? 'none'}`,
    `Preferred draft language: ${mem.contextLang}`,
    mem.contextPhone
      ? `(Tip: call get_conversation_history({ phone: "${mem.contextPhone}" }) to see the open thread before drafting.)`
      : '',
  ].filter(Boolean).join('\n')

  const systemPrompt = customSysPrompt + '\n' + dynamicContext

  const allMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...mem.messages.map((m) => ({ role: m.role, content: m.content }) as ChatCompletionMessageParam),
    { role: 'user', content: messageText },
  ]

  const openai = await getJohanOpenAIClient()
  const LLM_TIMEOUT = 90000

  let response = await openai.chat.completions.create({
    model: settings.model,
    max_completion_tokens: settings.maxTokens,
    tools: JOHAN_TOOLS,
    messages: allMessages,
  }, { timeout: LLM_TIMEOUT })

  // Tool-use loop (max 5 iterations)
  let iterations = 0
  while (response.choices[0]?.finish_reason === 'tool_calls' && iterations < 5) {
    iterations++
    const assistantMsg = response.choices[0].message
    allMessages.push(assistantMsg)

    const toolCalls = assistantMsg.tool_calls || []
    const toolResults = await Promise.all(
      toolCalls.map(async (tc: any) => {
        let input: Record<string, unknown> = {}
        try { input = JSON.parse(tc.function.arguments || '{}') } catch {}
        const result = await executeJohanTool(tc.function.name, input)
        return {
          role: 'tool' as const,
          tool_call_id: tc.id,
          content: result,
        }
      }),
    )
    allMessages.push(...toolResults)

    response = await openai.chat.completions.create({
      model: settings.model,
      max_completion_tokens: settings.maxTokens,
      tools: JOHAN_TOOLS,
      messages: allMessages,
    }, { timeout: LLM_TIMEOUT })
  }

  let reply = response.choices[0]?.message?.content?.trim() || 'Aku belum kebayang draftnya — kasih konteks lebih?'

  // Strip a few common LLM preambles in case the prompt slips
  reply = reply
    .replace(/^(here(?:'s| is)|berikut|draftnya?:?)\s*[:\-]\s*/i, '')
    .replace(/^["']|["']$/g, '')
    .trim()

  // Save memory
  const newMessages = [
    ...mem.messages,
    { role: 'user' as const, content: messageText, timestamp: new Date().toISOString() },
    { role: 'assistant' as const, content: reply, timestamp: new Date().toISOString() },
  ]
  await saveJohanMemory(userPhone, chatId, newMessages, mem.contextPhone, mem.contextLang)

  return reply
}
