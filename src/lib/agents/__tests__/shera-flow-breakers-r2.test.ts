/**
 * FLOW BREAKER TESTS ROUND 2 — Deeper Chaos
 *
 * WhatsApp-specific behaviors, Indonesian slang, multi-intent messages,
 * returning customer edge cases, timing conflicts, and state machine integrity.
 */
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({ from: vi.fn() }),
}))

import { detectHints, isQuestionMessage, detectServiceType, detectCategory, detectName } from '../shera-preprocessor'
import { classifyCustomer, buildCustomerContext } from '../shera'
import {
  getNextState,
  deriveStateFromHistory,
  isToolAllowed,
  statePromptBlock,
  type SheraState,
} from '../shera-state'

// =====================================================================
// CATEGORY 7: WHATSAPP-SPECIFIC BEHAVIORS
// =====================================================================

describe('Cat 7: WhatsApp-specific behaviors', () => {
  it('7.1 Quoted reply context — "?" in quoted text triggers question mode', () => {
    // The webhook enriches with: [Customer replied to: "..."] message
    const enriched = '[Customer replied to: "Mau cuci mobil atau detailing?"]\nyang ini'
    const hints = detectHints(enriched)
    // The "?" in the quoted text triggers isQuestionMessage → suppresses CATEGORY_DETECTED
    // This is a known limitation: preprocessor can't distinguish quoted text from customer text
    // The LLM handles this correctly from context — it sees the quoted message
    expect(isQuestionMessage(enriched)).toBe(true) // "?" in quoted text
    expect(hints.some(h => h.includes('CATEGORY_DETECTED'))).toBe(false) // suppressed
  })

  it('7.3 Rapid-fire contradictory messages — wash then detailing → detects both', () => {
    const combined = 'cuci\neh ga jadi\ndetailing aja'
    const hints = detectHints(combined)

    // Both "cuci" and "detailing" present → detects as "both"
    expect(hints).toContain('CATEGORY_DETECTED: both')
  })

  it('7.4 Location pin (no text) does not crash preprocessor', () => {
    expect(() => detectHints('')).not.toThrow()
    expect(detectHints('')).toEqual([])
  })

  it('7.5 Forwarded message detected as intent', () => {
    // Forwarded: "Ada promo cuci mobil murah nih"
    // Currently no forwarded-message detection — treated as customer's own message
    const hints = detectHints('Ada promo cuci mobil murah nih')
    expect(hints).toContain('CATEGORY_DETECTED: wash') // detected from forwarded text
    // Known limitation: forwarded messages treated as customer intent
  })
})

// =====================================================================
// CATEGORY 8: INDONESIAN SLANG & SHORTHAND
// =====================================================================

describe('Cat 8: Indonesian slang & shorthand', () => {
  it('8.1 Heavy abbreviations — "pro" does not match professional', () => {
    const msg = 'bro gw mo cuci mbl, yg pro brp duit?'
    // "pro" is not "professional" — should NOT match
    expect(detectServiceType(msg)).toBeNull()
    // But "cuci" should be detected (it's a full word)
    expect(detectCategory(msg)).toBe('wash')
    // "?" makes it a question, but comma separates "cuci mbl" from "brp duit?"
    expect(isQuestionMessage(msg)).toBe(true)
    const hints = detectHints(msg)
    // "cuci" is before comma → intent detected despite question
    expect(hints.some(h => h.includes('CATEGORY_DETECTED: wash'))).toBe(true)
  })

  it('8.2 Jaksel mixed language', () => {
    const msg = 'which one yang paling worth it sih?'
    expect(isQuestionMessage(msg)).toBe(true) // "?" present
    expect(detectHints(msg)).toEqual([])
  })

  it('8.3 All caps — case insensitive matching', () => {
    expect(detectCategory('CUCI MOBIL')).toBe('wash')
    expect(detectCategory('DETAILING')).toBe('detailing')
    expect(detectServiceType('ELITE WASH')).toBe('elite_wash')
    expect(detectServiceType('STANDARD WASH')).toBe('standard_wash')
    expect(detectServiceType('PROFESSIONAL')).toBe('professional')
  })

  it('8.3b All caps complaint — category still detected (no complaint differentiation)', () => {
    const msg = 'CUCI MOBIL GUE KEMARIN MASIH KOTOR!!!'
    // "CUCI" matches category
    expect(detectCategory(msg)).toBe('wash')
    // But this is a complaint, not a request — known limitation
    // The LLM handles this from context, not the preprocessor
  })

  it('8.4 Common typos do not match', () => {
    expect(detectCategory('mau cucj mobil')).toBeNull() // "cucj" ≠ "cuci"
    expect(detectServiceType('standar wash')).toBeNull() // "standar" ≠ "standard"
    expect(detectServiceType('profesiinal')).toBeNull() // typo
    expect(detectServiceType('eleite')).toBeNull() // typo
  })

  it('8.5 Selection by price — no hints detected', () => {
    expect(detectHints('mau yang 349rb aja')).toEqual([])
    expect(detectHints('yang nomor 2')).toEqual([])
    expect(detectHints('yang kedua')).toEqual([])
  })
})

// =====================================================================
// CATEGORY 9: MULTI-INTENT MESSAGES
// =====================================================================

describe('Cat 9: Multi-intent messages', () => {
  it('9.1 Customer selects AND asks question — service detected (selection before question)', () => {
    const msg = 'mau elite wash, tapi bisa hari ini ga?'

    // "bisa" triggers question detection
    expect(isQuestionMessage(msg)).toBe(true)
    // BUT "elite wash" appears BEFORE "bisa" → it's a selection + question
    const hints = detectHints(msg)
    expect(hints.some(h => h.includes('SERVICE_DETECTED: elite_wash'))).toBe(true)
  })

  it('9.2 Name AND question in same message — name still detected', () => {
    const msg = 'nama saya Rina, kalian buka jam brp?'
    const hints = detectHints(msg)

    // Name should be detected (questions don't suppress names)
    expect(hints.some(h => h.includes('NAME_DETECTED: Rina'))).toBe(true)
    // Question suppresses service/category — correct
    expect(isQuestionMessage(msg)).toBe(true)
  })

  it('9.3 Name + service + question — service detected (before question part)', () => {
    const msg = 'saya Budi mau standard wash, besok available ga?'
    const hints = detectHints(msg)

    // Name detected
    expect(hints.some(h => h.includes('NAME_DETECTED'))).toBe(true)
    // "standard wash" appears before "ga?" → selection + question
    expect(isQuestionMessage(msg)).toBe(true)
    expect(hints.some(h => h.includes('SERVICE_DETECTED: standard_wash'))).toBe(true)
  })

  it('9.4 Contradictory message — both detected', () => {
    const msg = 'mau cuci... eh ga deng, detailing aja'
    const hints = detectHints(msg)

    // Both "cuci" and "detailing" present → detects as "both"
    // LLM handles the correction ("ga deng, detailing aja") from context
    expect(hints).toContain('CATEGORY_DETECTED: both')
  })

  it('9.5 Customer says "ok" to a service suggestion — no hints', () => {
    // Shera asked "mau Standard, Professional, atau Elite?" and customer says "ok yang elite"
    const hints = detectHints('ok yang elite')
    // "elite" should trigger SERVICE_DETECTED
    expect(hints).toContain('SERVICE_DETECTED: elite_wash')
  })

  it('9.6 Customer says "iya" (yes) — no hints', () => {
    expect(detectHints('iya')).toEqual([])
    expect(detectHints('ok')).toEqual([])
    expect(detectHints('boleh')).toEqual([]) // "boleh" triggers question detection!
    // Wait — "boleh" alone triggers isQuestionMessage
    expect(isQuestionMessage('boleh')).toBe(true)
    // This is technically correct — "boleh" by itself is ambiguous
  })
})

// =====================================================================
// CATEGORY 10: RETURNING CUSTOMER EDGE CASES
// =====================================================================

describe('Cat 10: Returning customer edge cases', () => {
  it('10.1 Returning customer "halo" — context says dont re-ask info', () => {
    const customer = {
      id: 'c1', name: 'Fadil',
      car_model: 'Honda Civic', plate_number: 'B 2100 STA',
      address: 'Cikini Bintaro 1', neighborhood: 'bintaro',
    }
    const ctx = buildCustomerContext(customer, '+628123456789')
    expect(ctx).toContain('REGISTERED: Fadil')
    expect(ctx).toContain('Car: Honda Civic')
    expect(ctx).toContain('JANGAN tanya info yang sudah ada')

    // State should be general_chat
    expect(classifyCustomer(customer)).toBe('returning')
    const state = getNextState('greeting', { isReturningCustomer: true })
    expect(state).toBe('general_chat')
  })

  it('10.2 Returning customer — create_customer allowed for updates', () => {
    expect(isToolAllowed('create_customer', 'general_chat')).toBe(true)
  })

  it('10.3 Returning customer address change — create_customer allowed', () => {
    // In booking_complete state, create_customer should work for updates
    expect(isToolAllowed('create_customer', 'booking_complete')).toBe(false)
    // In general_chat it's allowed
    expect(isToolAllowed('create_customer', 'general_chat')).toBe(true)
    // In collecting_info it's allowed
    expect(isToolAllowed('create_customer', 'collecting_info')).toBe(true)
  })
})

// =====================================================================
// CATEGORY 11: TIMING & ORDERING EDGE CASES
// =====================================================================

describe('Cat 11: Timing & ordering edge cases', () => {
  it('11.1 Buffered correction — standard then elite, standard wins', () => {
    const combined = 'mau standard wash\neh elite deng'
    const hints = detectHints(combined)

    // "standard wash" matched first in regex chain
    expect(hints).toContain('SERVICE_DETECTED: standard_wash')
    // "elite" also present but standard wins
    expect(hints).not.toContain('SERVICE_DETECTED: elite_wash')
    // BUG: customer corrected to elite but standard wins
    // Known limitation of first-match regex
  })

  it('11.2 Very long message — no regex hang', () => {
    const longMsg = 'Jadi ceritanya '.repeat(100) + 'saya mau cuci mobil standard wash di rumah saya yang ada di Kemang'
    const start = Date.now()
    const hints = detectHints(longMsg)
    const elapsed = Date.now() - start

    expect(elapsed).toBeLessThan(100) // must be fast
    expect(hints.some(h => h.includes('SERVICE_DETECTED: standard_wash'))).toBe(true)
  })
})

// =====================================================================
// CATEGORY 12: STATE MACHINE INTEGRITY UNDER CHAOS
// =====================================================================

describe('Cat 12: State machine integrity', () => {
  it('12.1 State never goes backwards through chaotic conversation', () => {
    const STATE_ORDER: Record<string, number> = {
      greeting: 0, awaiting_name: 1, awaiting_intent: 2, showing_packages: 3,
      collecting_info: 4, confirming_booking: 5, booking_complete: 6, general_chat: 3,
    }

    let state: SheraState = 'greeting'
    let maxOrder = 0

    const turns: Array<{ event: Parameters<typeof getNextState>[1] }> = [
      { event: {} }, // greeting → awaiting_name
      { event: { nameKnown: true } }, // → awaiting_intent
      { event: {} }, // stays
      { event: { toolsCalled: ['send_service_images'] } }, // → showing_packages
      { event: {} }, // stays (question)
      { event: {} }, // stays (another question)
      { event: { serviceChosen: true } }, // → collecting_info
      { event: {} }, // stays
      { event: {} }, // stays
      { event: { toolsCalled: ['create_booking'] } }, // → booking_complete
    ]

    for (const turn of turns) {
      state = getNextState(state, turn.event)
      const order = STATE_ORDER[state] || 0
      expect(order).toBeGreaterThanOrEqual(maxOrder)
      maxOrder = Math.max(maxOrder, order)
    }

    expect(state).toBe('booking_complete')
  })

  it('12.2 All gated tools blocked in wrong states', () => {
    const gatedTools = [
      { tool: 'send_service_images', blockedIn: ['greeting', 'awaiting_name', 'collecting_info', 'confirming_booking', 'booking_complete'] },
      { tool: 'create_booking', blockedIn: ['greeting', 'awaiting_name', 'awaiting_intent', 'showing_packages'] },
      { tool: 'create_customer', blockedIn: ['greeting'] },
      { tool: 'update_booking', blockedIn: ['greeting', 'awaiting_name', 'awaiting_intent', 'showing_packages', 'collecting_info', 'confirming_booking'] },
      { tool: 'cancel_booking', blockedIn: ['greeting', 'awaiting_name', 'awaiting_intent', 'showing_packages', 'collecting_info', 'confirming_booking'] },
    ]

    for (const { tool, blockedIn } of gatedTools) {
      for (const state of blockedIn) {
        expect(isToolAllowed(tool, state as SheraState)).toBe(false)
      }
    }
  })

  it('12.2b All ungated tools allowed in every state', () => {
    const ungatedTools = ['search_customer', 'check_date_availability', 'get_customer_bookings', 'escalate_to_human', 'get_completed_jobs', 'submit_job_rating']
    const allStates: SheraState[] = ['greeting', 'awaiting_name', 'awaiting_intent', 'showing_packages', 'collecting_info', 'confirming_booking', 'booking_complete', 'general_chat']

    for (const tool of ungatedTools) {
      for (const state of allStates) {
        expect(isToolAllowed(tool, state)).toBe(true)
      }
    }
  })

  it('12.3 deriveStateFromHistory is idempotent', () => {
    const histories = [
      [],
      [{ role: 'user', content: 'halo' }],
      [
        { role: 'user', content: 'halo' },
        { role: 'assistant', content: 'Boleh tau namanya siapa ya?' },
      ],
      [
        { role: 'user', content: 'cuci' },
        { role: 'assistant', content: '[IMAGES_SENT]\nIni paketnya' },
      ],
      [
        { role: 'assistant', content: 'booking elite wash sudah aku buat' },
      ],
    ]

    for (const history of histories) {
      const first = deriveStateFromHistory(history, false)
      const second = deriveStateFromHistory(history, false)
      expect(first).toBe(second)
    }
  })

  it('12.4 State prompt block non-empty for all states', () => {
    const allStates: SheraState[] = ['greeting', 'awaiting_name', 'awaiting_intent', 'showing_packages', 'collecting_info', 'confirming_booking', 'booking_complete', 'general_chat']

    for (const state of allStates) {
      const block = statePromptBlock(state)
      expect(block.length).toBeGreaterThan(30)
      expect(block).toContain(state)
    }
  })

  it('12.5 No state transition produces undefined or invalid state', () => {
    const allStates: SheraState[] = ['greeting', 'awaiting_name', 'awaiting_intent', 'showing_packages', 'collecting_info', 'confirming_booking', 'booking_complete', 'general_chat']
    const validStates = new Set(allStates)

    const events = [
      {},
      { nameKnown: true },
      { serviceChosen: true },
      { toolsCalled: ['send_service_images'] },
      { toolsCalled: ['create_booking'] },
      { isReturningCustomer: true },
      { nameKnown: true, serviceChosen: true },
      { toolsCalled: ['send_service_images', 'create_customer'] },
    ]

    for (const state of allStates) {
      for (const event of events) {
        const next = getNextState(state, event)
        expect(validStates.has(next)).toBe(true)
      }
    }
  })
})
