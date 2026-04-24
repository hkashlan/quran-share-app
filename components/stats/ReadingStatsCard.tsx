import React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { BarChart } from 'react-native-gifted-charts'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme/ThemeProvider'
import { KText } from '@/components/ui'

interface ReadingStatsCardProps {
  yearlyCount: number | null
  lifetimeCount: number | null
  isLoading: boolean
}

export function ReadingStatsCard({ yearlyCount, lifetimeCount, isLoading }: ReadingStatsCardProps) {
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightBold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    badgesRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    badge: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    badgeValue: {
      fontSize: typography.fontSizeXL,
      fontWeight: typography.fontWeightBold,
      color: colors.primary,
    },
    badgeLabel: {
      fontSize: typography.fontSizeXS,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    chartContainer: {
      alignItems: 'center',
    },
    loadingPlaceholder: {
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
  })

  if (isLoading) {
    return (
      <View style={styles.card}>
        <KText style={styles.title}>{t('stats.readingStats')}</KText>
        <View style={styles.loadingPlaceholder}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <KText style={styles.title}>{t('stats.readingStats')}</KText>

      <View style={styles.badgesRow}>
        <View style={styles.badge}>
          <KText style={styles.badgeValue}>
            {yearlyCount !== null ? String(yearlyCount) : '—'}
          </KText>
          <KText style={styles.badgeLabel}>{t('stats.lastYearJuz')}</KText>
        </View>

        <View style={styles.badge}>
          <KText style={styles.badgeValue}>
            {lifetimeCount !== null ? String(lifetimeCount) : '—'}
          </KText>
          <KText style={styles.badgeLabel}>{t('stats.lifetimeJuz')}</KText>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <BarChart
          data={[{ value: yearlyCount ?? 0, frontColor: colors.primary }]}
          isAnimated
          hideAxes
          hideRules
          barWidth={40}
          height={60}
          maxValue={Math.max(yearlyCount ?? 0, 1)}
        />
      </View>
    </View>
  )
}
