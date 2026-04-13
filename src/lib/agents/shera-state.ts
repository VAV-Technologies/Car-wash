// ─── Shera State Machine v2 ──────────────────────────────────────────
// Granular states with per-state prompts and strict tool gates.
// The model receives ONLY the instructions for the current state.

export type SheraState =
  | 'greeting'
  | 'collecting_name'
  | 'intro_pitch'
  | 'awaiting_intent'
  | 'showing_wash_packages'
  | 'showing_detail_packages'
  | 'wash_selected'
  | 'detail_selected'
  | 'collecting_car_info'
  | 'collecting_address'
  | 'collecting_schedule'
  | 'confirming_booking'
  | 'booking_complete'
  | 'multi_car_next'
  | 'general_chat'

// ─── Tool Gates ──────────────────────────────────────────────────────

const TOOL_GATES: Record<string, SheraState[]> = {
  send_service_images: ['awaiting_intent', 'showing_wash_packages', 'showing_detail_packages', 'multi_car_next', 'general_chat'],
  create_booking: ['confirming_booking', 'general_chat'],
  create_customer: ['collecting_name', 'intro_pitch', 'awaiting_intent', 'wash_selected', 'detail_selected', 'collecting_car_info', 'collecting_address', 'collecting_schedule', 'confirming_booking', 'general_chat'],
  update_booking: ['booking_complete', 'general_chat'],
  cancel_booking: ['booking_complete', 'general_chat'],
}

export function isToolAllowed(tool: string, state: SheraState): boolean {
  const allowed = TOOL_GATES[tool]
  if (!allowed) return true
  return allowed.includes(state)
}

export function getToolBlockReason(tool: string, state: SheraState): string {
  if (tool === 'send_service_images') return 'Belum waktunya kirim gambar di state ini.'
  if (tool === 'create_booking') return 'Belum cukup info untuk buat booking.'
  return `Tool ${tool} tidak bisa dipanggil di state ${state}.`
}

// ─── Per-State Prompts ───────────────────────────────────────────────

const STATE_PROMPTS: Record<SheraState, string> = {
  greeting: `State: GREETING. Ini pesan pertama. Perkenalkan diri dengan template:
Indonesian: "Halo! Aku Shera dari Castudio 😊 Boleh tau namanya siapa ya?"
English: "Hi! I'm Shera from Castudio 😊 What's your name?"
HANYA ini. Jangan tambahkan apapun.`,

  collecting_name: `State: COLLECTING NAME. Customer belum kasih nama.
Jawab pertanyaan mereka dengan singkat, lalu SELALU akhiri dengan "Boleh tau namanya siapa ya kak?"
Jangan skip langkah ini.`,

  intro_pitch: `State: INTRO PITCH. Customer baru kasih nama. WAJIB kirim pesan ini PERSIS (ganti [NAMA]):
"Salam kenal kak [NAMA] 😊

Jadi Castudio itu layanan cuci mobil & detailing premium yang datang langsung ke rumah kak. Ga ada biaya antar dan ga perlu deposit, kita cuma butuh akses air sama listrik aja ya.

Oh iya, kita serius soal kualitas — kalau kak ga puas sama hasilnya, kita balik lagi buat benerin tanpa biaya tambahan 🙏

Kak [NAMA] lagi cari cuci mobil atau detailing nih?"
JANGAN singkat. JANGAN skip.`,

  awaiting_intent: `State: AWAITING INTENT. Tanya customer mau cuci mobil atau detailing.
Kalau customer sudah bilang → kirim gambar paket yang sesuai (pakai send_service_images).
Cuci: service_type "standard_wash,professional,elite_wash"
Detailing: service_type "interior_detail,exterior_detail,window_detail,tire_rims,full_detail"
SELALU kirim SEMUA paket dalam kategori, jangan cuma 1.`,

  showing_wash_packages: `State: WASH PACKAGES SHOWN. Gambar cuci SUDAH dikirim.
Jawab pertanyaan soal paket pakai TEXT. JANGAN kirim gambar lagi KECUALI customer minta ganti ke detailing.
Kalau customer pilih paket → lanjut tanya "Model mobilnya apa kak?"
Kalau customer bilang mahal → jawab percaya diri, JANGAN kasih diskon. Harga FINAL.
PENTING: Kalau customer tanya soal sesuatu (misal "tree sap itu apa?"), JAWAB pertanyaannya aja. JANGAN assume mereka punya masalah itu. JANGAN langsung rekomendasiin paket based on pertanyaan mereka.`,

  showing_detail_packages: `State: DETAIL PACKAGES SHOWN. Gambar detailing SUDAH dikirim.
Jawab pertanyaan soal paket pakai TEXT. JANGAN kirim gambar lagi KECUALI customer minta ganti ke cuci.
Kalau customer pilih paket → ingatkan soal wash prerequisite lalu tanya model mobilnya.`,

  wash_selected: `State: WASH SELECTED. Customer sudah pilih paket cuci.
Tanya model mobil DAN plat nomor dalam SATU pesan: "Model mobilnya apa dan plat nomornya berapa kak?"`,

  detail_selected: `State: DETAIL SELECTED. Customer sudah pilih paket detailing.
WAJIB ingatkan: "Oh iya kak, sebelum detailing mobilnya perlu dicuci dulu ya. Kalau mau, kita bisa sekalian cuci Standard Wash dengan harga spesial Rp 249.000 (biasanya 349.000). Tapi kalau mau cuci sendiri juga boleh kok 🙂"
Lalu tanya model DAN plat dalam SATU pesan: "Model mobilnya apa dan plat nomornya berapa kak?"`,

  collecting_car_info: `State: COLLECTING CAR INFO. Kumpulkan model mobil dan plat nomor.
Kalau belum ada dua-duanya, tanya BARENG: "Model mobilnya apa dan plat nomornya berapa kak?"
Kalau sudah ada salah satu, tanya yang kurang aja. Kalau sudah lengkap, lanjut ke alamat.`,

  collecting_address: `State: COLLECTING ADDRESS. Tanya alamat.
Terima APAPUN yang customer kasih. JANGAN minta "lebih lengkap". Alamat customer = FINAL.`,

  collecting_schedule: `State: COLLECTING SCHEDULE.
Tanya: "Kapan jadwalnya kak?" — JANGAN suggest tanggal atau jam spesifik. Biarkan customer yang tentuin.
Jam kerja: Senin-Sabtu 08:00-17:00. Minggu libur. Cek availability pakai check_date_availability.
BOLEH booking besok atau hari ini. Tidak ada minimum lead time.`,

  confirming_booking: `State: CONFIRMING. Semua info lengkap.
Konfirmasi semua detail dalam 1 pesan, lalu tanya "Mau aku buat bookingnya kak?"
Pakai create_booking kalau customer setuju.`,

  booking_complete: `State: BOOKING COMPLETE.
Kalau masih ada mobil yang belum di-booking (multi-car) → LANGSUNG lanjut: "Siap kak, mobil pertama udah aku booking 😊 Sekarang mobil berikutnya, model mobilnya apa kak?"
Kalau SEMUA mobil sudah di-booking → kasih info: "Ga perlu bayar dulu ya, bayarnya nanti setelah selesai. Kalau mau ganti jadwal, kabarin aku aja 🙂"`,

  multi_car_next: `State: MULTI CAR NEXT. Mobil sebelumnya sudah di-booking.
Tanya layanan + model untuk mobil berikutnya. Kirim gambar paket kalau belum dikirim untuk kategori ini.`,

  general_chat: `State: GENERAL CHAT. Customer returning atau percakapan bebas.
Bantu customer dengan apa yang mereka butuhkan. Kalau mau booking baru, mulai flow dari pemilihan layanan.`,
}

export function getStatePrompt(state: SheraState): string {
  return STATE_PROMPTS[state] || STATE_PROMPTS.general_chat
}

// ─── State Derivation ────────────────────────────────────────────────

export function deriveState(
  messages: Array<{ role: string; content: string }>,
  ctx: { customerName: string | null; alreadyIntroduced: boolean; introPitchGiven: boolean; imagesSentCategories: string[]; carsBooked: number; totalCarsRequested: number | null; address: string | null; schedule: string | null },
  isReturningCustomer: boolean
): SheraState {
  if (!messages || messages.length === 0) return 'greeting'

  const hasBooking = messages.some(m => m.role === 'assistant' && /booking.*beres|booking.*udah.*buat|sudah.*confirm/i.test(m.content))

  // Multi-car: if some booked but more remaining
  if (hasBooking && ctx.totalCarsRequested && ctx.carsBooked < ctx.totalCarsRequested) {
    return 'multi_car_next'
  }

  if (hasBooking) return 'booking_complete'

  // Check if car info has been discussed (model asked for car/plate in recent messages)
  const hasCarInfoCollected = messages.some(m => m.role === 'assistant' && /model mobil|plat nomor|plat nya/i.test(m.content))
    && messages.some(m => m.role === 'user' && /[A-Z]\s*\d{1,4}|[Bb]\s*\d/i.test(m.content)) // plate pattern

  // Check if all info is collected → confirming (MUST have car info too)
  if (ctx.customerName && ctx.imagesSentCategories.length > 0 && hasCarInfoCollected && ctx.address && ctx.schedule) {
    return 'confirming_booking'
  }

  // Collecting schedule (MUST have car info + address already)
  if (ctx.customerName && ctx.imagesSentCategories.length > 0 && hasCarInfoCollected && ctx.address && !ctx.schedule) {
    return 'collecting_schedule'
  }

  // Collecting address (MUST have car info first)
  if (ctx.customerName && ctx.imagesSentCategories.length > 0 && hasCarInfoCollected && !ctx.address) {
    return 'collecting_address'
  }

  // Collecting car info (images sent + package selected but no car info yet)
  if (ctx.customerName && ctx.imagesSentCategories.length > 0 && !hasCarInfoCollected) {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
    const hasSelected = lastUserMsg && /standard|professional|elite|interior|exterior|window|tire|rims|full/i.test(lastUserMsg.content)
    if (hasSelected) return 'collecting_car_info'
  }

  // Images sent — check if customer has selected a package
  if (ctx.imagesSentCategories.includes('wash')) {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
    const hasSelected = lastUserMsg && /standard|professional|elite/i.test(lastUserMsg.content)
    if (hasSelected) return 'wash_selected'
    return 'showing_wash_packages'
  }

  if (ctx.imagesSentCategories.includes('detailing')) {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
    const hasSelected = lastUserMsg && /interior|exterior|window|tire|rims|full/i.test(lastUserMsg.content)
    if (hasSelected) return 'detail_selected'
    return 'showing_detail_packages'
  }

  // Intro pitch given → awaiting intent
  if (ctx.introPitchGiven) return 'awaiting_intent'

  // Name known but no pitch → give pitch
  if (ctx.customerName && !ctx.introPitchGiven && !isReturningCustomer) return 'intro_pitch'

  // Introduced but no name → collecting
  if (ctx.alreadyIntroduced && !ctx.customerName) return 'collecting_name'

  // Returning customer → general chat
  if (isReturningCustomer) return 'general_chat'

  return 'greeting'
}

// ─── State Transition (after tool call) ──────────────────────────────

export function getNextState(
  current: SheraState,
  event: { toolsCalled?: string[]; nameGiven?: boolean; serviceChosen?: string; isReturning?: boolean }
): SheraState {
  if (event.isReturning && current === 'greeting') return 'general_chat'
  if (event.toolsCalled?.includes('create_booking')) return 'booking_complete'
  if (event.toolsCalled?.includes('send_service_images')) {
    // Determine which category was sent based on tool args (handled by caller)
    return current // Caller will use deriveState after
  }

  switch (current) {
    case 'greeting': return 'collecting_name'
    case 'collecting_name': return event.nameGiven ? 'intro_pitch' : 'collecting_name'
    case 'intro_pitch': return 'awaiting_intent'
    case 'awaiting_intent': return current
    case 'showing_wash_packages': return event.serviceChosen ? 'wash_selected' : current
    case 'showing_detail_packages': return event.serviceChosen ? 'detail_selected' : current
    case 'wash_selected': return 'collecting_car_info'
    case 'detail_selected': return 'collecting_car_info'
    case 'collecting_car_info': return 'collecting_address'
    case 'collecting_address': return 'collecting_schedule'
    case 'collecting_schedule': return 'confirming_booking'
    case 'confirming_booking': return current
    case 'booking_complete': return current
    case 'multi_car_next': return 'awaiting_intent'
    case 'general_chat': return current
    default: return current
  }
}
