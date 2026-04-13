/**
 * Khatmah Detail Screen
 * Shows all 30 Juz' with assignee names, completion status, and help-requested indicators.
 * Creator controls: automatic distribution, manual assignment, cycle reset (with confirmation).
 * Requirements: 5.2, 5.3, 5.4, 8.3, 9.4, 9.5
 */
import React, { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
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
} from '@/lib/assignment'
import { triggerCycleReset } from '@/lib/khatmah'

// ── Juz' row item ─────────────────────────────────────────────────────────────

interface JuzRowProps {
  juzNum: number
  assignedName: string
  planbName: string | null
  isCompleted: boolean
  isHelpRequested: boolean
  isCreator: boolean
  isManualMode: boolean
  isMyJuz: boolean
  actionLoading: boolean
  onCantRead: () => void
  onAdopt: () => void
  onReassign: () => void
  onPress: () => void
}

function JuzRow({
  juzNum,
  assignedName,
  planbName,
  isCompleted,
  isHelpRequested,
  isCreator,
  isManualMode,
  isMyJuz,
  actionLoading,
  onCantRead,
  onAdopt,
  onReassign,
  onPress,
}: JuzRowProps) {
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const styles = makeRowStyles(colors, spacing, typography)

  return (
    <TouchableOpacity
      style={[styles.row, isCompleted && styles.rowCompleted]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('juz.title', { num: juzNum })}
    >
      <KView style={styles.info}>
        <KText style={styles.juzNum}>{t('juz.title', { num: juzNum })}</KText>
        <KText style={styles.assignee}>{assignedName}</KText>
        {planbName != null ? (
          <KText style={styles.planb}>{`${t('juz.planBUser')}: ${planbName}`}</KText>
        ) : null}
        {isCompleted ? (
          <KText style={styles.completedBadge}>{t('khatmah.completed')}</KText>
        ) : null}
        {isHelpRequested && !isCompleted ? (
          <KText style={styles.helpBadge}>{t('juz.helpRequested')}</KText>
        ) : null}
      </KView>

      {/* Participant: "I Can't Read" button on their own incomplete Juz' */}
      {!isCreator && isMyJuz && !isCompleted && !isHelpRequested ? (
        actionLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <TouchableOpacity
            style={styles.cantReadBtn}
            onPress={onCantRead}
            accessibilityRole="button"
            accessibilityLabel={t('juz.cantRead')}
          >
            <KText style={styles.cantReadText}>{t('juz.cantRead')}</KText>
          </TouchableOpacity>
        )
      ) : null}

      {/* Creator: adopt / reassign for help-requested Juz' */}
      {isCreator && isHelpRequested && !isCompleted ? (
        actionLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <KView style={styles.creatorActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onAdopt}
              accessibilityRole="button"
              accessibilityLabel={`${t('khatmah.adopt')} ${t('juz.title', { num: juzNum })}`}
            >
              <KText style={styles.actionBtnText}>{t('khatmah.adopt')}</KText>
            </TouchableOpacity>
            {isManualMode ? (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnOutline]}
                onPress={onReassign}
                accessibilityRole="button"
                accessibilityLabel={`${t('khatmah.reassign')} ${t('juz.title', { num: juzNum })}`}
              >
                <KText style={styles.actionBtnOutlineText}>{t('khatmah.reassign')}</KText>
              </TouchableOpacity>
            ) : null}
          </KView>
        )
      ) : null}
    </TouchableOpacity>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function KhatmahDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const router = useRouter()
  const { session } = useSession()

  const { khatmah, loading: khatmahLoading } = useKhatmah(id ?? '')
  const { instance, loading: instanceLoading, reconnecting } = useActiveInstance(id ?? '')

  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [distributing, setDistributing] = useState(false)
  const [resetting, setResetting] = useState(false)

  const styles = makeStyles(colors, spacing, typography)

  const currentUserId = session?.user?.id ?? null
  const isCreator = khatmah != null && currentUserId === khatmah.creatorId
  const isManualMode = khatmah?.assignmentMode === 'manual'

  const loading = khatmahLoading || instanceLoading

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleDistributeAutomatic = useCallback(async () => {
    if (!instance) return
    setDistributing(true)
    try {
      await distributeAutomatic(instance.id, 'random')
    } catch (err) {
      Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined)
    } finally {
      setDistributing(false)
    }
  }, [instance, t])

  const handleManualAssign = useCallback((juzNum: number) => {
    if (!instance) return
    Alert.prompt(
      t('khatmah.reassignTitle', { num: juzNum }),
      t('khatmah.reassignMessage'),
      async (userId) => {
        if (!userId?.trim()) return
        setActionLoading(juzNum)
        try {
          await assignManual(instance.id, juzNum, userId.trim(), userId.trim())
        } catch (err) {
          Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined)
        } finally {
          setActionLoading(null)
        }
      },
      'plain-text',
      '',
    )
  }, [instance, t])

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
    } catch (err) {
      Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined)
    } finally {
      setActionLoading(null)
    }
  }, [instance, t])

  const handleAdopt = useCallback(async (juzNum: number) => {
    if (!instance || !currentUserId || !session?.user) return
    const adopterName =
      (session.user.user_metadata as { full_name?: string } | undefined)?.full_name ??
      session.user.email ??
      currentUserId
    setActionLoading(juzNum)
    try {
      await adoptJuz(instance.id, juzNum, currentUserId, adopterName)
    } catch (err) {
      Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined)
    } finally {
      setActionLoading(null)
    }
  }, [instance, currentUserId, session, t])

  const handleReassign = useCallback((juzNum: number) => {
    if (!instance) return
    Alert.prompt(
      t('khatmah.reassignTitle', { num: juzNum }),
      t('khatmah.reassignMessage'),
      async (newUserId) => {
        if (!newUserId?.trim()) return
        setActionLoading(juzNum)
        try {
          await reassignJuz(instance.id, juzNum, newUserId.trim(), newUserId.trim())
        } catch (err) {
          Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined)
        } finally {
          setActionLoading(null)
        }
      },
      'plain-text',
      '',
    )
  }, [instance, t])

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
      {reconnecting ? (
        <KView style={styles.reconnectBanner}>
          <KText style={styles.reconnectText}>{t('khatmah.loading')}</KText>
        </KView>
      ) : null}

      <KView style={styles.header}>
        <KText style={styles.title}>{khatmah.name}</KText>
        {isCreator ? (
          <TouchableOpacity
            onPress={handleSettingsPress}
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
              onPress={() => { void handleDistributeAutomatic() }}
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
            onPress={handleCycleReset}
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
              actionLoading={actionLoading === juzNum}
              onCantRead={() => { void handleCantRead(juzNum) }}
              onAdopt={() => { void handleAdopt(juzNum) }}
              onReassign={() => { handleReassign(juzNum) }}
              onPress={() => { handleJuzPress(juzNum) }}
            />
          )
        }}
      />
      {/* Creator: manual assign FAB-style row (tap any juz row to assign) */}
      {isCreator && isManualMode ? (
        <KView style={styles.manualHint}>
          <KText style={styles.manualHintText}>{t('khatmah.manual')}: {t('khatmah.reassign')}</KText>
        </KView>
      ) : null}
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
    reconnectBanner: {
      backgroundColor: colors.border,
      padding: spacing.sm,
      borderRadius: 6,
      marginBottom: spacing.sm,
      alignItems: 'center',
    },
    reconnectText: { fontSize: typography.fontSizeSM, color: colors.textMuted },
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
    manualHint: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
    },
    manualHintText: { fontSize: typography.fontSizeSM, color: colors.textMuted },
  })
}

function makeRowStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    row: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rowCompleted: { opacity: 0.55 },
    info: { marginBottom: spacing.xs },
    juzNum: {
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightBold,
      color: colors.text,
    },
    assignee: { fontSize: typography.fontSizeSM, color: colors.textMuted, marginTop: 2 },
    planb: { fontSize: typography.fontSizeSM, color: colors.primary, marginTop: 2 },
    completedBadge: {
      fontSize: typography.fontSizeXS,
      color: colors.success,
      fontWeight: typography.fontWeightMedium,
      marginTop: 4,
    },
    helpBadge: {
      fontSize: typography.fontSizeXS,
      color: colors.error,
      fontWeight: typography.fontWeightMedium,
      marginTop: 4,
    },
    cantReadBtn: {
      marginTop: spacing.sm,
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 6,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      alignSelf: 'flex-start',
    },
    cantReadText: {
      color: colors.error,
      fontSize: typography.fontSizeSM,
      fontWeight: typography.fontWeightMedium,
    },
    creatorActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    actionBtn: {
      backgroundColor: colors.primary,
      borderRadius: 6,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
    },
    actionBtnOutline: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    actionBtnText: {
      color: colors.surface,
      fontSize: typography.fontSizeSM,
      fontWeight: typography.fontWeightMedium,
    },
    actionBtnOutlineText: {
      color: colors.primary,
      fontSize: typography.fontSizeSM,
      fontWeight: typography.fontWeightMedium,
    },
  })
}
