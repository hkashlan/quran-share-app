import React from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import { KView, KText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'

export interface KhatmahHeaderProps {
  khatmahName: string
  isCreator: boolean
  isManualMode: boolean
  helpRequestedCount: number
  distributing: boolean
  resetting: boolean
  onSettingsPress: () => void
  onDistributeAutomatic: () => void
  onCycleReset: () => void
}

export function KhatmahHeader({
  khatmahName,
  isCreator,
  isManualMode,
  helpRequestedCount,
  distributing,
  resetting,
  onSettingsPress,
  onDistributeAutomatic,
  onCycleReset,
}: KhatmahHeaderProps) {
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const styles = makeStyles(colors, spacing, typography)

  return (
    <KView>
      <KView style={styles.header}>
        <KText style={styles.title}>{khatmahName}</KText>
        {isCreator ? (
          <TouchableOpacity
            onPress={onSettingsPress}
            accessibilityRole="button"
            accessibilityLabel={t('khatmah.settings')}
          >
            <KText style={styles.settingsLink}>{t('khatmah.settings')}</KText>
          </TouchableOpacity>
        ) : null}
      </KView>

      {/* Creator: help-requested banner */}
      {isCreator && helpRequestedCount > 0 ? (
        <KView style={styles.helpBanner}>
          <KText style={styles.helpBannerText}>
            {`⚠️ ${t('khatmah.helpAlert')}: ${helpRequestedCount} ${t('khatmah.juz')}`}
          </KText>
        </KView>
      ) : null}

      {/* Creator controls */}
      {isCreator ? (
        <KView style={styles.creatorControls}>
          {!isManualMode ? (
            <TouchableOpacity
              style={[styles.controlBtn, distributing && styles.btnDisabled]}
              onPress={onDistributeAutomatic}
              disabled={distributing}
              accessibilityRole="button"
              accessibilityLabel={t('khatmah.automatic')}
            >
              {distributing
                ? <ActivityIndicator size="small" color={colors.surface} />
                : <KText style={styles.controlBtnText}>{t('khatmah.automatic')}</KText>
              }
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[styles.controlBtn, styles.controlBtnDanger, resetting && styles.btnDisabled]}
            onPress={onCycleReset}
            disabled={resetting}
            accessibilityRole="button"
            accessibilityLabel={t('khatmah.cycleReset')}
          >
            {resetting
              ? <ActivityIndicator size="small" color={colors.surface} />
              : <KText style={styles.controlBtnText}>{t('khatmah.cycleReset')}</KText>
            }
          </TouchableOpacity>
        </KView>
      ) : null}

      <KText style={styles.sectionTitle}>{t('khatmah.juzList')}</KText>
    </KView>
  )
}

function makeStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    title: {
      fontSize: typography.fontSizeXL,
      fontWeight: typography.fontWeightBold,
      color: colors.text,
      flex: 1,
    },
    settingsLink: {
      fontSize: typography.fontSizeSM,
      color: colors.primary,
      fontWeight: typography.fontWeightMedium,
    },
    helpBanner: {
      backgroundColor: colors.error,
      borderRadius: 8,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    helpBannerText: {
      color: colors.surface,
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightMedium,
    },
    creatorControls: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    controlBtn: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    controlBtnDanger: { backgroundColor: colors.error },
    btnDisabled: { opacity: 0.6 },
    controlBtnText: {
      color: colors.surface,
      fontSize: typography.fontSizeSM,
      fontWeight: typography.fontWeightMedium,
    },
    sectionTitle: {
      fontSize: typography.fontSizeLG,
      fontWeight: typography.fontWeightMedium,
      color: colors.text,
      marginBottom: spacing.sm,
    },
  })
}
