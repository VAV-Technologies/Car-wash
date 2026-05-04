import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { mockFrom, mockLLMCreate, mockReplyToEmail, mockPostDraft } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockLLMCreate: vi.fn(),
  mockReplyToEmail: vi.fn(),
  mockPostDraft: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({ from: mockFrom }),
}))

vi.mock('@/lib/agents/openai-client', () => ({
  LLM_MODEL: 'mock-model',
  createOpenAIClient: () => ({ chat: { completions: { create: mockLLMCreate } } }),
}))

vi.mock('../plusvibe-client', () => ({
  replyToEmail: mockReplyToEmail,
  getEmailThread: vi.fn().mockResolvedValue([]),
}))

vi.mock('../telegram-client', () => ({
  sendTelegramMessage: vi.fn(),
}))

// Per-test we toggle whether approval is enabled by overriding ryan-tg.
vi.mock('../ryan-tg', () => ({
  isApprovalEnabled: () => Boolean(process.env.RYAN_DRAFT_BOT_TOKEN),
  postDraftForApproval: mockPostDraft,
}))

import {
  processEmailReply,
  approveDraft,
  denyDraft,
  applyEditToDraft,
} from '../plusvibe'

// ─── Supabase mock chain ─────────────────────────────────────────────

type ChainResult = { data: any; error?: any }
type TableScript = {
  // For .single() / .maybeSingle() reads (FIFO queue)
  reads?: ChainResult[]
  // For .insert(...).select().single() (FIFO queue)
  inserts?: ChainResult[]
  // For .update(...).eq()...select().single() / .maybeSingle() (FIFO queue)
  updates?: ChainResult[]
}

const inserts: Array<{ table: string; payload: any }> = []
const updates: Array<{ table: string; payload: any }> = []

function setup(tables: Record<string, TableScript>) {
  mockFrom.mockImplementation((table: string) => {
    const script = tables[table] || {}
    let mode: 'read' | 'insert' | 'update' = 'read'
    let pendingPayload: any = null

    const chain: any = {}
    chain.select = vi.fn(() => chain)
    chain.insert = vi.fn((payload: any) => {
      mode = 'insert'
      pendingPayload = payload
      inserts.push({ table, payload })
      return chain
    })
    chain.update = vi.fn((payload: any) => {
      mode = 'update'
      pendingPayload = payload
      updates.push({ table, payload })
      return chain
    })
    chain.delete = vi.fn(() => chain)
    chain.eq = vi.fn(() => chain)
    chain.in = vi.fn(() => chain)
    chain.ilike = vi.fn(() => chain)
    chain.like = vi.fn(() => chain)
    chain.limit = vi.fn(() => chain)
    chain.order = vi.fn(() => chain)
    chain.single = vi.fn(() => {
      if (mode === 'insert') return Promise.resolve(script.inserts?.shift() ?? { data: null, error: null })
      if (mode === 'update') return Promise.resolve(script.updates?.shift() ?? { data: null, error: null })
      return Promise.resolve(script.reads?.shift() ?? { data: null, error: null })
    })
    chain.maybeSingle = vi.fn(() => {
      if (mode === 'update') return Promise.resolve(script.updates?.shift() ?? { data: null, error: null })
      return Promise.resolve(script.reads?.shift() ?? { data: null, error: null })
    })
    chain.then = (cb: any) => Promise.resolve({ data: null, error: null }).then(cb)
    return chain
  })
}

function pushClassification(c: { classification: string; objection_type?: string | null; summary?: string }) {
  mockLLMCreate.mockResolvedValueOnce({
    choices: [
      {
        message: {
          content: JSON.stringify({
            classification: c.classification,
            phone_number: null,
            objection_type: c.objection_type ?? null,
            sentiment: 'neutral',
            summary: c.summary ?? 'test',
          }),
        },
      },
    ],
  })
}

function pushReplyHtml(html: string) {
  mockLLMCreate.mockResolvedValueOnce({ choices: [{ message: { content: html } }] })
}

const baseLead = {
  id: 'lead-row-1',
  lead_id: 'pv-lead-1',
  lead_email: 'fadil@acme.com',
  first_name: 'Fadil',
  company_name: 'Acme',
  job_title: 'Fleet Manager',
  campaign_name: 'Q2',
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
  text_body: 'Tell me more about your service.',
  subject: 'Re: Castudio',
  last_email_id: 'new-email-id',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockLLMCreate.mockReset()
  mockReplyToEmail.mockReset()
  mockPostDraft.mockReset()
  inserts.length = 0
  updates.length = 0
})

// ─── Approval-disabled path (legacy / fallback) ─────────────────────

describe('processEmailReply — approval disabled (legacy path)', () => {
  beforeEach(() => {
    delete process.env.RYAN_DRAFT_BOT_TOKEN
  })

  it('NOT_INTERESTED still auto-sends + closes the lead', async () => {
    setup({
      email_leads: { reads: [{ data: baseLead }] },
      agent_settings: { reads: [{ data: null }] },
      agent_rules: { reads: [{ data: [] }] },
      agent_knowledge: { reads: [{ data: [] }] },
    })
    pushClassification({ classification: 'NOT_INTERESTED' })
    pushReplyHtml('<p>All good, appreciate the honesty.</p>')

    const r = await processEmailReply(basePayload)

    expect(r.action).toBe('replied')
    expect(mockReplyToEmail).toHaveBeenCalledTimes(1)
    expect(mockPostDraft).not.toHaveBeenCalled()
    expect(updates.find((u) => u.table === 'email_leads' && u.payload.current_status === 'closed')).toBeDefined()
  })
})

// ─── Approval-enabled path ─────────────────────────────────────────

describe('processEmailReply — approval enabled', () => {
  beforeEach(() => {
    process.env.RYAN_DRAFT_BOT_TOKEN = 'test-token'
    process.env.RYAN_DRAFT_CHAT_ID = '-100123'
  })
  afterEach(() => {
    delete process.env.RYAN_DRAFT_BOT_TOKEN
    delete process.env.RYAN_DRAFT_CHAT_ID
  })

  it('INTERESTED_NO_NUMBER queues draft instead of sending; lead is NOT closed', async () => {
    setup({
      email_leads: { reads: [{ data: baseLead }] },
      agent_settings: { reads: [{ data: null }] },
      agent_rules: { reads: [{ data: [] }] },
      agent_knowledge: { reads: [{ data: [] }] },
      email_pending_drafts: {
        inserts: [{ data: { id: 'draft-uuid-1' } }],
      },
    })
    pushClassification({ classification: 'INTERESTED_NO_NUMBER' })
    pushReplyHtml('<p>Cool, drop your WA number?</p>')
    mockPostDraft.mockResolvedValueOnce({ chatId: -100123, draftMessageId: 999, threadMessageIds: [998] })

    const r = await processEmailReply(basePayload)

    expect(r.action).toBe('queued_for_approval')
    expect(mockReplyToEmail).not.toHaveBeenCalled()
    expect(mockPostDraft).toHaveBeenCalledTimes(1)
    expect(inserts.find((i) => i.table === 'email_pending_drafts')).toBeDefined()
    // Lead should NOT be closed (we close on approval, not on queue)
    expect(updates.find((u) => u.table === 'email_leads' && u.payload.current_status === 'closed')).toBeUndefined()
  })

  it('NOT_INTERESTED queues draft and leaves lead open until approval', async () => {
    setup({
      email_leads: { reads: [{ data: baseLead }] },
      agent_settings: { reads: [{ data: null }] },
      agent_rules: { reads: [{ data: [] }] },
      agent_knowledge: { reads: [{ data: [] }] },
      email_pending_drafts: { inserts: [{ data: { id: 'draft-uuid-2' } }] },
    })
    pushClassification({ classification: 'NOT_INTERESTED' })
    pushReplyHtml('<p>All good, appreciate the honesty.</p>')
    mockPostDraft.mockResolvedValueOnce({ chatId: -100123, draftMessageId: 1000, threadMessageIds: [999] })

    const r = await processEmailReply({ ...basePayload, text_body: 'Not interested.' })

    expect(r.action).toBe('queued_for_approval')
    expect(mockReplyToEmail).not.toHaveBeenCalled()
    expect(updates.find((u) => u.table === 'email_leads' && u.payload.current_status === 'closed')).toBeUndefined()
  })

  it('falls back to immediate send if Telegram post fails', async () => {
    setup({
      email_leads: { reads: [{ data: baseLead }] },
      agent_settings: { reads: [{ data: null }] },
      agent_rules: { reads: [{ data: [] }] },
      agent_knowledge: { reads: [{ data: [] }] },
      email_pending_drafts: { inserts: [{ data: { id: 'draft-uuid-3' } }] },
    })
    pushClassification({ classification: 'OBJECTION', objection_type: 'pricing' })
    pushReplyHtml('<p>Yeah I get it.</p>')
    mockPostDraft.mockRejectedValueOnce(new Error('telegram down'))

    const r = await processEmailReply({ ...basePayload, text_body: 'too expensive' })

    expect(r.action).toBe('error')
    expect(mockReplyToEmail).not.toHaveBeenCalled()
    // The draft row should have status='error' written to it
    const errorUpdate = updates.find(
      (u) => u.table === 'email_pending_drafts' && u.payload.status === 'error',
    )
    expect(errorUpdate).toBeDefined()
  })

  it('PHONE_NUMBER_FOUND still uses canned auto-send (not the approval flow)', async () => {
    setup({
      email_leads: { reads: [{ data: baseLead }] },
      agent_settings: { reads: [{ data: null }] },
      customers: { reads: [{ data: null }] },
    })
    pushClassification({ classification: 'PHONE_NUMBER_FOUND' })

    const r = await processEmailReply({
      ...basePayload,
      text_body: 'Sounds good, my number is 0812-3456-7890.',
    })

    expect(r.action).toBe('handed_off')
    expect(mockReplyToEmail).toHaveBeenCalledTimes(1) // canned confirm reply
    expect(mockPostDraft).not.toHaveBeenCalled() // no approval queue for templated path
  })
})

// ─── Action helpers ─────────────────────────────────────────────────

describe('approveDraft / denyDraft / applyEditToDraft', () => {
  it('approveDraft atomic-claims, sends, marks sent, updates lead', async () => {
    const draft = {
      id: 'd1',
      email_lead_id: 'lead-1',
      last_email_id: 'eid',
      subject: 'Re: x',
      from_email: 'us@castudio.id',
      to_email: 'lead@acme.com',
      draft_html: '<p>hi</p>',
      classification: 'OBJECTION',
    }
    setup({
      email_pending_drafts: {
        updates: [
          { data: draft }, // first claim succeeds
          { data: null }, // mark-sent doesn't need to return anything
        ],
      },
      email_leads: { updates: [{ data: null }] },
    })

    const result = await approveDraft('d1', { tgUserId: 1, username: 'vilca' })

    expect(result.ok).toBe(true)
    expect(mockReplyToEmail).toHaveBeenCalledWith('eid', 'Re: x', 'us@castudio.id', 'lead@acme.com', '<p>hi</p>')
    expect(updates.find((u) => u.table === 'email_pending_drafts' && u.payload.status === 'sent')).toBeDefined()
    expect(updates.find((u) => u.table === 'email_leads')).toBeDefined()
  })

  it('approveDraft returns ok:false when row already actioned (no row claimed)', async () => {
    setup({
      email_pending_drafts: { updates: [{ data: null }] },
    })
    const result = await approveDraft('d1', { tgUserId: 1, username: 'vilca' })
    expect(result.ok).toBe(false)
    expect(mockReplyToEmail).not.toHaveBeenCalled()
  })

  it('denyDraft claims atomically and does NOT send', async () => {
    setup({
      email_pending_drafts: { updates: [{ data: { id: 'd1' } }] },
    })
    const result = await denyDraft('d1', { tgUserId: 1, username: 'vilca' })
    expect(result.ok).toBe(true)
    expect(mockReplyToEmail).not.toHaveBeenCalled()
  })

  it('applyEditToDraft wraps plain text in <p> tags and appends to history', async () => {
    const current = {
      id: 'd1',
      draft_html: '<p>old draft</p>',
      edit_history: [],
      status: 'pending',
    }
    setup({
      email_pending_drafts: {
        reads: [{ data: current }],
        updates: [{ data: { ...current, draft_html: '<p>new draft</p>', edit_history: [{ at: 'x' }] } }],
      },
    })
    const result = await applyEditToDraft('d1', 'new draft', { tgUserId: 1, username: 'vilca' })
    expect(result.ok).toBe(true)
    const updateCall = updates.find((u) => u.table === 'email_pending_drafts')
    expect(updateCall?.payload.draft_html).toContain('<p>new draft</p>')
    expect(Array.isArray(updateCall?.payload.edit_history)).toBe(true)
    expect(updateCall?.payload.edit_history.length).toBe(1)
  })
})
