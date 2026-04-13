import { ScrollView, ScrollViewProps } from 'react-native'
import { useLocale } from '@/hooks/useLocale'

export function KScrollView({ style, ...props }: ScrollViewProps) {
  const { isRTL } = useLocale()
  return (
    <ScrollView
      style={[{ direction: isRTL ? 'rtl' : 'ltr' }, style]}
      {...props}
    />
  )
}
