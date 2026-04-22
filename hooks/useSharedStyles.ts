import { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { useTheme } from '@/theme/ThemeProvider'

export function useSharedStyles(): {
  screen: ViewStyle
  card: ViewStyle
  row: ViewStyle
  sectionTitle: TextStyle
  mutedText: TextStyle
} {
  const { colors, typography, spacing, shadows } = useTheme()

  return useMemo(
    () =>
      StyleSheet.create({
        screen: {
          flex: 1,
          backgroundColor: colors.background,
        },
        card: {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          padding: spacing.md,
          ...shadows.card,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        sectionTitle: {
          fontSize: typography.fontSizeLG,
          fontWeight: 'bold',
          color: colors.text,
        },
        mutedText: {
          fontSize: typography.fontSizeSM,
          color: colors.textMuted,
        },
      }),
    [colors, typography, spacing, shadows],
  )
}
