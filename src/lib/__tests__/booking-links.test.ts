import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ──────────────────────────────────────────────────────────

const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => mockSupabase,
}))

vi.mock('@/lib/admin/bookings', () => ({
  createBooking: vi.fn(),
}))

import { getOrCreateBookingLink } from '../booking-links'

// ─── Helper ─────────────────────────────────────────────────────────

function mockChain(result: { data?: any; error?: any }) {
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
  return chain
}

function mockFromSequence(...chains: any[]) {
  let i = 0
  mockFrom.mockImplementation(() => chains[i++] || chains[chains.length - 1])
}

beforeEach(() => {
  vi.clearAllMocks()
})

// =====================================================================
// getOrCreateBookingLink — idempotency
// =====================================================================

describe('getOrCreateBookingLink idempotency', () => {
  it('returns same token on repeat calls for an existing ACTIVE link', async () => {
    const existing = { token: 'tok_abc123', status: 'active', customer_id: 'c1' }

    // First call: lookup finds existing → update chat_id/customer_id
    mockFromSequence(mockChain({ data: existing }), mockChain({ data: null }))
    const first = await getOrCreateBookingLink('628111', 'chat1@c.us', 'c1')

    // Second call: lookup finds same existing → update chat_id/customer_id
    mockFromSequence(mockChain({ data: existing }), mockChain({ data: null }))
    const second = await getOrCreateBookingLink('628111', 'chat1@c.us', 'c1')

    expect(first.token).toBe('tok_abc123')
    expect(second.token).toBe('tok_abc123')
    expect(first.isNew).toBe(false)
    expect(second.isNew).toBe(false)
  })

  it('reuses token for a previously SUBMITTED link (resets to active)', async () => {
    const existing = { token: 'tok_xyz789', status: 'submitted', customer_id: 'c1' }

    // Lookup finds existing → customers prefill lookup → update to reset
    mockFromSequence(
      mockChain({ data: existing }),
      mockChain({ data: { name: 'Andi', phone: '628111', car_model: 'Civic', plate_number: 'B1', address: 'Jl X' } }),
      mockChain({ data: null }),
    )

    const result = await getOrCreateBookingLink('628111', 'chat1@c.us', 'c1')
    expect(result.token).toBe('tok_xyz789')
    expect(result.isNew).toBe(false)
  })

  it('creates a new token when no existing link for this phone', async () => {
    // Lookup returns null → insert new
    const insertChain = mockChain({ error: null })
    mockFromSequence(mockChain({ data: null }), insertChain)

    const result = await getOrCreateBookingLink('628222', 'chat2@c.us', 'c2')

    expect(result.isNew).toBe(true)
    expect(result.token).toBeDefined()
    expect(result.token.length).toBeGreaterThanOrEqual(6)
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '628222', chat_id: 'chat2@c.us', customer_id: 'c2' }),
    )
  })

  it('generates different tokens for different phones', async () => {
    const insertChainA = mockChain({ error: null })
    mockFromSequence(mockChain({ data: null }), insertChainA)
    const resultA = await getOrCreateBookingLink('628111', 'chatA@c.us')

    const insertChainB = mockChain({ error: null })
    mockFromSequence(mockChain({ data: null }), insertChainB)
    const resultB = await getOrCreateBookingLink('628222', 'chatB@c.us')

    expect(resultA.token).not.toBe(resultB.token)
    expect(resultA.isNew).toBe(true)
    expect(resultB.isNew).toBe(true)
  })
})
