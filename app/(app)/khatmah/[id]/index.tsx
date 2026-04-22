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
import { useMarkHelpRequested } from '@/hooks/mutations/useMarkHelpRequested'
import { useAdoptJuz } from '@/hooks/mutations/useAdoptJuz'
import { useReassignJuz } from '@/hooks/mutations/useReassignJuz'
import { useAssignManual } from '@/hooks/mutations/useAssignManual'
import { JuzRow } from '@/components/khatmah/JuzRow'
import { ReassignModal, ParticipantOption } from '@/components/khatmah/ReassignModal'
import { KhatmahHeader } from '@/components/khatmah/KhatmahHeader'
import { ManualHint } from '@/components/khatmah/ManualHint'

// ── Screen ────────────────────────────────────────────────────────────────────

export default function KhatmahDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const router = useRouter()
  const { session } = useSession()

  const { data: khatmah, isLoading: khatmahLoading, isError: khatmahError } = useKhatmah(id ?? '')
  const { data: instance, isLoading: instanceLoading } = useActiveInstance(id ?? '')

  const currentUserId = session?.user?.id ?? null

  const distributeAutomatic = useDistributeAutomatic(id ?? '')
  const triggerCycleReset = useTriggerCycleReset(id ?? '', currentUserId ?? '')
  const markHelpRequested = useMarkHelpRequested(id ?? '')
  const adoptJuz = useAdoptJuz(id ?? '')
  const reassignJuz = useReassignJuz(id ?? '')
  const assignManual = useAssignManual(id ?? '')

  const [reassignModalVisible, setReassignModalVisible] = useState(false)
  const [reassignJuzNum, setReassignJuzNum] = useState<number | null>(null)
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantOption | null>(null)
  const [participants, setParticipants] = useState<ParticipantOption[]>([])
  const [loadingParticipants, setLoadingParticipants] = useState(false)

  const styles = makeStyles(colors, spacing, typography)
  const isCreator = khatmah != null && currentUserId === khatmah.creatorId
  const isManualMode = khatmah?.assignmentMode === 'manual'

  const loading = khatmahLoading || instanceLoading

  // Fetch participants when modal opens
  useEffect(() => {
    if (reassignModalVisible && instance && participants.length === 0) {
      setLoadingParticipants(true)
      fetchParticipants(instance.id)
        .then((fetchedParticipants) => {
          const options: ParticipantOption[] = fetchedParticipants.map((p) => ({
            userId: p.userId,
            fullName: p.fullName,
          }))
          setParticipants(options)
        })
        .catch((err) => {
          Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined)
        })
        .finally(() => setLoadingParticipants(false))
    }
  }, [reassignModalVisible, instance, participants.length, t])

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

  const handleCantRead = useCallback((juzNum: number) => {
    if (!instance) return
    markHelpRequested.mutate(
      { instanceId: instance.id, juzNum },
      { onError: (err) => Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined) },
    )
  }, [instance, markHelpRequested, t])

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

  const handleReassign = useCallback((juzNum: number) => {
    setReassignJuzNum(juzNum)
    setSelectedParticipant(null)
    setReassignModalVisible(true)
  }, [])

  const handleReassignConfirm = useCallback(() => {
    if (!instance || reassignJuzNum == null || !selectedParticipant) return
    reassignJuz.mutate(
      {
        instanceId: instance.id,
        juzNum: reassignJuzNum,
        newUserId: selectedParticipant.userId,
        newUserFullName: selectedParticipant.fullName,
      },
      {
        onSuccess: () => {
          setReassignModalVisible(false)
          setReassignJuzNum(null)
          setSelectedParticipant(null)
        },
        onError: (err) => Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined),
      },
    )
  }, [instance, reassignJuzNum, selectedParticipant, reassignJuz, t])

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

  const handleJuzPress = useCallback((juzNum: number) => {
    router.push(`/(app)/khatmah/${id}/juz/${juzNum}`)
  }, [router, id])

  const handleSettingsPress = useCallback(() => {
    router.push(`/(app)/khatmah/${id}/settings`)
  }, [router, id])

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
            (markHelpRequested.isPending && (markHelpRequested.variables as { juzNum: number } | undefined)?.juzNum === juzNum) ||
            (adoptJuz.isPending && (adoptJuz.variables as { juzNum: number } | undefined)?.juzNum === juzNum) ||
            (assignManual.isPending && (assignManual.variables as { juzNum: number } | undefined)?.juzNum === juzNum) ||
            (reassignJuz.isPending && (reassignJuz.variables as { juzNum: number } | undefined)?.juzNum === juzNum)

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
              onCantRead={() => { handleCantRead(juzNum) }}
              onAdopt={() => { handleAdopt(juzNum) }}
              onReassign={() => { handleReassign(juzNum) }}
              onSelfAssign={() => { handleSelfAssign(juzNum) }}
              onPress={() => { handleJuzPress(juzNum) }}
            />
          )
        }}
      />
      <ManualHint visible={isCreator && isManualMode} />

      <ReassignModal
        visible={reassignModalVisible}
        juzNum={reassignJuzNum}
        participants={participants}
        selectedParticipant={selectedParticipant}
        loadingParticipants={loadingParticipants}
        actionLoading={reassignJuz.isPending}
        onSelectParticipant={setSelectedParticipant}
        onConfirm={handleReassignConfirm}
        onCancel={() => setReassignModalVisible(false)}
      />
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
