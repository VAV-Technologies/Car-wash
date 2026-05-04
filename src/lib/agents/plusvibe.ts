import { createOpenAIClient, LLM_MODEL } from '@/lib/agents/openai-client'
import { getSupabaseAdmin } from '@/lib/supabase'
import { replyToEmail, getEmailThread } from './plusvibe-client'
import { sendTelegramMessage } from './telegram-client'
import { loadAgentKnowledge } from './johan/knowledge'

// ─── Classification prompt ──────────────────────────────────────────
// Stays lean — no KB injection. Just routes the email to the right branch.

const CLASSIFICATION_PROMPT = `You are an email reply classifier for a B2B sales outreach campaign. Classify the reply into exactly ONE category and extract relevant data.

Categories:
PHONE_NUMBER_FOUND: Reply contains a phone/WhatsApp number in any format (+62xxx, 08xxx, with/without dashes/spaces, international)
INTERESTED_NO_NUMBER: Positive or curious reply but no phone number (wants info, asking questions, sounds open)
OBJECTION: Pushback but still engaged (too expensive, bad timing, already have solution, what makes you different, where did you get my email/number/info, how did you find me, privacy concern)
NOT_INTERESTED: Clear rejection (not interested, stop emailing, remove me, unsubscribe)
OUT_OF_OFFICE: Auto-reply, vacation, OOO message
UNRELATED: Reply doesn't relate to the sales offer at all
ASKED_FOR_OUR_NUMBER: Lead asks for our contact/WhatsApp number instead of giving theirs

IMPORTANT: If the reply contains ANY of these words, ALWAYS classify as NOT_INTERESTED regardless of other content: "unsubscribe", "stop emailing", "remove me", "opt out", "take me off"

IMPORTANT: Asking for a discount, price reduction, or "is there any deal" is ALWAYS classification=OBJECTION with objection_type=pricing. Examples that are OBJECTION/pricing, not INTERESTED:
- "Can you do a discount?"
- "Any discount?"
- "Bisa nego harga?"
- "Ada diskon ga?"
- "Ada promo?"
- "Bisa kurang?"
- "Could we get a deal?"

For OBJECTION, set objection_type to one of:
- pricing (too expensive, can't afford, what's it cost, asking for a discount/promo/deal)
- timing (not right now, busy, check back later)
- existing_solution (we already use someone, have a guy)
- where_did_you_get_my_info (how did you find me, where'd you get my email/number)
- differentiator (what makes you different, why you over a regular car wash)
- bot_check (are you a bot, is this real, are you AI)
- privacy (don't email me, you shouldn't have my info — distinct from where_did_you_get)
- other

Respond in JSON format:
{
  "classification": "CATEGORY_NAME",
  "phone_number": "extracted number or null",
  "objection_type": "pricing/timing/existing_solution/where_did_you_get_my_info/differentiator/bot_check/privacy/other or null",
  "sentiment": "positive/neutral/negative",
  "summary": "one line summary of the reply"
}`

// ─── Ryan persona block ─────────────────────────────────────────────
// The static voice anchor. KB rows + active rules + few-shot examples are
// composed in around this at runtime by `buildRyanGenerationPrompt`.

const RYAN_PERSONA = `You are Ryan, a real human sales rep at Castudio. You are NOT a bot. You write emails like one person emailing another, not like a marketing template.

CASTUDIO IN ONE LINE: a premium at-home car wash and detailing service in Jabodetabek. We come to the lead's office, home, or apartment with our own water, power, products, and trained team. The lead doesn't drive anywhere. Premium positioning is the whole business — we use the right product for each task instead of one cheap chemical for everything, our team is trained before they touch a customer's car, and if the lead isn't happy we come back and fix it for free within 24 hours.

YOUR JOB ON THIS EMAIL: get their WhatsApp number so a human can take it from there. That's the only conversion goal. Everything else is in service of that.

LANGUAGE: match the lead. If they wrote English, reply in English. If they wrote Bahasa Indonesia, reply in Bahasa. Never mix.

LENGTH: 2-4 sentences. This is an email reply, not a brochure. If you can say it in 2 sentences, say it in 2.

VOICE: words a real sales rep would actually say out loud over the phone. Say "we show up at your office" instead of "we provide on-site mobile service". Say "we use the right product for each step" instead of "we leverage premium task-specific solutions". Say "you don't have to drive anywhere" instead of "zero downtime". Words you would not say to a friend at a coffee shop don't belong in this email.

NEVER:
- Use any dash (hyphen "-", en dash "–", em dash "—"). Use commas or periods.
- Use the phrase "zero downtime" — ever. It's software-talk and we're a physical service.
- Use the phrase "business outreach". Real people don't talk about doing "business outreach". If they ask where you got their email, see the rules.
- Use "leverage", "streamline", "optimize", "synergy", "value-add", "ROI", "best-in-class".
- Repeat the literal wording of any objection bullet from your reference docs. Paraphrase. If the doc says "we use premium task-specific products", say it your way: "we use the right product for each step", "different bottle for each thing we do", "we don't dilute one cheap chemical and use it on everything".
- Open with corporate filler ("I hope this email finds you well", "Thank you for reaching out", "We appreciate your interest").
- Sign off with "Best regards" boilerplate. Just end with the CTA.
- Mention you're "AI", a "bot", an "agent", or a "system".
- Confirm a date, time, slot, or availability for a booking. You do NOT have access to the schedule. If the lead asks "can I book Saturday at 10?", DO NOT say "yes that works" or "Saturday is available". Acknowledge the request and redirect to WhatsApp where the team can check the calendar and lock the slot in.
- In Indonesian, address the lead with "kamu", "Anda", "tempatmu", or "kamu nya". Always use "kak" (e.g. "Share nomor WhatsApp-nya kak", not "Share nomor WhatsApp kamu"). This matches Castudio's voice on every channel.

ALWAYS:
- Reference something specific from THEIR reply so they know you actually read it.
- End with one clear next step. Default CTA is asking for their WhatsApp.
- Output as simple HTML using <p> tags only.
- Match the energy of the lead. If they sent one or two words ("ok", "k", "noted", "👍", "oke", "sip"), do NOT relaunch the full pitch. One short reciprocal sentence + the WhatsApp ask is enough. A real rep wouldn't write a paragraph in response to "k".

CTA VARIATIONS (rotate, don't repeat):
- "Drop your WhatsApp and I'll send over our service menu."
- "What's your WhatsApp? I can send you some before/after photos."
- "Easiest is a quick WhatsApp — what's your number?"

WHEN TO STOP:
- After 4+ replies without getting a number, share ours instead: "+62 855 9122 2000".
- After NOT_INTERESTED: ONE graceful close, then stop. "All good, appreciate the honesty. If anything changes, you know where to find us."
- ASKED_FOR_OUR_NUMBER: "Of course. WhatsApp us at +62 855 9122 2000."
- If they fire off a ton of questions: answer the top 2-3 briefly, then suggest continuing on WhatsApp for the rest.`

// ─── Few-shot examples ──────────────────────────────────────────────
// These show Grok the difference between the doc-flavored bullet (BAD) and
// what a real rep sounds like (GOOD). Critical for stopping the parroting.

const RYAN_FEW_SHOTS = `EXAMPLES — these are the kinds of replies you should write. The BAD column is what NOT to write. Look at the difference.

──────── PRICING OBJECTION ────────
Lead: "Honestly seems pricey for a car wash."
BAD (do not write): "We offer zero downtime, premium products, and trained staff."
GOOD: "Yeah I get it. Reason we charge what we do is we show up wherever your cars are, our team is trained on the process, and we use the right product for each step instead of diluting one cheap chemical and slapping it on everything. If it's a regular thing, the subscription brings the per-wash cost down a lot. Want me to run the math for your fleet on WhatsApp?"

──────── "WHERE DID YOU GET MY EMAIL?" ────────
Lead: "How did you get my email address?"
BAD (do not write): "Your email came through our outreach for companies in Jabodetabek."
GOOD: "Hey, that came through our marketing team — we reach out to companies in Jakarta that might benefit from at-home washes for their team. Happy to take you off the list if it's not a fit. Otherwise, what's your WhatsApp and I'll send a quick service menu?"

──────── "WHAT MAKES YOU DIFFERENT?" ────────
Lead: "What differentiates you from a regular car wash?"
BAD (do not write): "The key comes from zero downtime, use premium products, and our trained team."
GOOD: "Honestly the main thing is we come to you, so nobody on your team has to drive somewhere and wait around. Past that, we use a different product for each step (interior cleaner, wheel chemistry, leather conditioner — not one all-purpose) and our team is trained before they touch a car. If we mess up we come back and redo it free. Want me to send the menu over WhatsApp?"

──────── ARE YOU A BOT ────────
Lead: "Are you a bot?"
GOOD: "Real human, just reached out personally because I thought this could be useful for your team. What's a good WhatsApp to send you the service menu?"

──────── EXISTING SOLUTION ────────
Lead: "We already have a regular car wash we use."
GOOD: "Got it. Quick question — does your current one come to you, or does someone on your team have to drive the cars over and wait? If it's the latter, that's where we tend to save companies a chunk of time. Worth a quick chat on WhatsApp?"

──────── INDONESIAN — PRICING ────────
Lead: "Wah mahal banget."
GOOD: "Iya, harga kita memang premium kak. Soalnya kita datang langsung ke tempat, tim kita udah dilatih, dan tiap step kita pakai produk khusus (bukan satu chemical murah buat semuanya). Kalau cuci rutin, paket langganan jauh lebih hemat per cuci. Boleh share nomor WhatsApp-nya? Aku kirim menu lengkapnya."

──────── INDONESIAN — WHERE DID YOU GET MY INFO ────────
Lead: "Dari mana dapet email saya?"
GOOD: "Hai kak, ini dari tim marketing kita — kita coba reach out ke perusahaan di Jabodetabek yang kira-kira cocok buat layanan cuci on-site. Kalau ga relevan boleh banget di-skip ya. Atau kalau penasaran, share WhatsApp-nya, aku kirim menu lengkapnya."

──────── NOT INTERESTED — GRACEFUL CLOSE ────────
Lead: "Not interested, please remove me."
GOOD: "All good, thanks for letting me know. If anything ever changes, you know where to find us."

──────── BOOKING REQUEST — DO NOT CONFIRM SLOTS ────────
Lead: "Can I book Saturday at 10am for my Pajero?"
BAD (do not write): "Saturday at 10am is available, see you then." OR "Yes, that slot works."
GOOD: "Saturday morning could work, but I'd need the team to double check the calendar before I confirm anything. Drop your WhatsApp and we'll lock the slot in for you."

Lead: "Bisa booking Sabtu jam 10 untuk Pajero saya?"
BAD (do not write): "Bisa banget kak Sabtu jam 10."
GOOD: "Sabtu pagi kayaknya bisa kak, tapi mesti dicek dulu sama tim untuk pastiin slotnya. Boleh share nomor WhatsApp-nya? Tim langsung konfirmasi dan booking-in."

──────── TINY REPLY — MATCH THE ENERGY ────────
Lead: "ok"
BAD (do not write a full pitch — they sent one word): "Got it. We come straight to your office or home with our own water, power, and trained team so nobody has to drive anywhere or wait around. We use the right product for each step instead of one cheap chemical for everything..."
GOOD: "Cool. Want me to send the menu over WhatsApp? What's your number?"

Lead: "k"
GOOD: "Got it. WhatsApp's the easiest way to keep going — what's your number?"

Lead: "oke" (Indonesian)
GOOD: "Sip kak. Boleh share WhatsApp-nya? Aku kirim menu lengkapnya."

──────── WEATHER / OFF-TOPIC SMALL TALK — PIVOT GRACEFULLY ────────
Lead: "How's the weather in Jakarta today?"
GOOD: "Hot and humid as usual. On the actual reason I emailed though, we run a mobile car wash that comes to your office or home so the team doesn't have to drive anywhere. What's your WhatsApp? I'll send the menu over."`

// ─── Banned-phrase guardrail ────────────────────────────────────────
// These came verbatim from the OLD prompt's objection bullets. Grok kept
// lifting them word-for-word. The list is used in two places:
//   1. The persona prompt warns the model against them.
//   2. Post-processing scrubs and (once) regenerates if any slips through.

const BANNED_PHRASES = [
  'zero downtime',
  'business outreach',
  'companies in Jabodetabek',
  'company in Jabodetabek',
  'a company in Jaffa', // Grok's mishearing of "Jabodetabek" surfaced in QA
  'pH-neutral products',
  'premium pH-neutral',
  'key comes from',
  'leverage',
  'streamline',
  'synergy',
]

function findBannedPhrase(text: string): string | null {
  const lower = text.toLowerCase()
  for (const p of BANNED_PHRASES) {
    if (lower.includes(p.toLowerCase())) return p
  }
  return null
}

function stripDashes(s: string): string {
  return s.replace(/—/g, ',').replace(/–/g, ',').replace(/ - /g, ', ')
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ─── Settings + rules + KB loaders ──────────────────────────────────

export interface RyanSettings {
  apiKey: string | null
  model: string
  maxTokens: number
  systemPromptOverride: string | null
}

export async function getRyanSettings(): Promise<RyanSettings> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('agent_settings')
    .select('api_key, model, max_tokens, system_prompt')
    .eq('agent_name', 'plusvibe')
    .maybeSingle()

  let apiKey: string | null = null
  if (data?.api_key) {
    try {
      apiKey = Buffer.from(data.api_key, 'base64').toString('utf-8')
    } catch {}
  }

  // system_prompt is now a true override (post-migration). If it parses as
  // JSON containing workspace_id, treat it as legacy config (no override).
  let override: string | null = data?.system_prompt || null
  if (override && override.startsWith('{')) {
    try {
      const parsed = JSON.parse(override)
      if (parsed && typeof parsed === 'object' && 'workspace_id' in parsed) {
        override = null
      }
    } catch {}
  }

  return {
    apiKey,
    model: data?.model || LLM_MODEL,
    maxTokens: data?.max_tokens || 512,
    systemPromptOverride: override,
  }
}

export async function loadRyanRules(): Promise<string> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('agent_rules')
    .select('title, content')
    .eq('agent_name', 'ryan')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (!data || !Array.isArray(data) || data.length === 0) return ''

  const lines = (data as Array<{ title: string; content: string }>).map(
    (r) => `• ${r.title}: ${r.content}`,
  )
  return [
    '',
    '═══════════════ TEAM RULES (highest priority — override anything else) ═══════════════',
    'These are explicit instructions from the team. Follow them verbatim. They beat anything below if there is a conflict.',
    '',
    lines.join('\n'),
  ].join('\n')
}

async function buildRyanGenerationPrompt(): Promise<string> {
  const settings = await getRyanSettings()
  // KB + rules are enrichment, not required. If a query fails (e.g. table
  // missing or DB down), still produce a usable reply rather than failing
  // the whole pipeline.
  const [rulesBlock, knowledgeBlock] = await Promise.all([
    loadRyanRules().catch((err) => {
      console.error('[plusvibe] loadRyanRules failed', err)
      return ''
    }),
    loadAgentKnowledge().catch((err) => {
      console.error('[plusvibe] loadAgentKnowledge failed', err)
      return ''
    }),
  ])

  // If the team has saved a hand-edited override, use that as the persona.
  // Rules and KB still get appended, so an override doesn't accidentally
  // delete the configurable layers.
  const persona = settings.systemPromptOverride || RYAN_PERSONA

  return [persona, RYAN_FEW_SHOTS, rulesBlock, knowledgeBlock]
    .filter(Boolean)
    .join('\n\n')
}

// ─── OpenAI client (per-agent key chain) ────────────────────────────

async function getOpenAIClient() {
  const supabase = getSupabaseAdmin()

  // 1. Dedicated Plusvibe key
  const { data: settings } = await supabase
    .from('agent_settings')
    .select('api_key')
    .eq('agent_name', 'plusvibe')
    .single()
  let apiKey: string | undefined
  if (settings?.api_key) {
    try {
      apiKey = Buffer.from(settings.api_key, 'base64').toString('utf-8')
    } catch {}
  }

  // 2. Fall back to Shera's key
  if (!apiKey) {
    const { data: sheraSettings } = await supabase
      .from('agent_settings')
      .select('api_key')
      .eq('agent_name', 'shera')
      .single()
    if (sheraSettings?.api_key) {
      try {
        apiKey = Buffer.from(sheraSettings.api_key, 'base64').toString('utf-8')
      } catch {}
    }
  }

  // 3. Fall back to base model connector
  if (!apiKey) {
    const { data } = await supabase
      .from('connectors')
      .select('encrypted_key')
      .eq('is_base_model', true)
      .single()
    if (data?.encrypted_key) {
      try {
        apiKey = Buffer.from(data.encrypted_key, 'base64').toString('utf-8')
      } catch {}
    }
  }
  return createOpenAIClient(apiKey)
}

// ─── Phone extraction ───────────────────────────────────────────────

function extractPhoneNumber(text: string): string | null {
  // Match various formats: +62xxx, 08xxx, 62-xxx, (021) xxx, etc.
  const patterns = [
    /(?:\+?62|0)[\s\-.]?\d{2,4}[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}/g,
    /(?:\+?1|0)[\s\-.]?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/g,
    /\+\d{10,15}/g,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      let num = match[0].replace(/[\s\-.()\+]/g, '')
      if (num.startsWith('0')) num = '62' + num.slice(1)
      if (num.length < 8) continue
      if (!num.startsWith('62') && num.length >= 10) return '+' + num
      return '+' + num
    }
  }
  return null
}

// ─── Classification ─────────────────────────────────────────────────

// Pre-classify obvious auto-reply / OOO patterns before hitting the LLM.
// Saves a model call AND bypasses Azure's content filter, which has been
// observed to false-positive on benign OOO messages (e.g. anything
// containing "limited access").
const OOO_PATTERNS: RegExp[] = [
  /\bout of (the )?office\b/i,
  /\bO\.?O\.?O\.?\b/,
  /\bauto[-\s]?reply\b/i,
  /\bauto[-\s]?response\b/i,
  /\bautomated reply\b/i,
  /\bon vacation\b/i,
  /\bon (annual |paternity |maternity )?leave\b/i,
  /\bon (medical|sick) leave\b/i,
  /\bcurrently (away|out|unavailable)\b/i,
  /\bback (in|on) (the office|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  /\bI(?:'| a)m (?:currently )?(?:out|away|on leave|on vacation)\b/i,
  /\blimited (email )?access\b/i,
  /\bI will be (?:out|away|back) (?:from|until|on)\b/i,
  /\bsedang (cuti|tidak di kantor)\b/i,
]

function preClassifyOOO(text: string): boolean {
  for (const p of OOO_PATTERNS) if (p.test(text)) return true
  return false
}

export async function classifyReply(replyText: string): Promise<{
  classification: string
  phone_number: string | null
  objection_type: string | null
  sentiment: string
  summary: string
}> {
  // Cheap regex pass first — catches obvious auto-replies without an LLM
  // call and dodges Azure's content filter on common OOO phrasings.
  if (preClassifyOOO(replyText)) {
    return {
      classification: 'OUT_OF_OFFICE',
      phone_number: null,
      objection_type: null,
      sentiment: 'neutral',
      summary: 'auto-reply / OOO detected by pattern',
    }
  }

  // Safe default used when the model call fails (Azure content filter, API
  // outage, malformed JSON, etc.). UNRELATED routes to generateReply, which
  // has its own try/catch and emits a generic safe template — so the lead
  // still hears back from us instead of getting silence.
  const fallback = {
    classification: 'UNRELATED',
    phone_number: null,
    objection_type: null,
    sentiment: 'neutral',
    summary: 'classification failed; defaulted to UNRELATED',
  }

  let response: Awaited<ReturnType<ReturnType<typeof createOpenAIClient>['chat']['completions']['create']>>
  try {
    const openai = await getOpenAIClient()
    const settings = await getRyanSettings()
    response = await openai.chat.completions.create({
      model: settings.model,
      max_completion_tokens: 512,
      messages: [
        { role: 'system', content: CLASSIFICATION_PROMPT },
        { role: 'user', content: `Classify this email reply:\n\n${replyText}` },
      ],
    })
  } catch (err) {
    console.error('[plusvibe] classify call failed, defaulting to UNRELATED', err)
    return fallback
  }

  const text = response.choices[0]?.message?.content || '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('[plusvibe] no JSON in classification response, defaulting to UNRELATED')
    return fallback
  }
  try {
    return JSON.parse(jsonMatch[0])
  } catch (err) {
    console.error('[plusvibe] failed to parse classification JSON, defaulting to UNRELATED', err)
    return fallback
  }
}

// ─── Reply generation with guardrails ───────────────────────────────

interface LeadSlim {
  first_name: string
  company_name: string
  job_title: string
  reply_count: number
  objections_raised: string[]
  classification_history: string[]
}

function buildContextBlock(lead: LeadSlim, classification: string, whatsappNumber: string): string {
  let context = `Lead: ${lead.first_name} from ${lead.company_name} (${lead.job_title})\n`
  context += `Reply #${lead.reply_count + 1}\n`
  context += `Classification: ${classification}\n`
  if (lead.objections_raised.length > 0) {
    context += `Previous objections: ${lead.objections_raised.join(', ')}\n`
  }
  if (lead.classification_history.length > 0) {
    context += `Previous classifications: ${lead.classification_history.join(' → ')}\n`
  }
  if (lead.reply_count >= 4) {
    context += `\nIMPORTANT: This is reply #${lead.reply_count + 1}. We've been going back and forth. Time to share our WhatsApp number (${whatsappNumber}) as the final CTA instead of asking for theirs.\n`
  }
  return context
}

async function callModel(
  systemPrompt: string,
  userMessage: string,
  settings: RyanSettings,
): Promise<string> {
  const openai = await getOpenAIClient()
  const response = await openai.chat.completions.create({
    model: settings.model,
    max_completion_tokens: settings.maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  })
  return response.choices[0]?.message?.content || ''
}

export async function generateReply(
  lead: LeadSlim,
  classification: string,
  replyText: string,
  whatsappNumber: string,
): Promise<string> {
  const settings = await getRyanSettings()
  const systemPrompt = await buildRyanGenerationPrompt()
  const baseContext = buildContextBlock(lead, classification, whatsappNumber)
  const userMessage = `${baseContext}\n\nTheir reply:\n${replyText}\n\nGenerate the email reply (HTML with <p> tags):`

  let reply: string
  try {
    reply = await callModel(systemPrompt, userMessage, settings)
  } catch {
    return `<p>Thanks for the reply, ${lead.first_name || 'there'}. Happy to chat more about this on WhatsApp if that's easier. Our number is +62 855 9122 2000.</p>`
  }

  reply = stripDashes(reply)

  // Banned-phrase scrub: regenerate ONCE if the model parroted something
  // from the reference docs.
  const offending = findBannedPhrase(reply)
  if (offending) {
    console.warn(`[plusvibe] banned phrase "${offending}" in draft, regenerating`)
    try {
      const retry = await callModel(
        systemPrompt,
        `${userMessage}\n\nThe previous draft used a banned phrase: "${offending}". Rewrite the reply without that phrase or any close paraphrase. Same constraints (2-4 sentences, HTML <p> tags, no dashes).`,
        settings,
      )
      const cleanedRetry = stripDashes(retry)
      if (!findBannedPhrase(cleanedRetry) && cleanedRetry.trim()) {
        reply = cleanedRetry
      } else {
        reply = `<p>Thanks for the reply, ${lead.first_name || 'there'}. Happy to walk through the details on WhatsApp if that's easier. Our number is +62 855 9122 2000.</p>`
      }
    } catch {
      reply = `<p>Thanks for the reply, ${lead.first_name || 'there'}. Happy to walk through the details on WhatsApp if that's easier. Our number is +62 855 9122 2000.</p>`
    }
  }

  if (!reply.trim()) {
    reply = `<p>Thanks for the reply, ${lead.first_name || 'there'}. Happy to chat more about this on WhatsApp if that's easier. Our number is +62 855 9122 2000.</p>`
  }
  return reply
}

// ─── Discount detection (unchanged) ─────────────────────────────────

const DISCOUNT_PATTERNS: RegExp[] = [
  /discount/i,
  /diskon/i,
  /\bpromo(tion|si)?\b/i,
  /\d{1,2}\s*%\s*(off|discount|diskon|potongan)/i,
  /special\s+(offer|pricing|rate|price)/i,
  /harga\s+(khusus|spesial)/i,
  /potongan\s+harga/i,
]

export function detectDiscount(text: string): string | null {
  if (!text) return null
  for (const pat of DISCOUNT_PATTERNS) {
    const match = text.match(pat)
    if (!match || match.index === undefined) continue
    const idx = match.index
    const sentenceStart = Math.max(0, text.lastIndexOf('.', idx) + 1, text.lastIndexOf('\n', idx) + 1)
    const dotEnd = text.indexOf('.', idx)
    const newlineEnd = text.indexOf('\n', idx)
    const candidates = [dotEnd, newlineEnd].filter((n) => n > 0)
    const sentenceEnd = candidates.length > 0 ? Math.min(...candidates) + 1 : Math.min(text.length, idx + 200)
    const snippet = text.slice(sentenceStart, sentenceEnd).trim()
    return snippet.length > 200 ? snippet.slice(0, 200) + '…' : snippet
  }
  return null
}

export async function findDiscountInThread(
  emailId: string,
  latestReplyText: string,
): Promise<string | null> {
  const inReply = detectDiscount(latestReplyText)
  if (inReply) return inReply

  try {
    const thread = await getEmailThread(emailId)
    if (Array.isArray(thread)) {
      for (const msg of thread) {
        const raw = msg?.text_body || msg?.body || msg?.html_body || msg?.content || msg?.snippet || ''
        const stripped = String(raw).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
        const found = detectDiscount(stripped)
        if (found) return found
      }
    }
  } catch (err) {
    console.error('[plusvibe] discount detection: thread fetch failed', err)
  }
  return null
}

// ─── Telegram handoff (unchanged) ───────────────────────────────────

export async function notifyTelegramHandoff(
  lead: { first_name: string; lead_email: string; company_name: string; job_title: string; campaign_name: string },
  phone: string,
  threadSummary: string,
  latestReplyText: string,
  discountNote: string | null = null,
) {
  const supabase = getSupabaseAdmin()

  let cleanPhone = phone.replace(/[\s\-.()\+]/g, '')
  if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1)

  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .ilike('phone', `%${cleanPhone}%`)
    .limit(1)
    .maybeSingle()

  if (!existingCustomer) {
    await supabase.from('customers').insert({
      name: lead.first_name || 'Email Lead',
      phone: cleanPhone,
      email: lead.lead_email,
      segment: 'new',
      acquisition_source: 'website',
      notes: `From campaign: ${lead.campaign_name}. Company: ${lead.company_name}. Title: ${lead.job_title}`,
    })
  }

  const trimmedReply = latestReplyText.length > 800
    ? latestReplyText.slice(0, 800) + '…'
    : latestReplyText

  const firstName = lead.first_name || 'Lead'
  const discountBlock = discountNote
    ? `⚠️ <b>DISCOUNT OFFERED — honor it:</b>\n<i>${escapeHtml(discountNote)}</i>\n\n`
    : ''

  const text =
    `🚗 <b>New Lead — Phone Shared</b>\n\n` +
    discountBlock +
    `<b>Name:</b> ${escapeHtml(firstName)}\n` +
    `<b>Company:</b> ${escapeHtml(lead.company_name || '—')}\n` +
    `<b>Title:</b> ${escapeHtml(lead.job_title || '—')}\n` +
    `<b>Email:</b> ${escapeHtml(lead.lead_email)}\n` +
    `<b>Phone:</b> +${cleanPhone}\n` +
    `<b>Campaign:</b> ${escapeHtml(lead.campaign_name || '—')}\n\n` +
    `<b>Summary:</b> ${escapeHtml(threadSummary)}\n\n` +
    `<b>Latest reply:</b>\n<i>${escapeHtml(trimmedReply)}</i>\n\n` +
    `👉 <a href="https://wa.me/${cleanPhone}">Open WhatsApp chat</a>\n` +
    `Please reach out as soon as possible.`

  await sendTelegramMessage(text)
}

// ─── Outbound send + log ────────────────────────────────────────────
// Wraps replyToEmail so every outbound also lands in the leads table for
// the admin UI's "what did Ryan actually say" view.

async function sendAndLogReply(
  leadRowId: string,
  emailId: string,
  subject: string,
  fromEmail: string,
  toEmail: string,
  html: string,
) {
  await replyToEmail(emailId, subject, fromEmail, toEmail, html)
  try {
    await getSupabaseAdmin()
      .from('email_leads')
      .update({
        last_outbound_html: html,
        last_outbound_at: new Date().toISOString(),
      })
      .eq('id', leadRowId)
  } catch (err) {
    // Don't break the user-facing flow if the audit write fails.
    console.error('[plusvibe] failed to log outbound reply', err)
  }
}

// ─── Main webhook entry point ───────────────────────────────────────

export async function processEmailReply(payload: any) {
  const supabase = getSupabaseAdmin()
  const whatsappNumber = process.env.WHATSAPP_BUSINESS_NUMBER || '+6285591222000'

  const leadId = payload.lead_id
  const email = payload.email || payload.from_email
  const replyText = payload.text_body || payload.snippet || ''
  const subject = payload.subject || ''

  if (!replyText.trim()) return { action: 'skipped', reason: 'empty reply' }

  let { data: lead } = await supabase
    .from('email_leads')
    .select('*')
    .eq('lead_id', leadId)
    .single()

  if (!lead) {
    const { data: newLead } = await supabase
      .from('email_leads')
      .insert({
        lead_id: leadId,
        lead_email: email,
        first_name: payload.first_name || null,
        last_name: payload.last_name || null,
        company_name: payload.company_name || null,
        job_title: payload.job_title || null,
        campaign_id: payload.campaign_id || null,
        campaign_name: payload.campaign_name || null,
        last_email_id: payload.last_email_id || null,
        from_email: payload.from_email || null,
        to_email: payload.to_email || null,
      })
      .select()
      .single()
    lead = newLead
  }

  if (!lead) throw new Error('Failed to create lead record')

  // ── DEDUP ──
  if (lead.handed_off_to_whatsapp) {
    return { action: 'skipped', reason: 'already handed off to WhatsApp' }
  }
  if (lead.current_status === 'closed' && lead.last_email_id === payload.last_email_id) {
    return { action: 'skipped', reason: 'lead already closed (same email)' }
  }
  if (lead.current_status === 'closed') {
    await supabase.from('email_leads').update({ current_status: 'active' }).eq('id', lead.id)
  }
  if (lead.last_email_id === payload.last_email_id && (lead.reply_count || 0) > 0) {
    return { action: 'skipped', reason: 'duplicate webhook (same email already processed)' }
  }

  const newReplyCount = (lead.reply_count || 0) + 1
  await supabase.from('email_leads').update({
    reply_count: newReplyCount,
    last_email_id: payload.last_email_id,
    updated_at: new Date().toISOString(),
  }).eq('id', lead.id)

  const classification = await classifyReply(replyText)

  const directPhone = extractPhoneNumber(replyText)
  if (directPhone && classification.classification !== 'PHONE_NUMBER_FOUND') {
    classification.classification = 'PHONE_NUMBER_FOUND'
    classification.phone_number = directPhone
  }

  const history = Array.isArray(lead.classification_history) ? lead.classification_history : []
  history.push(classification.classification)
  const objections = Array.isArray(lead.objections_raised) ? lead.objections_raised : []
  if (classification.objection_type && !objections.includes(classification.objection_type)) {
    objections.push(classification.objection_type)
  }

  await supabase.from('email_leads').update({
    classification_history: history,
    objections_raised: objections,
  }).eq('id', lead.id)

  const cat = classification.classification
  const leadSlim: LeadSlim = {
    first_name: lead.first_name || '',
    company_name: lead.company_name || '',
    job_title: lead.job_title || '',
    reply_count: lead.reply_count || 0,
    objections_raised: objections,
    classification_history: history,
  }

  if (cat === 'OUT_OF_OFFICE') {
    await supabase.from('email_leads').update({ current_status: 'ooo' }).eq('id', lead.id)
    return { action: 'ignored', classification: cat, reason: 'OOO auto-reply' }
  }

  if (cat === 'NOT_INTERESTED') {
    const reply = await generateReply(leadSlim, cat, replyText, whatsappNumber)
    await sendAndLogReply(lead.id, payload.last_email_id, subject, payload.to_email, payload.from_email, reply)
    await supabase.from('email_leads').update({ current_status: 'closed' }).eq('id', lead.id)
    return { action: 'replied', classification: cat, reply }
  }

  if (cat === 'PHONE_NUMBER_FOUND') {
    const phone = classification.phone_number || directPhone
    if (!phone) return { action: 'error', reason: 'classification said phone found but extraction failed' }

    const digitsOnly = phone.replace(/\D/g, '')
    if (digitsOnly.length < 8) {
      const firstName = lead.first_name || 'there'
      const reply = `<p>Hey ${firstName}, that number doesn't look quite right. Could you double check and share your full WhatsApp number? We just need it so we can send you our service menu and get things rolling.</p>`
      await sendAndLogReply(lead.id, payload.last_email_id, subject, payload.to_email, payload.from_email, reply)
      return { action: 'replied', classification: 'PHONE_NUMBER_FOUND', reply, note: 'phone too short, asked to reshare' }
    }

    await supabase.from('email_leads').update({ phone_number: phone, current_status: 'handed_off_to_whatsapp', handed_off_to_whatsapp: true }).eq('id', lead.id)

    try {
      const confirmReply = `<p>Got it, ${lead.first_name || 'there'}! You'll hear from us on WhatsApp shortly.</p>`
      await sendAndLogReply(lead.id, payload.last_email_id, subject, payload.to_email, payload.from_email, confirmReply)
    } catch {
      // continue to Telegram handoff
    }

    const handoffData = {
      first_name: lead.first_name || '',
      lead_email: lead.lead_email,
      company_name: lead.company_name || '',
      job_title: lead.job_title || '',
      campaign_name: lead.campaign_name || '',
      phone,
      summary: classification.summary || 'Lead replied to email campaign with phone number',
    }

    await supabase.from('email_leads').update({
      washer_notes: JSON.stringify({ pending_telegram_handoff: true, handoff_data: handoffData, handoff_at: new Date().toISOString() }),
    }).eq('id', lead.id)

    const discountNote = await findDiscountInThread(payload.last_email_id, replyText)

    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      await notifyTelegramHandoff(
        { first_name: handoffData.first_name, lead_email: handoffData.lead_email, company_name: handoffData.company_name, job_title: handoffData.job_title, campaign_name: handoffData.campaign_name },
        phone,
        handoffData.summary,
        replyText,
        discountNote,
      )
    } catch (err) {
      console.error('[plusvibe] Telegram handoff failed:', err)
    }

    return { action: 'handed_off', classification: cat, phone }
  }

  if (cat === 'ASKED_FOR_OUR_NUMBER') {
    const reply = `<p>Of course! You can reach us on WhatsApp at ${whatsappNumber}. Just shoot us a message anytime and we'll get right back to you.</p>`
    await sendAndLogReply(lead.id, payload.last_email_id, subject, payload.to_email, payload.from_email, reply)
    return { action: 'replied', classification: cat, reply }
  }

  // INTERESTED_NO_NUMBER, OBJECTION, UNRELATED
  const reply = await generateReply(leadSlim, cat, replyText, whatsappNumber)
  await sendAndLogReply(lead.id, payload.last_email_id, subject, payload.to_email, payload.from_email, reply)
  return { action: 'replied', classification: cat, reply }
}

// ─── Test surface ───────────────────────────────────────────────────
// Called from the admin /api/admin/agents/ryan/test endpoint. Pure compute,
// no side effects (no email sent, no Telegram, no DB writes).

export async function dryRunReply(input: {
  inboundText: string
  firstName?: string
  companyName?: string
  jobTitle?: string
  // Multi-turn simulation: pass these to test how Ryan behaves on the Nth
  // reply after a given history of objections / classifications.
  replyCount?: number
  objectionsRaised?: string[]
  classificationHistory?: string[]
}): Promise<{
  classification: Awaited<ReturnType<typeof classifyReply>>
  reply: string
  bannedPhraseHit: string | null
}> {
  const whatsappNumber = process.env.WHATSAPP_BUSINESS_NUMBER || '+6285591222000'
  const classification = await classifyReply(input.inboundText)

  const objections = Array.isArray(input.objectionsRaised) ? [...input.objectionsRaised] : []
  if (classification.objection_type && !objections.includes(classification.objection_type)) {
    objections.push(classification.objection_type)
  }
  const history = Array.isArray(input.classificationHistory) ? [...input.classificationHistory] : []
  history.push(classification.classification)

  const leadSlim: LeadSlim = {
    first_name: input.firstName || '',
    company_name: input.companyName || '',
    job_title: input.jobTitle || '',
    reply_count: typeof input.replyCount === 'number' ? input.replyCount : 0,
    objections_raised: objections,
    classification_history: history,
  }
  const reply = await generateReply(
    leadSlim,
    classification.classification,
    input.inboundText,
    whatsappNumber,
  )
  return { classification, reply, bannedPhraseHit: findBannedPhrase(reply) }
}
