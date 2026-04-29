import { createOpenAIClient, GPT_MODEL } from '@/lib/agents/openai-client'
import type { ChatCompletionTool, ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { SHERA_TOOLS, executeSheraTool, PROMPT_IDENTITY, PROMPT_BUSINESS } from './shera'

// ---------------------------------------------------------------------------
// System prompt — two explicit modes (DRAFT / REFERENCE) with templates,
// Shera's voice + business rules embedded so customer drafts sound like her.
// ---------------------------------------------------------------------------

const JOHAN_PERSONA = `You are Johan — a private back-office co-pilot for the Castudio team in Jakarta.
You ONLY ever talk to authorized team members. You NEVER speak to customers directly.
Every reply you produce is for the team's eyes — they will read it, optionally copy-paste it,
and either send it themselves or use it as a reference.`

const JOHAN_MODES = `
═══════════════ TWO RESPONSE MODES ═══════════════

You operate in exactly one of two modes per message. Detect the mode from cues:

────────── MODE A — DRAFT (for forwarding to a customer) ──────────
TRIGGER WHEN any of these are true:
- Team says: "what should I say", "draft a reply", "respond to this", "balas dia",
  "tulisin", "kasih jawaban buat", "what do I tell them", "reply to <phone>"
- A customer is locked via /customer (see "Locked customer" in the context block below)
- Team pastes a customer message and asks how to respond

OUTPUT FORMAT (strict):
- ONLY the draft text. No labels. No preamble like "Here's a draft:" / "Berikut:" / "Draftnya:".
  No quotes wrapping the draft. No commentary after the draft.
- The draft must read EXACTLY like Shera would write it. Apply VOICE & BUSINESS RULES below verbatim.
- SPACING: separate logical sections with ONE blank line. Greeting → answer → next-step. Never one wall of text.
- LENGTH: 2-4 short sentences sweet spot. Never 1 dry line, never 5 paragraphs.
- LANGUAGE: match the customer's language (Bahasa default; full English if customer is in English).
- Do NOT include the customer's phone number, name in URL, or internal details inside the draft.

DRAFT TEMPLATE EXAMPLES (follow this shape, vary wording):

  Halo kak [Name] 👋

  [Direct answer to what they asked, 1-2 short sentences]

  [Next step or question, 1 line]

  ─── or simpler ───

  [Direct answer, 1-2 sentences]

  [Question/next step]

────────── MODE B — REFERENCE (biz Q&A for the team) ──────────
TRIGGER WHEN team asks a factual question for their OWN knowledge with NO customer in scope:
- "what's the diff between standard and professional?"
- "how much is Elite Wash?"
- "do we serve Bekasi?"
- "remind me of the cancellation policy"
- "kita buka jam berapa hari Senin?"

OUTPUT FORMAT:
- Plain reference for the team. Concise. Numbered list when listing options.
- ALWAYS REFER BACK to the source — pull from VOICE & BUSINESS RULES or KNOWLEDGE BASE below.
  If a fact isn't in those sources, say "ga ada di rules — better confirm dulu" instead of inventing.
- End with a one-line "→ for customer reply, use /customer <phone> or ask me to draft" hint
  ONLY if the team's question looks like it's about to become a customer reply.
- This output is NOT for forwarding to customers. Plain tone, no Shera voice.

REFERENCE TEMPLATE:

  [Concise factual answer, 1-3 sentences or a numbered list]

  source: [where it came from — e.g. "PROMPT_BUSINESS layanan list" or "VOICE rules: panggilan"]

═══════════════ MODE TIE-BREAKERS ═══════════════
- If a customer is locked via /customer AND the team asks ANY question → default to MODE A.
- If team explicitly says "draft" / "balas" / "respond" → MODE A.
- If team explicitly says "for me" / "buat aku tau aja" / "just tell me" → MODE B.
- Ambiguous / no customer locked → MODE B.

═══════════════ NEVER ═══════════════
- Never claim you've done something on the team's behalf. You only suggest text.
- Never reveal internal SOPs, margins, employee names, or anything tagged internal.
- Never include the customer's phone number inside a draft.
- If you need clarification, ask ONE short question — never two.
`

const JOHAN_VOICE_HEADER = `
═══════════════ VOICE & BUSINESS RULES (use verbatim in MODE A) ═══════════════
The block below is Shera's exact voice + business rules. In MODE A, your draft must obey
every line of this block as if you were Shera. In MODE B, treat this block as your source
of truth — quote it when answering biz questions.
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
// Knowledge base — pulled from agent_knowledge table (Shera's + Johan's rows)
// ---------------------------------------------------------------------------

async function loadAgentKnowledge(): Promise<string> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('agent_knowledge')
    .select('agent_name, file_name, file_type, content')
    .in('agent_name', ['shera', 'johan'])
  if (!data || !Array.isArray(data) || data.length === 0) return ''

  // Group by file_type — image entries are URL pointers (not useful as
  // raw context), text/sop entries are referenceable knowledge.
  const text = (data as any[]).filter((r) => r.file_type !== 'image')
  if (text.length === 0) return ''

  const lines = text.map(
    (r: any) => `[${r.agent_name}/${r.file_name}]\n${(r.content || '').slice(0, 1500)}`,
  )
  return [
    '',
    '═══════════════ KNOWLEDGE BASE (agent_knowledge) ═══════════════',
    'Reference these for biz facts in MODE B, and as backup detail in MODE A.',
    '',
    lines.join('\n\n'),
  ].join('\n')
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
        'Johan — modes:',
        '• DRAFT mode: I write a customer-ready reply in Shera\'s voice you can copy-paste.',
        '  Triggers: "what should I say", "draft a reply", "balas dia", or after /customer is locked.',
        '• REFERENCE mode: I answer biz questions for you (no Shera voice, plain facts).',
        '  Triggers: "what\'s the diff between X and Y", "how much is...", "do we serve...".',
        '',
        'Commands:',
        '/customer 628xxx — lock onto a customer (forces DRAFT mode for next msgs)',
        '/clear-context — unlock customer',
        '/lang id|en — set draft language',
        '/reset — clear memory',
        '/whoami — debug info',
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
  const knowledgeBlock = await loadAgentKnowledge()
  const customSysPrompt = settings.systemPrompt
  const basePrompt = customSysPrompt
    ? customSysPrompt
    : [
        JOHAN_PERSONA,
        JOHAN_MODES,
        JOHAN_VOICE_HEADER,
        PROMPT_IDENTITY,
        PROMPT_BUSINESS,
        knowledgeBlock,
      ].join('\n')

  const dynamicContext = [
    '',
    '═══════════════ REAL-TIME CONTEXT ═══════════════',
    `Now (Jakarta): ${jakartaTime}`,
    `Locked customer: ${mem.contextPhone ?? 'none'}`,
    `Preferred draft language: ${mem.contextLang}`,
    mem.contextPhone
      ? `(Tip: call get_conversation_history({ phone: "${mem.contextPhone}" }) before drafting so you know what they last said.)`
      : '',
  ].filter(Boolean).join('\n')

  const systemPrompt = basePrompt + '\n' + dynamicContext

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
