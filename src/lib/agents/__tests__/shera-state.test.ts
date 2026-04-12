import { describe, it, expect } from 'vitest'
import {
  isToolAllowed,
  getToolBlockReason,
  getNextState,
  deriveStateFromHistory,
  statePromptBlock,
} from '../shera-state'

// ─── isToolAllowed ──────────────────────────────────────────────────

describe('isToolAllowed', () => {
  // send_service_images
  it('blocks send_service_images in greeting', () => {
    expect(isToolAllowed('send_service_images', 'greeting')).toBe(false)
  })

  it('blocks send_service_images in awaiting_name', () => {
    expect(isToolAllowed('send_service_images', 'awaiting_name')).toBe(false)
  })

  it('allows send_service_images in awaiting_intent', () => {
    expect(isToolAllowed('send_service_images', 'awaiting_intent')).toBe(true)
  })

  it('allows send_service_images in showing_packages (category switch)', () => {
    expect(isToolAllowed('send_service_images', 'showing_packages')).toBe(true)
  })

  it('blocks send_service_images in collecting_info (already chosen)', () => {
    expect(isToolAllowed('send_service_images', 'collecting_info')).toBe(false)
  })

  it('blocks send_service_images in booking_complete', () => {
    expect(isToolAllowed('send_service_images', 'booking_complete')).toBe(false)
  })

  it('allows send_service_images in general_chat (returning customer)', () => {
    expect(isToolAllowed('send_service_images', 'general_chat')).toBe(true)
  })

  // create_booking
  it('blocks create_booking in greeting', () => {
    expect(isToolAllowed('create_booking', 'greeting')).toBe(false)
  })

  it('blocks create_booking in awaiting_name', () => {
    expect(isToolAllowed('create_booking', 'awaiting_name')).toBe(false)
  })

  it('blocks create_booking in awaiting_intent', () => {
    expect(isToolAllowed('create_booking', 'awaiting_intent')).toBe(false)
  })

  it('blocks create_booking in showing_packages', () => {
    expect(isToolAllowed('create_booking', 'showing_packages')).toBe(false)
  })

  it('allows create_booking in collecting_info', () => {
    expect(isToolAllowed('create_booking', 'collecting_info')).toBe(true)
  })

  it('allows create_booking in confirming_booking', () => {
    expect(isToolAllowed('create_booking', 'confirming_booking')).toBe(true)
  })

  it('allows create_booking in general_chat', () => {
    expect(isToolAllowed('create_booking', 'general_chat')).toBe(true)
  })

  // create_customer — allowed in most states
  it('blocks create_customer in greeting', () => {
    expect(isToolAllowed('create_customer', 'greeting')).toBe(false)
  })

  it('allows create_customer in awaiting_name', () => {
    expect(isToolAllowed('create_customer', 'awaiting_name')).toBe(true)
  })

  it('allows create_customer in collecting_info', () => {
    expect(isToolAllowed('create_customer', 'collecting_info')).toBe(true)
  })

  // ungated tools
  it('allows search_customer in any state', () => {
    expect(isToolAllowed('search_customer', 'greeting')).toBe(true)
    expect(isToolAllowed('search_customer', 'collecting_info')).toBe(true)
  })

  it('allows check_date_availability in any state', () => {
    expect(isToolAllowed('check_date_availability', 'greeting')).toBe(true)
  })

  it('allows escalate_to_human in any state', () => {
    expect(isToolAllowed('escalate_to_human', 'greeting')).toBe(true)
  })
})

// ─── getToolBlockReason ─────────────────────────────────────────────

describe('getToolBlockReason', () => {
  it('explains why images blocked in greeting', () => {
    const reason = getToolBlockReason('send_service_images', 'greeting')
    expect(reason).toContain('nama')
  })

  it('explains why images blocked in showing_packages', () => {
    const reason = getToolBlockReason('send_service_images', 'collecting_info')
    expect(reason).toContain('sudah pilih')
  })

  it('explains why booking blocked early', () => {
    const reason = getToolBlockReason('create_booking', 'greeting')
    expect(reason).toContain('Belum cukup info')
  })
})

// ─── getNextState ───────────────────────────────────────────────────

describe('getNextState', () => {
  it('greeting → awaiting_name after first exchange', () => {
    expect(getNextState('greeting', {})).toBe('awaiting_name')
  })

  it('greeting → general_chat for returning customer', () => {
    expect(getNextState('greeting', { isReturningCustomer: true })).toBe('general_chat')
  })

  it('awaiting_name → awaiting_intent when name known', () => {
    expect(getNextState('awaiting_name', { nameKnown: true })).toBe('awaiting_intent')
  })

  it('awaiting_name stays if name not yet known', () => {
    expect(getNextState('awaiting_name', { nameKnown: false })).toBe('awaiting_name')
  })

  it('awaiting_intent → showing_packages when images sent', () => {
    expect(getNextState('awaiting_intent', { toolsCalled: ['send_service_images'] })).toBe('showing_packages')
  })

  it('awaiting_intent → collecting_info when service chosen directly', () => {
    expect(getNextState('awaiting_intent', { serviceChosen: true })).toBe('collecting_info')
  })

  it('showing_packages → collecting_info when service chosen', () => {
    expect(getNextState('showing_packages', { serviceChosen: true })).toBe('collecting_info')
  })

  it('showing_packages stays while waiting for selection', () => {
    expect(getNextState('showing_packages', {})).toBe('showing_packages')
  })

  it('collecting_info stays while gathering details', () => {
    expect(getNextState('collecting_info', {})).toBe('collecting_info')
  })

  it('any state → booking_complete when booking created', () => {
    expect(getNextState('collecting_info', { toolsCalled: ['create_booking'] })).toBe('booking_complete')
    expect(getNextState('general_chat', { toolsCalled: ['create_booking'] })).toBe('booking_complete')
  })

  it('booking_complete stays for follow-up', () => {
    expect(getNextState('booking_complete', {})).toBe('booking_complete')
  })

  it('general_chat stays for returning customers', () => {
    expect(getNextState('general_chat', {})).toBe('general_chat')
  })
})

// ─── deriveStateFromHistory ─────────────────────────────────────────

describe('deriveStateFromHistory', () => {
  it('empty history → greeting', () => {
    expect(deriveStateFromHistory([], false)).toBe('greeting')
  })

  it('asked name → awaiting_name', () => {
    const msgs = [
      { role: 'user', content: 'halo' },
      { role: 'assistant', content: 'Halo! Aku Shera dari Castudio 😊 Boleh tau namanya siapa ya?' },
    ]
    expect(deriveStateFromHistory(msgs, false)).toBe('awaiting_name')
  })

  it('asked intent → awaiting_intent', () => {
    const msgs = [
      { role: 'user', content: 'halo' },
      { role: 'assistant', content: 'Boleh tau namanya siapa ya?' },
      { role: 'user', content: 'Andi' },
      { role: 'assistant', content: 'Hai pak Andi! Mau cuci mobil atau detailing nih?' },
    ]
    expect(deriveStateFromHistory(msgs, false)).toBe('awaiting_intent')
  })

  it('images sent but no service picked yet → showing_packages', () => {
    const msgs = [
      { role: 'user', content: 'halo' },
      { role: 'assistant', content: 'Boleh tau namanya siapa ya?' },
      { role: 'user', content: 'Andi' },
      { role: 'assistant', content: '[IMAGES_SENT]\nIni paket cuci mobilnya' },
    ]
    expect(deriveStateFromHistory(msgs, false)).toBe('showing_packages')
  })

  it('images sent + Shera asks for car → collecting_info', () => {
    const msgs = [
      { role: 'user', content: 'Andi' },
      { role: 'assistant', content: '[IMAGES_SENT]\nIni paket cuci mobilnya' },
      { role: 'user', content: 'mau elite wash' },
      { role: 'assistant', content: 'Siap pak, mobilnya apa ya?' },
    ]
    expect(deriveStateFromHistory(msgs, false)).toBe('collecting_info')
  })

  it('booking created → booking_complete', () => {
    const msgs = [
      { role: 'assistant', content: 'booking elite wash sudah aku buat ya' },
    ]
    expect(deriveStateFromHistory(msgs, false)).toBe('booking_complete')
  })

  it('returning customer with no history → general_chat', () => {
    expect(deriveStateFromHistory([], true)).toBe('greeting') // empty is still greeting
    const msgs = [{ role: 'user', content: 'halo' }]
    expect(deriveStateFromHistory(msgs, true)).toBe('general_chat')
  })
})

// ─── statePromptBlock ───────────────────────────────────────────────

describe('statePromptBlock', () => {
  it('includes current state name', () => {
    expect(statePromptBlock('greeting')).toContain('greeting')
  })

  it('greeting instructs to introduce and ask name', () => {
    const block = statePromptBlock('greeting')
    expect(block).toContain('Perkenalkan diri')
    expect(block).toContain('tanya nama')
  })

  it('awaiting_intent instructs to ask wash or detailing', () => {
    const block = statePromptBlock('awaiting_intent')
    expect(block).toContain('cuci mobil atau detailing')
    expect(block).toContain('JANGAN kirim gambar')
  })

  it('showing_packages says images already sent', () => {
    const block = statePromptBlock('showing_packages')
    expect(block).toContain('SUDAH dikirim')
    expect(block).toContain('JANGAN kirim gambar lagi')
  })

  it('collecting_info instructs to gather remaining info', () => {
    const block = statePromptBlock('collecting_info')
    expect(block).toContain('mobil')
    expect(block).toContain('plat')
    expect(block).toContain('SATU per pesan')
  })

  it('booking_complete mentions payment and reschedule', () => {
    const block = statePromptBlock('booking_complete')
    expect(block).toContain('pembayaran')
    expect(block).toContain('reschedule')
  })
})
