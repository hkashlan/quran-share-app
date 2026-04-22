import React from 'react'
import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { KView, KText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'

export interface ManualHintProps {
  visible: boolean
}

export function ManualHint({ visible }: ManualHintProps) {
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const styles = makeStyles(colors, spacing, typography)

  if (!visible) return null

  return (
    <KView style={styles.manualHint}>
      <KText style={styles.manualHintText}>{t('khatmah.manual')}: {t('khatmah.reassign')}</KText>
    </KView>
  )
}

function makeStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    manualHint: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
    },
    manualHintText: { fontSize: typography.fontSizeSM, color: colors.textMuted },
  })
}
