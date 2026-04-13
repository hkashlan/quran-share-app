import { StyleSheet } from 'react-native'
import { typography, colors } from '@/theme'

export const textStyles = StyleSheet.create({
  heading: { fontSize: typography.fontSizeLG, fontWeight: typography.fontWeightBold,    color: colors.text },
  body:    { fontSize: typography.fontSizeMD, fontWeight: typography.fontWeightRegular, color: colors.text },
  caption: { fontSize: typography.fontSizeXS, fontWeight: typography.fontWeightRegular, color: colors.textMuted },
})
