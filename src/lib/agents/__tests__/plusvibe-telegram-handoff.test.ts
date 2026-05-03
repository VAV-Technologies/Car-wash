import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── Module mocks (must be declared before importing code under test) ─
//
// vi.mock() factories are hoisted to the top of the file by vitest, so any
// vars they reference must be created via vi.hoisted to also be hoisted.

const { mockFrom, mockReplyToEmail, mockSendTelegramMessage, mockLLMCreate } =
  vi.hoisted(() => ({
    mockFrom: vi.fn(),
    mockReplyToEmail: vi.fn(),
    mockSendTelegramMessage: vi.fn(),
    mockLLMCreate: vi.fn(),
  }))

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({ from: mockFrom }),
}))

const { mockGetEmailThread } = vi.hoisted(() => ({
  mockGetEmailThread: vi.fn(),
}))
vi.mock('../plusvibe-client', () => ({
  replyToEmail: mockReplyToEmail,
  getEmailThread: mockGetEmailThread,
}))

vi.mock('../telegram-client', () => ({
  sendTelegramMessage: mockSendTelegramMessage,
}))

vi.mock('@/lib/agents/openai-client', () => ({
  LLM_MODEL: 'mock-model',
  createOpenAIClient: () => ({
    chat: { completions: { create: mockLLMCreate } },
  }),
}))

import {
  processEmailReply,
  notifyTelegramHandoff,
  detectDiscount,
  findDiscountInThread,
} from '../plusvibe'

// ─── Supabase fake ───────────────────────────────────────────────────
//
// The chain object returned by `from(table)` must support both:
//   • `.select().eq().single()`         (read path)
//   • `.update({...}).eq('id', x)`      (await directly — write path)
// We achieve this by giving the chain a `.then` so awaiting the chain
// itself resolves, while `.single` / `.maybeSingle` return their own
// promises.

type TableHandler = {
  single?: { data: any; error?: any }
  maybeSingle?: { data: any; error?: any }
}

const inserts: Array<{ table: string; payload: any }> = []
const updates: Array<{ table: string; payload: any }> = []

function setupSupabase(handlers: Record<string, TableHandler>) {
  mockFrom.mockImplementation((table: string) => {
    const h = handlers[table] || {}
    const chain: any = {}
    chain.select = vi.fn(() => chain)
    chain.insert = vi.fn((payload: any) => {
      inserts.push({ table, payload })
      return chain
    })
    chain.update = vi.fn((payload: any) => {
      updates.push({ table, payload })
      return chain
    })
    chain.delete = vi.fn(() => chain)
    chain.eq = vi.fn(() => chain)
    chain.ilike = vi.fn(() => chain)
    chain.like = vi.fn(() => chain)
    chain.limit = vi.fn(() => chain)
    chain.order = vi.fn(() => chain)
    chain.single = vi.fn(() =>
      Promise.resolve(h.single ?? { data: null, error: null }),
    )
    chain.maybeSingle = vi.fn(() =>
      Promise.resolve(h.maybeSingle ?? { data: null, error: null }),
    )
    chain.then = (cb: any) =>
      Promise.resolve({ data: null, error: null }).then(cb)
    return chain
  })
}

// ─── LLM helpers ─────────────────────────────────────────────────────

function pushClassification(c: {
  classification: string
  phone_number?: string | null
  objection_type?: string | null
  sentiment?: string
  summary?: string
}) {
  mockLLMCreate.mockResolvedValueOnce({
    choices: [
      {
        message: {
          content: JSON.stringify({
            classification: c.classification,
            phone_number: c.phone_number ?? null,
            objection_type: c.objection_type ?? null,
            sentiment: c.sentiment ?? 'neutral',
            summary: c.summary ?? 'test summary',
          }),
        },
      },
    ],
  })
}

function pushReplyHtml(html: string) {
  mockLLMCreate.mockResolvedValueOnce({
    choices: [{ message: { content: html } }],
  })
}

// ─── Fixtures ────────────────────────────────────────────────────────

const baseLead = {
  id: 'lead-row-1',
  lead_id: 'pv-lead-1',
  lead_email: 'fadil@acme.com',
  first_name: 'Fadil',
  last_name: 'Ahmad',
  company_name: 'Acme Corp',
  job_title: 'Fleet Manager',
  campaign_name: 'Q2 B2B Outreach',
  campaign_id: 'camp-1',
  reply_count: 0,
  classification_history: [],
  objections_raised: [],
  current_status: 'active',
  handed_off_to_whatsapp: false,
  last_email_id: 'old-email-id',
  from_email: 'fadil@acme.com',
  to_email: 'ryan@castudio.id',
}

const basePayload = {
  lead_id: 'pv-lead-1',
  email: 'fadil@acme.com',
  from_email: 'fadil@acme.com',
  to_email: 'ryan@castudio.id',
  text_body: 'Sounds good, my number is 0812-3456-7890. Call anytime.',
  subject: 'Re: Castudio mobile car wash',
  last_email_id: 'new-email-id',
}

const noLLMKey = {
  agent_settings: { single: { data: null, error: null } },
  connectors: { single: { data: null, error: null } },
}

beforeEach(() => {
  vi.clearAllMocks()
  inserts.length = 0
  updates.length = 0
  process.env.TELEGRAM_BOT_TOKEN = 'test-token'
  process.env.TELEGRAM_HANDOFF_CHAT_ID = '-100123'
  // Default: empty thread so non-discount tests remain unaffected
  mockGetEmailThread.mockResolvedValue([])
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

// =====================================================================
// PHONE_NUMBER_FOUND happy paths
// =====================================================================

describe('processEmailReply — PHONE_NUMBER_FOUND', () => {
  it('LLM classifies phone → email confirmation + Telegram handoff', async () => {
    setupSupabase({
      ...noLLMKey,
      email_leads: { single: { data: baseLead, error: null } },
      customers: { maybeSingle: { data: null, error: null } },
    })
    pushClassification({
      classification: 'PHONE_NUMBER_FOUND',
      phone_number: '+6281234567890',
      summary: 'Lead asked about fleet pricing, shared WhatsApp.',
    })

    const promise = processEmailReply(basePayload)
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result).toEqual({
      action: 'handed_off',
      classification: 'PHONE_NUMBER_FOUND',
      phone: '+6281234567890',
    })

    // Email confirmation sent with right copy
    expect(mockReplyToEmail).toHaveBeenCalledTimes(1)
    const confirmHtml = mockReplyToEmail.mock.calls[0][4]
    expect(confirmHtml).toContain('WhatsApp shortly')
    expect(confirmHtml).toContain('Fadil')

    // Telegram fired with full payload
    expect(mockSendTelegramMessage).toHaveBeenCalledTimes(1)
    const tg = mockSendTelegramMessage.mock.calls[0][0]
    expect(tg).toContain('New Lead')
    expect(tg).toContain('Fadil')
    expect(tg).toContain('Acme Corp')
    expect(tg).toContain('Fleet Manager')
    expect(tg).toContain('fadil@acme.com')
    expect(tg).toContain('+6281234567890')
    expect(tg).toContain('Q2 B2B Outreach')
    expect(tg).toContain('https://wa.me/6281234567890')
    expect(tg).toContain('Lead asked about fleet pricing')
    expect(tg).toContain('Sounds good, my number is')
    expect(tg).toContain('Please reach out as soon as possible.')

    // Email confirmation went out BEFORE the Telegram ping
    expect(
      mockReplyToEmail.mock.invocationCallOrder[0],
    ).toBeLessThan(mockSendTelegramMessage.mock.invocationCallOrder[0])

    // Lead was marked handed_off in DB
    const handoff = updates.find(
      (u) =>
        u.table === 'email_leads' && u.payload.handed_off_to_whatsapp === true,
    )
    expect(handoff).toBeDefined()
    expect(handoff!.payload.current_status).toBe('handed_off_to_whatsapp')
    expect(handoff!.payload.phone_number).toBe('+6281234567890')

    // Customer stub created with normalized phone
    const cust = inserts.find((i) => i.table === 'customers')
    expect(cust).toBeDefined()
    expect(cust!.payload.phone).toBe('6281234567890')
    expect(cust!.payload.email).toBe('fadil@acme.com')
    expect(cust!.payload.segment).toBe('new')
  })

  it('regex fallback catches phone the LLM missed', async () => {
    setupSupabase({
      ...noLLMKey,
      email_leads: { single: { data: baseLead, error: null } },
      customers: { maybeSingle: { data: null, error: null } },
    })
    // LLM thinks it's just a curious reply
    pushClassification({
      classification: 'INTERESTED_NO_NUMBER',
      phone_number: null,
    })

    const promise = processEmailReply({
      ...basePayload,
      text_body: 'Yes please, here is my whatsapp 0812-3456-7890 thanks',
    })
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result.action).toBe('handed_off')
    expect(mockSendTelegramMessage).toHaveBeenCalledTimes(1)
    const tg = mockSendTelegramMessage.mock.calls[0][0]
    expect(tg).toContain('https://wa.me/6281234567890')
  })

  it('phone too short → asks lead to reshare, no Telegram, no handoff flag', async () => {
    setupSupabase({
      ...noLLMKey,
      email_leads: { single: { data: baseLead, error: null } },
      customers: { maybeSingle: { data: null, error: null } },
    })
    pushClassification({
      classification: 'PHONE_NUMBER_FOUND',
      phone_number: '123',
    })

    const result = await processEmailReply(basePayload)

    expect(result.action).toBe('replied')
    expect(result.note).toContain('phone too short')
    expect(mockReplyToEmail).toHaveBeenCalledTimes(1)
    expect(mockReplyToEmail.mock.calls[0][4]).toContain("doesn't look quite right")
    expect(mockSendTelegramMessage).not.toHaveBeenCalled()

    const handoff = updates.find(
      (u) =>
        u.table === 'email_leads' && u.payload.handed_off_to_whatsapp === true,
    )
    expect(handoff).toBeUndefined()
  })

  it('Telegram API failure does not block lead handoff or email confirmation', async () => {
    setupSupabase({
      ...noLLMKey,
      email_leads: { single: { data: baseLead, error: null } },
      customers: { maybeSingle: { data: null, error: null } },
    })
    pushClassification({
      classification: 'PHONE_NUMBER_FOUND',
      phone_number: '+6281234567890',
    })
    mockSendTelegramMessage.mockRejectedValueOnce(new Error('Telegram 500'))

    const promise = processEmailReply(basePayload)
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result.action).toBe('handed_off')
    expect(mockReplyToEmail).toHaveBeenCalledTimes(1)
    expect(mockSendTelegramMessage).toHaveBeenCalledTimes(1)

    const handoff = updates.find(
      (u) =>
        u.table === 'email_leads' && u.payload.handed_off_to_whatsapp === true,
    )
    expect(handoff).toBeDefined()
  })
})

// =====================================================================
// Dedup / idempotency
// =====================================================================

describe('processEmailReply — dedup', () => {
  it('skips when lead is already handed off', async () => {
    setupSupabase({
      ...noLLMKey,
      email_leads: {
        single: {
          data: { ...baseLead, handed_off_to_whatsapp: true },
          error: null,
        },
      },
    })

    const result = await processEmailReply(basePayload)

    expect(result).toEqual({
      action: 'skipped',
      reason: 'already handed off to WhatsApp',
    })
    expect(mockSendTelegramMessage).not.toHaveBeenCalled()
    expect(mockReplyToEmail).not.toHaveBeenCalled()
    expect(mockLLMCreate).not.toHaveBeenCalled()
  })

  it('skips duplicate webhook (same last_email_id, reply_count > 0)', async () => {
    setupSupabase({
      ...noLLMKey,
      email_leads: {
        single: {
          data: { ...baseLead, last_email_id: 'new-email-id', reply_count: 1 },
          error: null,
        },
      },
    })

    const result = await processEmailReply(basePayload)

    expect(result).toMatchObject({ action: 'skipped' })
    expect(mockSendTelegramMessage).not.toHaveBeenCalled()
  })
})

// =====================================================================
// Non-handoff classifications
// =====================================================================

describe('processEmailReply — other classifications', () => {
  it('NOT_INTERESTED → reply + close, no Telegram', async () => {
    setupSupabase({
      ...noLLMKey,
      email_leads: { single: { data: baseLead, error: null } },
    })
    pushClassification({ classification: 'NOT_INTERESTED' })
    pushReplyHtml('<p>All good, appreciate the honesty.</p>')

    const result = await processEmailReply({
      ...basePayload,
      text_body: 'Not interested, please remove me.',
    })

    expect(result.action).toBe('replied')
    expect(result.classification).toBe('NOT_INTERESTED')
    expect(mockReplyToEmail).toHaveBeenCalledTimes(1)
    expect(mockSendTelegramMessage).not.toHaveBeenCalled()
    expect(
      updates.find(
        (u) =>
          u.table === 'email_leads' && u.payload.current_status === 'closed',
      ),
    ).toBeDefined()
  })

  it('OUT_OF_OFFICE → marks ooo, no reply, no Telegram', async () => {
    setupSupabase({
      ...noLLMKey,
      email_leads: { single: { data: baseLead, error: null } },
    })
    pushClassification({ classification: 'OUT_OF_OFFICE' })

    const result = await processEmailReply({
      ...basePayload,
      text_body: 'I am out of office until June 1.',
    })

    expect(result.action).toBe('ignored')
    expect(mockReplyToEmail).not.toHaveBeenCalled()
    expect(mockSendTelegramMessage).not.toHaveBeenCalled()
    expect(
      updates.find(
        (u) => u.table === 'email_leads' && u.payload.current_status === 'ooo',
      ),
    ).toBeDefined()
  })

  it('INTERESTED_NO_NUMBER → reply only, no Telegram', async () => {
    setupSupabase({
      ...noLLMKey,
      email_leads: { single: { data: baseLead, error: null } },
    })
    pushClassification({ classification: 'INTERESTED_NO_NUMBER' })
    pushReplyHtml('<p>Cool, drop your WA number?</p>')

    const result = await processEmailReply({
      ...basePayload,
      text_body: 'Tell me more about your service.',
    })

    expect(result.action).toBe('replied')
    expect(result.classification).toBe('INTERESTED_NO_NUMBER')
    expect(mockReplyToEmail).toHaveBeenCalledTimes(1)
    expect(mockSendTelegramMessage).not.toHaveBeenCalled()
  })
})

// =====================================================================
// notifyTelegramHandoff direct unit tests
// =====================================================================

describe('notifyTelegramHandoff', () => {
  const lead = {
    first_name: 'Fadil',
    lead_email: 'fadil@acme.com',
    company_name: 'Acme Corp',
    job_title: 'Fleet Manager',
    campaign_name: 'Q2 B2B Outreach',
  }

  it.each([
    '+62 812-3456-7890',
    '0812-3456-7890',
    '62-812-3456-7890',
    '+6281234567890',
  ])('normalizes phone "%s" to wa.me/6281234567890', async (input) => {
    setupSupabase({ customers: { maybeSingle: { data: null, error: null } } })

    await notifyTelegramHandoff(lead, input, 'summary', 'reply text')

    expect(mockSendTelegramMessage).toHaveBeenCalledTimes(1)
    const text = mockSendTelegramMessage.mock.calls[0][0]
    expect(text).toContain('https://wa.me/6281234567890')
    expect(text).toContain('+6281234567890')
  })

  it('escapes HTML in lead fields to prevent injection in Telegram message', async () => {
    setupSupabase({ customers: { maybeSingle: { data: null, error: null } } })

    await notifyTelegramHandoff(
      { ...lead, first_name: '<script>alert(1)</script>' },
      '+6281234567890',
      'summary with <html>',
      'reply with </b>',
    )

    const text = mockSendTelegramMessage.mock.calls[0][0]
    // No raw script tag from user input survives escaping
    expect(text).not.toContain('<script>alert(1)</script>')
    expect(text).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(text).toContain('&lt;html&gt;')
    expect(text).toContain('&lt;/b&gt;')
  })

  it('skips customer insert when one already exists for the phone', async () => {
    setupSupabase({
      customers: {
        maybeSingle: { data: { id: 'existing-cust' }, error: null },
      },
    })

    await notifyTelegramHandoff(lead, '+6281234567890', 'summary', 'reply')

    expect(inserts.find((i) => i.table === 'customers')).toBeUndefined()
    expect(mockSendTelegramMessage).toHaveBeenCalledTimes(1)
  })

  it('truncates very long latest reply with ellipsis', async () => {
    setupSupabase({ customers: { maybeSingle: { data: null, error: null } } })

    const longReply = 'x'.repeat(2000)
    await notifyTelegramHandoff(lead, '+6281234567890', 'summary', longReply)

    const text = mockSendTelegramMessage.mock.calls[0][0]
    expect(text).toContain('…')
    const bodyMatch = text.match(/<i>([\s\S]+?)<\/i>/)
    expect(bodyMatch).toBeTruthy()
    expect(bodyMatch![1]).toMatch(/^x{800}…$/)
  })

  it('renders discount notice block when discountNote is set', async () => {
    setupSupabase({ customers: { maybeSingle: { data: null, error: null } } })

    await notifyTelegramHandoff(
      lead,
      '+6281234567890',
      'summary',
      'reply',
      '20% off for early sign-up',
    )

    const text = mockSendTelegramMessage.mock.calls[0][0]
    expect(text).toContain('DISCOUNT OFFERED')
    expect(text).toContain('honor it')
    expect(text).toContain('20% off for early sign-up')
    // Discount block sits above the field labels
    expect(text.indexOf('DISCOUNT OFFERED')).toBeLessThan(text.indexOf('Name:'))
  })

  it('omits discount block when discountNote is null', async () => {
    setupSupabase({ customers: { maybeSingle: { data: null, error: null } } })

    await notifyTelegramHandoff(lead, '+6281234567890', 'summary', 'reply', null)

    const text = mockSendTelegramMessage.mock.calls[0][0]
    expect(text).not.toContain('DISCOUNT OFFERED')
  })
})

// =====================================================================
// Discount detection
// =====================================================================

describe('detectDiscount', () => {
  it.each([
    ['English: percent off', 'Get 20% off when you sign up this week.', '20% off'],
    ['English: discount keyword', 'We offer a special discount for fleet customers.', 'discount'],
    ['English: special pricing', 'Reach out for special pricing on multi-car deals.', 'special pricing'],
    ['Indonesian: diskon', 'Khusus minggu ini ada diskon 15% untuk armada kantor.', 'diskon 15%'],
    ['Indonesian: promo', 'Lagi ada promo Lebaran nih, buruan.', 'promo'],
    ['Indonesian: harga khusus', 'Untuk fleet, kami punya harga spesial.', 'harga spesial'],
    ['Mixed: % potongan', 'Dapatkan 10% potongan untuk pemesanan pertama.', '10% potongan'],
  ])('detects "%s"', (_label, input, expectedFragment) => {
    const result = detectDiscount(input)
    expect(result).not.toBeNull()
    expect(result!.toLowerCase()).toContain(expectedFragment.toLowerCase())
  })

  it.each([
    'Just a regular reply with no offer at all.',
    'Tell me more about your service.',
    '50% better quality than competitors.',
    'I am free on Tuesday.',
  ])('returns null for "%s"', (input) => {
    expect(detectDiscount(input)).toBeNull()
  })

  it('returns the surrounding sentence, not just the keyword', () => {
    const result = detectDiscount(
      'Hi Fadil. We are running a 20% off promotion for fleets this month. Let us know if interested.',
    )
    expect(result).toContain('20% off')
    expect(result).toContain('promotion')
    expect(result!.length).toBeLessThanOrEqual(201)
  })
})

describe('findDiscountInThread', () => {
  it('returns discount from latest reply without fetching thread', async () => {
    const note = await findDiscountInThread(
      'email-1',
      'Yes, I saw the 20% off offer — still good?',
    )
    expect(note).toContain('20% off')
    expect(mockGetEmailThread).not.toHaveBeenCalled()
  })

  it('falls back to thread fetch when reply has no discount', async () => {
    mockGetEmailThread.mockResolvedValueOnce([
      { text_body: 'Hi Fadil, intro email here, no offer.' },
      { text_body: 'Quick follow-up: we have a special pricing tier for fleets.' },
    ])
    const note = await findDiscountInThread('email-1', 'Tell me more.')
    expect(note).toContain('special pricing')
    expect(mockGetEmailThread).toHaveBeenCalledWith('email-1')
  })

  it('strips HTML tags from thread bodies before matching', async () => {
    mockGetEmailThread.mockResolvedValueOnce([
      { html_body: '<p>Lebaran <b>promo</b> diskon 25% untuk fleet!</p>' },
    ])
    const note = await findDiscountInThread('email-1', 'OK')
    expect(note).toContain('25%')
    expect(note).not.toContain('<')
  })

  it('returns null when neither reply nor thread mention a discount', async () => {
    mockGetEmailThread.mockResolvedValueOnce([
      { text_body: 'Hi Fadil, just checking in about your fleet.' },
      { text_body: 'Following up — still interested?' },
    ])
    const note = await findDiscountInThread('email-1', 'Tell me more.')
    expect(note).toBeNull()
  })

  it('returns null and does not throw when thread fetch fails', async () => {
    mockGetEmailThread.mockRejectedValueOnce(new Error('Plusvibe 500'))
    const note = await findDiscountInThread('email-1', 'Tell me more.')
    expect(note).toBeNull()
  })
})

// =====================================================================
// PHONE_NUMBER_FOUND end-to-end with discount
// =====================================================================

describe('processEmailReply — discount disclosure', () => {
  it('includes DISCOUNT block in Telegram when prior email offered a discount', async () => {
    setupSupabase({
      ...noLLMKey,
      email_leads: { single: { data: baseLead, error: null } },
      customers: { maybeSingle: { data: null, error: null } },
    })
    pushClassification({
      classification: 'PHONE_NUMBER_FOUND',
      phone_number: '+6281234567890',
      summary: 'Lead shared WhatsApp.',
    })
    mockGetEmailThread.mockResolvedValueOnce([
      { text_body: 'Hi Fadil, we are offering 20% off for the first three months on fleet contracts.' },
      { text_body: 'Following up — let me know if you want to chat.' },
    ])

    const promise = processEmailReply(basePayload)
    await vi.runAllTimersAsync()
    await promise

    expect(mockSendTelegramMessage).toHaveBeenCalledTimes(1)
    const tg = mockSendTelegramMessage.mock.calls[0][0]
    expect(tg).toContain('DISCOUNT OFFERED')
    expect(tg).toContain('20% off')
    // Notice sits above the field labels so the human can't miss it
    expect(tg.indexOf('DISCOUNT OFFERED')).toBeLessThan(tg.indexOf('Name:'))
  })

  it('omits DISCOUNT block when no discount in reply or thread', async () => {
    setupSupabase({
      ...noLLMKey,
      email_leads: { single: { data: baseLead, error: null } },
      customers: { maybeSingle: { data: null, error: null } },
    })
    pushClassification({
      classification: 'PHONE_NUMBER_FOUND',
      phone_number: '+6281234567890',
    })
    mockGetEmailThread.mockResolvedValueOnce([
      { text_body: 'Hi Fadil, hope you are well.' },
    ])

    const promise = processEmailReply(basePayload)
    await vi.runAllTimersAsync()
    await promise

    const tg = mockSendTelegramMessage.mock.calls[0][0]
    expect(tg).not.toContain('DISCOUNT OFFERED')
  })

  it('Plusvibe thread fetch failure does not block the handoff', async () => {
    setupSupabase({
      ...noLLMKey,
      email_leads: { single: { data: baseLead, error: null } },
      customers: { maybeSingle: { data: null, error: null } },
    })
    pushClassification({
      classification: 'PHONE_NUMBER_FOUND',
      phone_number: '+6281234567890',
    })
    mockGetEmailThread.mockRejectedValueOnce(new Error('Plusvibe outage'))

    const promise = processEmailReply(basePayload)
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result.action).toBe('handed_off')
    expect(mockSendTelegramMessage).toHaveBeenCalledTimes(1)
    const tg = mockSendTelegramMessage.mock.calls[0][0]
    expect(tg).not.toContain('DISCOUNT OFFERED')
  })
})
