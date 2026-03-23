import type { Neighborhood, Segment, AcquisitionSource, ServiceType, BookingStatus, SubscriptionTier } from './types'

// ─── Neighborhoods ──────────────────────────────────────────────────

export const NEIGHBORHOODS: { value: Neighborhood; label: string }[] = [
  { value: 'pondok_indah', label: 'Pondok Indah' },
  { value: 'kebayoran_baru', label: 'Kebayoran Baru' },
  { value: 'kebayoran_lama', label: 'Kebayoran Lama' },
  { value: 'senayan', label: 'Senayan' },
  { value: 'permata_hijau', label: 'Permata Hijau' },
  { value: 'simprug', label: 'Simprug' },
  { value: 'cilandak', label: 'Cilandak' },
  { value: 'tb_simatupang', label: 'TB Simatupang' },
  { value: 'kemang', label: 'Kemang' },
  { value: 'cipete', label: 'Cipete' },
  { value: 'fatmawati', label: 'Fatmawati' },
  { value: 'gandaria', label: 'Gandaria' },
  { value: 'pesanggrahan', label: 'Pesanggrahan' },
  { value: 'bintaro', label: 'Bintaro' },
  { value: 'other', label: 'Other' },
]

// ─── Segments ───────────────────────────────────────────────────────

export const SEGMENTS: { value: Segment; label: string; color: string; bgClass: string; textClass: string }[] = [
  { value: 'new', label: 'New', color: '#3B82F6', bgClass: 'bg-blue-500/20', textClass: 'text-blue-400' },
  { value: 'standard_only', label: 'Standard Only', color: '#9CA3AF', bgClass: 'bg-gray-500/20', textClass: 'text-gray-400' },
  { value: 'mixed', label: 'Mixed', color: '#A855F7', bgClass: 'bg-purple-500/20', textClass: 'text-purple-400' },
  { value: 'subscriber', label: 'Subscriber', color: '#22C55E', bgClass: 'bg-green-500/20', textClass: 'text-green-400' },
  { value: 'vip', label: 'VIP', color: '#F59E0B', bgClass: 'bg-amber-500/20', textClass: 'text-amber-400' },
  { value: 'churned', label: 'Churned', color: '#EF4444', bgClass: 'bg-red-500/20', textClass: 'text-red-400' },
]

// ─── Acquisition Sources ────────────────────────────────────────────

export const ACQUISITION_SOURCES: { value: AcquisitionSource; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'google', label: 'Google' },
  { value: 'referral', label: 'Referral' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'flyer', label: 'Flyer' },
  { value: 'event', label: 'Event' },
  { value: 'other', label: 'Other' },
]

// ─── Service Types ──────────────────────────────────────────────────

export const SERVICE_TYPES: { value: ServiceType; label: string; price: number }[] = [
  { value: 'standard_wash', label: 'Standard Wash', price: 349000 },
  { value: 'professional', label: 'Professional', price: 649000 },
  { value: 'elite_wash', label: 'Elite Wash', price: 949000 },
  { value: 'interior_detail', label: 'Interior Detail', price: 1039000 },
  { value: 'exterior_detail', label: 'Exterior Detail', price: 1039000 },
  { value: 'window_detail', label: 'Window Detail', price: 689000 },
  { value: 'tire_rims', label: 'Tire & Rims', price: 289000 },
  { value: 'full_detail', label: 'Full Detail', price: 2799000 },
]

// ─── Booking Statuses ───────────────────────────────────────────────

export const BOOKING_STATUSES: { value: BookingStatus; label: string; color: string }[] = [
  { value: 'requested', label: 'Requested', color: '#9CA3AF' },
  { value: 'confirmed', label: 'Confirmed', color: '#3B82F6' },
  { value: 'en_route', label: 'En Route', color: '#F59E0B' },
  { value: 'in_progress', label: 'In Progress', color: '#22C55E' },
  { value: 'completed', label: 'Completed', color: '#166534' },
  { value: 'cancelled', label: 'Cancelled', color: '#EF4444' },
  { value: 'no_show', label: 'No Show', color: '#EF4444' },
]

// ─── Subscription Tiers ─────────────────────────────────────────────

export const SUBSCRIPTION_TIERS: { value: SubscriptionTier; label: string; price: number; washesPerMonth: number }[] = [
  { value: 'basic', label: 'Basic', price: 999000, washesPerMonth: 4 },
  { value: 'standard', label: 'Standard', price: 1499000, washesPerMonth: 8 },
  { value: 'premium', label: 'Premium', price: 2499000, washesPerMonth: 12 },
  { value: 'vip', label: 'VIP', price: 3999000, washesPerMonth: 20 },
]

// ─── New Subscription Tiers (v2) ───────────────────────────────────

export const SUBSCRIPTION_TIERS_V2: {
  value: 'essentials' | 'plus' | 'elite'
  label: string
  price: number
  washesPerMonth: number
  washType: string
  badgeColor: string
  bgClass: string
  textClass: string
}[] = [
  {
    value: 'essentials',
    label: 'Essentials',
    price: 339000,
    washesPerMonth: 4,
    washType: '4 Standard Washes',
    badgeColor: '#6B7280',
    bgClass: 'bg-gray-500/20',
    textClass: 'text-gray-400',
  },
  {
    value: 'plus',
    label: 'Plus',
    price: 449000,
    washesPerMonth: 4,
    washType: '4 Professional Washes',
    badgeColor: '#3B82F6',
    bgClass: 'bg-blue-500/20',
    textClass: 'text-blue-400',
  },
  {
    value: 'elite',
    label: 'Elite',
    price: 1000000,
    washesPerMonth: 6,
    washType: '4 Professional + 2 Elite Washes',
    badgeColor: '#F97316',
    bgClass: 'bg-orange-500/20',
    textClass: 'text-orange-400',
  },
]

export function getTierConfig(value: string) {
  return SUBSCRIPTION_TIERS_V2.find((t) => t.value === value)
}

// ─── Helpers ────────────────────────────────────────────────────────

export function getNeighborhoodLabel(value: string | null): string {
  return NEIGHBORHOODS.find((n) => n.value === value)?.label ?? value ?? '—'
}

export function getSegmentConfig(value: string) {
  return SEGMENTS.find((s) => s.value === value)
}

export function getAcquisitionSourceLabel(value: string | null): string {
  return ACQUISITION_SOURCES.find((s) => s.value === value)?.label ?? value ?? '—'
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('IDR', 'Rp')
    .trim()
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}
