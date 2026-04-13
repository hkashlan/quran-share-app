import { Text, TextProps } from 'react-native'
import { useLocale } from '@/hooks/useLocale'

export function KText({ style, ...props }: TextProps) {
  const { isRTL } = useLocale()
  return (
    <Text
      style={[
        {
          textAlign: isRTL ? 'right' : 'left',
          writingDirection: isRTL ? 'rtl' : 'ltr',
        },
        style,
      ]}
      {...props}
    />
  )
}
