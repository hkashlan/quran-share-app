/**
 * Khatmah Detail Screen
 * Shows all 30 Juz' with assignment info, completion status, and help-requested indicators.
 * - Participant view: "I Can't Read" toggle on their assigned Juz'
 * - Creator view: help-requested alert with Adopt / Reassign (Manual mode) actions
 * Requirements: 8.1, 8.3, 8.4, 8.5
 */
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { KView, KText, KSafeAreaView, KScrollView } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { useSession } from '@/hooks/useSession'
import { getById, getActiveInstance } from '@/lib/khatmah'
import {
  markHelpRequested,
  adoptJuz,
  reassignJuz,
} from '@/lib/assignment'
import type { Khatmah, KhatmahInstance } from '@/types/khatmah'

export default function KhatmahDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const { session } = useSession()

  const [khatmah, setKhatmah] = useState<Khatmah | null>(null)
  const [instance, setInstance] = useState<KhatmahInstance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const styles = makeStyles(colors, spacing, typography)

  const currentUserId = session?.user?.id ?? null

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      setError(null)
      const [k, inst] = await Promise.all([getById(id), getActiveInstance(id)])
      setKhatmah(k)
      setInstance(inst)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('khatmah.error'))
    } finally {
      setLoading(false)
    }
  }, [id, t])

  useEffect(() => {
    void loadData()
  }, [loadData])

  // ── Derived state ───────────────────────────────────────────────────────────

  const isCreator = khatmah != null && currentUserId === khatmah.creatorId
  const isManualMode = khatmah?.assignmentMode === 'manual'

  // Juz' numbers that have help_requested = true
  const helpRequestedJuzList: Array<{ juzNum: number; participantName: string }> =
    instance == null
      ? []
      : Array.from({ length: 30 }, (_, i) => i + 1)
          .filter((n) => instance.juzHelpRequested[n] === true)
          .map((n) => ({
            juzNum: n,
            participantName: instance.juzUserFullNames[n] ?? t('khatmah.unassigned'),
          }))

  // ── Actions ─────────────────────────────────────────────────────────────────

  async function handleMarkHelpRequested(juzNum: number) {
    if (!instance) return
    setActionLoading(juzNum)
    try {
      await markHelpRequested(instance.id, juzNum)
      await loadData()
    } catch (err) {
      Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleAdopt(juzNum: number) {
    if (!instance || !currentUserId || !session?.user) return
    const adopterFullName =
      (session.user.user_metadata as { full_name?: string } | undefined)?.full_name ??
      session.user.email ??
      currentUserId

    setActionLoading(juzNum)
    try {
      await adoptJuz(instance.id, juzNum, currentUserId, adopterFullName)
      await loadData()
    } catch (err) {
      Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined)
    } finally {
      setActionLoading(null)
    }
  }

  function handleReassign(juzNum: number) {
    if (!instance) return
    // Prompt for new user ID — in a full implementation this would be a participant picker
    Alert.prompt(
      t('khatmah.reassignTitle', { num: juzNum }),
      t('khatmah.reassignMessage'),
      async (newUserId) => {
        if (!newUserId?.trim()) return
        setActionLoading(juzNum)
        try {
          await reassignJuz(instance.id, juzNum, newUserId.trim(), newUserId.trim())
          await loadData()
        } catch (err) {
          Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined)
        } finally {
          setActionLoading(null)
        }
      },
      'plain-text',
      '',
    )
  }

  function showHelpAlert() {
    if (helpRequestedJuzList.length === 0) return

    const message =
      t('khatmah.helpAlertMessage') +
      '\n' +
      helpRequestedJuzList
        .map((h) => `• ${t('juz.title', { num: h.juzNum })} — ${h.participantName}`)
        .join('\n')

    const buttons = helpRequestedJuzList.flatMap((h) => {
      const adoptBtn = {
        text: `${t('khatmah.adopt')} ${t('juz.title', { num: h.juzNum })}`,
        onPress: () => { void handleAdopt(h.juzNum) },
      }
      if (isManualMode) {
        const reassignBtn = {
          text: `${t('khatmah.reassign')} ${t('juz.title', { num: h.juzNum })}`,
          onPress: () => { handleReassign(h.juzNum) },
        }
        return [adoptBtn, reassignBtn]
      }
      return [adoptBtn]
    })

    Alert.alert(t('khatmah.helpAlert'), message, [
      ...buttons,
      { text: t('khatmah.cancel'), style: 'cancel' },
    ])
  }

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

  if (error || !khatmah || !instance) {
    return (
      <KSafeAreaView style={styles.safe}>
        <KView style={styles.center}>
          <KText style={styles.errorText}>{error ?? t('khatmah.notFound')}</KText>
        </KView>
      </KSafeAreaView>
    )
  }

  return (
    <KSafeAreaView style={styles.safe}>
      <KScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <KText style={styles.title}>{khatmah.name}</KText>

        {/* Creator: help-requested alert banner */}
        {isCreator && helpRequestedJuzList.length > 0 ? (
          <TouchableOpacity
            style={styles.helpBanner}
            onPress={showHelpAlert}
            accessibilityRole="button"
            accessibilityLabel={t('khatmah.helpAlert')}
          >
            <KText style={styles.helpBannerText}>
              {`⚠️ ${t('khatmah.helpAlert')}: ${helpRequestedJuzList.length} ${t('khatmah.juz')}`}
            </KText>
          </TouchableOpacity>
        ) : null}

        {/* Juz' list */}
        <KText style={styles.sectionTitle}>{t('khatmah.juzList')}</KText>

        {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
          const assignedUserId = instance.juzAssignments[juzNum] ?? null
          const assignedName = instance.juzUserFullNames[juzNum] ?? t('khatmah.unassigned')
          const isCompleted = instance.juzCompleted[juzNum] === true
          const isHelpRequested = instance.juzHelpRequested[juzNum] === true
          const planbName = instance.juzPlanbUserFullNames[juzNum] ?? null
          const isMyJuz = assignedUserId === currentUserId
          const isLoading = actionLoading === juzNum

          return (
            <KView key={juzNum} style={[styles.juzRow, isCompleted && styles.juzRowCompleted]}>
              {/* Juz' number + status */}
              <KView style={styles.juzInfo}>
                <KText style={styles.juzNum}>{t('juz.title', { num: juzNum })}</KText>
                <KText style={styles.juzAssignee}>{assignedName}</KText>
                {planbName != null ? (
                  <KText style={styles.juzPlanb}>
                    {`${t('juz.planBUser')}: ${planbName}`}
                  </KText>
                ) : null}
                {isCompleted ? (
                  <KText style={styles.completedBadge}>{t('khatmah.completed')}</KText>
                ) : null}
                {isHelpRequested && !isCompleted ? (
                  <KText style={styles.helpBadge}>{t('juz.helpRequested')}</KText>
                ) : null}
              </KView>

              {/* Participant: "I Can't Read" toggle on their own Juz' */}
              {!isCreator && isMyJuz && !isCompleted && !isHelpRequested ? (
                <KView style={styles.toggleRow}>
                  <KText style={styles.toggleLabel}>{t('juz.cantRead')}</KText>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Switch
                      value={false}
                      onValueChange={() => { void handleMarkHelpRequested(juzNum) }}
                      trackColor={{ true: colors.error }}
                      accessibilityLabel={t('juz.cantRead')}
                    />
                  )}
                </KView>
              ) : null}

              {/* Creator: per-row adopt/reassign buttons for help-requested Juz' */}
              {isCreator && isHelpRequested && !isCompleted ? (
                <KView style={styles.creatorActions}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => { void handleAdopt(juzNum) }}
                        accessibilityRole="button"
                        accessibilityLabel={`${t('khatmah.adopt')} ${t('juz.title', { num: juzNum })}`}
                      >
                        <KText style={styles.actionBtnText}>{t('khatmah.adopt')}</KText>
                      </TouchableOpacity>
                      {isManualMode ? (
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.actionBtnSecondary]}
                          onPress={() => { handleReassign(juzNum) }}
                          accessibilityRole="button"
                          accessibilityLabel={`${t('khatmah.reassign')} ${t('juz.title', { num: juzNum })}`}
                        >
                          <KText style={styles.actionBtnTextSecondary}>{t('khatmah.reassign')}</KText>
                        </TouchableOpacity>
                      ) : null}
                    </>
                  )}
                </KView>
              ) : null}
            </KView>
          )
        })}
      </KScrollView>
    </KSafeAreaView>
  )
}

function makeStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: { flexGrow: 1, padding: spacing.lg },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
    title: {
      fontSize: typography.fontSizeXL,
      fontWeight: typography.fontWeightBold,
      color: colors.text,
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: typography.fontSizeLG,
      fontWeight: typography.fontWeightMedium,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    loadingText: {
      marginTop: spacing.sm,
      color: colors.textMuted,
      fontSize: typography.fontSizeMD,
    },
    errorText: {
      color: colors.error,
      fontSize: typography.fontSizeMD,
      textAlign: 'center',
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
    juzRow: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    juzRowCompleted: {
      opacity: 0.6,
    },
    juzInfo: {
      marginBottom: spacing.xs,
    },
    juzNum: {
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightBold,
      color: colors.text,
    },
    juzAssignee: {
      fontSize: typography.fontSizeSM,
      color: colors.textMuted,
      marginTop: 2,
    },
    juzPlanb: {
      fontSize: typography.fontSizeSM,
      color: colors.primary,
      marginTop: 2,
    },
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
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
    },
    toggleLabel: {
      fontSize: typography.fontSizeSM,
      color: colors.text,
    },
    creatorActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    actionBtn: {
      backgroundColor: colors.primary,
      borderRadius: 6,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
    },
    actionBtnSecondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    actionBtnText: {
      color: colors.surface,
      fontSize: typography.fontSizeSM,
      fontWeight: typography.fontWeightMedium,
    },
    actionBtnTextSecondary: {
      color: colors.primary,
      fontSize: typography.fontSizeSM,
      fontWeight: typography.fontWeightMedium,
    },
  })
}
