import React from 'react'
import { View, StyleSheet } from 'react-native'
import { PieChart } from 'react-native-gifted-charts'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme/ThemeProvider'
import { KText } from '@/components/ui'

interface CompletionDonutProps {
  completedCount: number
  missingCount: number
  inProgressCount: number
}

export function CompletionDonut({ completedCount, missingCount, inProgressCount }: CompletionDonutProps) {
  const { colors } = useTheme()
  const { t } = useTranslation()

  const total = completedCount + missingCount + inProgressCount
  const percentage = Math.round((completedCount / 30) * 100)

  const data = total === 0
    ? [{ value: 1, color: colors.textMuted }]
    : [
        { value: completedCount, color: colors.success, label: t('stats.completed') },
        { value: missingCount, color: colors.error, label: t('stats.missing') },
        { value: inProgressCount, color: colors.textMuted, label: t('stats.inProgress') },
      ]

  return (
    <View style={styles.container}>
      <PieChart
        data={data}
        donut
        isAnimated
        animationDuration={800}
        radius={60}
        innerRadius={40}
        centerLabelComponent={() => (
          <KText style={[styles.centerLabel, { color: colors.text }]}>
            {`${percentage}%`}
          </KText>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
})
