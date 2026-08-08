/**
 * Normalize Arabic text by removing hamza variations
 * Converts أ, إ, آ to ا
 */
export function normalizeArabic(text: string): string {
  if (!text) return ''
  return text
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ى]/g, 'ي')
    .replace(/[ة]/g, 'ه')
    .toLowerCase()
    .trim()
}

/**
 * Check if search query matches text, ignoring hamza variations
 */
export function matchesArabic(query: string, text: string): boolean {
  if (!query) return true
  if (!text) return false
  return normalizeArabic(text).includes(normalizeArabic(query))
}
