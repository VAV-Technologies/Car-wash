// ─── Shera Rules Engine v3 — Hybrid Architecture ────────────────────
// AI reads conversation and drives the flow.
// Code ONLY audits for hard business rule violations.
// No regex detection for subjective fields (package, car, address, schedule).

// ─── Approved Prices ─────────────────────────────────────────────────
export const APPROVED_PRICES = [
  '349.000', '649.000', '949.000',           // wash
  '1.039.000', '689.000', '289.000', '2.799.000', // detailing
  '339.000', '449.000', '1.000.000',         // subscriptions
  '249.000',                                    // detailing wash discount
]

// ─── Conversation Context (minimal — only reliable signals) ──────────
export interface ConvoContext {
  currentState?: string
  customerName: string | null
  alreadyIntroduced: boolean
  introPitchGiven: boolean
  imagesSentCategories: string[] // ['wash'], ['detailing'], or both
  language: 'id' | 'en'
  totalCarsRequested: number | null
  carsBooked: number
}

type Msg = { role: string; content: string; [key: string]: any }

// ─── Pre-Call: Extract Context (only reliable signals) ───────────────

export function extractContext(messages: Msg[]): ConvoContext {
  const ctx: ConvoContext = {
    customerName: null,
    alreadyIntroduced: false,
    introPitchGiven: false,
    imagesSentCategories: [],
    language: 'id',
    totalCarsRequested: null,
    carsBooked: 0,
  }

  for (const m of messages) {
    const c = m.content || ''

    // Introduction check (assistant said "Shera dari Castudio")
    if (m.role === 'assistant' && /Shera dari Castudio|I'm Shera from Castudio/i.test(c)) {
      ctx.alreadyIntroduced = true
    }

    // Intro pitch check (assistant gave the full Castudio description)
    if (m.role === 'assistant' && /layanan cuci mobil.*detailing.*premium|premium car wash.*detailing/i.test(c)) {
      ctx.introPitchGiven = true
    }

    // Images sent (code tags these with [IMAGES_SENT])
    if (m.role === 'assistant' && c.includes('[IMAGES_SENT]')) {
      if (/cuci|wash|standard|professional|elite/i.test(c)) ctx.imagesSentCategories.push('wash')
      if (/detail|interior|exterior|window|tire|full/i.test(c)) ctx.imagesSentCategories.push('detailing')
      if (ctx.imagesSentCategories.length === 0) ctx.imagesSentCategories.push('unknown')
    }

    // Language detection — checks ALL user messages, switches if any is clearly English
    if (m.role === 'user' && ctx.language === 'id') {
      const hasEnglish = /\b(hello|good morning|good afternoon|I want|my name is|what|how much|please|thank you|thanks|can you|could you|would you|speak english|in english|english please|yes|no thanks|sure|great|awesome|perfect|sounds good|let me|I'd like|I would|how long|how about|car wash)\b/i.test(c)
      const hasIndonesian = /\b(halo|hallo|hai|selamat|mau|saya|aku|cuci|mobil|tolong|bisa|boleh|berapa|kapan|dimana|gimana|dong|deh|nih|kak|bang|mas)\b/i.test(c)
      if (hasEnglish && !hasIndonesian) ctx.language = 'en'
      // Explicit language request overrides everything
      if (/\b(speak|talk|reply|respond|chat)\s+(in\s+)?english\b|\benglish\s+please\b|\bin\s+english\b/i.test(c)) ctx.language = 'en'
    }

    // Customer name — from assistant "kak [Name]" OR from user "nama saya [Name]"
    if (m.role === 'assistant' && !ctx.customerName) {
      const nameMatch = c.match(/kak\s+(\w+)/i)
      const ASSISTANT_SKIP = new Set(['kak','can','could','would','should','will','do','does','did','mau','ingin','bukan','the','this','what','how','yang'])
      if (nameMatch && !ASSISTANT_SKIP.has(nameMatch[1].toLowerCase())) {
        ctx.customerName = nameMatch[1]
      }
    }
    if (m.role === 'user' && !ctx.customerName) {
      const SKIP = new Set([
        // Indonesian common words
        'mau','apa','cuci','detailing','halo','hai','hello','hi','iya','ok','oke','boleh','bisa','sip','siap','ya','tidak','ga','gak',
        'ingin','tahu','tau','dari','lagi','juga','baru','bukan','bkn','cuma','udah','sudah','belum','blm','dong','deh','nih','sih',
        'minta','tanya','cari','lihat','liat','punya','ada','perlu','butuh','pengen','banget','sekali',
        // Question words (prevent "siapa"/"shapa"/"apa" as names)
        'siapa','sapa','shapa','kenapa','mengapa','gimana','bagaimana','kapan','dimana','berapa','brp',
        // Negations/corrections
        'bener','benar','salah','emang','ngga','nggak','enggak','engga','jangan','kagak',
        // Slang/profanity (real users use these)
        'bacot','kontol','anjir','anjing','gila','cok','tot','bangsat','bego','tolol','kampret','asu','cuk','jancok',
        // English common words (prevent "Can", "Will", etc as names)
        'can','could','would','should','will','do','does','did','want','need','yes','no','sure','thanks','please',
        'the','this','that','what','how','why','when','where','who','which',
        // Service words
        'standard','professional','elite','wash','interior','exterior','window','tire','full','detail','mobil',
      ])
      const TITLES = new Set(['mas','bang','mbak','kak','pak','bu','om','bro','sis','mr','mrs','ms'])

      // Pattern: "nama saya X", "I'm X", "my name is X", "panggil saya X", "call me X"
      const patterns = [
        /nama\s+(?:saya|aku|gue|gw)\s+(\w+)/i,
        /(?:I'm|my name is|i am|this is)\s+(\w+)/i,
        /(?:panggil|call)\s+(?:saya|aku|me)\s+(\w+)/i,
      ]
      // "saya [Name]" only if followed by a capitalized word (likely a proper name)
      if (!ctx.customerName) {
        const sayaMatch = c.match(/\bsaya\s+([A-Z]\w+)/);
        if (sayaMatch && sayaMatch[1].length >= 2 && !SKIP.has(sayaMatch[1].toLowerCase())) {
          ctx.customerName = sayaMatch[1]
        }
      }
      for (const p of patterns) {
        const match = c.match(p)
        if (match && match[1].length >= 2 && !SKIP.has(match[1].toLowerCase())) {
          ctx.customerName = match[1]
          break
        }
      }

      // Direct reply: if previous message asked for name
      if (!ctx.customerName) {
        const idx = messages.indexOf(m)
        const prev = idx > 0 ? messages[idx - 1] : null
        if (prev?.role === 'assistant' && /namanya siapa|your name/i.test(prev.content || '')) {
          const words = c.trim().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length >= 2)
          if (words.length >= 1 && words.length <= 5) {
            let name = words[0]
            if (TITLES.has(name.toLowerCase()) && words.length >= 2) name = words[1]
            if (name.length >= 2 && !SKIP.has(name.toLowerCase()) && /^[a-zA-Z]/.test(name)) {
              ctx.customerName = name
            }
          }
        }
      }
    }

    // Multi-car count
    if (m.role === 'user' && !ctx.totalCarsRequested) {
      const multiMatch = c.match(/(\d+)\s*mobil/i)
      if (multiMatch) ctx.totalCarsRequested = parseInt(multiMatch[1])
    }

    // Booking count
    if (m.role === 'assistant' && /booking.*beres|booking.*udah.*buat|sudah.*confirm/i.test(c)) {
      ctx.carsBooked++
    }
  }

  return ctx
}

// ─── Format Context for Prompt Injection (minimal) ───────────────────

export function formatContextBlock(ctx: ConvoContext): string {
  let block = '\n--- Context ---'
  block += `\nCustomer: ${ctx.customerName || 'UNKNOWN'}`
  block += `\nLanguage: ${ctx.language === 'en' ? 'English — RESPOND FULLY IN ENGLISH, NO INDONESIAN' : 'Indonesian'}`
  block += `\nIntro: ${ctx.alreadyIntroduced ? 'DONE' : 'NOT YET'} | Pitch: ${ctx.introPitchGiven ? 'DONE' : 'NOT YET'}`
  block += `\nImages sent: ${ctx.imagesSentCategories.length > 0 ? ctx.imagesSentCategories.join(', ') : 'NONE'}`
  if (ctx.totalCarsRequested && ctx.totalCarsRequested > 1) {
    block += `\nMulti-car: ${ctx.totalCarsRequested} requested, ${ctx.carsBooked} booked`
  }
  return block
}

// ─── Post-Call: Validate Response (hard rules only) ──────────────────

export interface ValidationResult {
  valid: boolean
  output: string
  issues: string[]
  shouldRegenerate: boolean
}

export function validateResponse(response: string, ctx: ConvoContext): ValidationResult {
  let output = response
  const issues: string[] = []

  // 0. Enforce intro template (exact text, not AI-generated)
  if (ctx.currentState === 'intro' && ctx.customerName && !ctx.introPitchGiven) {
    const name = ctx.customerName
    if (ctx.language === 'en') {
      output = `Nice to meet you ${name}! 😊\n\nSo Castudio is a premium car wash & detailing service that comes directly to your home. No delivery fee and no deposit needed, we just need access to water and electricity.\n\nWe take our work seriously — if you're not satisfied with the result, we'll come back and fix it at zero cost 🙏\n\nFor now we only serve the Jabodetabek area (Jakarta, Bogor, Depok, Tangerang, Bekasi) ya.\n\nAre you looking to get your car washed or detailed?`
    } else {
      output = `Salam kenal kak ${name} 😊\n\nJadi Castudio itu layanan cuci mobil & detailing premium yang datang langsung ke rumah kak. Ga ada biaya antar dan ga perlu deposit, kita cuma butuh akses air sama listrik aja ya.\n\nOh iya, kita serius soal kualitas — kalau kak ga puas sama hasilnya, kita balik lagi buat benerin tanpa biaya tambahan 🙏\n\nUntuk saat ini kita baru bisa layani area Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi) ya kak.\n\nKak ${name} lagi cari cuci mobil atau detailing nih?`
    }
    issues.push('enforced intro template')
  }

  // 1. Strip re-introduction if already introduced
  if (ctx.alreadyIntroduced && /Halo!?\s*Aku Shera dari Castudio|Hi!?\s*I'm Shera from Castudio/i.test(output)) {
    output = output.replace(/.*(?:Aku Shera dari Castudio|I'm Shera from Castudio).*(?:siapa ya\?|your name\?)?\s*/i, '').trim()
    issues.push('stripped re-introduction')
  }

  // 2. Hallucinated prices — strip fake prices
  const priceMatches = output.match(/Rp\s*[\d.]+\.000/gi)
  if (priceMatches) {
    for (const price of priceMatches) {
      const normalized = price.replace(/[Rp\s]/gi, '')
      if (normalized && !APPROVED_PRICES.includes(normalized)) {
        output = output.replace(new RegExp('[^.!?\\n]*' + price.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^.!?\\n]*[.!?]?\\s*', 'gi'), '').trim()
        issues.push(`stripped hallucinated price: ${price}`)
      }
    }
  }

  // 3. Unauthorized discounts — strip if OFFERING, not refusing
  const discountMatch = /\bdiskon\b|\bpotongan\b|\bdiscount\b|\bgratis\b|\bfree\b|\bbonus\b/i.test(output)
  const isRefusingDiscount = /ga bisa.*diskon|tidak bisa.*diskon|can't.*discount|no discount|harga.*fixed|harga.*final/i.test(output)
  if (discountMatch && !isRefusingDiscount && !/249\.?000/i.test(output)) {
    output = output.replace(/[^.!?\n]*(?:\bdiskon\b|\bpotongan\b|\bdiscount\b|\bgratis\b|\bfree\b|\bbonus\b)[^.!?\n]*[.!?]?\s*/gi, '').trim()
    issues.push('stripped unauthorized discount offer')
    if (output.length < 10) {
      output = ctx.language === 'en'
        ? "Unfortunately we can't offer discounts — our prices reflect the premium materials and thorough process we use 🙂"
        : "Sayangnya harga kita ga bisa di-diskon kak, karena kita pakai produk premium import dan prosesnya teliti 🙂"
    }
  }

  // 4. Fix gendering — pak/bu → kak
  output = output.replace(/\bpak\s+([A-Z]\w*)/g, 'kak $1')
  output = output.replace(/\bPak\s+([A-Z]\w*)/g, 'Kak $1')
  output = output.replace(/\bbu\s+([A-Z]\w*)/g, 'kak $1')
  output = output.replace(/\bBu\s+([A-Z]\w*)/g, 'Kak $1')

  // 5. Deduplicate (Grok sometimes repeats itself)
  const halfLen = Math.floor(output.length / 2)
  if (output.length > 40 && output.slice(0, halfLen).trim() === output.slice(halfLen).trim()) {
    output = output.slice(0, halfLen).trim()
    issues.push('deduplicated response')
  }

  // 6. Strip Anda/kamu
  output = output.replace(/\bAnda\b/g, 'kak')
  output = output.replace(/\bkamu\b/gi, 'kak')

  // 7. Replace dash list items with numbered list
  if (/^-\s/m.test(output)) {
    let counter = 1
    output = output.replace(/^-\s/gm, () => `${counter++}. `)
    issues.push('replaced dashes with numbers')
  }

  // 8. Strip phone number requests
  if (/nomor\s*(?:hp|telepon|telpon|wa|whatsapp)|phone\s*number/i.test(output)) {
    output = output.replace(/[^.!?\n]*(?:nomor\s*(?:hp|telepon|telpon|wa|whatsapp)|phone\s*number)[^.!?\n]*[.!?]?\s*/gi, '').trim()
    issues.push('stripped phone number request')
  }

  // 9. Detailing prereq price — 349k → 249k when detailing images were sent (not wash)
  if (ctx.imagesSentCategories.includes('detailing') && /349\.?000/i.test(output) && !/249\.?000/i.test(output)) {
    output = output.replace(/349\.000/g, '249.000')
    output = output.replace(/Rp\s*349/gi, 'Rp 249')
    issues.push('fixed 349k → 249k (detailing wash prereq)')
  }

  // 10. Ensure not empty — use context-aware fallback
  if (!output.trim()) {
    if (ctx.currentState === 'intro' && !ctx.alreadyIntroduced) {
      // First message fallback: use the standard greeting
      output = ctx.language === 'en'
        ? "Hi! I'm Shera from Castudio 😊 What's your name?"
        : 'Halo! Aku Shera dari Castudio 😊 Boleh tau namanya siapa ya?'
    } else if (ctx.currentState === 'intro' && ctx.customerName && !ctx.introPitchGiven) {
      // Name known but no pitch: use the template
      const name = ctx.customerName
      output = ctx.language === 'en'
        ? `Nice to meet you ${name}! 😊 So Castudio is a premium car wash & detailing service that comes directly to your home. Are you looking to get your car washed or detailed?`
        : `Salam kenal kak ${name} 😊 Castudio itu layanan cuci mobil & detailing premium yang datang langsung ke rumah. Lagi cari cuci mobil atau detailing nih?`
    } else {
      output = ctx.language === 'en' ? 'How can I help you?' : 'Ada yang bisa aku bantu?'
    }
    issues.push('empty response replaced')
  }

  return { valid: issues.length === 0, output, issues, shouldRegenerate: false }
}
