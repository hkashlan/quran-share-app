/**
 * Khatmah Detail Screen
 * Shows all 30 Juz' with assignee names, completion status, and help-requested indicators.
 * Creator controls: automatic distribution, manual assignment, cycle reset (with confirmation).
 * Requirements: 5.2, 5.3, 5.4, 8.3, 9.4, 9.5
 */
import React, { useCallback, useState, useEffect } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  FlatList,
} from 'react-native'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { KView, KText, KSafeAreaView } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { useSession } from '@/hooks/useSession'
import { useActiveInstance } from '@/hooks/useActiveInstance'
import { useKhatmah } from '@/hooks/useKhatmah'
import {
  distributeAutomatic,
  assignManual,
  adoptJuz,
  reassignJuz,
  markHelpRequested,
  fetchParticipants,
} from '@/lib/assignment'
import { triggerCycleReset } from '@/lib/khatmah'
import { JuzRow } from '@/components/khatmah/JuzRow'
import { ReassignModal, ParticipantOption } from '@/components/khatmah/ReassignModal'
import { KhatmahHeader } from '@/components/khatmah/KhatmahHeader'
import { ReconnectBanner } from '@/components/khatmah/ReconnectBanner'
import { ManualHint } from '@/components/khatmah/ManualHint'

// ── Screen ────────────────────────────────────────────────────────────────────

export default function KhatmahDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const router = useRouter()
  const { session } = useSession()

  const { khatmah, loading: khatmahLoading } = useKhatmah(id ?? '')
  const { instance, loading: instanceLoading, reconnecting, refresh } = useActiveInstance(id ?? '')

  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [distributing, setDistributing] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [reassignModalVisible, setReassignModalVisible] = useState(false)
  const [reassignJuzNum, setReassignJuzNum] = useState<number | null>(null)
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantOption | null>(null)
  const [participants, setParticipants] = useState<ParticipantOption[]>([])
  const [loadingParticipants, setLoadingParticipants] = useState(false)

  const styles = makeStyles(colors, spacing, typography)

  const currentUserId = session?.user?.id ?? null
  const isCreator = khatmah != null && currentUserId === khatmah.creatorId
  const isManualMode = khatmah?.assignmentMode === 'manual'

  const loading = khatmahLoading || instanceLoading

  // Refresh instance data when screen comes back into focus (e.g. returning from juz detail)
  useFocusEffect(
    useCallback(() => {
      refresh()
    }, [refresh]),
  )

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

  const handleDistributeAutomatic = useCallback(async () => {
    if (!instance) return
    setDistributing(true)
    try {
      await distributeAutomatic(instance.id, 'random')
      refresh()
    } catch (err) {
      Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined)
    } finally {
      setDistributing(false)
    }
  }, [instance, t, refresh])

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
          onPress: async () => {
            setResetting(true)
            try {
              await triggerCycleReset(id)
            } catch (err) {
              Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined)
            } finally {
              setResetting(false)
            }
          },
        },
      ],
    )
  }, [id, t])

  const handleCantRead = useCallback(async (juzNum: number) => {
    if (!instance) return
    setActionLoading(juzNum)
    try {
      await markHelpRequested(instance.id, juzNum)
      refresh()
    } catch (err) {
      Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined)
    } finally {
      setActionLoading(null)
    }
  }, [instance, t, refresh])

  const handleAdopt = useCallback(async (juzNum: number) => {
    if (!instance || !currentUserId || !session?.user) return
    const adopterName =
      (session.user.user_metadata as { full_name?: string } | undefined)?.full_name ??
      session.user.email ??
      currentUserId
    setActionLoading(juzNum)
    try {
      await adoptJuz(instance.id, juzNum, currentUserId, adopterName)
      refresh()
    } catch (err) {
      Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined)
    } finally {
      setActionLoading(null)
    }
  }, [instance, currentUserId, session, t, refresh])

  const handleReassign = useCallback((juzNum: number) => {
    setReassignJuzNum(juzNum)
    setSelectedParticipant(null)
    setReassignModalVisible(true)
  }, [])

  const handleReassignConfirm = useCallback(async () => {
    if (!instance || reassignJuzNum == null || !selectedParticipant) return
    setActionLoading(reassignJuzNum)
    try {
      await reassignJuz(instance.id, reassignJuzNum, selectedParticipant.userId, selectedParticipant.fullName)
      setReassignModalVisible(false)
      setReassignJuzNum(null)
      setSelectedParticipant(null)
      refresh()
    } catch (err) {
      Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined)
    } finally {
      setActionLoading(null)
    }
  }, [instance, reassignJuzNum, selectedParticipant, t, refresh])

  const handleSelfAssign = useCallback(async (juzNum: number) => {
    if (!instance || !currentUserId || !session?.user) return
    const userName =
      (session.user.user_metadata as { full_name?: string } | undefined)?.full_name ??
      session.user.email ??
      currentUserId
    setActionLoading(juzNum)
    try {
      await assignManual(instance.id, juzNum, currentUserId, userName)
      refresh()
    } catch (err) {
      Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined)
    } finally {
      setActionLoading(null)
    }
  }, [instance, currentUserId, session, t, refresh])

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
      <ReconnectBanner visible={reconnecting} />
      <KhatmahHeader
        khatmahName={khatmah.name}
        isCreator={isCreator}
        isManualMode={isManualMode}
        helpRequestedCount={helpRequestedCount}
        distributing={distributing}
        resetting={resetting}
        onSettingsPress={handleSettingsPress}
        onDistributeAutomatic={() => { void handleDistributeAutomatic() }}
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
        renderItem={({ item: juzNum }) => {
          const assignedUserId = instance.juzAssignments[juzNum] ?? null
          const assignedName = instance.juzUserFullNames[juzNum] ?? t('khatmah.unassigned')
          const planbName = instance.juzPlanbUserFullNames[juzNum] ?? null
          const isCompleted = instance.juzCompleted[juzNum] === true
          const isHelpRequested = instance.juzHelpRequested[juzNum] === true
          const isMyJuz = assignedUserId === currentUserId
          const isUnassigned = assignedUserId == null

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
              actionLoading={actionLoading === juzNum}
              onCantRead={() => { void handleCantRead(juzNum) }}
              onAdopt={() => { void handleAdopt(juzNum) }}
              onReassign={() => { handleReassign(juzNum) }}
              onSelfAssign={() => { void handleSelfAssign(juzNum) }}
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
        actionLoading={actionLoading === reassignJuzNum}
        onSelectParticipant={setSelectedParticipant}
        onConfirm={() => { void handleReassignConfirm() }}
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
