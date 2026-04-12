import { describe, it, expect, vi } from 'vitest'

// Mock Supabase to prevent env var errors
vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({ from: vi.fn() }),
}))

import { classifyCustomer, buildCustomerContext, SHERA_SYSTEM_PROMPT } from '../shera'
import type { CustomerRecord } from '../shera'

// ─── classifyCustomer ───────────────────────────────────────────────

describe('classifyCustomer', () => {
  it('returns "new" for null', () => {
    expect(classifyCustomer(null)).toBe('new')
  })

  it('returns "stub" for "WhatsApp User"', () => {
    expect(classifyCustomer({ id: 'c1', name: 'WhatsApp User' })).toBe('stub')
  })

  it('returns "stub" for "Unknown"', () => {
    expect(classifyCustomer({ id: 'c1', name: 'Unknown' })).toBe('stub')
  })

  it('returns "returning" for a real name', () => {
    expect(classifyCustomer({ id: 'c1', name: 'Fadil' })).toBe('returning')
  })

  it('returns "returning" for any non-stub name', () => {
    expect(classifyCustomer({ id: 'c1', name: 'Rina Sari' })).toBe('returning')
  })
})

// ─── buildCustomerContext ───────────────────────────────────────────

describe('buildCustomerContext', () => {
  const phone = '+628123456789'

  describe('new customer (null)', () => {
    it('contains "Customer is NEW"', () => {
      const ctx = buildCustomerContext(null, phone)
      expect(ctx).toContain('Customer is NEW')
    })

    it('contains "Ikuti FLOW BOOKING"', () => {
      const ctx = buildCustomerContext(null, phone)
      expect(ctx).toContain('Ikuti FLOW BOOKING')
    })

    it('contains "WAJIB panggil create_customer"', () => {
      const ctx = buildCustomerContext(null, phone)
      expect(ctx).toContain('create_customer')
    })

    it('does not contain "REGISTERED"', () => {
      const ctx = buildCustomerContext(null, phone)
      expect(ctx).not.toContain('REGISTERED')
    })
  })

  describe('stub customer', () => {
    const stub: CustomerRecord = { id: 'c1', name: 'WhatsApp User' }

    it('contains "INCOMPLETE"', () => {
      const ctx = buildCustomerContext(stub, phone)
      expect(ctx).toContain('INCOMPLETE')
    })

    it('contains "WAJIB panggil create_customer"', () => {
      const ctx = buildCustomerContext(stub, phone)
      expect(ctx).toContain('WAJIB panggil create_customer')
    })

    it('contains the stub name as placeholder', () => {
      const ctx = buildCustomerContext(stub, phone)
      expect(ctx).toContain('WhatsApp User')
    })

    it('does not say "RETURNING"', () => {
      const ctx = buildCustomerContext(stub, phone)
      expect(ctx).not.toContain('RETURNING customer')
    })

    it('includes "Do NOT ask for phone"', () => {
      const ctx = buildCustomerContext(stub, phone)
      expect(ctx).toContain('Do NOT ask for phone')
    })
  })

  describe('returning customer', () => {
    const returning: CustomerRecord = {
      id: 'c1',
      name: 'Fadil',
      car_model: 'Honda Civic',
      plate_number: 'B 2100 STA',
      address: 'Cikini Bintaro 1',
      neighborhood: 'bintaro',
    }

    it('contains "REGISTERED" with name', () => {
      const ctx = buildCustomerContext(returning, phone)
      expect(ctx).toContain('REGISTERED: Fadil')
    })

    it('includes car model', () => {
      const ctx = buildCustomerContext(returning, phone)
      expect(ctx).toContain('Car: Honda Civic')
    })

    it('includes plate number', () => {
      const ctx = buildCustomerContext(returning, phone)
      expect(ctx).toContain('Plate: B 2100 STA')
    })

    it('includes address', () => {
      const ctx = buildCustomerContext(returning, phone)
      expect(ctx).toContain('Address: Cikini Bintaro 1')
    })

    it('includes neighborhood', () => {
      const ctx = buildCustomerContext(returning, phone)
      expect(ctx).toContain('Area: bintaro')
    })

    it('says "JANGAN tanya info yang sudah ada"', () => {
      const ctx = buildCustomerContext(returning, phone)
      expect(ctx).toContain('JANGAN tanya info yang sudah ada')
    })

    it('includes customer_id for tools', () => {
      const ctx = buildCustomerContext(returning, phone)
      expect(ctx).toContain('c1')
    })
  })

  describe('returning customer with missing optional fields', () => {
    const minimal: CustomerRecord = { id: 'c2', name: 'Rina' }

    it('does not include "Car:" when car_model is null', () => {
      const ctx = buildCustomerContext(minimal, phone)
      expect(ctx).not.toContain('Car:')
    })

    it('does not include "Plate:" when plate_number is null', () => {
      const ctx = buildCustomerContext(minimal, phone)
      expect(ctx).not.toContain('Plate:')
    })

    it('does not include "Address:" when address is null', () => {
      const ctx = buildCustomerContext(minimal, phone)
      expect(ctx).not.toContain('Address:')
    })

    it('does not include "Area:" when neighborhood is null', () => {
      const ctx = buildCustomerContext(minimal, phone)
      expect(ctx).not.toContain('Area:')
    })

    it('still contains "REGISTERED"', () => {
      const ctx = buildCustomerContext(minimal, phone)
      expect(ctx).toContain('REGISTERED: Rina')
    })
  })
})

// ─── SHERA_SYSTEM_PROMPT content validation ─────────────────────────

describe('SHERA_SYSTEM_PROMPT', () => {
  // First message rules
  it('requires introduction on first message', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('WAJIB perkenalkan diri')
  })

  it('requires asking for name', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('tanya nama')
  })

  // Image gating
  it('forbids images before customer states intent', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('DILARANG KERAS kirim gambar paket')
    expect(SHERA_SYSTEM_PROMPT).toContain('SEBELUM customer bilang mau apa')
  })

  it('forbids sending images twice', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('JANGAN KIRIM GAMBAR DUA KALI')
  })

  it('requires checking IMAGES_SENT tag', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('[IMAGES_SENT]')
  })

  // Language rules
  it('has English detection rule', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('English')
    expect(SHERA_SYSTEM_PROMPT).toContain('balas FULL English')
  })

  // Service categories
  it('lists wash packages', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('standard_wash')
    expect(SHERA_SYSTEM_PROMPT).toContain('professional')
    expect(SHERA_SYSTEM_PROMPT).toContain('elite_wash')
  })

  it('lists detailing packages', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('interior_detail')
    expect(SHERA_SYSTEM_PROMPT).toContain('exterior_detail')
    expect(SHERA_SYSTEM_PROMPT).toContain('window_detail')
    expect(SHERA_SYSTEM_PROMPT).toContain('tire_rims')
    expect(SHERA_SYSTEM_PROMPT).toContain('full_detail')
  })

  // Booking rules
  it('mentions 48-hour reschedule policy', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('48 jam')
  })

  it('mentions no upfront payment', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('ga perlu bayar dulu')
  })

  // Working hours
  it('specifies working hours', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('08.00')
    expect(SHERA_SYSTEM_PROMPT).toContain('17.00')
  })

  it('specifies Sunday is closed', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('Minggu libur')
  })

  // Area restriction
  it('mentions Jabodetabek area', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('Jabodetabek')
  })

  // Multi-car flow
  it('has multi-car instructions', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('MULTI MOBIL')
    expect(SHERA_SYSTEM_PROMPT).toContain('KONFIRMASI pemahaman')
  })

  it('instructs to accept multiple cars at once', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('TERIMA SEMUA')
  })

  // Escalation rules
  it('limits escalation to specific cases', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('lebih dari 8 mobil')
    expect(SHERA_SYSTEM_PROMPT).toContain('harga khusus')
  })

  it('forbids telling customer about escalation', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('JANGAN PERNAH bilang ke customer')
  })

  it('forbids revealing AI identity', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('JANGAN bilang kamu AI atau bot')
  })

  // Wrong behaviors listed
  it('lists wrong: images after name without asking service', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('Kirim gambar paket langsung setelah dapat nama')
  })

  it('lists wrong: using "kamu"', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('Pakai "kamu"')
  })

  // SYSTEM HINTS documentation
  it('documents NAME_DETECTED behavior', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('NAME_DETECTED')
    expect(SHERA_SYSTEM_PROMPT).toContain('IKUTI FLOW NORMAL')
  })

  it('documents SERVICE_DETECTED behavior', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('SERVICE_DETECTED')
    expect(SHERA_SYSTEM_PROMPT).toContain('JANGAN kirim gambar')
  })

  it('documents CATEGORY_DETECTED behavior', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('CATEGORY_DETECTED: wash')
    expect(SHERA_SYSTEM_PROMPT).toContain('CATEGORY_DETECTED: detailing')
  })

  // Backup price list
  it('has backup text price list', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('Rp 349.000')
    expect(SHERA_SYSTEM_PROMPT).toContain('Rp 649.000')
    expect(SHERA_SYSTEM_PROMPT).toContain('Rp 949.000')
  })

  // Subscription info
  it('has subscription plans', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('Essentials')
    expect(SHERA_SYSTEM_PROMPT).toContain('Rp 339.000')
  })

  // Style rules
  it('forbids dashes', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('DILARANG KERAS pakai tanda strip')
  })

  it('forbids formal greetings', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('JANGAN pernah bilang "Selamat datang di Castudio"')
  })

  it('limits message length', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('Maksimal 2 kalimat per pesan')
  })

  it('forbids "Anda"', () => {
    expect(SHERA_SYSTEM_PROMPT).toContain('JANGAN pakai "Anda"')
  })
})
