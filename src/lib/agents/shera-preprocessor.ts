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
 * Returns 'wash', 'detailing', or null.
 */
export function detectCategory(message: string): string | null {
  if (/\bcuci\s*mobil\b|\bcar\s*wash\b|\bcuci\b|\bwash\b/i.test(message)) return 'wash'
  if (/\bdetailing\b|\bdetail\b/i.test(message)) return 'detailing'
  return null
}

/**
 * Detect customer name from common patterns in Indonesian and English.
 * Returns the detected name or null.
 */
export function detectName(message: string): string | null {
  const patterns = [
    /nama\s+(?:saya|aku|gue|gw)\s+(\w+)/i,
    /(?:I'm|my name is|i am|this is)\s+(\w+)/i,
    /(?:panggil\s+(?:aku|saya)\s+)(\w+)/i,
  ]
  for (const p of patterns) {
    const m = message.match(p)
    if (m) return m[1]
  }
  return null
}

/**
 * Run all hint detection on a message.
 * Returns an array of hint strings like ["SERVICE_DETECTED: elite_wash", "NAME_DETECTED: Fadil"].
 * Questions suppress SERVICE_DETECTED and CATEGORY_DETECTED to avoid false positives.
 */
export function detectHints(message: string): string[] {
  const hints: string[] = []
  const question = isQuestionMessage(message)

  // Detect specific service (only if not a question)
  if (!question) {
    const service = detectServiceType(message)
    if (service) {
      hints.push(`SERVICE_DETECTED: ${service}`)
    }
  }

  // Detect category (only if no service detected and not a question)
  if (!hints.some(h => h.includes('SERVICE_DETECTED')) && !question) {
    const category = detectCategory(message)
    if (category) {
      hints.push(`CATEGORY_DETECTED: ${category}`)
    }
  }

  // Detect name (always — questions don't affect name detection)
  const name = detectName(message)
  if (name) {
    hints.push(`NAME_DETECTED: ${name}`)
  }

  return hints
}
