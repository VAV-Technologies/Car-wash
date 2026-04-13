// ─── Shera Rules Engine ──────────────────────────────────────────────
// Hard rules enforced in CODE, not in the prompt.
// Pre-call: extracts context deterministically from conversation history.
// Post-call: validates and fixes model output before sending.

// ─── Approved Prices ─────────────────────────────────────────────────
export const APPROVED_PRICES = [
  '349.000', '649.000', '949.000',           // wash
  '1.039.000', '689.000', '289.000', '2.799.000', // detailing
  '339.000', '449.000', '1.000.000',         // subscriptions
  '249.000',                                    // detailing wash discount
]

// ─── Conversation Context ────────────────────────────────────────────
export interface ConvoContext {
  customerName: string | null
  alreadyIntroduced: boolean
  introPitchGiven: boolean
  imagesSentCategories: string[] // ['wash'], ['detailing'], or both
  language: 'id' | 'en'
  knownCars: Array<{ model?: string; plate?: string; service?: string; booked?: boolean }>
  totalCarsRequested: number | null
  carsBooked: number
  address: string | null
  schedule: string | null
  detailingWashOffered: boolean
}

type Msg = { role: string; content: string; [key: string]: any }

// ─── Pre-Call: Extract Context ───────────────────────────────────────

export function extractContext(messages: Msg[]): ConvoContext {
  const ctx: ConvoContext = {
    customerName: null,
    alreadyIntroduced: false,
    introPitchGiven: false,
    imagesSentCategories: [],
    language: 'id',
    knownCars: [],
    totalCarsRequested: null,
    carsBooked: 0,
    address: null,
    schedule: null,
    detailingWashOffered: false,
  }

  for (const m of messages) {
    const c = m.content || ''

    // Check introduction
    if (m.role === 'assistant' && /Shera dari Castudio|I'm Shera from Castudio/i.test(c)) {
      ctx.alreadyIntroduced = true
    }

    // Check intro pitch (the full Castudio description)
    if (m.role === 'assistant' && /layanan cuci mobil.*detailing.*premium|premium car wash.*detailing/i.test(c)) {
      ctx.introPitchGiven = true
    }

    // Check images sent
    if (m.role === 'assistant' && c.includes('[IMAGES_SENT]')) {
      if (/cuci|wash|standard|professional|elite/i.test(c)) ctx.imagesSentCategories.push('wash')
      if (/detail|interior|exterior|window|tire|full/i.test(c)) ctx.imagesSentCategories.push('detailing')
      // If can't determine, check tool context
      if (ctx.imagesSentCategories.length === 0) ctx.imagesSentCategories.push('unknown')
    }

    // Detect language from first user message
    if (m.role === 'user' && ctx.language === 'id') {
      const hasEnglish = /\b(hello|good morning|good afternoon|I want|my name is|what|how much|please)\b/i.test(c)
      const hasIndonesian = /\b(halo|hallo|hai|selamat|mau|saya|aku|cuci|mobil|detailing)\b/i.test(c)
      if (hasEnglish && !hasIndonesian) ctx.language = 'en'
    }

    // Extract name from assistant messages addressing customer
    if (m.role === 'assistant' && !ctx.customerName) {
      const nameMatch = c.match(/kak\s+(\w+)/i)
      if (nameMatch && !['kak'].includes(nameMatch[1].toLowerCase())) {
        ctx.customerName = nameMatch[1]
      }
    }

    // Check for multi-car requests
    if (m.role === 'user') {
      const multiMatch = c.match(/(\d+)\s*mobil/i)
      if (multiMatch && !ctx.totalCarsRequested) {
        ctx.totalCarsRequested = parseInt(multiMatch[1])
      }
    }

    // Check address given
    if (m.role === 'user' && /jl\b|jalan|no\.\s*\d|rt\s*\d/i.test(c) && !ctx.address) {
      ctx.address = c.trim()
    }

    // Check schedule given
    if (m.role === 'user' && /\b(april|mei|juni|juli|agustus|september|oktober|november|desember|january|february|march)\b.*jam|\bjam\s+\d/i.test(c) && !ctx.schedule) {
      ctx.schedule = c.trim()
    }

    // Check detailing wash offer
    if (m.role === 'assistant' && /249\.000|wash.*diskon.*detailing|detailing.*cuci.*dulu/i.test(c)) {
      ctx.detailingWashOffered = true
    }

    // Count bookings
    if (m.role === 'assistant' && /booking.*beres|booking.*udah.*buat|sudah.*confirm/i.test(c)) {
      ctx.carsBooked++
    }
  }

  return ctx
}

// ─── Format Context for Prompt Injection ─────────────────────────────

export function formatContextBlock(ctx: ConvoContext): string {
  let block = '\n--- Current Situation ---'
  block += `\nCustomer name: ${ctx.customerName || 'UNKNOWN'}`
  block += `\nLanguage: ${ctx.language === 'en' ? 'English' : 'Indonesian'}`
  block += `\nIntroduced: ${ctx.alreadyIntroduced ? 'YES — do NOT re-introduce' : 'NO — introduce yourself'}`
  block += `\nIntro pitch given: ${ctx.introPitchGiven ? 'YES — do NOT repeat' : 'NO — give full pitch after getting name'}`
  block += `\nImages sent: ${ctx.imagesSentCategories.length > 0 ? ctx.imagesSentCategories.join(', ') + ' — do NOT re-send same category' : 'NONE'}`

  if (ctx.totalCarsRequested && ctx.totalCarsRequested > 1) {
    block += `\nMulti-car: ${ctx.totalCarsRequested} cars requested, ${ctx.carsBooked} booked`
    if (ctx.carsBooked < ctx.totalCarsRequested) {
      block += ` — ${ctx.totalCarsRequested - ctx.carsBooked} remaining, DO NOT say "sudah confirm" until all done`
    }
  }

  if (ctx.address) block += `\nAddress: ${ctx.address} — ALREADY GIVEN, do NOT ask again`
  if (ctx.schedule) block += `\nSchedule: ${ctx.schedule} — ALREADY GIVEN, do NOT ask again`

  const missing: string[] = []
  if (!ctx.customerName) missing.push('name')
  if (!ctx.address) missing.push('address')
  if (!ctx.schedule) missing.push('schedule')
  if (missing.length > 0) block += `\nStill needed: ${missing.join(', ')}`

  return block
}

// ─── Post-Call: Validate Response ────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  output: string
  issues: string[]
  shouldRegenerate: boolean
}

export function validateResponse(response: string, ctx: ConvoContext): ValidationResult {
  let output = response
  const issues: string[] = []
  let shouldRegenerate = false

  // 1. Strip re-introduction if already introduced
  if (ctx.alreadyIntroduced && /Halo!?\s*Aku Shera dari Castudio|Hi!?\s*I'm Shera from Castudio/i.test(output)) {
    output = output.replace(/.*(?:Aku Shera dari Castudio|I'm Shera from Castudio).*(?:siapa ya\?|your name\?)?\s*/i, '').trim()
    issues.push('stripped re-introduction')
  }

  // 2. Check for hallucinated prices
  const priceMatches = output.match(/Rp\s*[\d.]+/g)
  if (priceMatches) {
    for (const price of priceMatches) {
      const normalized = price.replace(/[Rp\s]/g, '')
      if (!APPROVED_PRICES.includes(normalized)) {
        issues.push(`hallucinated price: ${price}`)
        shouldRegenerate = true
      }
    }
  }

  // 3. Check for unauthorized discounts / special prices
  if (/\bdiskon\b|\bpotongan\b|\bdiscount\b|\bharga spesial\b|\bharga khusus\b/i.test(output)) {
    if (!/249\.000/i.test(output)) {
      issues.push('unauthorized discount or special price')
      shouldRegenerate = true
    }
  }

  // 4. Fix gendering — replace pak/bu with kak
  const beforeGender = output
  output = output.replace(/\bpak\s+([A-Z])/gi, 'kak $1')
  output = output.replace(/\bbu\s+([A-Z])/gi, 'kak $1')
  if (output !== beforeGender) issues.push('fixed gendering')

  // 5. Block address re-asking
  if (ctx.address && /lebih lengkap|tulis ulang|tulis lagi|alamat.*lagi|kirim.*alamat/i.test(output)) {
    output = output.replace(/.*(?:lebih lengkap|tulis ulang|tulis lagi|alamat.*lagi|kirim.*alamat).*[.?!]?\s*/gi, '').trim()
    issues.push('stripped address re-ask')
  }

  // 6. Deduplicate (Grok sometimes repeats)
  const halfLen = Math.floor(output.length / 2)
  if (output.length > 40 && output.slice(0, halfLen).trim() === output.slice(halfLen).trim()) {
    output = output.slice(0, halfLen).trim()
    issues.push('deduplicated response')
  }

  // 7. Ensure CTA at end (must end with question or call-to-action)
  if (output.length > 10 && !output.includes('?') && !/mau lanjut|gimana kak|mau coba|boleh|siap|booking/i.test(output)) {
    const cta = ctx.language === 'en' ? '\n\nWould you like to continue?' : '\n\nMau lanjut kak?'
    output += cta
    issues.push('appended CTA')
  }

  // 8. Ensure not empty
  if (!output.trim()) {
    output = ctx.language === 'en' ? 'How can I help you?' : 'Ada yang bisa aku bantu kak?'
    issues.push('empty response replaced')
  }

  return {
    valid: issues.length === 0,
    output,
    issues,
    shouldRegenerate,
  }
}
