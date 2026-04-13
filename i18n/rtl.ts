export const RTL_LANGUAGES = new Set(['ar'])

export function isRTLLanguage(lang: string): boolean {
  return RTL_LANGUAGES.has(lang)
}
