import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase before importing the module
const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => mockSupabase,
}))

// Mock WAHA
const mockSendImage = vi.fn()
vi.mock('@/lib/agents/waha', () => ({
  sendImage: (...args: any[]) => mockSendImage(...args),
}))

// Mock bookings module
const mockCreateBooking = vi.fn()
vi.mock('@/lib/admin/bookings', () => ({
  createBooking: (...args: any[]) => mockCreateBooking(...args),
}))

import { executeSheraTool } from '../shera'

// ─── Helper to build Supabase chain mocks ───────────────────────────

function mockChain(result: { data?: any; error?: any; count?: number }) {
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
  // For count queries
  if (result.count !== undefined) {
    chain.limit = vi.fn().mockResolvedValue(result)
    chain.single = vi.fn().mockResolvedValue(result)
  }
  return chain
}

beforeEach(() => {
  vi.clearAllMocks()
  ;(globalThis as any).__serviceImagesSent = false
})

// ─── search_customer ────────────────────────────────────────────────

describe('executeSheraTool: search_customer', () => {
  it('searches by phone or name and returns results', async () => {
    const customers = [{ id: 'c1', name: 'Fadil', phone: '628123456789' }]
    const chain = mockChain({ data: customers })
    // Override limit to return data directly (not .single())
    chain.limit = vi.fn().mockResolvedValue({ data: customers, error: null })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('search_customer', { query: 'Fadil' }))
    expect(mockFrom).toHaveBeenCalledWith('customers')
    expect(result).toEqual(customers)
  })
})

// ─── create_customer ────────────────────────────────────────────────

describe('executeSheraTool: create_customer', () => {
  it('updates existing stub customer when phone matches', async () => {
    const existingStub = { id: 'c1' }
    const updatedCustomer = { id: 'c1', name: 'Fadil', phone: '628123456789', car_model: 'Civic' }

    // First call: customers table (search existing by phone)
    const searchChain = mockChain({ data: existingStub })
    // Second call: customers table (update)
    const updateChain = mockChain({ data: updatedCustomer })

    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount++
      return callCount === 1 ? searchChain : updateChain
    })

    const result = JSON.parse(await executeSheraTool('create_customer', {
      name: 'Fadil',
      phone: '628123456789',
      car_model: 'Civic',
    }))

    expect(result).toEqual(updatedCustomer)
  })

  it('creates new customer when no existing record found', async () => {
    const newCustomer = { id: 'c2', name: 'Rina', phone: '628987654321' }

    // First call: search returns null
    const searchChain = mockChain({ data: null })
    // Second call: insert returns new customer
    const insertChain = mockChain({ data: newCustomer })

    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount++
      return callCount === 1 ? searchChain : insertChain
    })

    const result = JSON.parse(await executeSheraTool('create_customer', {
      name: 'Rina',
      phone: '628987654321',
    }))

    expect(result).toEqual(newCustomer)
  })
})

// ─── send_service_images ────────────────────────────────────────────

describe('executeSheraTool: send_service_images', () => {
  it('returns GAGAL when no images in database', async () => {
    const chain = mockChain({ data: [] })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('send_service_images', {
      service_type: 'standard_wash,professional,elite_wash',
      chat_id: '628123@c.us',
    }))

    expect(result.sent).toBeFalsy()
    expect(result.reason || result.message).toMatch(/GAGAL|No service images/i)
  })

  it('sends images when they exist in DB', async () => {
    const images = [
      { file_name: 'service_image_standard_wash', content: 'https://example.com/standard.jpg' },
      { file_name: 'service_image_professional', content: 'https://example.com/pro.jpg' },
      { file_name: 'service_image_elite_wash', content: 'https://example.com/elite.jpg' },
    ]

    // agent_knowledge query
    const knowledgeChain = mockChain({ data: images })
    mockFrom.mockReturnValue(knowledgeChain)
    // Override like() to resolve with data
    knowledgeChain.like = vi.fn().mockResolvedValue({ data: images })

    mockSendImage.mockResolvedValue(undefined)

    // Mock the WAHA verification fetch
    const originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { fromMe: true, hasMedia: true },
      ]),
    }) as any

    try {
      const result = JSON.parse(await executeSheraTool('send_service_images', {
        service_type: 'standard_wash,professional,elite_wash',
        chat_id: '628123@c.us',
      }))

      expect(result.sent).toBe(3)
      expect(mockSendImage).toHaveBeenCalledTimes(3)
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('returns GAGAL when sendImage throws for all images', async () => {
    const images = [
      { file_name: 'service_image_standard_wash', content: 'https://example.com/standard.jpg' },
    ]

    const knowledgeChain = mockChain({ data: images })
    mockFrom.mockReturnValue(knowledgeChain)
    knowledgeChain.like = vi.fn().mockResolvedValue({ data: images })

    mockSendImage.mockRejectedValue(new Error('WAHA timeout'))

    const result = JSON.parse(await executeSheraTool('send_service_images', {
      service_type: 'standard_wash',
      chat_id: '628123@c.us',
    }))

    expect(result.sent).toBe(0)
    expect(result.message).toMatch(/GAGAL/)
  })

  it('prevents duplicate sends in same turn', async () => {
    ;(globalThis as any).__serviceImagesSent = true

    const result = JSON.parse(await executeSheraTool('send_service_images', {
      service_type: 'standard_wash',
      chat_id: '628123@c.us',
    }))

    expect(result.already_sent).toBe(true)
    expect(result.sent).toBe(0)
    expect(mockSendImage).not.toHaveBeenCalled()
  })

  it('only sends requested service types', async () => {
    const images = [
      { file_name: 'service_image_standard_wash', content: 'https://example.com/standard.jpg' },
      { file_name: 'service_image_professional', content: 'https://example.com/pro.jpg' },
      { file_name: 'service_image_elite_wash', content: 'https://example.com/elite.jpg' },
      { file_name: 'service_image_interior_detail', content: 'https://example.com/interior.jpg' },
    ]

    const knowledgeChain = mockChain({ data: images })
    mockFrom.mockReturnValue(knowledgeChain)
    knowledgeChain.like = vi.fn().mockResolvedValue({ data: images })

    mockSendImage.mockResolvedValue(undefined)

    const originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ fromMe: true, hasMedia: true }]),
    }) as any

    try {
      const result = JSON.parse(await executeSheraTool('send_service_images', {
        service_type: 'standard_wash,elite_wash',
        chat_id: '628123@c.us',
      }))

      // Should only send 2 (standard + elite), not professional or interior
      expect(result.sent).toBe(2)
      expect(mockSendImage).toHaveBeenCalledTimes(2)
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})

// ─── create_booking ─────────────────────────────────────────────────

describe('executeSheraTool: create_booking', () => {
  it('creates booking with all fields', async () => {
    const booking = {
      id: 'b1',
      customer_id: 'c1',
      service_type: 'elite_wash',
      scheduled_date: '2026-04-15',
      scheduled_time: '10:00',
      location_address: 'Jl Kemang 15',
      status: 'confirmed',
    }
    mockCreateBooking.mockResolvedValue(booking)

    const result = JSON.parse(await executeSheraTool('create_booking', {
      customer_id: 'c1',
      service_type: 'elite_wash',
      scheduled_date: '2026-04-15',
      scheduled_time: '10:00',
      location_address: 'Jl Kemang 15',
    }))

    expect(result).toEqual(booking)
    expect(mockCreateBooking).toHaveBeenCalledWith(expect.objectContaining({
      customer_id: 'c1',
      service_type: 'elite_wash',
      scheduled_date: '2026-04-15',
      scheduled_time: '10:00',
      location_address: 'Jl Kemang 15',
      status: 'confirmed',
    }))
  })
})

// ─── escalate_to_human ──────────────────────────────────────────────

describe('executeSheraTool: escalate_to_human', () => {
  it('creates escalation with pending status', async () => {
    const escalation = { id: 'e1', status: 'pending', reason: 'bulk order 10 cars' }
    const chain = mockChain({ data: escalation })
    mockFrom.mockReturnValue(chain)

    const result = JSON.parse(await executeSheraTool('escalate_to_human', {
      reason: 'bulk order 10 cars',
      category: 'bulk_order',
      customer_message: 'I want to book 10 cars',
    }))

    expect(result.escalated).toBe(true)
    expect(result.id).toBe('e1')
  })
})

// ─── Unknown tool ───────────────────────────────────────────────────

describe('executeSheraTool: unknown tool', () => {
  it('returns error for unknown tool name', async () => {
    const result = JSON.parse(await executeSheraTool('nonexistent_tool', {}))
    expect(result.error).toMatch(/Unknown tool/)
  })
})
