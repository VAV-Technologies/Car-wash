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
  currentState?: string
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
  hasServiceIntent: boolean
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
    hasServiceIntent: false,
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

    // Extract name from user messages
    if (m.role === 'user' && !ctx.customerName) {
      // Comprehensive blocklist: common Indonesian/English words that are NOT names
      const NOT_NAMES = new Set([
        // Intent words
        'mau', 'ingin', 'butuh', 'perlu', 'pengen', 'mo', 'mw',
        // Question words
        'apa', 'apakah', 'siapa', 'kenapa', 'mengapa', 'gimana', 'bagaimana', 'kapan', 'dimana', 'berapa', 'brp',
        // Verbs/actions
        'cuci', 'dicuci', 'booking', 'book', 'tanya', 'minta', 'cari', 'lihat', 'liat',
        'punya', 'ada', 'bisa', 'boleh', 'tau', 'tahu', 'pikir', 'rasa', 'kabar',
        // Negations
        'tidak', 'ga', 'gak', 'gk', 'belum', 'blm', 'ngga', 'nggak', 'enggak', 'engga', 'jangan',
        // Filler/casual/laughs
        'iya', 'iyaa', 'ok', 'oke', 'okee', 'sip', 'siap', 'yah', 'yaa', 'ya',
        'huh', 'hmm', 'hmmm', 'wkwk', 'wkwkwk', 'wkwkwkwk', 'wkwkwkwkwk',
        'lol', 'haha', 'hahaha', 'hahahaha', 'kwkwk', 'xixi', 'lmao', 'lmfao', 'rofl',
        'ohh', 'ooh', 'ohhh', 'ahhh', 'hmmmm', 'ehh', 'uhh',
        // Greetings
        'halo', 'hallo', 'hai', 'hello', 'hi', 'hey', 'selamat',
        // Adverbs/conjunctions
        'lagi', 'sedang', 'baru', 'sudah', 'udah', 'cuma', 'hanya', 'juga', 'dari',
        // Service words (prevent "detailing" / "standard" etc being name)
        'detailing', 'detail', 'standard', 'professional', 'elite', 'wash',
        'interior', 'exterior', 'window', 'tire', 'rims', 'full',
        'mobil', 'motor', 'motor',
        // English common
        'want', 'need', 'yes', 'no', 'sure', 'thanks', 'thank', 'please', 'can',
        // Titles (handled separately below but also block as first word)
        'mas', 'bang', 'mbak', 'kak', 'pak', 'bu', 'om', 'tante', 'mr', 'mrs', 'ms',
      ])

      // Indonesian title prefixes — if name starts with these, take the NEXT word
      const TITLE_PREFIXES = new Set(['mas', 'bang', 'mbak', 'kak', 'pak', 'bu', 'om', 'tante', 'mr', 'mrs', 'ms', 'bro', 'sis'])

      const idx = messages.indexOf(m)
      const prevMsg = idx > 0 ? messages[idx - 1] : null
      const prevAskedName = prevMsg?.role === 'assistant' && /namanya siapa|your name/i.test(prevMsg.content || '')

      // Helper: validate a candidate name
      function isValidName(candidate: string): boolean {
        if (!candidate || candidate.length < 2) return false
        if (NOT_NAMES.has(candidate.toLowerCase())) return false
        if (/^\d+$/.test(candidate)) return false // pure numbers
        if (/^[^a-zA-Z]/.test(candidate)) return false // starts with non-letter
        if (/^\.+$/.test(candidate)) return false // just dots
        if (/^(.)\1{2,}$/i.test(candidate)) return false // repeated chars (aaa, hhh)
        if (/^(..)\1{2,}$/i.test(candidate)) return false // repeated pairs (wkwkwk, hahaha)
        if (candidate.length > 20) return false // too long to be a name
        return true
      }

      // Pattern-based detection ("saya X", "nama saya X", "I'm X")
      const patterns = [
        /nama\s+(?:saya|aku|gue|gw)\s+(\w+)/i,
        /(?:I'm|my name is|i am|this is)\s+(\w+)/i,
        /(?:^|[,.!]\s*|hi\s+|halo\s+|hello\s+)(?:saya|aku|gue|gw)\s+(\w+)/i,
      ]
      for (const p of patterns) {
        const match = c.match(p)
        if (match && isValidName(match[1])) {
          ctx.customerName = match[1]
          break
        }
      }

      // Direct name response: if previous message asked for name and this is a short reply
      if (!ctx.customerName && prevAskedName) {
        const cleaned = c.trim().replace(/[^\w\s]/g, '').trim() // strip punctuation/emoji
        const words = cleaned.split(/\s+/).filter(w => w.length > 0)
        if (words.length >= 1 && words.length <= 4) {
          let nameWord = words[0]
          // If first word is a title prefix, take the next word
          if (TITLE_PREFIXES.has(nameWord.toLowerCase()) && words.length >= 2) {
            nameWord = words[1]
          }
          if (isValidName(nameWord)) {
            ctx.customerName = nameWord
          }
        }
      }
    }

    // Check for multi-car requests
    if (m.role === 'user') {
      const multiMatch = c.match(/(\d+)\s*mobil/i)
      if (multiMatch && !ctx.totalCarsRequested) {
        ctx.totalCarsRequested = parseInt(multiMatch[1])
      }
    }

    // Check address given — require "jl"/"jalan" as standalone + some detail (number, RT, area name)
    if (m.role === 'user' && !ctx.address) {
      const hasStreetIndicator = /\bjl\.?\s+\w|jalan\s+\w/i.test(c)
      const hasNumberIndicator = /no\.?\s*\d|rt\s*\d|rw\s*\d|blok\s*\w/i.test(c)
      if (hasStreetIndicator || (hasNumberIndicator && c.length > 15)) {
        ctx.address = c.trim()
      }
    }

    // Check schedule given — require both date indicator AND time indicator in same message
    if (m.role === 'user' && !ctx.schedule) {
      const hasDate = /\b(besok|lusa|senin|selasa|rabu|kamis|jumat|sabtu|minggu|tanggal\s*\d|april|mei|juni|juli|agustus|september|oktober|november|desember|january|february|march|monday|tuesday|wednesday|thursday|friday|saturday)\b/i.test(c)
      const hasTime = /\bjam\s+\d|\bpagi\b|\bsiang\b|\bsore\b|\bmalem\b|\bmalam\b|\bmorning\b|\bafternoon\b/i.test(c)
      if (hasDate || hasTime) {
        ctx.schedule = c.trim()
      }
    }

    // Detect service intent from user messages
    if (m.role === 'user' && /\bcuci\b|\bwash\b|\bdetailing\b|\bdetail\b|\bstandard\b|\bprofessional\b|\belite\b/i.test(c)) {
      ctx.hasServiceIntent = true
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

  // 0. HARD RULE: Enforce intro template when in intro_pitch state
  // BUT skip if customer already stated their intent (multi-car, specific service, category, etc.)
  const hasIntent = ctx.imagesSentCategories.length > 0
    || (ctx.totalCarsRequested && ctx.totalCarsRequested > 0)
    || ctx.hasServiceIntent
  if (ctx.currentState === 'intro_pitch' && ctx.customerName && !ctx.introPitchGiven && !hasIntent) {
    const name = ctx.customerName
    if (ctx.language === 'en') {
      output = `Nice to meet you ${name}! 😊\n\nSo Castudio is a premium car wash & detailing service that comes directly to your home. No delivery fee and no deposit needed, we just need access to water and electricity.\n\nWe take our work seriously — if you're not satisfied with the result, we'll come back and fix it at zero cost 🙏\n\nAre you looking to get your car washed or detailed?`
    } else {
      output = `Salam kenal kak ${name} 😊\n\nJadi Castudio itu layanan cuci mobil & detailing premium yang datang langsung ke rumah kak. Ga ada biaya antar dan ga perlu deposit, kita cuma butuh akses air sama listrik aja ya.\n\nOh iya, kita serius soal kualitas — kalau kak ga puas sama hasilnya, kita balik lagi buat benerin tanpa biaya tambahan 🙏\n\nKak ${name} lagi cari cuci mobil atau detailing nih?`
    }
    issues.push('enforced intro template')
  }

  // 1. Strip re-introduction if already introduced
  if (ctx.alreadyIntroduced && /Halo!?\s*Aku Shera dari Castudio|Hi!?\s*I'm Shera from Castudio/i.test(output)) {
    output = output.replace(/.*(?:Aku Shera dari Castudio|I'm Shera from Castudio).*(?:siapa ya\?|your name\?)?\s*/i, '').trim()
    issues.push('stripped re-introduction')
  }

  // 2. Check for hallucinated prices — ONLY flag clearly fake prices, don't block approved ones
  // Only check "Rp" format prices (not "349rb" which is too noisy)
  const priceMatches = output.match(/Rp\s*[\d.]+\.000/gi)
  if (priceMatches) {
    for (const price of priceMatches) {
      const normalized = price.replace(/[Rp\s]/gi, '')
      if (normalized && !APPROVED_PRICES.includes(normalized)) {
        // STRIP the fake price sentence, don't block the whole response
        output = output.replace(new RegExp('[^.!?\\n]*' + price.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^.!?\\n]*[.!?]?\\s*', 'gi'), '').trim()
        issues.push(`stripped hallucinated price: ${price}`)
      }
    }
  }

  // 3. Check for unauthorized discounts — only strip if OFFERING a discount, not REFUSING one
  const discountMatch = /\bdiskon\b|\bpotongan\b|\bdiscount\b|\bgratis\b|\bfree\b|\bbonus\b/i.test(output)
  const isRefusingDiscount = /ga bisa.*diskon|tidak bisa.*diskon|can't.*discount|no discount|harga.*fixed|harga.*final/i.test(output)
  if (discountMatch && !isRefusingDiscount && !/249\.?000/i.test(output)) {
    // Model is OFFERING a discount — strip that sentence
    output = output.replace(/[^.!?\n]*(?:\bdiskon\b|\bpotongan\b|\bdiscount\b|\bgratis\b|\bfree\b|\bbonus\b)[^.!?\n]*[.!?]?\s*/gi, '').trim()
    issues.push('stripped unauthorized discount offer')
    if (output.length < 10) {
      output = ctx.language === 'en'
        ? "Unfortunately we can't offer discounts — our prices reflect the premium materials and thorough process we use 🙂\n\nWould you like to continue?"
        : "Sayangnya harga kita ga bisa di-diskon kak, karena kita pakai produk premium import dan prosesnya teliti 🙂\n\nMau lanjut kak?"
    }
  }
  // If refusing a discount → that's CORRECT behavior, leave it alone

  // 4. Fix gendering — replace standalone "pak"/"bu" before names with "kak"
  const beforeGender = output
  // "pak Robert" → "kak Robert" (but NOT "paket" or "buat")
  output = output.replace(/\bpak\s+([A-Z]\w*)/g, 'kak $1')
  output = output.replace(/\bPak\s+([A-Z]\w*)/g, 'Kak $1')
  // "bu Dina" → "kak Dina" (but NOT "buat", "buka", "bulan", "butuh")
  output = output.replace(/\bbu\s+([A-Z]\w*)/g, 'kak $1')
  output = output.replace(/\bBu\s+([A-Z]\w*)/g, 'Kak $1')
  if (output !== beforeGender) issues.push('fixed gendering')

  // 5. Block address re-asking
  if (ctx.address && /lebih lengkap|tulis ulang|tulis lagi|kirim.*alamat.*lagi|alamat.*sekali lagi/i.test(output)) {
    output = output.replace(/[^.!?]*(?:lebih lengkap|tulis ulang|tulis lagi|kirim.*alamat.*lagi|alamat.*sekali lagi)[^.!?]*[.!?]?\s*/gi, '').trim()
    issues.push('stripped address re-ask')
  }

  // 6. Deduplicate (Grok sometimes repeats)
  const halfLen = Math.floor(output.length / 2)
  if (output.length > 40 && output.slice(0, halfLen).trim() === output.slice(halfLen).trim()) {
    output = output.slice(0, halfLen).trim()
    issues.push('deduplicated response')
  }

  // 7. Ensure CTA at end — but NOT on booking confirmations or payment info
  const isConfirmation = /booking.*beres|booking.*udah|sudah.*confirm|ga perlu bayar|bayarnya nanti/i.test(output)
  if (!isConfirmation && output.length > 10 && !output.includes('?') && !/mau lanjut|gimana kak|mau coba|boleh|siap kak|booking|yang mana/i.test(output)) {
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
