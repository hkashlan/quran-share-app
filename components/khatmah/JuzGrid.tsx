import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { KText } from '@/components/ui'
import type { KhatmahInstance } from '@/types/khatmah'

type JuzCellStatus = 'completed' | 'missing' | 'unassigned' | 'in_progress'

const STATUS_COLORS: Record<JuzCellStatus, string> = {
  completed:   '#4CAF50',
  missing:     '#F44336',
  unassigned:  '#E0E0E0',
  in_progress: '#9E9E9E',
}

function getCellStatus(instance: KhatmahInstance, n: number): JuzCellStatus {
  if (instance.juzCompleted[n] === true) return 'completed'
  if (instance.juzHelpRequested[n] === true) return 'missing'
  if (instance.juzAssignments[n] == null) return 'unassigned'
  return 'in_progress'
}

export interface JuzGridProps {
  instance: KhatmahInstance
}

export function JuzGrid({ instance }: JuzGridProps) {
  const { t } = useTranslation()

  const juzNumbers = Array.from({ length: 30 }, (_, i) => i + 1)

  const missingCount = juzNumbers.filter(
    (n) =>
      (instance.juzAssignments[n] == null || instance.juzHelpRequested[n] === true) &&
      instance.juzCompleted[n] !== true,
  ).length

  return (
    <View>
      <View style={styles.grid}>
        {juzNumbers.map((n) => {
          const status = getCellStatus(instance, n)
          return (
            <View
              key={n}
              style={[styles.cell, { backgroundColor: STATUS_COLORS[status] }]}
            >
              <KText style={styles.cellText}>{n}</KText>
            </View>
          )
        })}
      </View>
      <KText style={styles.summary}>
        {missingCount === 0
          ? t('stats.allComplete')
          : t('stats.missingAlert', { count: missingCount })}
      </KText>
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '16.66%',
    aspectRatio: 1,
    borderRadius: 4,
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  summary: {
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center',
  },
})
