export const SERVICE_TYPES: Record<string, { label: string; bonus: number; duration: number }> = {
  standard_wash: { label: 'Standard Wash', bonus: 20000, duration: 90 },
  professional: { label: 'Professional', bonus: 35000, duration: 180 },
  elite_wash: { label: 'Elite Wash', bonus: 50000, duration: 240 },
  interior_detail: { label: 'Interior Detail', bonus: 50000, duration: 240 },
  exterior_detail: { label: 'Exterior Detail', bonus: 50000, duration: 300 },
  window_detail: { label: 'Window Detail', bonus: 30000, duration: 120 },
  tire_rims: { label: 'Tire & Rims', bonus: 15000, duration: 90 },
  full_detail: { label: 'Full Detail', bonus: 150000, duration: 480 },
}

export function formatCurrency(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID')
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatWhatsAppLink(phone: string): string {
  if (!phone) return '#'
  const intl = phone.startsWith('+') ? phone.replace('+', '') : phone.startsWith('0') ? '62' + phone.slice(1) : phone
  return `https://wa.me/${intl}`
}
