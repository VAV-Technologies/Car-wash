// ─── Shera State Machine v3 — Simplified Phases ────────────────────
// 4 phases instead of 15 states. The AI drives the flow within each phase.
// Code only provides phase-level guidance and gates dangerous tools.

export type SheraState =
  | 'intro'           // greeting + name + pitch
  | 'active'          // service selection through booking
  | 'post_booking'    // after booking, follow-ups
  | 'general'         // returning customer, free chat

// ─── Tool Gates ──────────────────────────────────────────────────────

const TOOL_GATES: Record<string, SheraState[]> = {
  send_service_images: ['active', 'post_booking', 'general'],
  create_customer: ['intro', 'active', 'post_booking', 'general'],
  update_booking: ['post_booking', 'general'],
  cancel_booking: ['post_booking', 'general'],
  get_booking_link_status: ['intro', 'active', 'post_booking', 'general'],
}

export function isToolAllowed(tool: string, state: SheraState): boolean {
  const allowed = TOOL_GATES[tool]
  if (!allowed) return true
  return allowed.includes(state)
}

export function getToolBlockReason(tool: string, state: SheraState): string {
  if (tool === 'send_service_images') return 'Belum waktunya kirim gambar.'
  return `Tool ${tool} tidak bisa dipanggil di phase ${state}.`
}

// ─── Phase Prompts ───────────────────────────────────────────────────

const PHASE_PROMPTS: Record<SheraState, string> = {
  intro: `Phase: INTRO. Perkenalkan diri dan kumpulkan nama customer.
Kalau belum perkenalan: "Halo! Aku Shera dari Castudio 😊 Boleh tau namanya siapa ya?" — HANYA INI, jangan tambahkan kalimat atau pertanyaan lain. Pertanyaan nama ITU sudah jadi CTA-nya.
Kalau sudah tau nama tapi belum kasih intro pitch: tunggu — intro pitch akan dikirim otomatis oleh sistem.
Kalau customer langsung bilang mau cuci/detailing tanpa kasih nama: jawab singkat tapi tetap tanya nama.`,

  active: `Phase: ACTIVE. Customer sudah melewati intro.
BOOKING VIA FORM: Customer sudah dikirim link form booking. JANGAN kumpulkan detail booking (paket, mobil, plat, alamat, jadwal) via chat. Arahkan ke form.
Kalau customer bilang mau cuci/detailing → boleh kirim gambar paket (send_service_images) untuk bantu pilih, tapi untuk BOOKING arahkan ke form.
Kalau customer tanya harga, perbedaan paket, dll → jawab dengan informatif.
Kalau customer minta booking → arahkan ke form: "Langsung isi form yang tadi aku kirim ya kak, gampang banget kok 🙂"
Kalau detailing → ingatkan wash prereq: "Sebelum detailing mobilnya perlu dicuci dulu ya. Standard Wash harga spesial Rp 249.000, atau cuci sendiri juga boleh 🙂"
Gunakan get_booking_link_status untuk cek progress form customer.`,

  post_booking: `Phase: POST BOOKING. Booking sudah dibuat via form.
Konfirmasi singkat: rangkum detail (paket, tanggal, jam), ingatkan bayar setelah selesai, ingatkan kabarin minimal 48 jam sebelumnya kalau mau reschedule.
JANGAN tanya "ada yang bisa dibantu lagi?" — percakapan selesai. Kalau customer chat lagi, baru respond.
Kalau customer mau reschedule/cancel → pakai update_booking atau cancel_booking.
Kalau customer masih punya mobil lain yang belum di-booking → minta mereka isi form lagi satu submission per mobil (link yang sama masih bisa dipakai).`,

  general: `Phase: GENERAL. Customer returning atau chat bebas.
Bantu apa yang mereka butuhkan. Kalau mau booking baru → arahkan ke form link (pakai get_booking_link_status untuk cek token, atau kirim ulang link yang ada di percakapan awal).`,
}

export function getStatePrompt(state: SheraState): string {
  return PHASE_PROMPTS[state] || PHASE_PROMPTS.general
}

// ─── Phase Derivation ────────────────────────────────────────────────

export function deriveState(
  messages: Array<{ role: string; content: string }>,
  ctx: { customerName: string | null; alreadyIntroduced: boolean; introPitchGiven: boolean; imagesSentCategories: string[]; carsBooked: number; totalCarsRequested: number | null },
  isReturningCustomer: boolean
): SheraState {
  if (!messages || messages.length === 0) return 'intro'

  // Booking complete?
  if (ctx.carsBooked > 0) {
    // Multi-car: still have cars to book → stay active
    if (ctx.totalCarsRequested && ctx.carsBooked < ctx.totalCarsRequested) return 'active'
    return 'post_booking'
  }

  // Returning customer with no active booking flow → general
  if (isReturningCustomer && !ctx.imagesSentCategories.length) return 'general'

  // Images sent → active (already past intro, even if pitch was skipped)
  if (ctx.imagesSentCategories.length > 0) return 'active'

  // Intro pitch given → active
  if (ctx.introPitchGiven) return 'active'

  // Customer has name but no pitch yet → stay in intro (validator will enforce pitch)
  return 'intro'
}

