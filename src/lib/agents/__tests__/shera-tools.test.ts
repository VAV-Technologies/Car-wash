import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ──────────────────────────────────────────────────────────

const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => mockSupabase,
}))

const mockSendImage = vi.fn()
vi.mock('@/lib/agents/waha', () => ({
  sendImage: (...args: any[]) => mockSendImage(...args),
}))

import { executeSheraTool } from '../shera'

// ─── Helper ─────────────────────────────────────────────────────────

function mockChain(result: { data?: any; error?: any; count?: number }) {
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
  if (result.count !== undefined) {
    chain.not = vi.fn().mockResolvedValue(result)
  }
  return chain
}

/** Mock sequential calls to supabase.from() returning different chains */
function mockFromSequence(...chains: any[]) {
  let i = 0
  mockFrom.mockImplementation(() => chains[i++] || chains[chains.length - 1])
}

// Request-scoped context for tests
let ctx: { serviceImagesSent: boolean; imagesSentCategories: string[] }

beforeEach(() => {
  vi.clearAllMocks()
  ctx = { serviceImagesSent: false, imagesSentCategories: [] }
})

// =====================================================================
// search_customer
// =====================================================================

describe('search_customer', () => {
  it('returns matching customers', async () => {
    const customers = [{ id: 'c1', name: 'Fadil', phone: '628123456789' }]
    const chain = mockChain({ data: customers })
    chain.limit = vi.fn().mockResolvedValue({ data: customers, error: null })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('search_customer', { query: 'Fadil' }))
    expect(result).toEqual(customers)
  })

  it('returns empty array when no matches', async () => {
    const chain = mockChain({ data: [] })
    chain.limit = vi.fn().mockResolvedValue({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('search_customer', { query: 'nonexistent' }))
    expect(result).toEqual([])
  })

  it('returns empty array when data is null', async () => {
    const chain = mockChain({ data: null })
    chain.limit = vi.fn().mockResolvedValue({ data: null, error: null })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('search_customer', { query: 'test' }))
    expect(result).toEqual([])
  })
})

// =====================================================================
// get_customer_bookings
// =====================================================================

describe('get_customer_bookings', () => {
  it('returns bookings for a customer', async () => {
    const bookings = [
      { id: 'b1', service_type: 'elite_wash', scheduled_date: '2026-12-15', status: 'confirmed' },
    ]
    const chain = mockChain({})
    chain.limit = vi.fn().mockResolvedValue({ data: bookings, error: null })
    // Override eq to still return chain for chaining, but also handle status filter
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('get_customer_bookings', { customer_id: 'c1' }))
    expect(result).toEqual(bookings)
  })

  it('returns empty array when no bookings', async () => {
    const chain = mockChain({})
    chain.limit = vi.fn().mockResolvedValue({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('get_customer_bookings', { customer_id: 'c1' }))
    expect(result).toEqual([])
  })

  it('filters by status when provided', async () => {
    const bookings = [{ id: 'b1', status: 'confirmed' }]
    const chain = mockChain({})
    // The code does: let q = supabase.from().select().eq().order().limit()
    // then q = q.eq('status', ...) — so eq must return the chain and the final await resolves
    chain.limit = vi.fn().mockReturnThis()
    chain.eq = vi.fn().mockImplementation(() => {
      // Return a thenable so `await q` resolves
      return { ...chain, then: (resolve: any) => resolve({ data: bookings, error: null }) }
    })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('get_customer_bookings', {
      customer_id: 'c1',
      status: 'confirmed',
    }))
    expect(chain.eq).toHaveBeenCalled()
    expect(result).toEqual(bookings)
  })
})

// =====================================================================
// check_date_availability
// =====================================================================

describe('check_date_availability', () => {
  it('returns "available" when 0 bookings', async () => {
    const chain = mockChain({ count: 0 })
    chain.not = vi.fn().mockResolvedValue({ count: 0, error: null })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('check_date_availability', { date: '2026-04-20' }))
    expect(result.availability).toBe('available')
    expect(result.date).toBe('2026-04-20')
    expect(result.booked).toBe(0)
  })

  it('returns "available" when 7 bookings', async () => {
    const chain = mockChain({ count: 7 })
    chain.not = vi.fn().mockResolvedValue({ count: 7, error: null })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('check_date_availability', { date: '2026-04-20' }))
    expect(result.availability).toBe('available')
  })

  it('returns "limited slots" when 8 bookings', async () => {
    const chain = mockChain({ count: 8 })
    chain.not = vi.fn().mockResolvedValue({ count: 8, error: null })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('check_date_availability', { date: '2026-04-20' }))
    expect(result.availability).toBe('limited slots')
  })

  it('returns "limited slots" when 12 bookings', async () => {
    const chain = mockChain({ count: 12 })
    chain.not = vi.fn().mockResolvedValue({ count: 12, error: null })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('check_date_availability', { date: '2026-04-20' }))
    expect(result.availability).toBe('limited slots')
  })

  it('returns "fully booked" when 13+ bookings', async () => {
    const chain = mockChain({ count: 13 })
    chain.not = vi.fn().mockResolvedValue({ count: 13, error: null })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('check_date_availability', { date: '2026-04-20' }))
    expect(result.availability).toBe('fully booked')
  })
})

// =====================================================================
// update_booking
// =====================================================================

describe('update_booking', () => {
  it('updates date and time', async () => {
    const updated = { id: 'b1', scheduled_date: '2026-04-20', scheduled_time: '14:00' }
    const chain = mockChain({ data: updated })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('update_booking', {
      booking_id: 'b1',
      scheduled_date: '2026-04-20',
      scheduled_time: '14:00',
    }))

    expect(result).toEqual(updated)
    expect(chain.update).toHaveBeenCalledWith({
      scheduled_date: '2026-04-20',
      scheduled_time: '14:00',
    })
  })

  it('updates service_type only', async () => {
    const updated = { id: 'b1', service_type: 'professional' }
    const chain = mockChain({ data: updated })
    mockFrom.mockReturnValue(chain)

    await executeSheraTool('update_booking', {
      booking_id: 'b1',
      service_type: 'professional',
    })

    expect(chain.update).toHaveBeenCalledWith({ service_type: 'professional' })
  })

  it('sends empty update when no fields provided', async () => {
    const chain = mockChain({ data: { id: 'b1' } })
    mockFrom.mockReturnValue(chain)

    await executeSheraTool('update_booking', { booking_id: 'b1' })
    expect(chain.update).toHaveBeenCalledWith({})
  })
})

// =====================================================================
// cancel_booking
// =====================================================================

describe('cancel_booking', () => {
  it('sets status to cancelled', async () => {
    const cancelled = { id: 'b1', status: 'cancelled' }
    const chain = mockChain({ data: cancelled })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('cancel_booking', { booking_id: 'b1' }))

    expect(result.status).toBe('cancelled')
    expect(chain.update).toHaveBeenCalledWith({ status: 'cancelled' })
  })
})

// =====================================================================
// create_customer
// =====================================================================

describe('create_customer', () => {
  it('updates existing stub when phone matches', async () => {
    const existing = { id: 'c1' }
    const updated = { id: 'c1', name: 'Fadil', phone: '628123456789' }
    mockFromSequence(mockChain({ data: existing }), mockChain({ data: updated }))

    const result = JSON.parse(await executeSheraTool('create_customer', {
      name: 'Fadil',
      phone: '628123456789',
      car_model: 'Civic',
    }))

    expect(result).toEqual(updated)
  })

  it('creates new customer when no match found', async () => {
    const newCust = { id: 'c2', name: 'Rina', phone: '628987654321' }
    mockFromSequence(mockChain({ data: null }), mockChain({ data: newCust }))

    const result = JSON.parse(await executeSheraTool('create_customer', {
      name: 'Rina',
      phone: '628987654321',
    }))

    expect(result).toEqual(newCust)
  })

  it('handles missing optional fields gracefully', async () => {
    const newCust = { id: 'c3', name: 'Budi', phone: '628111111111' }
    mockFromSequence(mockChain({ data: null }), mockChain({ data: newCust }))

    const result = JSON.parse(await executeSheraTool('create_customer', {
      name: 'Budi',
      phone: '628111111111',
      // no car_model, plate_number, address, neighborhood
    }))

    expect(result).toEqual(newCust)
  })

  // BUG TEST: phone with "+" should be cleaned before insert
  it('cleans phone number before inserting new customer', async () => {
    const newCust = { id: 'c4', name: 'Ali', phone: '628222222222' }
    const insertChain = mockChain({ data: newCust })
    mockFromSequence(mockChain({ data: null }), insertChain)

    await executeSheraTool('create_customer', {
      name: 'Ali',
      phone: '+62 822-2222-222',
    })

    // The insert should use the cleaned phone, not the raw input
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: '628222222222', // cleaned, not '+62 822-2222-222'
      })
    )
  })
})

// =====================================================================
// get_completed_jobs
// =====================================================================

describe('get_completed_jobs', () => {
  it('finds completed jobs via bookings lookup', async () => {
    const bookingsData = [{ id: 'b1' }, { id: 'b2' }]
    const jobs = [
      { id: 'j1', service_type: 'elite_wash', completed_at: '2026-04-10', customer_rating: 5 },
    ]

    const bookingsChain: any = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: bookingsData }),
    }
    const jobsChain = mockChain({})
    jobsChain.limit = vi.fn().mockResolvedValue({ data: jobs, error: null })

    let callIdx = 0
    mockFrom.mockImplementation(() => {
      callIdx++
      return callIdx === 1 ? bookingsChain : jobsChain
    })

    const result = JSON.parse(await executeSheraTool('get_completed_jobs', { customer_id: 'c1' }))
    expect(result).toEqual(jobs)
  })

  it('returns empty when customer has no bookings', async () => {
    const bookingsChain: any = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [] }),
    }
    mockFrom.mockReturnValue(bookingsChain)

    const result = JSON.parse(await executeSheraTool('get_completed_jobs', { customer_id: 'c-none' }))
    expect(result).toEqual([])
  })
})

// =====================================================================
// submit_job_rating
// =====================================================================

describe('submit_job_rating', () => {
  it('stores valid rating (1-5)', async () => {
    const chain = mockChain({ data: { id: 'j1', customer_rating: 4 } })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('submit_job_rating', {
      job_id: 'j1',
      rating: 4,
      feedback: 'Great service!',
    }))

    expect(result.success).toBe(true)
    expect(result.rating).toBe(4)
    expect(result.feedback).toBe('Great service!')
  })

  it('rejects rating of 0', async () => {
    const result = JSON.parse(await executeSheraTool('submit_job_rating', {
      job_id: 'j1',
      rating: 0,
    }))

    expect(result.error).toBeDefined()
    expect(result.error).toMatch(/1 sampai 5/)
  })

  it('rejects non-numeric rating', async () => {
    const result = JSON.parse(await executeSheraTool('submit_job_rating', {
      job_id: 'j1',
      rating: 'terrible',
    }))

    expect(result.error).toBeDefined()
    expect(result.error).toMatch(/1 sampai 5/)
  })

  it('rejects rating above 5', async () => {
    const result = JSON.parse(await executeSheraTool('submit_job_rating', {
      job_id: 'j1',
      rating: 10,
    }))

    expect(result.error).toBeDefined()
    expect(result.error).toMatch(/1 sampai 5/)
  })

  it('rejects negative rating', async () => {
    const result = JSON.parse(await executeSheraTool('submit_job_rating', {
      job_id: 'j1',
      rating: -1,
    }))

    expect(result.error).toBeDefined()
  })

  it('feedback is optional', async () => {
    const chain = mockChain({ data: { id: 'j1' } })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('submit_job_rating', {
      job_id: 'j1',
      rating: 5,
    }))

    expect(result.success).toBe(true)
    expect(result.feedback).toBeNull()
  })
})

// =====================================================================
// send_service_images
// =====================================================================

describe('send_service_images', () => {
  const washImages = [
    { file_name: 'service_image_standard_wash', content: 'https://example.com/standard.jpg' },
    { file_name: 'service_image_professional', content: 'https://example.com/pro.jpg' },
    { file_name: 'service_image_elite_wash', content: 'https://example.com/elite.jpg' },
  ]

  function mockImagesInDB(images: typeof washImages) {
    const chain = mockChain({ data: images })
    chain.like = vi.fn().mockResolvedValue({ data: images })
    mockFrom.mockReturnValue(chain)
  }

  function mockVerification() {
    const original = globalThis.fetch
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ fromMe: true, hasMedia: true }]),
    }) as any
    return () => { globalThis.fetch = original }
  }

  it('returns "No service images" when DB is empty', async () => {
    mockImagesInDB([])

    const result = JSON.parse(await executeSheraTool('send_service_images', {
      service_type: 'standard_wash',
      chat_id: '628123@c.us',
    }))

    expect(result.sent).toBeFalsy()
  })

  it('sends all 3 wash images', { timeout: 15000 }, async () => {
    mockImagesInDB(washImages)
    mockSendImage.mockResolvedValue(undefined)
    const restore = mockVerification()

    try {
      const result = JSON.parse(await executeSheraTool('send_service_images', {
        service_type: 'standard_wash,professional,elite_wash',
        chat_id: '628123@c.us',
      }))

      expect(result.sent).toBe(3)
      expect(mockSendImage).toHaveBeenCalledTimes(3)
    } finally { restore() }
  })

  it('auto-expands partial wash request to all wash types', { timeout: 15000 }, async () => {
    process.env.WAHA_API_URL = 'http://localhost:3000'
    process.env.WAHA_API_KEY = 'test'
    mockImagesInDB([...washImages, { file_name: 'service_image_interior_detail', content: 'https://example.com/int.jpg' }])
    mockSendImage.mockResolvedValue(undefined)
    const restore = mockVerification()

    try {
      const result = JSON.parse(await executeSheraTool('send_service_images', {
        service_type: 'standard_wash,elite_wash', // only 2 wash types
        chat_id: '628123@c.us',
      }))

      // Auto-expanded to all 3 wash types (not 2, not 4)
      expect(result.sent).toBe(3)
    } finally { restore() }
  })

  it('returns GAGAL when all sends fail', async () => {
    mockImagesInDB(washImages)
    mockSendImage.mockRejectedValue(new Error('WAHA down'))

    const result = JSON.parse(await executeSheraTool('send_service_images', {
      service_type: 'standard_wash,professional,elite_wash',
      chat_id: '628123@c.us',
    }))

    expect(result.sent).toBe(0)
    expect(result.failed).toBe(3)
    expect(result.message).toMatch(/GAGAL/)
  })

  it('reports partial failure correctly', { timeout: 15000 }, async () => {
    mockImagesInDB(washImages)
    let callCount = 0
    mockSendImage.mockImplementation(() => {
      callCount++
      if (callCount === 2) throw new Error('WAHA timeout')
      return Promise.resolve()
    })
    const restore = mockVerification()

    try {
      const result = JSON.parse(await executeSheraTool('send_service_images', {
        service_type: 'standard_wash,professional,elite_wash',
        chat_id: '628123@c.us',
      }))

      expect(result.sent).toBe(2)
      expect(result.failed).toBe(1)
    } finally { restore() }
  })

  it('blocks duplicate sends in same turn', async () => {
    ctx.serviceImagesSent = true

    const result = JSON.parse(await executeSheraTool('send_service_images', {
      service_type: 'standard_wash',
      chat_id: '628123@c.us',
    }, undefined, ctx))

    expect(result.already_sent).toBe(true)
    expect(mockSendImage).not.toHaveBeenCalled()
  })

  it('sends images in correct sort order (standard → professional → elite)', { timeout: 15000 }, async () => {
    // Provide images in wrong order to test sorting
    const unsorted = [
      { file_name: 'service_image_elite_wash', content: 'https://example.com/elite.jpg' },
      { file_name: 'service_image_standard_wash', content: 'https://example.com/standard.jpg' },
      { file_name: 'service_image_professional', content: 'https://example.com/pro.jpg' },
    ]
    mockImagesInDB(unsorted)
    mockSendImage.mockResolvedValue(undefined)
    const restore = mockVerification()

    try {
      await executeSheraTool('send_service_images', {
        service_type: 'standard_wash,professional,elite_wash',
        chat_id: '628123@c.us',
      })

      // Verify order: standard (1), professional (2), elite (3)
      expect(mockSendImage.mock.calls[0][1]).toContain('standard')
      expect(mockSendImage.mock.calls[1][1]).toContain('pro')
      expect(mockSendImage.mock.calls[2][1]).toContain('elite')
    } finally { restore() }
  })
})

// =====================================================================
// escalate_to_human
// =====================================================================

describe('escalate_to_human', () => {
  it('creates escalation and returns ID', async () => {
    const esc = { id: 'e1' }
    const chain = mockChain({ data: esc })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('escalate_to_human', {
      reason: 'bulk order',
      category: 'bulk_order',
      customer_message: 'I want 10 cars',
    }))

    expect(result.escalated).toBe(true)
    expect(result.id).toBe('e1')
  })

  it('handles missing customer_message', async () => {
    const esc = { id: 'e2' }
    const chain = mockChain({ data: esc })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('escalate_to_human', {
      reason: 'partnership request',
      category: 'partnership',
    }))

    expect(result.escalated).toBe(true)
  })

  it('defaults category to "other" when not provided', async () => {
    const chain = mockChain({ data: { id: 'e3' } })
    mockFrom.mockReturnValue(chain)

    await executeSheraTool('escalate_to_human', {
      reason: 'unclear situation',
    })

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'other' })
    )
  })
})

// =====================================================================
// State gating
// =====================================================================

describe('State gating', () => {
  it('blocks send_service_images in greeting state', async () => {
    const result = JSON.parse(await executeSheraTool('send_service_images', {
      service_type: 'standard_wash',
      chat_id: '628123@c.us',
    }, 'greeting'))

    expect(result.blocked_by_state).toBe(true)
    expect(result.current_state).toBe('greeting')
    expect(mockSendImage).not.toHaveBeenCalled()
  })

  it('allows send_service_images in active state', async () => {
    const result = JSON.parse(await executeSheraTool('send_service_images', {
      service_type: 'standard_wash',
      chat_id: '628123@c.us',
    }, 'active'))

    expect(result.blocked_by_state).toBeUndefined()
  })

  it('allows search_customer in any state (ungated)', async () => {
    const chain = mockChain({ data: [] })
    chain.limit = vi.fn().mockResolvedValue({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('search_customer', { query: 'test' }, 'greeting'))
    expect(result).toEqual([])
    // No blocked_by_state error
  })

  it('allows tools when no state is provided (backwards compatible)', async () => {
    const chain = mockChain({ data: [] })
    chain.limit = vi.fn().mockResolvedValue({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('search_customer', { query: 'test' }))
    expect(result).toEqual([])
    // No blocked_by_state error when state arg omitted
  })
})

// =====================================================================
// Error handling
// =====================================================================

describe('Error handling', () => {
  it('returns JSON error when Supabase throws', async () => {
    const chain = mockChain({ data: null, error: { message: 'connection refused' } })
    chain.limit = vi.fn().mockResolvedValue({ data: null, error: { message: 'connection refused' } })
    // Make the chain throw
    chain.limit = vi.fn().mockRejectedValue(new Error('connection refused'))
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('search_customer', { query: 'test' }))
    expect(result.error).toBeDefined()
  })

  it('returns error for unknown tool', async () => {
    const result = JSON.parse(await executeSheraTool('nonexistent_tool', {}))
    expect(result.error).toMatch(/Unknown tool/)
  })
})
