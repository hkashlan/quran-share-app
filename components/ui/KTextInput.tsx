import { TextInput, TextInputProps } from 'react-native'
import { useLocale } from '@/hooks/useLocale'

export function KTextInput({ style, ...props }: TextInputProps) {
  const { isRTL } = useLocale()
  return (
    <TextInput
      style={[{ textAlign: isRTL ? 'right' : 'left' }, style]}
      {...props}
    />
  )
}
