import { describe, it, expect } from 'vitest'
import {
  isQuestionMessage,
  detectServiceType,
  detectCategory,
  detectName,
  detectHints,
} from '../shera-preprocessor'

// ─── isQuestionMessage ──────────────────────────────────────────────

describe('isQuestionMessage', () => {
  // Should detect questions
  it('detects question mark', () => {
    expect(isQuestionMessage('berapa harganya?')).toBe(true)
  })

  it('detects "kalau" (Indonesian if)', () => {
    expect(isQuestionMessage('kalau exterior detail gadapet window juga ya')).toBe(true)
  })

  it('detects "apa" (what)', () => {
    expect(isQuestionMessage('apa bedanya standard dan professional')).toBe(true)
  })

  it('detects "apakah" (whether)', () => {
    expect(isQuestionMessage('apakah bisa hari ini')).toBe(true)
  })

  it('detects "gadapet" (slang: doesn\'t include)', () => {
    expect(isQuestionMessage('exterior detail gadapet window juga')).toBe(true)
  })

  it('detects "termasuk" (includes)', () => {
    expect(isQuestionMessage('termasuk interior ga')).toBe(true)
  })

  it('detects "bedanya" (the difference)', () => {
    expect(isQuestionMessage('bedanya elite sama professional apa')).toBe(true)
  })

  it('detects "bisa" (can)', () => {
    expect(isQuestionMessage('bisa hari ini')).toBe(true)
  })

  it('detects "does it"', () => {
    expect(isQuestionMessage('does it include window coating')).toBe(true)
  })

  it('detects "is it"', () => {
    expect(isQuestionMessage('is it available today')).toBe(true)
  })

  it('detects "what about"', () => {
    expect(isQuestionMessage('what about the professional package')).toBe(true)
  })

  it('detects "include"', () => {
    expect(isQuestionMessage('does exterior detail include window')).toBe(true)
  })

  it('detects "boleh"', () => {
    expect(isQuestionMessage('boleh tau harganya')).toBe(true)
  })

  it('detects "can i"', () => {
    expect(isQuestionMessage('can I book for tomorrow')).toBe(true)
  })

  // Should NOT flag statements as questions
  it('does not flag "mau elite wash"', () => {
    expect(isQuestionMessage('mau elite wash')).toBe(false)
  })

  it('does not flag "cuci mobil"', () => {
    expect(isQuestionMessage('cuci mobil')).toBe(false)
  })

  it('does not flag "detailing"', () => {
    expect(isQuestionMessage('detailing')).toBe(false)
  })

  it('does not flag simple names', () => {
    expect(isQuestionMessage('nama saya Andi')).toBe(false)
  })

  it('does not flag "halo"', () => {
    expect(isQuestionMessage('halo')).toBe(false)
  })

  it('does not flag "saya mau booking"', () => {
    expect(isQuestionMessage('saya mau booking')).toBe(false)
  })
})

// ─── detectServiceType ──────────────────────────────────────────────

describe('detectServiceType', () => {
  it('detects "standard wash"', () => {
    expect(detectServiceType('standard wash please')).toBe('standard_wash')
  })

  it('detects "standard wash" case-insensitive', () => {
    expect(detectServiceType('Standard Wash')).toBe('standard_wash')
  })

  it('detects "professional wash"', () => {
    expect(detectServiceType('professional wash')).toBe('professional')
  })

  it('detects "professional" alone', () => {
    expect(detectServiceType('yang professional')).toBe('professional')
  })

  it('detects "elite wash"', () => {
    expect(detectServiceType('mau elite wash')).toBe('elite_wash')
  })

  it('detects "elite" alone', () => {
    expect(detectServiceType('elite dong')).toBe('elite_wash')
  })

  it('detects "full detail"', () => {
    expect(detectServiceType('full detail please')).toBe('full_detail')
  })

  it('detects "interior detail"', () => {
    expect(detectServiceType('interior detail')).toBe('interior_detail')
  })

  it('detects "exterior detail"', () => {
    expect(detectServiceType('exterior detail')).toBe('exterior_detail')
  })

  it('detects "window detail"', () => {
    expect(detectServiceType('window detail')).toBe('window_detail')
  })

  it('detects "tire"', () => {
    expect(detectServiceType('tire aja')).toBe('tire_rims')
  })

  it('detects "rims"', () => {
    expect(detectServiceType('rims nya aja')).toBe('tire_rims')
  })

  it('returns null for "halo"', () => {
    expect(detectServiceType('halo')).toBeNull()
  })

  it('returns null for "mobil"', () => {
    expect(detectServiceType('mobil')).toBeNull()
  })

  it('returns null for "cuci"', () => {
    expect(detectServiceType('cuci')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(detectServiceType('')).toBeNull()
  })
})

// ─── detectCategory ─────────────────────────────────────────────────

describe('detectCategory', () => {
  it('detects "cuci mobil"', () => {
    expect(detectCategory('cuci mobil')).toBe('wash')
  })

  it('detects "cuci" alone', () => {
    expect(detectCategory('cuci')).toBe('wash')
  })

  it('detects "car wash"', () => {
    expect(detectCategory('car wash')).toBe('wash')
  })

  it('detects "wash"', () => {
    expect(detectCategory('wash')).toBe('wash')
  })

  it('detects "detailing"', () => {
    expect(detectCategory('detailing')).toBe('detailing')
  })

  it('detects "detail"', () => {
    expect(detectCategory('detail')).toBe('detailing')
  })

  it('returns null for "halo"', () => {
    expect(detectCategory('halo')).toBeNull()
  })

  it('returns null for "mobil"', () => {
    expect(detectCategory('mobil')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(detectCategory('')).toBeNull()
  })

  // "cuci" should win over "detail" when both present
  it('prefers wash when message contains both "cuci" and "detail"', () => {
    expect(detectCategory('cuci detail')).toBe('wash')
  })
})

// ─── detectName ─────────────────────────────────────────────────────

describe('detectName', () => {
  it('detects "nama saya X"', () => {
    expect(detectName('nama saya fadil')).toBe('fadil')
  })

  it('detects "nama aku X"', () => {
    expect(detectName('nama aku Rina')).toBe('Rina')
  })

  it('detects "nama gue X" (slang)', () => {
    expect(detectName('nama gue Budi')).toBe('Budi')
  })

  it('detects "nama gw X" (slang)', () => {
    expect(detectName('nama gw Andi')).toBe('Andi')
  })

  it('detects "I\'m X"', () => {
    expect(detectName("I'm John")).toBe('John')
  })

  it('detects "my name is X"', () => {
    expect(detectName('my name is Sarah')).toBe('Sarah')
  })

  it('detects "i am X"', () => {
    expect(detectName('i am David')).toBe('David')
  })

  it('detects "this is X"', () => {
    expect(detectName('this is Michael')).toBe('Michael')
  })

  it('detects "panggil aku X"', () => {
    expect(detectName('panggil aku Budi')).toBe('Budi')
  })

  it('detects "panggil saya X"', () => {
    expect(detectName('panggil saya Dewi')).toBe('Dewi')
  })

  it('returns null for "halo"', () => {
    expect(detectName('halo')).toBeNull()
  })

  it('returns null for just a name "Fadil"', () => {
    expect(detectName('Fadil')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(detectName('')).toBeNull()
  })
})

// ─── detectHints (combined) ─────────────────────────────────────────

describe('detectHints', () => {
  // Service selection (not a question)
  it('detects service selection', () => {
    expect(detectHints('mau elite wash')).toEqual(['SERVICE_DETECTED: elite_wash'])
  })

  it('detects category wash', () => {
    expect(detectHints('cuci mobil')).toEqual(['CATEGORY_DETECTED: wash'])
  })

  it('detects category detailing', () => {
    expect(detectHints('mau detailing')).toEqual(['CATEGORY_DETECTED: detailing'])
  })

  // Questions suppress service and category hints
  it('suppresses SERVICE_DETECTED for questions', () => {
    expect(detectHints('kalau elite wash termasuk apa?')).toEqual([])
  })

  it('suppresses CATEGORY_DETECTED for questions', () => {
    expect(detectHints('apa bedanya cuci dan detailing?')).toEqual([])
  })

  it('suppresses SERVICE_DETECTED for "bisa" questions', () => {
    expect(detectHints('bisa professional wash hari ini')).toEqual([])
  })

  // Name detection (never suppressed by questions)
  it('detects name', () => {
    expect(detectHints('nama saya fadil')).toEqual(['NAME_DETECTED: fadil'])
  })

  it('name detection works even in questions', () => {
    expect(detectHints('nama saya fadil, bisa booking?')).toEqual(['NAME_DETECTED: fadil'])
  })

  // Combined hints
  it('detects name + category together', () => {
    const hints = detectHints('nama saya Rina, mau cuci mobil')
    expect(hints).toContain('CATEGORY_DETECTED: wash')
    expect(hints).toContain('NAME_DETECTED: Rina')
    expect(hints).toHaveLength(2)
  })

  it('detects name + service together', () => {
    const hints = detectHints('nama saya Rina, mau elite wash')
    expect(hints).toContain('SERVICE_DETECTED: elite_wash')
    expect(hints).toContain('NAME_DETECTED: Rina')
    expect(hints).toHaveLength(2)
  })

  // Service takes priority over category
  it('SERVICE_DETECTED prevents CATEGORY_DETECTED', () => {
    const hints = detectHints('mau standard wash')
    expect(hints).toEqual(['SERVICE_DETECTED: standard_wash'])
    expect(hints).not.toContain('CATEGORY_DETECTED: wash')
  })

  // No hints for generic messages
  it('returns empty for "halo"', () => {
    expect(detectHints('halo')).toEqual([])
  })

  it('returns empty for "mobil"', () => {
    expect(detectHints('mobil')).toEqual([])
  })

  it('returns empty for "wkwkwk"', () => {
    expect(detectHints('wkwkwk')).toEqual([])
  })

  it('returns empty for "okay"', () => {
    expect(detectHints('okay')).toEqual([])
  })

  // Human nuances
  it('detects "cuci" in slang "gue mau cuci"', () => {
    expect(detectHints('gue mau cuci')).toEqual(['CATEGORY_DETECTED: wash'])
  })

  it('detects "cuci" even with typo "cuci mobi"', () => {
    // "cuci" is detected even if "mobil" is misspelled
    expect(detectHints('cuci mobi')).toEqual(['CATEGORY_DETECTED: wash'])
  })

  it('handles mixed language "Halo I want wash"', () => {
    expect(detectHints('Halo I want wash')).toEqual(['CATEGORY_DETECTED: wash'])
  })

  // Emoji and special characters
  it('handles emoji in message', () => {
    expect(detectHints('cuci mobil dong 🚗')).toEqual(['CATEGORY_DETECTED: wash'])
  })

  it('handles empty string', () => {
    expect(detectHints('')).toEqual([])
  })

  // Real conversation messages that caused bugs
  it('Fadil case: "kalau exterior detail gadapet detailing window juga ya?" → no SERVICE_DETECTED', () => {
    const hints = detectHints('kalau exterior detail gadapet detailing window juga ya?')
    expect(hints.some(h => h.includes('SERVICE_DETECTED'))).toBe(false)
    expect(hints.some(h => h.includes('CATEGORY_DETECTED'))).toBe(false)
  })

  it('Andit case: "mobil" then "cuci" combined → CATEGORY_DETECTED: wash', () => {
    // After buffering, these get combined
    const hints = detectHints('mobil\ncuci\nwkwkwk')
    expect(hints).toEqual(['CATEGORY_DETECTED: wash'])
  })
})
