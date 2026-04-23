/**
 * Khatmah Detail Screen
 * Shows all 30 Juz' with assignee names, completion status, and help-requested indicators.
 * Creator controls: automatic distribution, manual assignment, cycle reset (with confirmation).
 * Requirements: 2.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9
 */
import React, { useCallback, useState, useEffect } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  FlatList,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { KView, KText, KSafeAreaView } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { useSession } from '@/hooks/useSession'
import { useActiveInstance } from '@/hooks/useActiveInstance'
import { useKhatmah } from '@/hooks/useKhatmah'
import { fetchParticipants } from '@/lib/assignment'
import { useDistributeAutomatic } from '@/hooks/mutations/useDistributeAutomatic'
import { useTriggerCycleReset } from '@/hooks/mutations/useTriggerCycleReset'
import { useAdoptJuz } from '@/hooks/mutations/useAdoptJuz'
import { useReassignJuz } from '@/hooks/mutations/useReassignJuz'
import { useAssignManual } from '@/hooks/mutations/useAssignManual'
import { useFinishJuz } from '@/hooks/mutations/useFinishJuz'
import { useMarkHelpRequested } from '@/hooks/mutations/useMarkHelpRequested'
import { useUnfinishJuz } from '@/hooks/mutations/useUnfinishJuz'
import { JuzRow } from '@/components/khatmah/JuzRow'
import { KhatmahHeader } from '@/components/khatmah/KhatmahHeader'
import { ManualHint } from '@/components/khatmah/ManualHint'

// ── Screen ────────────────────────────────────────────────────────────────────

export default function KhatmahDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const router = useRouter()
  const { session } = useSession()

  const { data: khatmah, isLoading: khatmahLoading } = useKhatmah(id ?? '')
  const { data: instance, isLoading: instanceLoading } = useActiveInstance(id ?? '')

  const currentUserId = session?.user?.id ?? null

  const distributeAutomatic = useDistributeAutomatic(id ?? '')
  const triggerCycleReset = useTriggerCycleReset(id ?? '', currentUserId ?? '')
  const adoptJuz = useAdoptJuz(id ?? '')
  const reassignJuz = useReassignJuz(id ?? '')
  const assignManual = useAssignManual(id ?? '')
  const finishJuz = useFinishJuz(id ?? '', currentUserId ?? '')
  const markHelpRequested = useMarkHelpRequested(id ?? '')
  const unfinishJuz = useUnfinishJuz(id ?? '')

  const styles = makeStyles(colors, spacing, typography)
  const isCreator = khatmah != null && currentUserId === khatmah.creatorId
  const isManualMode = khatmah?.assignmentMode === 'manual'

  const loading = khatmahLoading || instanceLoading

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleDistributeAutomatic = useCallback(() => {
    if (!instance) return
    distributeAutomatic.mutate(
      { instanceId: instance.id, mode: 'random' },
      { onError: (err) => Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined) },
    )
  }, [instance, distributeAutomatic, t])

  const handleCycleReset = useCallback(() => {
    if (!id) return
    Alert.alert(
      t('khatmah.confirmReset'),
      t('khatmah.resetWarning'),
      [
        { text: t('khatmah.cancel'), style: 'cancel' },
        {
          text: t('khatmah.cycleReset'),
          style: 'destructive',
          onPress: () => {
            triggerCycleReset.mutate(undefined, {
              onError: (err) => Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined),
            })
          },
        },
      ],
    )
  }, [id, triggerCycleReset, t])

  const handleAdopt = useCallback((juzNum: number) => {
    if (!instance || !currentUserId || !session?.user) return
    const adopterName =
      (session.user.user_metadata as { full_name?: string } | undefined)?.full_name ??
      session.user.email ??
      currentUserId
    adoptJuz.mutate(
      { instanceId: instance.id, juzNum, adopterId: currentUserId, adopterFullName: adopterName },
      { onError: (err) => Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined) },
    )
  }, [instance, currentUserId, session, adoptJuz, t])

  const handleReassignConfirm = useCallback((juzNum: number, newUserId: string, newUserFullName: string) => {
    if (!instance) return
    reassignJuz.mutate(
      { instanceId: instance.id, juzNum, newUserId, newUserFullName },
      { onError: (err) => Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined) },
    )
  }, [instance, reassignJuz, t])

  const handleSelfAssign = useCallback((juzNum: number) => {
    if (!instance || !currentUserId || !session?.user) return
    const userName =
      (session.user.user_metadata as { full_name?: string } | undefined)?.full_name ??
      session.user.email ??
      currentUserId
    assignManual.mutate(
      { instanceId: instance.id, juzNum, userId: currentUserId, userFullName: userName },
      { onError: (err) => Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined) },
    )
  }, [instance, currentUserId, session, assignManual, t])

  const handleSettingsPress = useCallback(() => {
    router.push(`/(app)/khatmah/${id}/settings`)
  }, [router, id])

  const handleComplete = useCallback((juzNum: number) => {
    if (!instance) return
    finishJuz.mutate(
      { instanceId: instance.id, juzNum },
      { onError: (err) => Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined) },
    )
  }, [instance, finishJuz, t])

  const handleCantRead = useCallback((juzNum: number) => {
    if (!instance) return
    markHelpRequested.mutate(
      { instanceId: instance.id, juzNum },
      { onError: (err) => Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined) },
    )
  }, [instance, markHelpRequested, t])

  const handleRevertReading = useCallback((juzNum: number) => {
    if (!instance) return
    unfinishJuz.mutate(
      { instanceId: instance.id, juzNum },
      { onError: (err) => Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined) },
    )
  }, [instance, unfinishJuz, t])

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <KSafeAreaView style={styles.safe}>
        <KView style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <KText style={styles.loadingText}>{t('khatmah.loading')}</KText>
        </KView>
      </KSafeAreaView>
    )
  }

  if (!khatmah || !instance) {
    return (
      <KSafeAreaView style={styles.safe}>
        <KView style={styles.center}>
          <KText style={styles.errorText}>{t('khatmah.notFound')}</KText>
        </KView>
      </KSafeAreaView>
    )
  }

  const helpRequestedCount = Array.from({ length: 30 }, (_, i) => i + 1).filter(
    (n) => instance.juzHelpRequested[n] === true && instance.juzCompleted[n] !== true,
  ).length

  const juzNums = Array.from({ length: 30 }, (_, i) => i + 1)

  const ListHeader = (
    <KView>
      <KhatmahHeader
        khatmahName={khatmah.name}
        isCreator={isCreator}
        isManualMode={isManualMode}
        helpRequestedCount={helpRequestedCount}
        distributing={distributeAutomatic.isPending}
        resetting={triggerCycleReset.isPending}
        onSettingsPress={handleSettingsPress}
        onDistributeAutomatic={handleDistributeAutomatic}
        onCycleReset={handleCycleReset}
      />
    </KView>
  )

  return (
    <KSafeAreaView style={styles.safe}>
      <FlatList
        data={juzNums}
        keyExtractor={(n) => String(n)}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        extraData={instance}
        renderItem={({ item: juzNum }) => {
          const assignedUserId = instance.juzAssignments[juzNum] ?? null
          const assignedName = instance.juzUserFullNames[juzNum] ?? t('khatmah.unassigned')
          const planbName = instance.juzPlanbUserFullNames[juzNum] ?? null
          const isCompleted = instance.juzCompleted[juzNum] === true
          const isHelpRequested = instance.juzHelpRequested[juzNum] === true
          const isMyJuz = assignedUserId === currentUserId
          const isUnassigned = assignedUserId == null
          const isActionLoading =
            (adoptJuz.isPending && (adoptJuz.variables as { juzNum: number } | undefined)?.juzNum === juzNum) ||
            (assignManual.isPending && (assignManual.variables as { juzNum: number } | undefined)?.juzNum === juzNum) ||
            (finishJuz.isPending && finishJuz.variables?.juzNum === juzNum) ||
            (markHelpRequested.isPending && markHelpRequested.variables?.juzNum === juzNum) ||
            (unfinishJuz.isPending && unfinishJuz.variables?.juzNum === juzNum)

          return (
            <JuzRow
              juzNum={juzNum}
              assignedName={assignedName}
              planbName={planbName}
              isCompleted={isCompleted}
              isHelpRequested={isHelpRequested}
              isCreator={isCreator}
              isManualMode={isManualMode}
              isMyJuz={isMyJuz}
              isUnassigned={isUnassigned}
              actionLoading={isActionLoading}
              instanceId={instance.id}
              onAdopt={() => { handleAdopt(juzNum) }}
              onSelfAssign={() => { handleSelfAssign(juzNum) }}
              onComplete={() => { handleComplete(juzNum) }}
              onCantRead={() => { handleCantRead(juzNum) }}
              onReassignConfirm={handleReassignConfirm}
              reassignLoading={reassignJuz.isPending}
              onRevertReading={() => { handleRevertReading(juzNum) }}
            />
          )
        }}
      />
      <ManualHint visible={isCreator && isManualMode} />
    </KSafeAreaView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
    listContent: { padding: spacing.lg, paddingBottom: spacing.xl },
    loadingText: { marginTop: spacing.sm, color: colors.textMuted, fontSize: typography.fontSizeMD },
    errorText: { color: colors.error, fontSize: typography.fontSizeMD, textAlign: 'center' },
  })
}
