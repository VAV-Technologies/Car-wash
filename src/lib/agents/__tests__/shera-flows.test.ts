import { describe, it, expect, vi } from 'vitest'

// Mock Supabase to prevent env var errors
vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({ from: vi.fn() }),
}))

import { detectHints } from '../shera-preprocessor'
import { classifyCustomer, buildCustomerContext, SHERA_SYSTEM_PROMPT, SHERA_TOOLS } from '../shera'
import type { CustomerRecord } from '../shera'

/**
 * Flow tests validate that given a conversation state, the system prompt + hints
 * produce the correct context for the LLM. We don't call the LLM — we verify
 * that the inputs the LLM receives are correct.
 */

// ─── Normal Booking Flow ────────────────────────────────────────────

describe('Normal booking flow', () => {
  it('Step 1: first message "halo" → no hints, new customer context', () => {
    const hints = detectHints('halo')
    expect(hints).toEqual([])

    const ctx = buildCustomerContext(null, '+628123456789')
    expect(ctx).toContain('Customer is NEW')
    expect(ctx).toContain('Tanya nama dulu')
  })

  it('Step 2: name given "nama saya Andi" → NAME_DETECTED, stub customer context', () => {
    const hints = detectHints('nama saya Andi')
    expect(hints).toContain('NAME_DETECTED: Andi')

    // At this point customer is still a stub in DB
    const ctx = buildCustomerContext({ id: 'c1', name: 'WhatsApp User' }, '+628123456789')
    expect(ctx).toContain('INCOMPLETE')
    expect(ctx).toContain('panggil create_customer')
    expect(ctx).not.toContain('REGISTERED')
  })

  it('Step 3: "cuci mobil" → CATEGORY_DETECTED: wash', () => {
    const hints = detectHints('cuci mobil')
    expect(hints).toEqual(['CATEGORY_DETECTED: wash'])
  })

  it('Step 4: "elite wash" → SERVICE_DETECTED: elite_wash', () => {
    const hints = detectHints('mau elite wash')
    expect(hints).toEqual(['SERVICE_DETECTED: elite_wash'])
  })

  it('Step 5: car info → no special hints', () => {
    const hints = detectHints('mobilnya Honda Civic')
    expect(hints).toEqual([])
  })

  it('Step 6: plate number → no special hints', () => {
    const hints = detectHints('B 2100 STA')
    expect(hints).toEqual([])
  })

  it('Step 7: address → no special hints', () => {
    const hints = detectHints('Jl Kemang Raya No 15, Jakarta Selatan')
    expect(hints).toEqual([])
  })

  it('Step 8: schedule → no special hints', () => {
    const hints = detectHints('besok jam 10 pagi')
    expect(hints).toEqual([])
  })

  it('Step 9: returning customer → context has all saved details', () => {
    const customer: CustomerRecord = {
      id: 'c1',
      name: 'Andi',
      car_model: 'Honda Civic',
      plate_number: 'B 2100 STA',
      address: 'Jl Kemang Raya No 15',
      neighborhood: 'kemang',
    }
    const ctx = buildCustomerContext(customer, '+628123456789')
    expect(ctx).toContain('REGISTERED: Andi')
    expect(ctx).toContain('Car: Honda Civic')
    expect(ctx).toContain('Plate: B 2100 STA')
    expect(ctx).toContain('JANGAN tanya info yang sudah ada')
  })
})

// ─── Booking Form Link Injection ────────────────────────────────────

describe('Booking form link injection', () => {
  it('injects BOOKING VIA FORM block with the per-customer token', () => {
    const ctx = buildCustomerContext(null, '+628123456789', null, 'abc12345')
    expect(ctx).toContain('--- BOOKING VIA FORM ---')
    expect(ctx).toContain('https://castudio.id/book/abc12345')
    expect(ctx).toContain('JANGAN kumpulkan detail booking')
  })

  it('uses different tokens for different customers', () => {
    const ctxA = buildCustomerContext(null, '+6281111', null, 'tokenAAA')
    const ctxB = buildCustomerContext(null, '+6282222', null, 'tokenBBB')
    expect(ctxA).toContain('https://castudio.id/book/tokenAAA')
    expect(ctxA).not.toContain('tokenBBB')
    expect(ctxB).toContain('https://castudio.id/book/tokenBBB')
    expect(ctxB).not.toContain('tokenAAA')
  })

  it('omits the form block when no token provided', () => {
    const ctx = buildCustomerContext(null, '+628123456789')
    expect(ctx).not.toContain('BOOKING VIA FORM')
    expect(ctx).not.toContain('castudio.id/book/')
  })

  it('injects form link for returning customers too', () => {
    const customer: CustomerRecord = { id: 'c1', name: 'Andi' }
    const ctx = buildCustomerContext(customer, '+628123456789', null, 'xyz99999')
    expect(ctx).toContain('REGISTERED: Andi')
    expect(ctx).toContain('https://castudio.id/book/xyz99999')
  })
})

// ─── Human Nuances ──────────────────────────────────────────────────

describe('Human nuances', () => {
  it('typo "cuci mobi" still detects wash via "cuci"', () => {
    const hints = detectHints('cuci mobi')
    expect(hints).toContain('CATEGORY_DETECTED: wash')
  })

  it('slang "gue mau cuci" detects wash', () => {
    const hints = detectHints('gue mau cuci')
    expect(hints).toContain('CATEGORY_DETECTED: wash')
  })

  it('split messages "mobil\\ncuci\\nwkwk" combined → detects wash', () => {
    const hints = detectHints('mobil\ncuci\nwkwkwk')
    expect(hints).toContain('CATEGORY_DETECTED: wash')
  })

  it('"mobil" alone → no hints (ambiguous)', () => {
    const hints = detectHints('mobil')
    expect(hints).toEqual([])
  })

  it('"wkwkwk" alone → no hints', () => {
    const hints = detectHints('wkwkwk')
    expect(hints).toEqual([])
  })

  it('single period "." → no hints', () => {
    const hints = detectHints('.')
    expect(hints).toEqual([])
  })

  it('emoji only "🚗" → no hints', () => {
    const hints = detectHints('🚗')
    expect(hints).toEqual([])
  })

  it('"halo mau cuci mobil dong" → name not detected, category detected', () => {
    const hints = detectHints('halo mau cuci mobil dong')
    expect(hints).toEqual(['CATEGORY_DETECTED: wash'])
    expect(hints.some(h => h.includes('NAME_DETECTED'))).toBe(false)
  })

  it('"Hi I want wash" → detects wash', () => {
    const hints = detectHints('Hi I want wash')
    expect(hints).toContain('CATEGORY_DETECTED: wash')
  })

  it('all caps "ELITE WASH" → detects service', () => {
    const hints = detectHints('ELITE WASH')
    expect(hints).toContain('SERVICE_DETECTED: elite_wash')
  })

  it('"mau yang professional dong" → detects professional', () => {
    const hints = detectHints('mau yang professional dong')
    expect(hints).toContain('SERVICE_DETECTED: professional')
  })

  it('"ok" → no hints', () => {
    const hints = detectHints('ok')
    expect(hints).toEqual([])
  })

  it('"iya" → no hints', () => {
    const hints = detectHints('iya')
    expect(hints).toEqual([])
  })

  it('"jam 2" → no hints', () => {
    const hints = detectHints('jam 2')
    expect(hints).toEqual([])
  })

  it('"nama saya fadil, mau detailing yang paling top" → name + category', () => {
    const hints = detectHints('nama saya fadil, mau detailing yang paling top')
    expect(hints).toContain('NAME_DETECTED: fadil')
    expect(hints).toContain('CATEGORY_DETECTED: detailing')
  })
})

// ─── Question Edge Cases ────────────────────────────────────────────

describe('Question edge cases', () => {
  it('"apa bedanya standard dan professional?" → no hints (question)', () => {
    const hints = detectHints('apa bedanya standard dan professional?')
    expect(hints).toEqual([])
  })

  it('"kalau exterior detail termasuk apa aja" → no service detected (question)', () => {
    const hints = detectHints('kalau exterior detail termasuk apa aja')
    expect(hints.some(h => h.includes('SERVICE_DETECTED'))).toBe(false)
  })

  it('"does the professional wash include wax?" → no hints (question)', () => {
    const hints = detectHints('does the professional wash include wax?')
    expect(hints).toEqual([])
  })

  it('"boleh tau detail harganya" → no hints (question via "boleh")', () => {
    const hints = detectHints('boleh tau detail harganya')
    expect(hints).toEqual([])
  })

  it('"bisa reschedule ga" → no hints (question via "bisa")', () => {
    const hints = detectHints('bisa reschedule ga')
    expect(hints).toEqual([])
  })

  it('"mau elite wash" (statement, no question words) → SERVICE_DETECTED', () => {
    const hints = detectHints('mau elite wash')
    expect(hints).toContain('SERVICE_DETECTED: elite_wash')
  })

  it('"yang professional" (selection) → SERVICE_DETECTED', () => {
    const hints = detectHints('yang professional')
    expect(hints).toContain('SERVICE_DETECTED: professional')
  })
})

// ─── Tool Definitions Validation ────────────────────────────────────

describe('SHERA_TOOLS validation', () => {
  it('has send_service_images with service_type as required', () => {
    const tool = SHERA_TOOLS.find(t => t.function.name === 'send_service_images')
    expect(tool).toBeDefined()
    const params = tool!.function.parameters as any
    expect(params.required).toContain('service_type')
    expect(params.required).toContain('chat_id')
  })

  it('has create_customer with description mentioning updates', () => {
    const tool = SHERA_TOOLS.find(t => t.function.name === 'create_customer')
    expect(tool).toBeDefined()
    expect(tool!.function.description).toMatch(/update/i)
  })

  it('has escalate_to_human tool', () => {
    const tool = SHERA_TOOLS.find(t => t.function.name === 'escalate_to_human')
    expect(tool).toBeDefined()
  })

  it('send_service_images description forbids calling without customer intent', () => {
    const tool = SHERA_TOOLS.find(t => t.function.name === 'send_service_images')
    expect(tool!.function.description).toMatch(/ONLY call this AFTER/i)
  })

  it('all tools have required parameters', () => {
    for (const tool of SHERA_TOOLS) {
      const params = tool.function.parameters as any
      expect(params.required).toBeDefined()
      expect(params.required.length).toBeGreaterThan(0)
    }
  })
})

// ─── System Prompt Safety Checks ────────────────────────────────────

describe('System prompt safety checks', () => {
  it('prompt does not contain actual API keys or secrets', () => {
    expect(SHERA_SYSTEM_PROMPT).not.toMatch(/sk-[a-zA-Z0-9]{20,}/)
    expect(SHERA_SYSTEM_PROMPT).not.toMatch(/eyJ[a-zA-Z0-9]{20,}/)
    expect(SHERA_SYSTEM_PROMPT).not.toMatch(/password|secret|token/i)
  })

  it('prompt mentions Castudio as the brand', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('Castudio')
  })

  it('prompt does not contain competitor names', () => {
    // Should not hardcode competitor names
    expect(SHERA_SYSTEM_PROMPT).not.toMatch(/\b(AutoGlaze|SparkClean|CarSpa)\b/)
  })
})
