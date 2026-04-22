import React from 'react'
import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { KView, KText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'

export interface ReconnectBannerProps {
  visible: boolean
}

export function ReconnectBanner({ visible }: ReconnectBannerProps) {
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const styles = makeStyles(colors, spacing, typography)

  if (!visible) return null

  return (
    <KView style={styles.reconnectBanner}>
      <KText style={styles.reconnectText}>{t('khatmah.loading')}</KText>
    </KView>
  )
}

function makeStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    reconnectBanner: {
      backgroundColor: colors.border,
      padding: spacing.sm,
      borderRadius: 6,
      marginBottom: spacing.sm,
      alignItems: 'center',
    },
    reconnectText: { fontSize: typography.fontSizeSM, color: colors.textMuted },
  })
}
