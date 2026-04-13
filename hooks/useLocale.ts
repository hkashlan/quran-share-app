import { useTranslation } from 'react-i18next'
import { isRTLLanguage } from '@/i18n/rtl'

export function useLocale() {
  const { i18n } = useTranslation()
  return {
    locale: i18n.language,
    isRTL: isRTLLanguage(i18n.language),
  }
}
