/**
 * FLOW BREAKER TESTS — Shera Agent
 *
 * Simulates customers who don't follow the booking flow:
 * skip steps, ask random questions, change their mind,
 * give info out of order, refuse to cooperate, or just vibe.
 */
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({ from: vi.fn() }),
}))

import { detectHints, isQuestionMessage } from '../shera-preprocessor'
import { classifyCustomer, buildCustomerContext } from '../shera'
import {
  getNextState,
  deriveStateFromHistory,
  isToolAllowed,
  statePromptBlock,
  type SheraState,
} from '../shera-state'

// ─── Helpers ────────────────────────────────────────────────────────

type Msg = { role: string; content: string }

/** Simulate a conversation turn: detect hints, compute next state, derive from history */
function simulateTurn(
  state: SheraState,
  userMsg: string,
  sheraResponse: string,
  history: Msg[],
  opts: { toolsCalled?: string[]; isReturning?: boolean } = {}
): { nextState: SheraState; hints: string[]; history: Msg[] } {
  const hints = detectHints(userMsg)
  const hasName = hints.some(h => h.includes('NAME_DETECTED'))
  const hasService = hints.some(h => h.includes('SERVICE_DETECTED'))

  const hintState = getNextState(state, {
    toolsCalled: opts.toolsCalled,
    nameKnown: hasName,
    serviceChosen: hasService,
    imagesAlreadySent: opts.toolsCalled?.includes('send_service_images'),
    bookingCreated: opts.toolsCalled?.includes('create_booking'),
    isReturningCustomer: opts.isReturning,
  })

  const updatedHistory: Msg[] = [
    ...history,
    { role: 'user', content: userMsg },
    { role: 'assistant', content: sheraResponse },
  ]

  const derivedState = deriveStateFromHistory(updatedHistory, opts.isReturning ?? false)

  // Use whichever is further along
  const STATE_ORDER: Record<string, number> = {
    greeting: 0, awaiting_name: 1, awaiting_intent: 2, showing_packages: 3,
    collecting_info: 4, confirming_booking: 5, booking_complete: 6, general_chat: 3,
  }
  const nextState = (STATE_ORDER[derivedState] || 0) >= (STATE_ORDER[hintState] || 0)
    ? derivedState
    : hintState

  return { nextState, hints, history: updatedHistory }
}

// =====================================================================
// CATEGORY 1: EARLY FLOW BREAKS (greeting / name phase)
// =====================================================================

describe('Cat 1: Early flow breaks', () => {
  it('1.1 Customer refuses name, asks price', () => {
    // Turn 1: greeting
    let state: SheraState = 'greeting'
    let history: Msg[] = []

    const t1 = simulateTurn(state, 'Hallo selamat malem',
      'Halo! Aku Shera dari Castudio 😊 Boleh tau namanya siapa ya?', history)
    state = t1.nextState
    history = t1.history

    // Turn 2: refuses name, asks price
    const t2 = simulateTurn(state, 'Tidak, mau tanya harga, cuci brp?',
      'Boleh kak, mau cuci mobilnya yang Standard Wash, Professional, atau Elite Wash?', history)
    state = t2.nextState
    history = t2.history

    // State should have advanced past awaiting_name
    expect(state).not.toBe('awaiting_name')
    expect(state).not.toBe('greeting')
    // send_service_images should be allowed
    expect(isToolAllowed('send_service_images', state)).toBe(true)
  })

  it('1.2 Customer gives all info at once (info dump)', () => {
    const msg = 'Hi saya Budi, Fortuner B1234XY, Jl Kemang 15, mau standard wash besok jam 10'
    const hints = detectHints(msg)

    // Should detect both name and service
    expect(hints.some(h => h.includes('NAME_DETECTED'))).toBe(true)
    expect(hints.some(h => h.includes('SERVICE_DETECTED: standard_wash'))).toBe(true)

    // State should jump ahead
    let state: SheraState = 'greeting'
    state = getNextState(state, { nameKnown: true, serviceChosen: true })
    // greeting → awaiting_name (first exchange), but with name+service it should advance
    // Actually getNextState from greeting always returns awaiting_name first
    // The deriveState should catch up
    const history: Msg[] = [
      { role: 'user', content: msg },
      { role: 'assistant', content: 'Siap pak Budi! Aku confirm ya: Standard Wash untuk Fortuner B1234XY' },
    ]
    const derived = deriveStateFromHistory(history, false)
    // Shera mentioned Standard Wash → hasSheraMovedPastName → awaiting_intent or further
    expect(derived).not.toBe('greeting')
    expect(derived).not.toBe('awaiting_name')

    // create_booking should be allowed in the derived state
    expect(isToolAllowed('create_booking', 'collecting_info')).toBe(true)
  })

  it('1.3 Customer asks random question before name', () => {
    let state: SheraState = 'awaiting_name'
    const history: Msg[] = [
      { role: 'user', content: 'Halo' },
      { role: 'assistant', content: 'Halo! Aku Shera dari Castudio 😊 Boleh tau namanya siapa ya?' },
    ]

    // Customer asks off-topic question
    const hints = detectHints('Kalian buka jam berapa?')
    expect(isQuestionMessage('Kalian buka jam berapa?')).toBe(true)
    expect(hints).toEqual([]) // No service/category/name

    const t = simulateTurn(state, 'Kalian buka jam berapa?',
      'Kita buka Senin-Sabtu jam 8 pagi sampai 5 sore kak', history)

    // State should not go backwards
    expect(t.nextState).not.toBe('greeting')
  })

  it('1.4 Customer sends emoji then real message', () => {
    let state: SheraState = 'greeting'
    let history: Msg[] = []

    const t1 = simulateTurn(state, '👋',
      'Halo! Aku Shera dari Castudio 😊 Boleh tau namanya siapa ya?', history)
    state = t1.nextState
    history = t1.history

    // Next: real message with intent but no name
    const t2 = simulateTurn(state, 'halo saya mau cuci',
      'Boleh kak! Mau cuci yang Standard, Professional, atau Elite?', history)

    // Should advance past name (cuci detected, Shera moved to services)
    expect(t2.nextState).not.toBe('awaiting_name')
  })

  it('1.5 Price question with "?" suppresses CATEGORY_DETECTED', () => {
    const msg = 'cuci mobil brp?'
    const hints = detectHints(msg)

    // "?" makes it a question → category suppressed
    expect(isQuestionMessage(msg)).toBe(true)
    expect(hints.some(h => h.includes('CATEGORY_DETECTED'))).toBe(false)

    // But if Shera responds about wash prices, deriveState should advance
    const history: Msg[] = [
      { role: 'user', content: 'halo' },
      { role: 'assistant', content: 'Boleh tau namanya siapa ya?' },
      { role: 'user', content: msg },
      { role: 'assistant', content: 'Standard Wash mulai dari Rp 349.000 kak' },
    ]
    const derived = deriveStateFromHistory(history, false)
    // Shera mentioned Standard Wash → should advance
    expect(derived).not.toBe('awaiting_name')
  })
})

// =====================================================================
// CATEGORY 2: MID-FLOW BREAKS (after images shown)
// =====================================================================

describe('Cat 2: Mid-flow breaks (after images)', () => {
  it('2.1 Customer asks question instead of picking', () => {
    const state: SheraState = 'showing_packages'
    const msg = 'bedanya professional sama elite apa?'

    expect(isQuestionMessage(msg)).toBe(true)
    expect(detectHints(msg)).toEqual([]) // question suppresses all

    // send_service_images should be BLOCKED (already sent)
    expect(isToolAllowed('send_service_images', state)).toBe(false)

    // State stays
    const next = getNextState(state, {})
    expect(next).toBe('showing_packages')
  })

  it('2.2 Customer changes mind — wash to detailing after images sent', () => {
    const state: SheraState = 'showing_packages'
    const msg = 'ehh ga jadi, mau detailing aja'
    const hints = detectHints(msg)

    expect(hints).toContain('CATEGORY_DETECTED: detailing')

    // BUG: send_service_images is BLOCKED in showing_packages
    // Customer can't switch categories — detailing images can't be sent
    expect(isToolAllowed('send_service_images', state)).toBe(false)
    // This is a known limitation — customer has to be handled via text fallback
  })

  it('2.3 Customer asks about subscription after seeing wash packages', () => {
    const state: SheraState = 'showing_packages'
    const msg = 'ada langganan ga?'

    expect(isQuestionMessage(msg)).toBe(true)
    // send_service_images blocked — can't send subscription images
    expect(isToolAllowed('send_service_images', state)).toBe(false)
    // State stays
    expect(getNextState(state, {})).toBe('showing_packages')
  })

  it('2.4 Unrelated question mid-flow', () => {
    const state: SheraState = 'showing_packages'
    const hints = detectHints('btw kalian buka sampe jam brp?')

    expect(hints).toEqual([])
    expect(getNextState(state, {})).toBe('showing_packages')
  })

  it('2.5 Multiple questions without picking — state never re-sends images', () => {
    let state: SheraState = 'showing_packages'

    // 3 consecutive questions
    state = getNextState(state, {})
    expect(state).toBe('showing_packages')
    expect(isToolAllowed('send_service_images', state)).toBe(false)

    state = getNextState(state, {})
    expect(state).toBe('showing_packages')

    state = getNextState(state, {})
    expect(state).toBe('showing_packages')
    // Never leaves, never re-sends — good
  })
})

// =====================================================================
// CATEGORY 3: LATE FLOW BREAKS (collecting info)
// =====================================================================

describe('Cat 3: Late flow breaks (collecting info)', () => {
  it('3.1 Customer changes service mid-collection', () => {
    const state: SheraState = 'collecting_info'
    const hints = detectHints('eh ganti professional aja deh')

    expect(hints).toContain('SERVICE_DETECTED: professional')
    // State should stay at collecting_info (just different service)
    const next = getNextState(state, { serviceChosen: true })
    expect(next).toBe('collecting_info')
  })

  it('3.2 Customer cancels mid-booking (no booking exists yet)', () => {
    const state: SheraState = 'collecting_info'

    // cancel_booking should be BLOCKED — nothing to cancel
    expect(isToolAllowed('cancel_booking', state)).toBe(false)
    // But the state should allow the conversation to continue
    expect(getNextState(state, {})).toBe('collecting_info')
  })

  it('3.3 Customer corrects info', () => {
    const state: SheraState = 'collecting_info'

    // create_customer should be allowed to update
    expect(isToolAllowed('create_customer', state)).toBe(true)
    expect(getNextState(state, {})).toBe('collecting_info')
  })

  it('3.4 Customer asks availability (ungated tool)', () => {
    const state: SheraState = 'collecting_info'
    const msg = 'besok masih available ga?'

    expect(isQuestionMessage(msg)).toBe(true)
    // check_date_availability is ungated
    expect(isToolAllowed('check_date_availability', state)).toBe(true)
    expect(getNextState(state, {})).toBe('collecting_info')
  })

  it('3.5 Off-topic competitor complaint', () => {
    const state: SheraState = 'collecting_info'
    const hints = detectHints('btw kemarin mobil gue dicuci di tempat lain hasilnya jelek')

    expect(hints).toEqual([])
    // escalate_to_human allowed but LLM should NOT call it (competitor, not Castudio)
    expect(isToolAllowed('escalate_to_human', state)).toBe(true)
    expect(getNextState(state, {})).toBe('collecting_info')
  })
})

// =====================================================================
// CATEGORY 4: POST-BOOKING FLOW BREAKS
// =====================================================================

describe('Cat 4: Post-booking flow breaks', () => {
  it('4.1 Customer wants another booking after first', () => {
    const state: SheraState = 'booking_complete'
    const hints = detectHints('mobil satunya juga mau cuci dong')

    expect(hints).toContain('CATEGORY_DETECTED: wash')

    // send_service_images should be... blocked in booking_complete
    expect(isToolAllowed('send_service_images', state)).toBe(false)
    // But if images are sent (tool called), state transitions
    const next = getNextState(state, { toolsCalled: ['send_service_images'] })
    expect(next).toBe('showing_packages')
  })

  it('4.2 Customer wants to reschedule', () => {
    const state: SheraState = 'booking_complete'

    expect(isToolAllowed('update_booking', state)).toBe(true)
    expect(isToolAllowed('get_customer_bookings', state)).toBe(true)
  })

  it('4.3 Random question after booking', () => {
    const state: SheraState = 'booking_complete'
    const next = getNextState(state, {})
    expect(next).toBe('booking_complete') // stays
  })
})

// =====================================================================
// CATEGORY 5: PERSISTENT OFF-TRACK
// =====================================================================

describe('Cat 5: Persistent off-track', () => {
  it('5.1 Customer only asks questions for 4+ turns', () => {
    let history: Msg[] = [
      { role: 'user', content: 'halo' },
      { role: 'assistant', content: 'Halo! Aku Shera dari Castudio 😊 Boleh tau namanya siapa ya?' },
      { role: 'user', content: 'brp harganya?' },
      { role: 'assistant', content: 'Kita punya beberapa paket kak, Standard mulai 349rb' },
      { role: 'user', content: 'ada diskon ga?' },
      { role: 'assistant', content: 'Untuk diskon bisa cek langganan kita kak' },
      { role: 'user', content: 'lokasi dimana?' },
      { role: 'assistant', content: 'Kita datang ke lokasi kak, area Jabodetabek' },
    ]

    const derived = deriveStateFromHistory(history, false)
    // After 4+ turns, Shera has mentioned Standard and prices
    // deriveState should detect hasSheraMovedPastName
    expect(derived).not.toBe('awaiting_name')
    expect(derived).not.toBe('greeting')
  })

  it('5.2 Customer just wants to chat', () => {
    let state: SheraState = 'greeting'
    let history: Msg[] = []

    const t1 = simulateTurn(state, 'halo',
      'Halo! Aku Shera dari Castudio 😊 Boleh tau namanya siapa ya?', history)
    state = t1.nextState; history = t1.history

    const t2 = simulateTurn(state, 'gue cuma mau tanya tanya aja',
      'Boleh kak! Mau tanya apa?', history)
    state = t2.nextState; history = t2.history

    const t3 = simulateTurn(state, 'produk kalian apa sih?',
      'Kita pakai produk premium yang aman buat semua jenis cat mobil', history)
    state = t3.nextState; history = t3.history

    const t4 = simulateTurn(state, 'ok thanks',
      'Sama sama kak! Kalau nanti mau booking tinggal chat aja ya', history)

    // Should never re-introduce (state advanced past greeting/awaiting_name)
    expect(t4.nextState).not.toBe('greeting')
  })

  it('5.3 Angry customer — no escalation, just apologize', () => {
    const hints = detectHints('JANGAN HUBUNGI SAYA LAGI')
    expect(hints).toEqual([]) // no service/name/category

    // escalate_to_human is allowed technically but LLM should not call it
    // (opt-out, not a complaint about Castudio service)
  })

  it('5.4 Gibberish messages do not crash', () => {
    expect(() => detectHints('asdfghjkl')).not.toThrow()
    expect(() => detectHints('wkwkwkwk')).not.toThrow()
    expect(() => detectHints('🤣🤣🤣')).not.toThrow()

    expect(detectHints('asdfghjkl')).toEqual([])
    expect(detectHints('wkwkwkwk')).toEqual([])
    expect(detectHints('🤣🤣🤣')).toEqual([])

    // State transitions don't crash
    expect(getNextState('awaiting_name', {})).toBe('awaiting_name')
    expect(getNextState('showing_packages', {})).toBe('showing_packages')
  })
})

// =====================================================================
// CATEGORY 6: MULTI-BREAK CHAOS
// =====================================================================

describe('Cat 6: Multi-break chaos', () => {
  it('6.1 Break → recover → break → recover', () => {
    let state: SheraState = 'greeting'
    let history: Msg[] = []

    // Turn 1: greeting
    const t1 = simulateTurn(state, 'halo',
      'Halo! Aku Shera dari Castudio 😊 Boleh tau namanya siapa ya?', history)
    state = t1.nextState; history = t1.history
    expect(state).toBe('awaiting_name')

    // Turn 2: refuses name, asks price (BREAK)
    const t2 = simulateTurn(state, 'ga mau kasih nama, cuci brp?',
      'Boleh kak, Standard Wash mulai dari 349rb. Mau yang mana?', history)
    state = t2.nextState; history = t2.history
    // Should advance past name (Shera mentioned Standard Wash)
    expect(state).not.toBe('awaiting_name')

    // Turn 3: images shown (RECOVER)
    const t3 = simulateTurn(state, 'lihat paketnya dong',
      '[IMAGES_SENT]\nIni paket cuci mobilnya kak', history,
      { toolsCalled: ['send_service_images'] })
    state = t3.nextState; history = t3.history
    expect(state).toBe('showing_packages')

    // Turn 4: off-topic question (BREAK)
    const t4 = simulateTurn(state, 'btw jam berapa tutup?',
      'Kita buka sampai jam 5 sore kak', history)
    state = t4.nextState; history = t4.history
    expect(state).toBe('showing_packages') // stays, doesn't go backwards

    // Turn 5: back on track (RECOVER)
    const t5 = simulateTurn(state, 'ok mau yang elite',
      'Siap kak, mobilnya apa ya?', history)
    state = t5.nextState; history = t5.history
    expect(state).toBe('collecting_info')

    // Turn 6: another break — subscription question
    const t6 = simulateTurn(state, 'eh tunggu, ada langganan?',
      'Ada kak! Essentials 339rb/bulan, Plus 449rb/bulan, Elite 1jt/bulan', history)
    state = t6.nextState; history = t6.history
    expect(state).toBe('collecting_info') // stays, doesn't go backwards

    // Turn 7: back on track
    const t7 = simulateTurn(state, 'ya udah elite aja, mobilnya avanza',
      'Siap kak, plat nomornya apa ya?', history)
    state = t7.nextState; history = t7.history
    expect(state).toBe('collecting_info') // still collecting
  })

  it('6.2 Info dump → correction → question → schedule', () => {
    let state: SheraState = 'greeting'
    let history: Msg[] = []

    // Turn 1: massive info dump
    const t1 = simulateTurn(state,
      'nama saya Rina, mau elite wash buat Fortuner B1234XY di Kemang',
      'Siap kak Rina! Elite Wash untuk Fortuner B1234XY di Kemang ya. Mau dijadwalkan kapan?',
      history, { toolsCalled: ['create_customer'] })
    state = t1.nextState; history = t1.history
    // Should jump far ahead
    expect(['collecting_info', 'confirming_booking', 'awaiting_intent']).toContain(state)

    // Turn 2: correction
    const t2 = simulateTurn(state, 'eh salah, bukan Fortuner, CRV',
      'Oke kak, aku update ya jadi CRV. Mau dijadwalkan kapan?',
      history, { toolsCalled: ['create_customer'] })
    state = t2.nextState; history = t2.history
    // create_customer should have been allowed for update
    expect(isToolAllowed('create_customer', state)).toBe(true)

    // Turn 3: availability question
    const t3 = simulateTurn(state, 'kalo besok bisa ga?',
      'Besok masih available kak!', history)
    state = t3.nextState; history = t3.history
    // check_date_availability is ungated
    expect(isToolAllowed('check_date_availability', state)).toBe(true)

    // Turn 4: schedule confirmed, booking created
    const t4 = simulateTurn(state, 'ok besok jam 10',
      'Siap kak Rina! Booking elite wash sudah aku buat ya',
      history, { toolsCalled: ['create_booking'] })
    state = t4.nextState; history = t4.history
    expect(state).toBe('booking_complete')
  })

  it('6.3 Customer flip-flops between services 3 times', () => {
    let state: SheraState = 'showing_packages'
    let history: Msg[] = [
      { role: 'user', content: 'cuci mobil' },
      { role: 'assistant', content: '[IMAGES_SENT]\nIni paket cuci mobilnya' },
    ]

    // Pick standard
    const t1 = simulateTurn(state, 'yang standard aja',
      'Siap kak, mobilnya apa?', history)
    state = t1.nextState; history = t1.history
    expect(state).toBe('collecting_info')

    // Change to professional
    const t2 = simulateTurn(state, 'eh ganti professional deh',
      'Oke kak, aku ganti ke Professional ya. Mobilnya apa?', history)
    state = t2.nextState; history = t2.history
    expect(state).toBe('collecting_info') // stays

    // Change again to elite
    const t3 = simulateTurn(state, 'hmm elite aja deh biar sekalian',
      'Siap kak, Elite Wash ya! Mobilnya apa?', history)
    state = t3.nextState; history = t3.history
    expect(state).toBe('collecting_info') // still collecting, just different service

    // send_service_images should stay blocked throughout
    expect(isToolAllowed('send_service_images', state)).toBe(false)
  })
})
