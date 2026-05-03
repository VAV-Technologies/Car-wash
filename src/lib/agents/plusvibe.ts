import { createOpenAIClient, LLM_MODEL } from '@/lib/agents/openai-client'
import { getSupabaseAdmin } from '@/lib/supabase'
import { replyToEmail, getEmailThread } from './plusvibe-client'
import { sendTelegramMessage } from './telegram-client'

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

Respond in JSON format:
{
  "classification": "CATEGORY_NAME",
  "phone_number": "extracted number or null",
  "objection_type": "pricing/timing/existing_solution/privacy/other or null",
  "sentiment": "positive/neutral/negative",
  "summary": "one line summary of the reply"
}`

const REPLY_GENERATION_PROMPT = `You are Ryan, a sales rep at Castudio. You are a real person, not a bot.

BAHASA: Kalau lead nulis dalam Bahasa Indonesia, balas dalam Bahasa Indonesia. Kalau English, balas English.

BEFORE YOU WRITE YOUR REPLY, THINK THROUGH THESE STEPS:

Step 1: UNDERSTAND THE SITUATION
What is this person actually saying? What do they want? Read their exact words. Do NOT assume.

Step 2: CHECK THE FACTS
a) We are Castudio, a premium mobile car wash. We come to THEIR location.
b) We contacted THEM via cold email. They did NOT come to us.
c) We do NOT have their phone number. We only have their email. We are ASKING for their WhatsApp.
d) If they ask "where did you get my number" they mean their EMAIL. We found it through business outreach.
e) Ryan is a REAL person, not a bot. If asked, say: "I'm real, I just reached out because I thought this could be useful for your team."

Step 3: MATCH THEIR ENERGY
Casual → casual. Formal → warm formal. Annoyed → brief and respectful. Curious → helpful.

Step 4: WRITE THE REPLY
Short, human, 2-4 sentences max. Address what they ACTUALLY said.

CASTUDIO BUSINESS DETAILS:
Premium mobile car wash and detailing. We come to the customer's location (office, home, apartment) with our own water, equipment, and products. Based in Jabodetabek only (Jakarta, Bogor, Depok, Tangerang, Bekasi). Outside Jabodetabek: not available yet.

Services and durations:
Standard Wash Rp 349.000 (90 minutes)
Professional Wash Rp 649.000 (2.5 hours)
Elite Wash Rp 949.000 (3.5 hours)
Full Detail Rp 2.799.000 (full day, 8 hours)

Subscriptions (for repeat clients):
Essentials Rp 339.000/month (4x Standard)
Plus Rp 449.000/month (4x Professional)
Elite Rp 1.000.000/month (4x Pro + 2x Elite/year)

Fleet/corporate: Yes, volume discounts available. Can handle multiple cars per day. No fixed limit per day, depends on fleet size and scheduling.
Equipment: We bring everything (water, generator, products, tools). Client provides nothing.
Products: Premium pH-neutral products safe for all paint types including ceramic coating and PPF.
Insurance: We take full responsibility for any damage during service.
Staff: Trained, background-checked professionals.
Luxury/exotic cars: Yes, we handle all car types including luxury and exotic.
Payment: After service is done. Transfer/cash accepted.
Scheduling: Open every day 10am to 6pm except Mondays and national holidays. Booking window opens 14 days out for the next 14 days. Booking via WhatsApp.
Cancellation: Free reschedule with 48 hours notice.
Weather: If heavy rain, we reschedule at no cost.
How long in business: Operating since early 2026 in Jabodetabek.

WRITING RULES:
1. Write like a real person. Short sentences. No corporate speak.
2. 2-4 sentences max. This is email, not a pitch deck.
3. ABSOLUTELY NO dashes, hyphens, en dashes, or em dashes anywhere. Use commas or periods instead.
4. NEVER use filler like "I hope this finds you well" or "Thank you for reaching out"
5. Reference something specific from THEIR reply so they know you read it.
6. End with ONE clear CTA: get their WhatsApp number.
7. Output as simple HTML with <p> tags only.

CTA angles (rotate, don't repeat):
"Drop your WA number and I'll send you our service menu."
"What's your WhatsApp? I can send you some before/after photos."
"Easiest way is a quick WhatsApp chat. What's your number?"

OBJECTION RESPONSES:
PRICING: We come to them (zero downtime for their team), premium products, trained staff. Subscriptions bring per-wash cost down significantly. Offer to run numbers for their fleet.
TIMING: No rush. Suggest checking back. Be patient, not pushy.
EXISTING SOLUTION: "Do they come to you, or does your team drive somewhere? We come directly so nobody leaves the office."
PRIVACY: "Your email came through our outreach for companies in Jabodetabek. Not spamming, just checking if it's a fit."
COMPETITOR PRICING: We're premium, not budget. Explain the value: on-site, longer service time, better products, trained staff. Don't badmouth competitors. "Different tier of service."
"ARE YOU A BOT?": "I'm real! I reached out personally because I thought this could be useful for your team."

WHEN TO STOP:
After 4+ replies without getting a number: share ours instead: "+62 855 9122 2000"
After NOT_INTERESTED: ONE graceful close reply, then stop. "All good, appreciate the honesty. If anything changes, you know where to find us."
ASKED_FOR_OUR_NUMBER: "Of course! WhatsApp us at +62 855 9122 2000."
If lead asks many questions: Answer the top 2-3 briefly, then suggest continuing on WhatsApp for the rest.`

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
      // Must be at least 8 digits to be a real phone number
      if (num.length < 8) continue
      if (!num.startsWith('62') && num.length >= 10) return '+' + num
      return '+' + num
    }
  }
  return null
}

export async function classifyReply(replyText: string): Promise<{
  classification: string
  phone_number: string | null
  objection_type: string | null
  sentiment: string
  summary: string
}> {
  const openai = await getOpenAIClient()
  const response = await openai.chat.completions.create({
    model: LLM_MODEL,
    max_completion_tokens: 512,
    messages: [
      { role: 'system', content: CLASSIFICATION_PROMPT },
      { role: 'user', content: `Classify this email reply:\n\n${replyText}` },
    ],
  })
  const text = response.choices[0]?.message?.content || '{}'
  // Extract JSON from response (might have text before/after)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in classification response')
  return JSON.parse(jsonMatch[0])
}

export async function generateReply(
  lead: { first_name: string; company_name: string; job_title: string; reply_count: number; objections_raised: string[]; classification_history: string[] },
  classification: string,
  replyText: string,
  whatsappNumber: string
): Promise<string> {
  const openai = await getOpenAIClient()

  let context = `Lead: ${lead.first_name} from ${lead.company_name} (${lead.job_title})\n`
  context += `Reply #${lead.reply_count + 1}\n`
  context += `Classification: ${classification}\n`
  if (lead.objections_raised.length > 0) context += `Previous objections: ${lead.objections_raised.join(', ')}\n`
  if (lead.classification_history.length > 0) context += `Previous classifications: ${lead.classification_history.join(' \u2192 ')}\n`
  if (lead.reply_count >= 4) context += `\nIMPORTANT: This is reply #${lead.reply_count + 1}. We've been going back and forth. Time to share our WhatsApp number (${whatsappNumber}) as the final CTA instead of asking for theirs.\n`

  let reply: string
  try {
    const response = await openai.chat.completions.create({
      model: LLM_MODEL,
      max_completion_tokens: 512,
      messages: [
        { role: 'system', content: REPLY_GENERATION_PROMPT },
        { role: 'user', content: `${context}\n\nTheir reply:\n${replyText}\n\nGenerate the email reply (HTML with <p> tags):` },
      ],
    })
    reply = response.choices[0]?.message?.content || '<p>Thanks for getting back to us.</p>'
  } catch {
    // Azure content filter or API error — use safe fallback
    reply = `<p>Thanks for the reply, ${lead.first_name || 'there'}. Happy to chat more about this on WhatsApp if that's easier. Our number is +62 855 9122 2000.</p>`
  }
  // Strip any dashes (em dash, en dash, hyphen used as dash)
  reply = reply.replace(/\u2014/g, ',').replace(/\u2013/g, ',').replace(/ - /g, ', ')
  return reply
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Bilingual discount-language detection. Catches both English (campaigns) and
// Indonesian (Castudio's local market). Used to flag handoffs where the lead
// may have been offered a discount upstream — the human handler must honor it.
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

// Look for discount language in the lead's latest reply first (cheap), then
// fall back to fetching the full email thread from Plusvibe. If the thread
// fetch fails, swallow the error — the handoff itself must not break.
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

export async function notifyTelegramHandoff(
  lead: { first_name: string; lead_email: string; company_name: string; job_title: string; campaign_name: string },
  phone: string,
  threadSummary: string,
  latestReplyText: string,
  discountNote: string | null = null,
) {
  const supabase = getSupabaseAdmin()

  // Normalize phone to 62xxx (used for wa.me link AND customer stub lookup)
  let cleanPhone = phone.replace(/[\s\-.()\+]/g, '')
  if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1)

  // Create customer stub if no existing record matches the phone
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

  // Telegram cap is 4096 chars; keep latest reply trimmed
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

async function getOpenAIClient() {
  const supabase = getSupabaseAdmin()
  const { data: settings } = await supabase.from('agent_settings').select('api_key').eq('agent_name', 'plusvibe').single()
  let apiKey: string | undefined
  if (settings?.api_key) {
    try { apiKey = Buffer.from(settings.api_key, 'base64').toString('utf-8') } catch {}
  }
  if (!apiKey) {
    const { data: sheraSettings } = await supabase.from('agent_settings').select('api_key').eq('agent_name', 'shera').single()
    if (sheraSettings?.api_key) {
      try { apiKey = Buffer.from(sheraSettings.api_key, 'base64').toString('utf-8') } catch {}
    }
  }
  if (!apiKey) {
    const { data } = await supabase.from('connectors').select('encrypted_key').eq('is_base_model', true).single()
    if (data?.encrypted_key) {
      try { apiKey = Buffer.from(data.encrypted_key, 'base64').toString('utf-8') } catch {}
    }
  }
  return createOpenAIClient(apiKey)
}

export async function processEmailReply(payload: any) {
  const supabase = getSupabaseAdmin()
  const whatsappNumber = process.env.WHATSAPP_BUSINESS_NUMBER || '+6285591222000'

  const leadId = payload.lead_id
  const email = payload.email || payload.from_email
  const replyText = payload.text_body || payload.snippet || ''
  const subject = payload.subject || ''

  if (!replyText.trim()) return { action: 'skipped', reason: 'empty reply' }

  // Get or create lead record
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

  // ── DEDUP: Prevent duplicate processing from Plusvibe webhook retries ──
  // Three layers of protection:

  // Layer 1: Already handed off
  if (lead.handed_off_to_whatsapp) {
    return { action: 'skipped', reason: 'already handed off to WhatsApp' }
  }
  // Closed leads: only skip if same email (retry). Allow NEW emails (they changed their mind).
  if (lead.current_status === 'closed' && lead.last_email_id === payload.last_email_id) {
    return { action: 'skipped', reason: 'lead already closed (same email)' }
  }
  // Reopen closed lead if they reply again with a new email
  if (lead.current_status === 'closed') {
    await supabase.from('email_leads').update({ current_status: 'active' }).eq('id', lead.id)
  }

  // Layer 2: Same email already processed (retry detection)
  // If lead has the same last_email_id AND reply_count > 0, this is a retry
  if (lead.last_email_id === payload.last_email_id && (lead.reply_count || 0) > 0) {
    return { action: 'skipped', reason: 'duplicate webhook (same email already processed)' }
  }

  // Layer 3: Atomic claim — increment reply_count IMMEDIATELY before any processing
  // This narrows the race window to milliseconds (between SELECT and this UPDATE)
  const newReplyCount = (lead.reply_count || 0) + 1
  await supabase.from('email_leads').update({
    reply_count: newReplyCount,
    last_email_id: payload.last_email_id,
    updated_at: new Date().toISOString(),
  }).eq('id', lead.id)

  // ── Classify the reply ──
  const classification = await classifyReply(replyText)

  // Also check phone extraction directly (LLM might miss it)
  const directPhone = extractPhoneNumber(replyText)
  if (directPhone && classification.classification !== 'PHONE_NUMBER_FOUND') {
    classification.classification = 'PHONE_NUMBER_FOUND'
    classification.phone_number = directPhone
  }

  // Update lead history (reply_count already incremented above)
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

  // Route based on classification
  const cat = classification.classification

  if (cat === 'OUT_OF_OFFICE') {
    await supabase.from('email_leads').update({ current_status: 'ooo' }).eq('id', lead.id)
    return { action: 'ignored', classification: cat, reason: 'OOO auto-reply' }
  }

  if (cat === 'NOT_INTERESTED') {
    const reply = await generateReply(
      { first_name: lead.first_name || '', company_name: lead.company_name || '', job_title: lead.job_title || '', reply_count: lead.reply_count || 0, objections_raised: objections, classification_history: history },
      cat, replyText, whatsappNumber
    )
    await replyToEmail(payload.last_email_id, subject, payload.to_email, payload.from_email, reply)
    await supabase.from('email_leads').update({ current_status: 'closed' }).eq('id', lead.id)
    return { action: 'replied', classification: cat, reply }
  }

  if (cat === 'PHONE_NUMBER_FOUND') {
    const phone = classification.phone_number || directPhone
    if (!phone) return { action: 'error', reason: 'classification said phone found but extraction failed' }

    // Validate phone: must be at least 8 digits (reject things like "911", "123", etc.)
    const digitsOnly = phone.replace(/\D/g, '')
    if (digitsOnly.length < 8) {
      const firstName = lead.first_name || 'there'
      const reply = `<p>Hey ${firstName}, that number doesn't look quite right. Could you double check and share your full WhatsApp number? We just need it so we can send you our service menu and get things rolling.</p>`
      await replyToEmail(payload.last_email_id, subject, payload.to_email, payload.from_email, reply)
      return { action: 'replied', classification: 'PHONE_NUMBER_FOUND', reply, note: 'phone too short, asked to reshare' }
    }

    // Save phone. NOTE: column name `handed_off_to_whatsapp` is legacy from the Shera-WhatsApp era;
    // it now means "escalated to a human via Telegram". Admin UI still reads this column.
    await supabase.from('email_leads').update({ phone_number: phone, current_status: 'handed_off_to_whatsapp', handed_off_to_whatsapp: true }).eq('id', lead.id)

    // Send email confirmation FIRST (lead sees this immediately)
    try {
      const confirmReply = `<p>Got it, ${lead.first_name || 'there'}! You'll hear from us on WhatsApp shortly.</p>`
      await replyToEmail(payload.last_email_id, subject, payload.to_email, payload.from_email, confirmReply)
    } catch {
      // Email reply failed — continue to Telegram handoff anyway
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

    // Audit trail of the handoff intent (kept for admin UI / debugging)
    await supabase.from('email_leads').update({
      washer_notes: JSON.stringify({ pending_telegram_handoff: true, handoff_data: handoffData, handoff_at: new Date().toISOString() }),
    }).eq('id', lead.id)

    // Look for discount language anywhere in the email sequence so the human
    // handler knows to honor any prior offer. Resilient — failures are logged
    // and the handoff continues without a discount notice.
    const discountNote = await findDiscountInThread(payload.last_email_id, replyText)

    // Short pause so the email confirmation lands first, then ping Telegram
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
      // Lead is still marked handed_off in DB; admin UI surfaces it for manual follow-up.
    }

    return { action: 'handed_off', classification: cat, phone }
  }

  if (cat === 'ASKED_FOR_OUR_NUMBER') {
    const reply = `<p>Of course! You can reach us on WhatsApp at ${whatsappNumber}. Just shoot us a message anytime and we'll get right back to you.</p>`
    await replyToEmail(payload.last_email_id, subject, payload.to_email, payload.from_email, reply)
    return { action: 'replied', classification: cat, reply }
  }

  // INTERESTED_NO_NUMBER, OBJECTION, UNRELATED — generate reply
  const reply = await generateReply(
    { first_name: lead.first_name || '', company_name: lead.company_name || '', job_title: lead.job_title || '', reply_count: lead.reply_count || 0, objections_raised: objections, classification_history: history },
    cat, replyText, whatsappNumber
  )
  await replyToEmail(payload.last_email_id, subject, payload.to_email, payload.from_email, reply)
  return { action: 'replied', classification: cat, reply }
}
