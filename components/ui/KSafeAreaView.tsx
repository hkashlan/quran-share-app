import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context'
import { useLocale } from '@/hooks/useLocale'

export function KSafeAreaView({ style, ...props }: SafeAreaViewProps) {
  const { isRTL } = useLocale()
  return (
    <SafeAreaView
      style={[{ direction: isRTL ? 'rtl' : 'ltr' }, style]}
      {...props}
    />
  )
}
