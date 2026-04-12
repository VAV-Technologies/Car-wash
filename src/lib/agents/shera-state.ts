// ─── Shera Conversation State Machine ────────────────────────────────
// Enforces conversation flow deterministically.
// The LLM can suggest actions, but the state machine gates them.

export type SheraState =
  | 'greeting'           // New conversation, no messages yet
  | 'awaiting_name'      // Asked for name, waiting for response
  | 'awaiting_intent'    // Have name, need to ask wash or detailing
  | 'showing_packages'   // Sent service images, waiting for selection
  | 'collecting_info'    // Package selected, collecting car/plate/address/schedule
  | 'confirming_booking' // All info collected, confirming before booking
  | 'booking_complete'   // Booking created, post-booking chat
  | 'general_chat'       // Free-form (returning customer, follow-ups)

/** Tools that are gated by state */
const TOOL_STATE_GATES: Record<string, SheraState[]> = {
  send_service_images: ['awaiting_intent', 'general_chat'],
  create_booking: ['collecting_info', 'confirming_booking', 'general_chat'],
  create_customer: ['awaiting_name', 'awaiting_intent', 'showing_packages', 'collecting_info', 'confirming_booking', 'general_chat'],
  update_booking: ['booking_complete', 'general_chat'],
  cancel_booking: ['booking_complete', 'general_chat'],
}

/** Check if a tool is allowed in the current state */
export function isToolAllowed(toolName: string, state: SheraState): boolean {
  const allowed = TOOL_STATE_GATES[toolName]
  if (!allowed) return true // ungated tools (search_customer, check_date_availability, etc.)
  return allowed.includes(state)
}

/** Get a human-readable rejection reason when a tool is blocked */
export function getToolBlockReason(toolName: string, state: SheraState): string {
  switch (toolName) {
    case 'send_service_images':
      if (state === 'greeting' || state === 'awaiting_name')
        return 'Kamu belum tau nama customer. Tanya nama dulu sebelum kirim gambar.'
      if (state === 'showing_packages')
        return 'Gambar sudah dikirim sebelumnya. JANGAN kirim lagi. Tanya customer mau pilih yang mana.'
      if (state === 'collecting_info' || state === 'confirming_booking')
        return 'Customer sudah pilih paket. JANGAN kirim gambar lagi. Lanjut kumpulkan info yang kurang.'
      if (state === 'booking_complete')
        return 'Booking sudah dibuat. JANGAN kirim gambar lagi.'
      return 'Belum waktunya kirim gambar paket.'
    case 'create_booking':
      if (state === 'greeting' || state === 'awaiting_name' || state === 'awaiting_intent' || state === 'showing_packages')
        return 'Belum cukup info untuk buat booking. Kumpulkan semua detail dulu (paket, mobil, plat, alamat, jadwal).'
      return 'Belum waktunya buat booking.'
    default:
      return `Tool ${toolName} tidak bisa dipanggil di state ${state}.`
  }
}

/**
 * Determine the next state based on what just happened.
 * Called after processing each message turn.
 */
export function getNextState(
  currentState: SheraState,
  event: {
    toolsCalled?: string[]
    nameKnown?: boolean
    serviceChosen?: boolean
    imagesAlreadySent?: boolean
    bookingCreated?: boolean
    isReturningCustomer?: boolean
  }
): SheraState {
  // Returning customers with full profile go straight to general_chat
  if (event.isReturningCustomer && currentState === 'greeting') {
    return 'general_chat'
  }

  // If a booking was just created, transition to complete
  if (event.toolsCalled?.includes('create_booking')) {
    return 'booking_complete'
  }

  // If images were just sent, transition to showing_packages
  if (event.toolsCalled?.includes('send_service_images')) {
    return 'showing_packages'
  }

  switch (currentState) {
    case 'greeting':
      // After first exchange, we're awaiting name
      return 'awaiting_name'

    case 'awaiting_name':
      // Once we have the name, ask what they want
      if (event.nameKnown) return 'awaiting_intent'
      return 'awaiting_name'

    case 'awaiting_intent':
      // If they said what they want and images sent → showing_packages
      // If they said a specific service → collecting_info
      if (event.serviceChosen) return 'collecting_info'
      return 'awaiting_intent'

    case 'showing_packages':
      // Customer picks a package → collecting_info
      if (event.serviceChosen) return 'collecting_info'
      return 'showing_packages'

    case 'collecting_info':
      // Stay here until booking is created
      return 'collecting_info'

    case 'confirming_booking':
      return 'confirming_booking'

    case 'booking_complete':
      // Stay in complete for follow-up chat
      return 'booking_complete'

    case 'general_chat':
      // Returning customers stay in general_chat unless a booking flow starts
      if (event.imagesAlreadySent === false && event.serviceChosen) return 'collecting_info'
      return 'general_chat'

    default:
      return currentState
  }
}

/**
 * Derive state from conversation history for existing conversations
 * that don't have a state yet.
 */
export function deriveStateFromHistory(
  messages: Array<{ role: string; content: string }>,
  isReturningCustomer: boolean
): SheraState {
  if (!messages || messages.length === 0) return 'greeting'

  const hasImagesSent = messages.some(m => m.role === 'assistant' && m.content.includes('[IMAGES_SENT]'))
  const hasBookingConfirm = messages.some(m => m.role === 'assistant' && /booking.*sudah.*buat|booking.*created|bookingnya.*buat/i.test(m.content))
  const hasAskedName = messages.some(m => m.role === 'assistant' && /namanya siapa|your name/i.test(m.content))
  const hasAskedIntent = messages.some(m => m.role === 'assistant' && /cuci mobil atau detailing|wash or detailing/i.test(m.content))
  const hasNameResponse = messages.some(m => m.role === 'user' && messages.indexOf(m) > 0)
  // Detect when Shera already moved past name (asking about services, prices, etc.)
  const hasSheraMovedPastName = messages.some(m => m.role === 'assistant' &&
    /standard wash|professional|elite|mau cuci|which package|paket cuci|paket detail|harga/i.test(m.content))

  if (hasBookingConfirm) return 'booking_complete'
  if (hasImagesSent && hasNameResponse) return 'collecting_info'
  if (hasImagesSent) return 'showing_packages'
  if (hasSheraMovedPastName) return 'awaiting_intent'
  if (hasAskedIntent) return 'awaiting_intent'
  if (hasAskedName && hasNameResponse) return 'awaiting_intent'
  if (hasAskedName) return 'awaiting_name'
  if (isReturningCustomer) return 'general_chat'

  return 'greeting'
}

/** Format state info for injection into the system prompt */
export function statePromptBlock(state: SheraState): string {
  let block = `\n\n--- Conversation State ---`
  block += `\nCurrent state: ${state}`

  switch (state) {
    case 'greeting':
      block += `\nAksi: Perkenalkan diri dan tanya nama.`
      break
    case 'awaiting_name':
      block += `\nAksi: Tunggu customer kasih nama. Kalau sudah dapat, sapa dan tanya mau cuci atau detailing. Kalau customer TIDAK MAU kasih nama (bilang "tidak", langsung tanya harga, atau skip), JANGAN tanya nama lagi. Lanjut aja ke layanan, panggil mereka "kak".`
      break
    case 'awaiting_intent':
      block += `\nAksi: Tanya customer mau cuci mobil atau detailing. JANGAN kirim gambar sebelum customer jawab.`
      break
    case 'showing_packages':
      block += `\nAksi: Gambar paket SUDAH dikirim. Tanya customer mau pilih yang mana. JANGAN kirim gambar lagi.`
      break
    case 'collecting_info':
      block += `\nAksi: Customer sudah pilih paket. Kumpulkan info yang kurang: mobil, plat, alamat, jadwal. Tanya SATU per pesan.`
      break
    case 'confirming_booking':
      block += `\nAksi: Semua info sudah ada. Konfirmasi detail booking sebelum buat.`
      break
    case 'booking_complete':
      block += `\nAksi: Booking sudah dibuat. Kasih info pembayaran dan reschedule. Jawab pertanyaan lanjutan.`
      break
    case 'general_chat':
      block += `\nAksi: Conversation bebas. Bantu customer dengan apa yang mereka butuhkan.`
      break
  }

  return block
}
