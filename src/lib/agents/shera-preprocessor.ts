// ─── Shera Pre-Processor ─────────────────────────────────────────────
// Extracted hint detection logic for testability.
// Used by the WhatsApp webhook to enrich messages before sending to GPT.

/**
 * Check if a message is a question (asking about a service, not selecting it).
 * When true, SERVICE_DETECTED hints should be suppressed.
 */
export function isQuestionMessage(message: string): boolean {
  return /[?]/.test(message) ||
    /\b(kalau|apa|apakah|ga\s*dapet|nggak\s*dapet|gadapet|termasuk|include|bedanya|beda|does it|is it|what about|can i|boleh|bisa)\b/i.test(message)
}

/**
 * Detect a specific service package from the message text.
 * Returns the service key or null if none detected.
 */
export function detectServiceType(message: string): string | null {
  if (/\bstandard\s*wash\b/i.test(message)) return 'standard_wash'
  if (/\bprofessional\s*wash\b|\bprofessional\b/i.test(message)) return 'professional'
  if (/\belite\s*wash\b|\belite\b/i.test(message)) return 'elite_wash'
  if (/\bfull\s*detail/i.test(message)) return 'full_detail'
  if (/\binterior\s*detail/i.test(message)) return 'interior_detail'
  if (/\bexterior\s*detail/i.test(message)) return 'exterior_detail'
  if (/\bwindow\s*detail/i.test(message)) return 'window_detail'
  if (/\btire\b|\brims\b/i.test(message)) return 'tire_rims'
  return null
}

/**
 * Detect wash vs detailing category from the message text.
 * Returns 'wash', 'detailing', 'both', or null.
 */
export function detectCategory(message: string): string | null {
  const hasWash = /\bcuci\s*mobil\b|\bcar\s*wash\b|\bcuci\b|\bwash\b/i.test(message)
  const hasDetail = /\bdetailing\b|\bdetail\b/i.test(message)
  if (hasWash && hasDetail) return 'both'
  if (hasWash) return 'wash'
  if (hasDetail) return 'detailing'
  return null
}

/**
 * Detect customer name from common patterns in Indonesian and English.
 * Returns the detected name or null.
 */
// Words that commonly follow "saya/aku/gue/gw" but are NOT names
const NOT_NAMES = new Set([
  'mau', 'ingin', 'butuh', 'perlu', 'lagi', 'sedang', 'baru', 'sudah',
  'tidak', 'ga', 'gak', 'gk', 'belum', 'cuma', 'hanya', 'juga', 'dari',
  'tanya', 'minta', 'cari', 'lihat', 'booking', 'book', 'want', 'need',
  'pengen', 'mw', 'mo', 'lg', 'udah', 'blm', 'ngga', 'nggak', 'enggak',
  'liat', 'tau', 'tahu', 'pikir', 'rasa', 'kira', 'harap', 'suka',
  // Common verbs that follow "gue/aku/saya" in sentences
  'dicuci', 'cuci', 'punya', 'ada', 'bisa', 'boleh', 'harus', 'akan',
  'lagi', 'kemarin', 'tadi', 'barusan', 'pernah', 'belom', 'dah',
  'kerja', 'tinggal', 'datang', 'pergi', 'makan', 'tidur', 'bangun',
])

export function detectName(message: string): string | null {
  const patterns = [
    /nama\s+(?:saya|aku|gue|gw)\s+(\w+)/i,         // "nama saya Budi"
    /(?:I'm|my name is|i am|this is)\s+(\w+)/i,     // English patterns
    /(?:panggil\s+(?:aku|saya)\s+)(\w+)/i,          // "panggil aku Budi"
    /(?:^|[,.!]\s*|hi\s+|halo\s+|hello\s+)(?:saya|aku|gue|gw)\s+(\w+)/i, // "saya Budi", "Hi saya Budi" (only at start/after greeting)
  ]
  for (const p of patterns) {
    const m = message.match(p)
    if (m) {
      const candidate = m[1]
      // For the loose "saya + word" pattern, filter out common non-name words
      if (p === patterns[3] && NOT_NAMES.has(candidate.toLowerCase())) continue
      return candidate
    }
  }
  return null
}

/**
 * Run all hint detection on a message.
 * Returns an array of hint strings like ["SERVICE_DETECTED: elite_wash", "NAME_DETECTED: Fadil"].
 * Questions suppress SERVICE_DETECTED and CATEGORY_DETECTED to avoid false positives.
 */
/**
 * Check if a service/category keyword is a SELECTION in a compound sentence
 * (selection clause + question clause, separated by comma/conjunction).
 *
 * "mau elite wash, tapi bisa hari ini ga?" → comma separates → selection + question → true
 * "does the professional wash include wax?" → no separator → whole sentence is a question → false
 * "cuci mobil brp?" → no separator → embedded question → false
 */
function isSelectionSeparateFromQuestion(message: string, matchKeyword: string): boolean {
  const keywordPos = message.toLowerCase().indexOf(matchKeyword.toLowerCase())
  if (keywordPos < 0) return false

  // Find clause separators between the keyword and the question part
  const afterKeyword = message.slice(keywordPos + matchKeyword.length)
  const hasSeparator = /[,.]|\b(tapi|but|terus|lalu|then|oh ya|btw)\b/i.test(afterKeyword)

  // Only treat as separate selection if there's a clause separator
  return hasSeparator
}

export function detectHints(message: string): string[] {
  const hints: string[] = []
  const question = isQuestionMessage(message)

  // Detect specific service
  // If the message is a question, still detect the service IF it appears BEFORE the question part
  // e.g., "mau elite wash, tapi bisa hari ini ga?" → elite wash is a selection, not part of the question
  const service = detectServiceType(message)
  if (service) {
    if (!question || isSelectionSeparateFromQuestion(message, service === 'tire_rims' ? 'tire' : service.replace('_', ' '))) {
      hints.push(`SERVICE_DETECTED: ${service}`)
    }
  }

  // Detect category (only if no service detected)
  // Same logic: if category keyword appears before question part, it's intent
  if (!hints.some(h => h.includes('SERVICE_DETECTED'))) {
    const category = detectCategory(message)
    if (category) {
      const categoryKeyword = category === 'both' ? 'cuci' : category === 'wash' ? 'cuci' : 'detail'
      if (!question || isSelectionSeparateFromQuestion(message, categoryKeyword)) {
        hints.push(`CATEGORY_DETECTED: ${category}`)
      }
    }
  }

  // Detect name (always — questions don't affect name detection)
  const name = detectName(message)
  if (name) {
    hints.push(`NAME_DETECTED: ${name}`)
  }

  return hints
}
