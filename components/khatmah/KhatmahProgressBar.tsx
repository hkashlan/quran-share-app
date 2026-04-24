import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { KText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'

export interface KhatmahProgressBarProps {
  completedCount: number
  totalCount?: number
}

export function KhatmahProgressBar({ completedCount, totalCount = 30 }: KhatmahProgressBarProps) {
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()

  const animatedValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const ratio = totalCount > 0 ? completedCount / totalCount : 0
    Animated.timing(animatedValue, {
      toValue: ratio,
      duration: 600,
      useNativeDriver: false,
    }).start()
  }, [completedCount, totalCount])

  const widthInterpolated = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  })

  const isComplete = totalCount > 0 && completedCount >= totalCount
  const fillColor = isComplete ? colors.success : colors.primary

  return (
    <View style={styles.container}>
      <KText style={[styles.label, { color: colors.text, fontSize: typography.fontSizeSM }]}>
        {t('stats.completedOf', { completed: completedCount, total: totalCount })}
      </KText>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.fill,
            { width: widthInterpolated, backgroundColor: fillColor },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 6,
    textAlign: 'right',
  },
  track: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
})
