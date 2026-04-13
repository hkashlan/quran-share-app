import { View, ViewProps } from 'react-native'
import { useLocale } from '@/hooks/useLocale'

export function KView({ style, ...props }: ViewProps) {
  const { isRTL } = useLocale()
  return (
    <View
      style={[{ direction: isRTL ? 'rtl' : 'ltr' }, style]}
      {...props}
    />
  )
}
