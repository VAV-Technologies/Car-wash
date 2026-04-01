import { createOpenAIClient, GPT_MODEL } from '@/lib/agents/openai-client'
import { getSupabaseAdmin } from '@/lib/supabase'
import { replyToEmail } from './plusvibe-client'

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

const REPLY_GENERATION_PROMPT = `You are Ryan, a sales rep at Castudio. You are a real person, not a bot. You write emails like a human who genuinely wants to help.

About Castudio:
Castudio is a premium mobile car wash and detailing service. We come to the customer's location (office, home, apartment) with professional equipment. No need to drive anywhere or wait in line. Based in Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi).

Services:
Standard Wash Rp 349.000 (1-1.5 hours)
Professional Wash Rp 649.000 (2-2.5 hours)
Elite Wash Rp 949.000 (3-3.5 hours)
Full Detail Rp 2.799.000 (full day)

Subscriptions (for repeat clients):
Essentials Rp 339.000/month (4x Standard)
Plus Rp 449.000/month (4x Professional)
Elite Rp 1.000.000/month (4x Pro + 2x Elite)

Corporate fleet packages available with volume discounts.

Your writing style:
1. You are a real person named Ryan. Write like a human, not a template.
2. Keep it short. 2-4 sentences max. This is email, not a pitch deck.
3. NEVER use em dashes or en dashes. Period.
4. NEVER use filler like "I hope this finds you well" or "Thank you for reaching out"
5. Reference something specific from their reply so they know you actually read it.
6. End with ONE clear CTA: get their WhatsApp number so you can chat faster.
7. Output as simple HTML with <p> tags only.

CTA angles (rotate, don't repeat the same one):
"Drop your WA number and I'll send you our service menu. Way easier to chat there."
"What's your WhatsApp? I can send you some before/after photos of our work."
"Easiest way to sort this out is a quick WhatsApp chat. What's your number?"
"Happy to walk you through everything on WhatsApp. What number should I message?"

Objection handling framework:
PRICING objection:
"Yeah I get that. Most of our corporate clients actually save money vs sending cars to a shop because there's zero downtime. Plus our subscription plans bring the per-wash cost way down. Want me to run the numbers for your fleet?"

TIMING objection:
"No rush at all. We're not going anywhere. When things calm down, just ping me and we'll get you sorted. Want me to check back in [suggest a timeframe]?"

EXISTING SOLUTION objection:
"Fair enough. Out of curiosity, are they coming to your location or do your team have to drive somewhere? We come directly to your office/home so nobody loses work time. Might be worth a comparison."

PRIVACY/SOURCING objection (where did you get my email/number/info, how did you find me):
"Good question! Your email came up through our outreach for companies in the area that might benefit from mobile car wash. We're not spamming, just reaching out to see if it's a fit. If it's not your thing, no worries at all. But if your office fleet could use a wash without anyone leaving the building, happy to share more."
IMPORTANT: We do NOT have their phone number. We are ASKING for their WhatsApp number. If they say "where did you get my number", clarify that we don't have their number and we're reaching out via email only. Do NOT imply we already have their phone.

GENERAL objection:
Acknowledge their concern directly. Don't dismiss it. Provide ONE counter-point. Ask ONE follow-up question. Don't oversell.

After 4+ replies without getting a number:
Stop asking for their number. Instead share ours: "No worries at all. Whenever you're ready, just WhatsApp us at +62 855 9122 2000. We're always around."

NOT_INTERESTED:
"All good, appreciate the honesty. If anything changes down the road, you know where to find us. Cheers!"
One reply only. No follow-up after this.

ASKED_FOR_OUR_NUMBER:
"Of course! Hit us up on WhatsApp at +62 855 9122 2000. We'll get back to you right away."`

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
    model: GPT_MODEL,
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

  const response = await openai.chat.completions.create({
    model: GPT_MODEL,
    max_completion_tokens: 512,
    messages: [
      { role: 'system', content: REPLY_GENERATION_PROMPT },
      { role: 'user', content: `${context}\n\nTheir reply:\n${replyText}\n\nGenerate the email reply (HTML with <p> tags):` },
    ],
  })
  return response.choices[0]?.message?.content || '<p>Thanks for getting back to us.</p>'
}

export async function triggerWhatsAppAgent(
  lead: { first_name: string; lead_email: string; company_name: string; job_title: string; campaign_name: string },
  phone: string,
  threadSummary: string
) {
  const supabase = getSupabaseAdmin()

  // Clean phone
  let cleanPhone = phone.replace(/[\s\-.()\+]/g, '')
  if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1)

  const chatId = cleanPhone + '@c.us'

  // DEDUP: If conversation already exists for this chatId, skip (prevents duplicate messages from webhook retries)
  const { data: existingConvo } = await supabase
    .from('whatsapp_conversations')
    .select('id')
    .eq('chat_id', chatId)
    .maybeSingle()

  if (existingConvo) {
    console.log(`[plusvibe] Skipping triggerWhatsAppAgent — conversation already exists for ${chatId}`)
    return
  }

  // Create customer in Castudio DB
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

  // Send opening WhatsApp via WAHA
  const WAHA_API_URL = process.env.WAHA_API_URL
  const WAHA_API_KEY = process.env.WAHA_API_KEY
  if (!WAHA_API_URL || !WAHA_API_KEY) {
    console.error('[plusvibe] Missing WAHA env vars for WhatsApp handoff')
    return
  }

  const firstName = lead.first_name || 'there'
  const openingMessage = `Hai ${firstName}! Makasih udah share nomornya lewat email. Aku Shera dari Castudio. Boleh tau mobilnya apa dan lokasinya di daerah mana?`

  await fetch(`${WAHA_API_URL}/api/sendText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': WAHA_API_KEY },
    body: JSON.stringify({ session: 'default', chatId, text: openingMessage }),
  })

  // Create conversation record with context for Shera
  const { data: convo } = await supabase
    .from('whatsapp_conversations')
    .select('id, messages')
    .eq('chat_id', chatId)
    .maybeSingle()

  const sheraContext = `LEAD FROM EMAIL CAMPAIGN (Ryan agent handoff). Name: ${lead.first_name || 'unknown'}. Email: ${lead.lead_email}. Company: ${lead.company_name || 'unknown'}. Title: ${lead.job_title || 'unknown'}. Campaign: ${lead.campaign_name || 'unknown'}. Email thread summary: ${threadSummary}. This person already knows about Castudio from email. Do NOT ask for their name again. You already asked for their car and location. When they respond with car and location, continue: ask for plate number, then ask which service they want, then schedule. Flow: car+location → plate → service → date → book.`

  if (!convo) {
    await supabase.from('whatsapp_conversations').insert({
      chat_id: chatId,
      phone: cleanPhone,
      messages: [
        { role: 'assistant', content: openingMessage, timestamp: new Date().toISOString(), context: sheraContext },
      ],
    })
  } else {
    // Existing conversation — append context
    const msgs = Array.isArray(convo.messages) ? convo.messages : []
    msgs.push({ role: 'assistant', content: openingMessage, timestamp: new Date().toISOString(), context: sheraContext })
    await supabase.from('whatsapp_conversations').update({ messages: msgs.slice(-30), last_message_at: new Date().toISOString() }).eq('chat_id', chatId)
  }
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

  // Layer 1: Already handed off or closed
  if (lead.handed_off_to_whatsapp) {
    return { action: 'skipped', reason: 'already handed off to WhatsApp' }
  }
  if (lead.current_status === 'closed') {
    return { action: 'skipped', reason: 'lead already closed' }
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

    // Save phone
    await supabase.from('email_leads').update({ phone_number: phone, current_status: 'handed_off_to_whatsapp', handed_off_to_whatsapp: true }).eq('id', lead.id)

    // Send email confirmation FIRST (lead sees this immediately)
    try {
      const confirmReply = `<p>Got it, ${lead.first_name || 'there'}! You'll hear from us on WhatsApp shortly.</p>`
      await replyToEmail(payload.last_email_id, subject, payload.to_email, payload.from_email, confirmReply)
    } catch {
      // Email reply failed — continue to WhatsApp anyway
    }

    // Schedule WhatsApp handoff after a delay (fire-and-forget to a delayed endpoint)
    // Can't wait 60s in this function (Vercel timeout), so we save the handoff
    // data and let the follow-up cron or a separate call handle it.
    // For now: store the handoff intent, and trigger via a background fetch.
    const handoffData = {
      first_name: lead.first_name || '',
      lead_email: lead.lead_email,
      company_name: lead.company_name || '',
      job_title: lead.job_title || '',
      campaign_name: lead.campaign_name || '',
      phone,
      summary: classification.summary || 'Lead replied to email campaign with phone number',
    }

    // Store handoff for delayed processing
    await supabase.from('email_leads').update({
      washer_notes: JSON.stringify({ pending_wa_handoff: true, handoff_data: handoffData, handoff_at: new Date(Date.now() + 90000).toISOString() }),
    }).eq('id', lead.id)

    // Trigger WhatsApp after 30s delay (best we can do within function timeout)
    const delay = 25000 + Math.random() * 10000 // 25-35 seconds
    await new Promise(resolve => setTimeout(resolve, delay))

    await triggerWhatsAppAgent(
      { first_name: handoffData.first_name, lead_email: handoffData.lead_email, company_name: handoffData.company_name, job_title: handoffData.job_title, campaign_name: handoffData.campaign_name },
      phone,
      handoffData.summary
    )

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
