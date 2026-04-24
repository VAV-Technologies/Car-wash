// ─── Shared booking form constants ──────────────────────────────────
// Used by /book (public form) and /book/[token] (WhatsApp link form)

export const WASH_SERVICES = [
  {
    value: 'standard_wash', label: 'Standard Wash', price: 349000,
    image: '/images/wash/standard-wash.jpg',
    tagline: 'Perawatan rutin buat mobil kamu',
    description: 'Cuci premium buat perawatan rutin mobil kamu. Dikerjakan langsung di rumah dengan foam pre-wash dan 2-bucket hand wash.',
    duration: '~1 jam',
    includes: ['Foam pre-wash', '2-bucket hand wash', 'Interior clean & vacuum', 'Tire polish & rim clean', 'Body spot remover'],
    excludes: ['Glass spot remover', 'Tar remover', 'Clay bar decontamination', 'Sealant coating'],
  },
  {
    value: 'professional', label: 'Professional Wash', price: 649000,
    image: '/images/wash/professional-wash.jpg',
    tagline: 'Deep clean — noda, bercak hujan, brake dust',
    badge: 'Paling Populer',
    description: 'Deep clean buat mobil yang udah lama ga dicuci. Bersihin noda membandel, bercak hujan, tar, dan brake dust sampai kinclong.',
    duration: '~2 jam',
    includes: ['Foam pre-wash', '2-bucket hand wash', 'Interior clean & vacuum', 'Tire polish & rim clean', 'Body spot remover', 'Glass spot remover', 'Tar remover'],
    excludes: ['Clay bar decontamination', 'Sealant coating'],
  },
  {
    value: 'elite_wash', label: 'Elite Wash', price: 949000,
    image: '/images/wash/elite-wash.jpg',
    tagline: 'The works — ceramic coating & engine bay',
    badge: 'Paling Lengkap',
    description: 'Paket paling lengkap dengan clay bar, sealant coating, dan engine bay cleaning. Proteksi maksimal buat cat mobil kamu.',
    duration: '~3 jam',
    includes: ['Foam pre-wash', '2-bucket hand wash', 'Interior clean & vacuum', 'Tire polish & rim clean', 'Body spot remover', 'Glass spot remover', 'Tar remover', 'Clay bar decontamination', 'Sealant coating'],
    excludes: [],
  },
]

export const DETAIL_SERVICES = [
  {
    value: 'full_detail', label: 'Full Detail', price: 2799000,
    image: '/images/detailing/full-detail.jpg',
    tagline: 'Paket lengkap — seluruh mobil, luar dalam',
    badge: 'Best Value',
    description: 'Paket detailing lengkap buat seluruh mobil. Interior + exterior detail, engine bay, dan ceramic coating dalam satu paket.',
    duration: '~6 jam',
    includes: ['Interior deep clean', 'Exterior multi-stage polish', 'Paint correction', 'Engine bay cleaning', 'Ceramic coating'],
    excludes: [],
  },
  {
    value: 'interior_detail', label: 'Interior Detail', price: 1039000,
    image: '/images/detailing/interior.jpg',
    tagline: 'Kulit, fabric, dashboard — seperti baru',
    description: 'Deep clean khusus interior mobil. Kulit, fabric, dashboard, dan plafon bakal keliatan kayak baru lagi.',
    duration: '~3 jam',
    includes: ['Deep clean semua permukaan', 'Leather conditioning', 'Fabric shampoo', 'Stain removal'],
    excludes: ['Exterior polish', 'Engine bay', 'Ceramic coating'],
  },
  {
    value: 'exterior_detail', label: 'Exterior Detail', price: 1039000,
    image: '/images/detailing/exterior.jpg',
    tagline: 'Polish & sealant — cat bersinar showroom',
    description: 'Polish multi-stage plus paint correction buat ngembaliin kilau cat mobil. Ditutup dengan sealant buat proteksi tambahan.',
    duration: '~3 jam',
    includes: ['Multi-stage polish', 'Paint correction', 'Sealant protection', 'Swirl mark removal'],
    excludes: ['Interior detail', 'Engine bay', 'Ceramic coating'],
  },
  {
    value: 'window_detail', label: 'Window Detail', price: 689000,
    image: '/images/detailing/window.jpg',
    tagline: 'Kaca bening sempurna, anti-jamur',
    description: 'Bersihin jamur kaca dan water spot sampai bening sempurna. Ditutup dengan hydrophobic coating biar air langsung mengalir.',
    duration: '~1.5 jam',
    includes: ['Water spot removal', 'Glass polish', 'Hydrophobic coating'],
    excludes: ['Body polish', 'Interior detail'],
  },
  {
    value: 'tire_rims', label: 'Tire & Rims', price: 289000,
    image: '/images/detailing/tire-rims.jpg',
    tagline: 'Velg mengkilap, ban hitam pekat',
    description: 'Decontamination buat velg sama tire dressing biar ban item pekat. Ditutup dengan wheel sealant buat tahan lama.',
    duration: '~1 jam',
    includes: ['Rim decontamination', 'Tire dressing', 'Wheel sealant'],
    excludes: ['Body polish', 'Interior detail'],
  },
]

export const ALL_SERVICES = [...WASH_SERVICES, ...DETAIL_SERVICES]
export const DETAILING_VALUES = DETAIL_SERVICES.map(s => s.value)
export const WASH_PREREQ_PRICE = 249000

export const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
]

// Booking window:
//   - Lead time: today + BOOKING_LEAD_TIME_DAYS days are closed (too soon).
//   - Open window: the next BOOKING_OPEN_WINDOW_DAYS after that are bookable.
//   - Everything beyond the open window is closed (too far out).
// First bookable = today + BOOKING_LEAD_TIME_DAYS.
// Last bookable (exclusive) = today + BOOKING_LEAD_TIME_DAYS + BOOKING_OPEN_WINDOW_DAYS.
export const BOOKING_LEAD_TIME_DAYS = 14
export const BOOKING_OPEN_WINDOW_DAYS = 14

export const AREAS = [
  'Jakarta Pusat',
  'Jakarta Selatan',
  'Jakarta Utara',
  'Jakarta Timur',
  'Jakarta Barat',
  'Bogor',
  'Depok',
  'Tangerang',
  'Tangerang Selatan',
  'Bekasi',
] as const
export type Area = typeof AREAS[number]

export function formatRupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export function isSunday(date: Date): boolean {
  return date.getDay() === 0
}

export const REQUIRED_BOOKING_FIELDS = ['name', 'phone', 'service_type', 'car_model', 'plate_number', 'area', 'address', 'date', 'time'] as const
