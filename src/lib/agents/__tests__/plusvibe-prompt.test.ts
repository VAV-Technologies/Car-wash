import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFrom, mockLLMCreate } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockLLMCreate: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({ from: mockFrom }),
}))

vi.mock('@/lib/agents/openai-client', () => ({
  LLM_MODEL: 'mock-model',
  createOpenAIClient: () => ({
    chat: { completions: { create: mockLLMCreate } },
  }),
}))

vi.mock('../plusvibe-client', () => ({
  replyToEmail: vi.fn(),
  getEmailThread: vi.fn(),
}))

vi.mock('../telegram-client', () => ({
  sendTelegramMessage: vi.fn(),
}))

import {
  generateReply,
  loadRyanRules,
  getRyanSettings,
} from '../plusvibe'

type TableHandler = {
  single?: { data: any; error?: any }
  maybeSingle?: { data: any; error?: any }
  rows?: any[]
}

function setupSupabase(handlers: Record<string, TableHandler>) {
  mockFrom.mockImplementation((table: string) => {
    const h = handlers[table] || {}
    const chain: any = {}
    chain.select = vi.fn(() => chain)
    chain.insert = vi.fn(() => chain)
    chain.update = vi.fn(() => chain)
    chain.delete = vi.fn(() => chain)
    chain.eq = vi.fn(() => chain)
    chain.in = vi.fn(() => chain)
    chain.ilike = vi.fn(() => chain)
    chain.like = vi.fn(() => chain)
    chain.limit = vi.fn(() => chain)
    chain.order = vi.fn(() => Promise.resolve({ data: h.rows ?? [], error: null }))
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

const baseLead = {
  first_name: 'Fadil',
  company_name: 'Acme Corp',
  job_title: 'Fleet Manager',
  reply_count: 0,
  objections_raised: [],
  classification_history: [],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('generateReply guardrails', () => {
  it('regenerates once when the model parrots a banned phrase', async () => {
    setupSupabase({
      agent_settings: { single: { data: null, error: null }, maybeSingle: { data: null, error: null } },
      agent_rules: { rows: [] },
      agent_knowledge: { rows: [] },
      connectors: { single: { data: null, error: null } },
    })

    // First call: banned phrase. Second call: clean.
    mockLLMCreate
      .mockResolvedValueOnce({
        choices: [{ message: { content: '<p>We offer zero downtime and trained staff.</p>' } }],
      })
      .mockResolvedValueOnce({
        choices: [{ message: { content: '<p>Yeah we come to you so nobody on the team has to drive over. What is your WhatsApp?</p>' } }],
      })

    const reply = await generateReply(baseLead, 'OBJECTION', 'too pricey', '+6285591222000')

    expect(mockLLMCreate).toHaveBeenCalledTimes(2)
    expect(reply.toLowerCase()).not.toContain('zero downtime')
    expect(reply).toContain('drive over')
  })

  it('passes clean drafts through without regenerating', async () => {
    setupSupabase({
      agent_settings: { single: { data: null, error: null }, maybeSingle: { data: null, error: null } },
      agent_rules: { rows: [] },
      agent_knowledge: { rows: [] },
      connectors: { single: { data: null, error: null } },
    })

    mockLLMCreate.mockResolvedValueOnce({
      choices: [{ message: { content: '<p>Got it. Reason we charge what we do is the team is trained and we use a different product for each step. What is your WhatsApp?</p>' } }],
    })

    const reply = await generateReply(baseLead, 'OBJECTION', 'too pricey', '+6285591222000')

    expect(mockLLMCreate).toHaveBeenCalledTimes(1)
    expect(reply).toContain('different product for each step')
  })

  it('falls back to a safe template if both attempts contain banned phrases', async () => {
    setupSupabase({
      agent_settings: { single: { data: null, error: null }, maybeSingle: { data: null, error: null } },
      agent_rules: { rows: [] },
      agent_knowledge: { rows: [] },
      connectors: { single: { data: null, error: null } },
    })

    mockLLMCreate
      .mockResolvedValueOnce({ choices: [{ message: { content: '<p>Zero downtime is our thing.</p>' } }] })
      .mockResolvedValueOnce({ choices: [{ message: { content: '<p>Streamline your fleet with zero downtime.</p>' } }] })

    const reply = await generateReply(baseLead, 'OBJECTION', 'expensive', '+6285591222000')

    expect(mockLLMCreate).toHaveBeenCalledTimes(2)
    expect(reply.toLowerCase()).not.toContain('zero downtime')
    expect(reply.toLowerCase()).not.toContain('streamline')
    expect(reply).toContain('+62 855 9122 2000')
  })

  it('strips em dashes from output', async () => {
    setupSupabase({
      agent_settings: { single: { data: null, error: null }, maybeSingle: { data: null, error: null } },
      agent_rules: { rows: [] },
      agent_knowledge: { rows: [] },
      connectors: { single: { data: null, error: null } },
    })

    mockLLMCreate.mockResolvedValueOnce({
      choices: [{ message: { content: '<p>Got it — happy to chat on WhatsApp.</p>' } }],
    })

    const reply = await generateReply(baseLead, 'INTERESTED_NO_NUMBER', 'tell me more', '+6285591222000')

    expect(reply).not.toContain('—')
  })
})

describe('loadRyanRules', () => {
  it('returns an empty string when no rules exist', async () => {
    setupSupabase({
      agent_rules: { rows: [] },
    })
    const block = await loadRyanRules()
    expect(block).toBe('')
  })

  it('formats active rules into a TEAM RULES block', async () => {
    setupSupabase({
      agent_rules: {
        rows: [
          { title: 'Marketing source', content: 'If they ask where we got their email, say it came from the marketing team.' },
          { title: 'No promises', content: 'Never promise specific timing for follow-up.' },
        ],
      },
    })
    const block = await loadRyanRules()
    expect(block).toContain('TEAM RULES')
    expect(block).toContain('Marketing source')
    expect(block).toContain('marketing team')
    expect(block).toContain('No promises')
  })
})

describe('getRyanSettings', () => {
  it('returns defaults when no row exists', async () => {
    setupSupabase({
      agent_settings: { maybeSingle: { data: null, error: null } },
    })
    const s = await getRyanSettings()
    expect(s.apiKey).toBeNull()
    expect(s.model).toBe('mock-model')
    expect(s.maxTokens).toBe(512)
    expect(s.systemPromptOverride).toBeNull()
  })

  it('treats legacy workspace_id JSON in system_prompt as not-an-override', async () => {
    setupSupabase({
      agent_settings: {
        maybeSingle: {
          data: {
            api_key: null,
            model: null,
            max_tokens: null,
            system_prompt: '{"workspace_id":"ws_123","plusvibe_api_key":"pk"}',
          },
        },
      },
    })
    const s = await getRyanSettings()
    expect(s.systemPromptOverride).toBeNull()
  })

  it('returns a real prompt override when system_prompt is plain text', async () => {
    setupSupabase({
      agent_settings: {
        maybeSingle: {
          data: {
            api_key: null,
            model: 'gpt-5',
            max_tokens: 1024,
            system_prompt: 'You are Ryan. Be terse.',
          },
        },
      },
    })
    const s = await getRyanSettings()
    expect(s.systemPromptOverride).toBe('You are Ryan. Be terse.')
    expect(s.model).toBe('gpt-5')
    expect(s.maxTokens).toBe(1024)
  })
})
