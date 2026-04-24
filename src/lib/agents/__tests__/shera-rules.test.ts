import { describe, it, expect } from 'vitest'
import { extractContext, formatContextBlock, validateResponse, type ConvoContext } from '../shera-rules'

function baseCtx(overrides: Partial<ConvoContext> = {}): ConvoContext {
  return {
    customerName: 'Budi',
    alreadyIntroduced: true,
    introPitchGiven: true,
    imagesSentCategories: [],
    language: 'id',
    totalCarsRequested: null,
    carsBooked: 0,
    ...overrides,
  }
}

// ─── extractContext: reliable signals only ────────────────────────────

describe('extractContext', () => {
  it('detects introduction', () => {
    const msgs = [{ role: 'assistant', content: 'Halo! Aku Shera dari Castudio 😊' }]
    expect(extractContext(msgs).alreadyIntroduced).toBe(true)
  })

  it('detects intro pitch', () => {
    const msgs = [{ role: 'assistant', content: 'Castudio itu layanan cuci mobil & detailing premium yang datang...' }]
    expect(extractContext(msgs).introPitchGiven).toBe(true)
  })

  it('detects wash images sent', () => {
    const msgs = [{ role: 'assistant', content: '[IMAGES_SENT] standard wash, professional, elite' }]
    expect(extractContext(msgs).imagesSentCategories).toContain('wash')
  })

  it('detects detailing images sent', () => {
    const msgs = [{ role: 'assistant', content: '[IMAGES_SENT] interior detail, exterior detail' }]
    expect(extractContext(msgs).imagesSentCategories).toContain('detailing')
  })

  it('detects English language', () => {
    const msgs = [{ role: 'user', content: 'Hello good morning' }]
    expect(extractContext(msgs).language).toBe('en')
  })

  it('defaults to Indonesian', () => {
    const msgs = [{ role: 'user', content: 'Halo malam' }]
    expect(extractContext(msgs).language).toBe('id')
  })

  it('extracts customer name from assistant message', () => {
    const msgs = [{ role: 'assistant', content: 'Salam kenal kak Viktor 😊' }]
    expect(extractContext(msgs).customerName).toBe('Viktor')
  })

  it('detects multi-car request', () => {
    const msgs = [{ role: 'user', content: 'mau pesen buat 3 mobil' }]
    expect(extractContext(msgs).totalCarsRequested).toBe(3)
  })

  it('counts bookings', () => {
    const msgs = [
      { role: 'assistant', content: 'Booking udah beres ya kak!' },
      { role: 'assistant', content: 'Booking kedua sudah confirm!' },
    ]
    expect(extractContext(msgs).carsBooked).toBe(2)
  })

  it('does NOT detect schedule from "Halo malam"', () => {
    // This was bug #1 — "malam" was incorrectly detected as schedule
    const msgs = [{ role: 'user', content: 'Halo malam' }]
    const ctx = extractContext(msgs)
    // ConvoContext no longer has schedule field — this is the fix
    expect(ctx).not.toHaveProperty('schedule')
  })
})

// ─── formatContextBlock ──────────────────────────────────────────────

describe('formatContextBlock', () => {
  it('shows customer name', () => {
    expect(formatContextBlock(baseCtx())).toContain('Budi')
  })

  it('shows images sent', () => {
    expect(formatContextBlock(baseCtx({ imagesSentCategories: ['wash'] }))).toContain('wash')
  })

  it('shows multi-car progress', () => {
    expect(formatContextBlock(baseCtx({ totalCarsRequested: 3, carsBooked: 1 }))).toContain('3 requested')
  })
})

// ─── validateResponse: hard rules ────────────────────────────────────

describe('validateResponse — hallucinated prices', () => {
  it('strips Rp 500.000 (not approved)', () => {
    const result = validateResponse('Harganya Rp 500.000 kak.', baseCtx())
    expect(result.output).not.toContain('500.000')
  })

  it('keeps Rp 349.000 (approved)', () => {
    const result = validateResponse('Standard Wash Rp 349.000 kak.', baseCtx())
    expect(result.output).toContain('349.000')
  })
})

describe('validateResponse — unauthorized discounts', () => {
  it('replaces discount offer with refusal', () => {
    const result = validateResponse('Aku kasih diskon 50% ya kak.', baseCtx())
    expect(result.output).toContain('ga bisa')
    expect(result.issues.some(i => i.includes('discount'))).toBe(true)
  })

  it('keeps discount refusals', () => {
    const result = validateResponse('Sayangnya ga bisa diskon kak.', baseCtx())
    expect(result.output).toContain('diskon')
  })
})

describe('validateResponse — gendering', () => {
  it('replaces Pak with Kak', () => {
    const result = validateResponse('Baik Pak Robert, mau booking?', baseCtx())
    expect(result.output).toContain('Kak Robert')
    expect(result.output).not.toContain('Pak Robert')
  })

  it('replaces Bu with Kak', () => {
    const result = validateResponse('Baik Bu Dina, pilih mana?', baseCtx())
    expect(result.output).toContain('Kak Dina')
  })
})

describe('validateResponse — Anda/kamu', () => {
  it('replaces Anda with kak', () => {
    const result = validateResponse('Anda bisa pilih paket.', baseCtx())
    expect(result.output).toContain('kak bisa pilih')
  })
})

describe('validateResponse — phone number strip', () => {
  it('strips phone number request', () => {
    const result = validateResponse('Boleh kasih nomor HP kak?', baseCtx())
    expect(result.output).not.toContain('nomor HP')
  })
})

describe('validateResponse — detailing prereq price', () => {
  it('fixes 349k to 249k in detailing context', () => {
    const ctx = baseCtx({ imagesSentCategories: ['detailing'] })
    const result = validateResponse('Standard Wash Rp 349.000 ya kak.', ctx)
    expect(result.output).toContain('249.000')
    expect(result.output).not.toContain('349.000')
  })

  it('does NOT fix 349k in wash context', () => {
    const ctx = baseCtx({ imagesSentCategories: ['wash'] })
    const result = validateResponse('Standard Wash Rp 349.000 ya kak.', ctx)
    expect(result.output).toContain('349.000')
  })

  it('leaves both alone when 249k already present (comparison)', () => {
    const ctx = baseCtx({ imagesSentCategories: ['detailing'] })
    const result = validateResponse('Biasanya 349.000, tapi buat detailing cuma 249.000.', ctx)
    expect(result.output).toContain('349.000')
    expect(result.output).toContain('249.000')
  })
})

describe('validateResponse — intro template', () => {
  it('enforces intro pitch for Indonesian', () => {
    const ctx = baseCtx({ currentState: 'intro', introPitchGiven: false })
    const result = validateResponse('Hai kak Budi!', ctx)
    expect(result.output).toContain('Salam kenal kak Budi')
    expect(result.output).toContain('Jabodetabek')
    expect(result.output).toContain('cuci mobil atau detailing')
  })

  it('enforces intro pitch for English', () => {
    const ctx = baseCtx({ currentState: 'intro', introPitchGiven: false, language: 'en' })
    const result = validateResponse('Hi Budi!', ctx)
    expect(result.output).toContain('Nice to meet you Budi')
    expect(result.output).toContain('Jabodetabek')
  })

  it('does NOT enforce if pitch already given', () => {
    const ctx = baseCtx({ currentState: 'intro', introPitchGiven: true })
    const result = validateResponse('Kak Budi mau apa?', ctx)
    expect(result.output).toBe('Kak Budi mau apa?')
  })
})

describe('validateResponse — deduplication', () => {
  it('deduplicates repeated output', () => {
    const repeated = 'Siap kak, aku catat ya. Siap kak, aku catat ya.'
    const result = validateResponse(repeated, baseCtx())
    expect(result.output).toBe('Siap kak, aku catat ya.')
  })
})

describe('validateResponse — empty response', () => {
  it('replaces empty with fallback', () => {
    const result = validateResponse('', baseCtx())
    expect(result.output).toContain('bantu')
  })
})

describe('validateResponse — dash replacement', () => {
  it('replaces dashes with numbers', () => {
    const result = validateResponse('- Standard\n- Professional\n- Elite', baseCtx())
    expect(result.output).toContain('1. Standard')
    expect(result.output).toContain('2. Professional')
  })
})
