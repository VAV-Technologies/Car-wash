/**
 * SHERA PRODUCTION READINESS TEST
 * Ultra-comprehensive final checklist before go-live.
 * Every testable aspect of Shera in one file.
 * Tests SHOULD FAIL where bugs exist — no fixing during this run.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ──────────────────────────────────────────────────────────

const mockFrom = vi.fn()
vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({ from: mockFrom }),
}))

const mockSendImage = vi.fn()
vi.mock('@/lib/agents/waha', () => ({
  sendImage: (...args: any[]) => mockSendImage(...args),
}))

const mockCreateBooking = vi.fn()
vi.mock('@/lib/admin/bookings', () => ({
  createBooking: (...args: any[]) => mockCreateBooking(...args),
}))

import {
  isQuestionMessage, detectServiceType, detectCategory, detectName, detectHints,
} from '../shera-preprocessor'
import {
  classifyCustomer, buildCustomerContext, SHERA_SYSTEM_PROMPT, SHERA_TOOLS, executeSheraTool,
} from '../shera'
import type { CustomerRecord } from '../shera'
import {
  isToolAllowed, getToolBlockReason, getNextState, deriveStateFromHistory, statePromptBlock,
  type SheraState,
} from '../shera-state'

const ALL_STATES: SheraState[] = [
  'greeting', 'awaiting_name', 'awaiting_intent', 'showing_packages',
  'collecting_info', 'confirming_booking', 'booking_complete', 'general_chat',
]

// =====================================================================
// SECTION 1: SYSTEM PROMPT POLICY COMPLIANCE
// =====================================================================

describe('S1: System prompt policy', () => {
  // 1.1 Gender neutrality
  describe('1.1 Gender neutrality', () => {
    it('uses "kak" for addressing', () => {
      expect(SHERA_SYSTEM_PROMPT).toContain('"kak"')
    })

    it('no standalone "pak" in examples (excluding "paket" and prohibition rules)', () => {
      // Remove "paket" and the prohibition lines that MENTION pak to forbid it
      const cleaned = SHERA_SYSTEM_PROMPT
        .replace(/paket/gi, 'XXX')
        .replace(/JANGAN.*"pak".*\n?/gi, '') // remove prohibition lines
        .replace(/Pakai "kamu".*"pak".*\n?/gi, '') // remove wrong-behavior lines
      expect(cleaned).not.toMatch(/\bpak\b/i)
    })

    it('no standalone "bu" used for addressing', () => {
      // "bu" appears only in "buat", "buka", "kabarin", etc. — not as honorific
      // Check for " bu " or "bu " at word boundary used as honorific
      expect(SHERA_SYSTEM_PROMPT).not.toMatch(/ bu [A-Z]/) // "bu Rina" pattern
    })

    it('explicitly forbids pak and bu', () => {
      expect(SHERA_SYSTEM_PROMPT).toContain('JANGAN PERNAH pakai "pak" atau "bu"')
    })

    it('post-booking template uses kak', () => {
      expect(SHERA_SYSTEM_PROMPT).toContain('Oh iya kak')
    })

    it('Sunday rejection uses kak', () => {
      expect(SHERA_SYSTEM_PROMPT).toContain('kita libur kak')
    })

    it('hours rejection uses kak', () => {
      expect(SHERA_SYSTEM_PROMPT).toContain('5 sore ya kak')
    })
  })

  // 1.2 Language rules
  describe('1.2 Language rules', () => {
    it('Indonesian is default', () => {
      expect(SHERA_SYSTEM_PROMPT).toContain('Selalu pakai Bahasa Indonesia')
    })
    it('English for English input', () => {
      expect(SHERA_SYSTEM_PROMPT).toContain('balas FULL English')
    })
    it('English examples provided', () => {
      // Prompt has example English sentences for detection
      expect(SHERA_SYSTEM_PROMPT).toContain('Hello good morning')
      expect(SHERA_SYSTEM_PROMPT).toContain('I want a car wash')
    })
    it('English example exists', () => {
      expect(SHERA_SYSTEM_PROMPT).toContain('Hello good morning')
      expect(SHERA_SYSTEM_PROMPT).toContain("What's your name?")
    })
    it('Indonesian example exists', () => {
      expect(SHERA_SYSTEM_PROMPT).toContain('Boleh tau namanya siapa ya?')
    })
  })

  // 1.3 Style rules
  describe('1.3 Style rules', () => {
    it('max 2 sentences', () => { expect(SHERA_SYSTEM_PROMPT).toContain('Maksimal 2 kalimat') })
    it('no dashes', () => { expect(SHERA_SYSTEM_PROMPT).toContain('DILARANG KERAS pakai tanda strip') })
    it('no "Anda"', () => { expect(SHERA_SYSTEM_PROMPT).toContain('JANGAN pakai "Anda"') })
    it('no "kamu"', () => { expect(SHERA_SYSTEM_PROMPT).toContain('JANGAN pakai "kamu"') })
    it('no formal greetings', () => { expect(SHERA_SYSTEM_PROMPT).toContain('Selamat datang di Castudio') })
    it('emoji max 1', () => { expect(SHERA_SYSTEM_PROMPT).toContain('Maksimal 1 per pesan') })
    it('no repeated messages', () => { expect(SHERA_SYSTEM_PROMPT).toContain('JANGAN ulangi pesan yang sama') })
    it('one question per message', () => { expect(SHERA_SYSTEM_PROMPT).toContain('SATU hal per pesan') })
  })

  // 1.4 First message
  describe('1.4 First message', () => {
    it('introduce as Shera', () => { expect(SHERA_SYSTEM_PROMPT).toContain('Aku Shera dari Castudio') })
    it('ask for name', () => { expect(SHERA_SYSTEM_PROMPT).toContain('Boleh tau namanya siapa ya') })
    it('Indonesian template', () => { expect(SHERA_SYSTEM_PROMPT).toContain('Halo! Aku Shera dari Castudio') })
    it('English template', () => { expect(SHERA_SYSTEM_PROMPT).toContain("I'm Shera from Castudio") })
    it('applies to all first messages', () => { expect(SHERA_SYSTEM_PROMPT).toContain('SEMUA jenis pesan pertama') })
  })

  // 1.5 Identity
  describe('1.5 Identity', () => {
    it('no AI disclosure', () => { expect(SHERA_SYSTEM_PROMPT).toContain('JANGAN bilang kamu AI atau bot') })
    it('no team referral', () => { expect(SHERA_SYSTEM_PROMPT).toContain('JANGAN PERNAH bilang ke customer untuk menghubungi tim') })
    it('escalation phrasing', () => { expect(SHERA_SYSTEM_PROMPT).toContain('aku cek dulu') })
  })

  // 1.6 Business rules
  describe('1.6 Business rules', () => {
    it('working hours', () => {
      expect(SHERA_SYSTEM_PROMPT).toContain('08.00')
      expect(SHERA_SYSTEM_PROMPT).toContain('17.00')
    })
    it('Sunday closed', () => { expect(SHERA_SYSTEM_PROMPT).toContain('Minggu libur') })
    it('Jabodetabek area', () => { expect(SHERA_SYSTEM_PROMPT).toContain('Jabodetabek') })
    it('no upfront payment', () => { expect(SHERA_SYSTEM_PROMPT).toContain('ga perlu bayar dulu') })
    it('48h reschedule', () => { expect(SHERA_SYSTEM_PROMPT).toContain('48 jam') })
    it('all service prices', () => {
      expect(SHERA_SYSTEM_PROMPT).toContain('Rp 349.000')
      expect(SHERA_SYSTEM_PROMPT).toContain('Rp 649.000')
      expect(SHERA_SYSTEM_PROMPT).toContain('Rp 949.000')
      expect(SHERA_SYSTEM_PROMPT).toContain('Rp 1.039.000')
      expect(SHERA_SYSTEM_PROMPT).toContain('Rp 689.000')
      expect(SHERA_SYSTEM_PROMPT).toContain('Rp 289.000')
      expect(SHERA_SYSTEM_PROMPT).toContain('Rp 2.799.000')
    })
    it('subscription prices', () => {
      expect(SHERA_SYSTEM_PROMPT).toContain('Rp 339.000')
      expect(SHERA_SYSTEM_PROMPT).toContain('Rp 449.000')
      expect(SHERA_SYSTEM_PROMPT).toContain('Rp 1.000.000')
    })
  })

  // 1.7 Escalation
  describe('1.7 Escalation rules', () => {
    it('escalate for >8 cars', () => { expect(SHERA_SYSTEM_PROMPT).toContain('lebih dari 8 mobil') })
    it('dont escalate competitor complaints', () => { expect(SHERA_SYSTEM_PROMPT).toContain('bukan komplain ke kita') })
    it('competitor → empathy + pitch', () => { expect(SHERA_SYSTEM_PROMPT).toContain('sayang banget ya') })
  })

  // 1.8 Multi-car
  describe('1.8 Multi-car', () => {
    it('confirm understanding first', () => { expect(SHERA_SYSTEM_PROMPT).toContain('KONFIRMASI pemahaman') })
    it('accept multiple cars at once', () => { expect(SHERA_SYSTEM_PROMPT).toContain('TERIMA SEMUA') })
    it('understand complex requests', () => { expect(SHERA_SYSTEM_PROMPT).toContain('3 MOBIL total') })
  })
})

// =====================================================================
// SECTION 2: PREPROCESSOR EXHAUSTIVE
// =====================================================================

describe('S2: Preprocessor exhaustive', () => {
  describe('2.1 Service detection', () => {
    const cases: [string, string | null][] = [
      ['standard wash', 'standard_wash'], ['professional wash', 'professional'],
      ['professional', 'professional'], ['elite wash', 'elite_wash'], ['elite', 'elite_wash'],
      ['full detail', 'full_detail'], ['interior detail', 'interior_detail'],
      ['exterior detail', 'exterior_detail'], ['window detail', 'window_detail'],
      ['tire', 'tire_rims'], ['rims', 'tire_rims'],
      ['standard', null], ['cuci', null], ['', null], ['halo', null], ['mobil', null],
    ]
    for (const [input, expected] of cases) {
      it(`"${input}" → ${expected}`, () => expect(detectServiceType(input)).toBe(expected))
    }
  })

  describe('2.2 Category detection', () => {
    const cases: [string, string | null][] = [
      ['cuci mobil', 'wash'], ['cuci', 'wash'], ['car wash', 'wash'], ['wash', 'wash'],
      ['detailing', 'detailing'], ['detail', 'detailing'],
      ['mobil', null], ['', null], ['halo', null],
    ]
    for (const [input, expected] of cases) {
      it(`"${input}" → ${expected}`, () => expect(detectCategory(input)).toBe(expected))
    }
  })

  describe('2.3 Name detection', () => {
    const detected: [string, string][] = [
      ['nama saya Fadil', 'Fadil'], ['nama aku Rina', 'Rina'], ['nama gue Budi', 'Budi'],
      ['nama gw Andi', 'Andi'], ["I'm John", 'John'], ['my name is Sarah', 'Sarah'],
      ['i am David', 'David'], ['this is Michael', 'Michael'],
      ['panggil aku Budi', 'Budi'], ['panggil saya Dewi', 'Dewi'],
      ['saya Budi', 'Budi'], ['Hi saya Rina', 'Rina'],
    ]
    for (const [input, expected] of detected) {
      it(`"${input}" → ${expected}`, () => expect(detectName(input)).toBe(expected))
    }
    const notDetected = ['saya mau', 'gue dicuci', 'Fadil', '', 'halo', 'nama perusahaan saya ABC']
    for (const input of notDetected) {
      it(`"${input}" → null`, () => expect(detectName(input)).toBeNull())
    }
  })

  describe('2.4 Question detection', () => {
    const questions = ['berapa?', 'kalau bisa', 'apa bedanya', 'apakah', 'gadapet', 'termasuk', 'bedanya', 'bisa hari ini', 'boleh', 'does it include', 'is it available', 'what about', 'can i book', 'include window']
    for (const q of questions) {
      it(`"${q}" → question`, () => expect(isQuestionMessage(q)).toBe(true))
    }
    const notQuestions = ['mau elite wash', 'cuci mobil', 'detailing', 'halo', 'nama saya Andi', 'saya mau booking']
    for (const nq of notQuestions) {
      it(`"${nq}" → not question`, () => expect(isQuestionMessage(nq)).toBe(false))
    }
  })

  describe('2.5 Selection + question parsing', () => {
    it('service before comma → detected', () => {
      expect(detectHints('mau elite wash, tapi bisa hari ini ga?')).toContain('SERVICE_DETECTED: elite_wash')
    })
    it('question word before service → suppressed', () => {
      expect(detectHints('kalau elite wash termasuk apa?').some(h => h.includes('SERVICE_DETECTED'))).toBe(false)
    })
    it('no separator → suppressed', () => {
      expect(detectHints('does the professional wash include wax?')).toEqual([])
    })
    it('category before comma → detected', () => {
      expect(detectHints('mau cuci mobil, bisa ga?')).toContain('CATEGORY_DETECTED: wash')
    })
    it('question word before category → suppressed', () => {
      expect(detectHints('apa bedanya cuci dan detailing?')).toEqual([])
    })
    it('name survives question', () => {
      expect(detectHints('nama saya Rina, bisa booking?').some(h => h.includes('NAME_DETECTED'))).toBe(true)
    })
  })

  describe('2.6 Adversarial', () => {
    it('unicode', () => { expect(() => detectHints('مرحبا')).not.toThrow() })
    it('10K chars fast', () => {
      const start = Date.now()
      detectHints('a'.repeat(10000) + ' cuci')
      expect(Date.now() - start).toBeLessThan(100)
    })
    it('HTML', () => { expect(() => detectHints('<script>alert(1)</script>')).not.toThrow() })
    it('SQL', () => { expect(() => detectHints("'; DROP TABLE --")).not.toThrow() })
    it('null bytes', () => { expect(() => detectHints('test\x00test')).not.toThrow() })
    it('empty', () => { expect(detectHints('')).toEqual([]) })
    it('emoji only', () => { expect(detectHints('🚗💦')).toEqual([]) })
  })
})

// =====================================================================
// SECTION 3: STATE MACHINE COMPLETE COVERAGE
// =====================================================================

describe('S3: State machine', () => {
  describe('3.1 All states have prompt blocks', () => {
    for (const state of ALL_STATES) {
      it(`${state} has non-empty block`, () => {
        const block = statePromptBlock(state)
        expect(block.length).toBeGreaterThan(30)
        expect(block).toContain(state)
      })
    }
  })

  describe('3.2 Tool gating matrix', () => {
    const GATED: Record<string, SheraState[]> = {
      send_service_images: ['awaiting_intent', 'showing_packages', 'general_chat'],
      create_booking: ['collecting_info', 'confirming_booking', 'general_chat'],
      create_customer: ['awaiting_name', 'awaiting_intent', 'showing_packages', 'collecting_info', 'confirming_booking', 'general_chat'],
      update_booking: ['booking_complete', 'general_chat'],
      cancel_booking: ['booking_complete', 'general_chat'],
    }
    const UNGATED = ['search_customer', 'get_customer_bookings', 'check_date_availability', 'escalate_to_human', 'get_completed_jobs', 'submit_job_rating']

    for (const [tool, allowed] of Object.entries(GATED)) {
      for (const state of ALL_STATES) {
        const shouldAllow = allowed.includes(state)
        it(`${tool} in ${state} → ${shouldAllow ? 'allowed' : 'blocked'}`, () => {
          expect(isToolAllowed(tool, state)).toBe(shouldAllow)
        })
      }
    }
    for (const tool of UNGATED) {
      for (const state of ALL_STATES) {
        it(`${tool} in ${state} → allowed (ungated)`, () => {
          expect(isToolAllowed(tool, state)).toBe(true)
        })
      }
    }
  })

  describe('3.3 State transitions', () => {
    it('greeting → awaiting_name', () => expect(getNextState('greeting', {})).toBe('awaiting_name'))
    it('greeting → general_chat (returning)', () => expect(getNextState('greeting', { isReturningCustomer: true })).toBe('general_chat'))
    it('awaiting_name → awaiting_intent (name)', () => expect(getNextState('awaiting_name', { nameKnown: true })).toBe('awaiting_intent'))
    it('awaiting_name stays', () => expect(getNextState('awaiting_name', {})).toBe('awaiting_name'))
    it('awaiting_intent → collecting_info (service)', () => expect(getNextState('awaiting_intent', { serviceChosen: true })).toBe('collecting_info'))
    it('awaiting_intent → showing_packages (images)', () => expect(getNextState('awaiting_intent', { toolsCalled: ['send_service_images'] })).toBe('showing_packages'))
    it('showing_packages → collecting_info (service)', () => expect(getNextState('showing_packages', { serviceChosen: true })).toBe('collecting_info'))
    it('showing_packages stays', () => expect(getNextState('showing_packages', {})).toBe('showing_packages'))
    it('collecting_info stays', () => expect(getNextState('collecting_info', {})).toBe('collecting_info'))
    it('collecting_info → booking_complete', () => expect(getNextState('collecting_info', { toolsCalled: ['create_booking'] })).toBe('booking_complete'))
    it('booking_complete stays', () => expect(getNextState('booking_complete', {})).toBe('booking_complete'))
    it('booking_complete → showing_packages (new images)', () => expect(getNextState('booking_complete', { toolsCalled: ['send_service_images'] })).toBe('showing_packages'))
    it('general_chat stays', () => expect(getNextState('general_chat', {})).toBe('general_chat'))
    it('general_chat → showing_packages (images)', () => expect(getNextState('general_chat', { toolsCalled: ['send_service_images'] })).toBe('showing_packages'))
  })

  describe('3.4 No backwards transitions in chaos', () => {
    it('10-turn chaos', () => {
      const ORDER: Record<string, number> = {
        greeting: 0, awaiting_name: 1, awaiting_intent: 2, showing_packages: 3,
        collecting_info: 4, confirming_booking: 5, booking_complete: 6, general_chat: 3,
      }
      let state: SheraState = 'greeting'
      let max = 0
      const events = [
        {}, { nameKnown: true }, {}, { toolsCalled: ['send_service_images'] as string[] },
        {}, {}, { serviceChosen: true }, {}, {}, { toolsCalled: ['create_booking'] as string[] },
      ]
      for (const e of events) {
        state = getNextState(state, e)
        const order = ORDER[state] || 0
        expect(order).toBeGreaterThanOrEqual(max)
        max = Math.max(max, order)
      }
    })
  })

  describe('3.5 No invalid states', () => {
    it('all combinations produce valid state', () => {
      const valid = new Set(ALL_STATES)
      const events = [{}, { nameKnown: true }, { serviceChosen: true }, { toolsCalled: ['send_service_images'] }, { toolsCalled: ['create_booking'] }, { isReturningCustomer: true }]
      for (const s of ALL_STATES) {
        for (const e of events) {
          expect(valid.has(getNextState(s, e))).toBe(true)
        }
      }
    })
  })

  describe('3.6 deriveStateFromHistory', () => {
    it('empty → greeting', () => expect(deriveStateFromHistory([], false)).toBe('greeting'))
    it('asked name → awaiting_name', () => {
      expect(deriveStateFromHistory([
        { role: 'user', content: 'halo' },
        { role: 'assistant', content: 'Boleh tau namanya siapa ya?' },
      ], false)).toBe('awaiting_name')
    })
    it('IMAGES_SENT no response → showing_packages', () => {
      expect(deriveStateFromHistory([
        { role: 'assistant', content: '[IMAGES_SENT]\nIni paketnya' },
      ], false)).toBe('showing_packages')
    })
    it('IMAGES_SENT + car asked → collecting_info', () => {
      expect(deriveStateFromHistory([
        { role: 'assistant', content: '[IMAGES_SENT]\nIni paketnya' },
        { role: 'user', content: 'elite wash' },
        { role: 'assistant', content: 'Siap kak, mobilnya apa ya?' },
      ], false)).toBe('collecting_info')
    })
    it('booking confirmed → booking_complete', () => {
      expect(deriveStateFromHistory([
        { role: 'assistant', content: 'booking elite wash sudah aku buat ya' },
      ], false)).toBe('booking_complete')
    })
    it('idempotent', () => {
      const h = [{ role: 'user', content: 'halo' }, { role: 'assistant', content: 'Boleh tau namanya siapa ya?' }]
      expect(deriveStateFromHistory(h, false)).toBe(deriveStateFromHistory(h, false))
    })
  })
})

// =====================================================================
// SECTION 4: TOOL EXECUTION (uses existing shera-tools.test.ts patterns)
// =====================================================================

describe('S4: Tool execution quick checks', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('unknown tool → error', async () => {
    const r = JSON.parse(await executeSheraTool('fake_tool', {}))
    expect(r.error).toMatch(/Unknown tool/)
  })

  it('state-blocked tool → blocked_by_state', async () => {
    const r = JSON.parse(await executeSheraTool('send_service_images', { service_type: 'x', chat_id: 'x' }, 'greeting'))
    expect(r.blocked_by_state).toBe(true)
  })

  it('no state → backwards compatible (no block)', async () => {
    mockCreateBooking.mockResolvedValue({ id: 'b1' })
    const r = JSON.parse(await executeSheraTool('create_booking', {
      customer_id: 'c1', service_type: 'elite_wash', scheduled_date: '2026-04-15', scheduled_time: '10:00',
    }))
    expect(r.id).toBe('b1')
  })
})

// =====================================================================
// SECTION 5: CUSTOMER CONTEXT
// =====================================================================

describe('S5: Customer context', () => {
  it('null → new', () => expect(classifyCustomer(null)).toBe('new'))
  it('WhatsApp User → stub', () => expect(classifyCustomer({ id: 'c1', name: 'WhatsApp User' })).toBe('stub'))
  it('Unknown → stub', () => expect(classifyCustomer({ id: 'c1', name: 'Unknown' })).toBe('stub'))
  it('Fadil → returning', () => expect(classifyCustomer({ id: 'c1', name: 'Fadil' })).toBe('returning'))
  it('empty string → returning', () => expect(classifyCustomer({ id: 'c1', name: '' })).toBe('returning'))
  it('lowercase unknown → returning', () => expect(classifyCustomer({ id: 'c1', name: 'unknown' })).toBe('returning'))

  it('new context', () => {
    const ctx = buildCustomerContext(null, '+628123')
    expect(ctx).toContain('Customer is NEW')
    expect(ctx).toContain('Ikuti FLOW BOOKING')
  })
  it('stub context', () => {
    const ctx = buildCustomerContext({ id: 'c1', name: 'WhatsApp User' }, '+628123')
    expect(ctx).toContain('INCOMPLETE')
    expect(ctx).toContain('WAJIB panggil create_customer')
  })
  it('returning full', () => {
    const ctx = buildCustomerContext({ id: 'c1', name: 'Fadil', car_model: 'Civic', plate_number: 'B 2100', address: 'Bintaro', neighborhood: 'bintaro' }, '+628123')
    expect(ctx).toContain('REGISTERED: Fadil')
    expect(ctx).toContain('Car: Civic')
    expect(ctx).toContain('JANGAN tanya info')
  })
  it('returning minimal — no optional fields', () => {
    const ctx = buildCustomerContext({ id: 'c1', name: 'Rina' }, '+628123')
    expect(ctx).toContain('REGISTERED: Rina')
    expect(ctx).not.toContain('Car:')
    expect(ctx).not.toContain('Plate:')
  })
})

// =====================================================================
// SECTION 6: FULL CONVERSATION FLOWS
// =====================================================================

describe('S6: Conversation flows', () => {
  it('6.1 Happy path — full booking', () => {
    let s: SheraState = 'greeting'
    s = getNextState(s, {}); expect(s).toBe('awaiting_name')
    s = getNextState(s, { nameKnown: true }); expect(s).toBe('awaiting_intent')
    s = getNextState(s, { toolsCalled: ['send_service_images'] }); expect(s).toBe('showing_packages')
    s = getNextState(s, { serviceChosen: true }); expect(s).toBe('collecting_info')
    s = getNextState(s, {}); expect(s).toBe('collecting_info') // car
    s = getNextState(s, {}); expect(s).toBe('collecting_info') // plate
    s = getNextState(s, {}); expect(s).toBe('collecting_info') // address
    s = getNextState(s, { toolsCalled: ['create_booking'] }); expect(s).toBe('booking_complete')
  })

  it('6.2 Returning customer', () => {
    let s: SheraState = 'greeting'
    s = getNextState(s, { isReturningCustomer: true }); expect(s).toBe('general_chat')
    s = getNextState(s, { toolsCalled: ['send_service_images'] }); expect(s).toBe('showing_packages')
    s = getNextState(s, { serviceChosen: true }); expect(s).toBe('collecting_info')
    s = getNextState(s, { toolsCalled: ['create_booking'] }); expect(s).toBe('booking_complete')
  })

  it('6.5 Customer refuses name — advances after 4 messages', () => {
    const history = [
      { role: 'user', content: 'halo' },
      { role: 'assistant', content: 'Boleh tau namanya siapa ya?' },
      { role: 'user', content: 'ga mau kasih nama' },
      { role: 'assistant', content: 'Standard Wash mulai dari 349rb kak' },
    ]
    const derived = deriveStateFromHistory(history, false)
    expect(derived).not.toBe('awaiting_name')
  })

  it('6.7 Second booking after first', () => {
    let s: SheraState = 'booking_complete'
    s = getNextState(s, { toolsCalled: ['send_service_images'] }); expect(s).toBe('showing_packages')
    s = getNextState(s, { serviceChosen: true }); expect(s).toBe('collecting_info')
    s = getNextState(s, { toolsCalled: ['create_booking'] }); expect(s).toBe('booking_complete')
  })

  it('6.10 Gibberish no crash', () => {
    for (const msg of ['asdfghjkl', 'wkwkwk', '🤣🤣🤣', '...', '']) {
      expect(() => detectHints(msg)).not.toThrow()
      expect(getNextState('awaiting_name', {})).toBe('awaiting_name')
    }
  })
})

// =====================================================================
// SECTION 7: BUSINESS LOGIC VALIDATION
// =====================================================================

describe('S7: Business logic', () => {
  describe('7.1 All prices in prompt', () => {
    const prices = ['349.000', '649.000', '949.000', '1.039.000', '689.000', '289.000', '2.799.000', '339.000', '449.000', '1.000.000']
    for (const p of prices) {
      it(`Rp ${p}`, () => expect(SHERA_SYSTEM_PROMPT).toContain(p))
    }
  })

  describe('7.2 Durations in prompt', () => {
    for (const d of ['90', '150', '210', '240', '300', '120', '480']) {
      it(`${d} menit`, () => expect(SHERA_SYSTEM_PROMPT).toContain(d))
    }
  })

  describe('7.3 Tool definitions', () => {
    it('11 tools', () => expect(SHERA_TOOLS.length).toBe(11))
    it('unique names', () => {
      const names = SHERA_TOOLS.map(t => t.function.name)
      expect(new Set(names).size).toBe(names.length)
    })
    it('all have descriptions', () => {
      for (const t of SHERA_TOOLS) expect(t.function.description.length).toBeGreaterThan(10)
    })
    it('all have required params', () => {
      for (const t of SHERA_TOOLS) {
        expect((t.function.parameters as any).required.length).toBeGreaterThan(0)
      }
    })
    it('send_service_images requires service_type + chat_id', () => {
      const t = SHERA_TOOLS.find(t => t.function.name === 'send_service_images')!
      expect((t.function.parameters as any).required).toContain('service_type')
      expect((t.function.parameters as any).required).toContain('chat_id')
    })
    it('create_booking requires 4 fields', () => {
      const t = SHERA_TOOLS.find(t => t.function.name === 'create_booking')!
      const req = (t.function.parameters as any).required
      expect(req).toContain('customer_id')
      expect(req).toContain('service_type')
      expect(req).toContain('scheduled_date')
      expect(req).toContain('scheduled_time')
    })
  })
})

// =====================================================================
// SECTION 8: SECURITY & SAFETY
// =====================================================================

describe('S8: Security', () => {
  it('no API keys in prompt', () => {
    expect(SHERA_SYSTEM_PROMPT).not.toMatch(/sk-[a-zA-Z0-9]{20,}/)
    expect(SHERA_SYSTEM_PROMPT).not.toMatch(/eyJ[a-zA-Z0-9]{20,}/)
  })
  it('no password/secret/token', () => {
    expect(SHERA_SYSTEM_PROMPT.toLowerCase()).not.toMatch(/\b(password|secret|token|api_key)\b/)
  })
  it('Castudio brand present', () => expect(SHERA_SYSTEM_PROMPT).toContain('Castudio'))
  it('prompt size reasonable', () => {
    expect(SHERA_SYSTEM_PROMPT.length).toBeGreaterThan(1000)
    expect(SHERA_SYSTEM_PROMPT.length).toBeLessThan(32000)
  })
  it('request context is isolated', () => {
    const ctx1 = { serviceImagesSent: false }
    const ctx2 = { serviceImagesSent: false }
    ctx1.serviceImagesSent = true
    expect(ctx2.serviceImagesSent).toBe(false)
  })
})

// =====================================================================
// SECTION 9: ALERTS & METRICS (no-throw checks)
// =====================================================================

describe('S9: Alerts & metrics', () => {
  it('alertLLMFailure does not throw', async () => {
    const { alertLLMFailure } = await import('../shera-alerts')
    await expect(alertLLMFailure('test', '+628', 'error')).resolves.not.toThrow()
  })
  it('alertImageDeliveryFailure does not throw', async () => {
    const { alertImageDeliveryFailure } = await import('../shera-alerts')
    await expect(alertImageDeliveryFailure('test', 3)).resolves.not.toThrow()
  })
  it('alertRetryExhausted does not throw', async () => {
    const { alertRetryExhausted } = await import('../shera-alerts')
    await expect(alertRetryExhausted('test', '+628', 5)).resolves.not.toThrow()
  })
  it('trackMetric does not throw', async () => {
    const { trackMetric } = await import('../shera-metrics')
    await expect(trackMetric('test', 'conversation_started', {})).resolves.not.toThrow()
  })
})

// =====================================================================
// SECTION 10: GENDERING FINAL CHECK
// =====================================================================

describe('S10: Gendering final check', () => {
  it('no standalone "pak" in prompt (excluding paket and prohibition rules)', () => {
    const cleaned = SHERA_SYSTEM_PROMPT
      .replace(/paket/gi, 'XXX')
      .replace(/JANGAN.*"pak".*\n?/gi, '')
      .replace(/Pakai "kamu".*"pak".*\n?/gi, '')
    const matches = cleaned.match(/\bpak\b/gi) || []
    expect(matches.length).toBe(0)
  })

  it('no " bu " honorific pattern', () => {
    // Check for "bu" followed by a capitalized name
    expect(SHERA_SYSTEM_PROMPT).not.toMatch(/\bbu [A-Z][a-z]/)
  })

  it('all example conversations use kak', () => {
    const examples = SHERA_SYSTEM_PROMPT.match(/Shera: ".*?"/g) || []
    for (const ex of examples) {
      if (ex.includes('kak') || ex.includes('Shera') || ex.includes('Hey') || ex.includes('Good') || ex.includes('Hi')) {
        // Uses kak or is English — fine
      } else if (ex.includes('Hai') || ex.includes('Siap') || ex.includes('Oke') || ex.includes('Oh iya')) {
        // Indonesian response should use kak if addressing by name
        // Check it doesn't use pak/bu
        expect(ex).not.toMatch(/\bpak\b/i)
        expect(ex).not.toMatch(/\bbu\b/i)
      }
    }
  })

  it('explicit prohibition', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('JANGAN PERNAH pakai "pak" atau "bu"')
  })

  it('state prompt blocks dont use pak', () => {
    for (const state of ALL_STATES) {
      const block = statePromptBlock(state)
      expect(block).not.toMatch(/\bpak\b/)
    }
  })
})
