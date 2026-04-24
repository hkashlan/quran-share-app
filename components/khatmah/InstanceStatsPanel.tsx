import React from 'react'
import { View } from 'react-native'
import { useTheme } from '@/theme/ThemeProvider'
import type { KhatmahInstance } from '@/types/khatmah'
import { KhatmahProgressBar } from './KhatmahProgressBar'
import { CompletionDonut } from './CompletionDonut'
import { JuzGrid } from './JuzGrid'

interface InstanceStatsPanelProps {
  instance: KhatmahInstance
}

export function InstanceStatsPanel({ instance }: InstanceStatsPanelProps) {
  const { spacing } = useTheme()

  const juzNumbers = Array.from({ length: 30 }, (_, i) => i + 1)

  const completedCount = juzNumbers.filter(
    (n) => instance.juzCompleted[n] === true,
  ).length

  const missingCount = juzNumbers.filter(
    (n) =>
      (instance.juzAssignments[n] == null || instance.juzHelpRequested[n] === true) &&
      instance.juzCompleted[n] !== true,
  ).length

  const inProgressCount = juzNumbers.filter(
    (n) =>
      instance.juzAssignments[n] != null &&
      instance.juzCompleted[n] !== true &&
      instance.juzHelpRequested[n] !== true,
  ).length

  return (
    <View style={{ padding: spacing.md }}>
      <KhatmahProgressBar completedCount={completedCount} />
      <CompletionDonut
        completedCount={completedCount}
        missingCount={missingCount}
        inProgressCount={inProgressCount}
      />
      <JuzGrid instance={instance} />
    </View>
  )
}
