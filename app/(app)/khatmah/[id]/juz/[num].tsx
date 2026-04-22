/**
 * Juz' Detail Screen
 * Displays current page via useJuzProgress; page number input calls Progress_Service.updatePage.
 * "Finish Juz'" button calls Progress_Service.finishJuz.
 * "I Can't Read" toggle calls Assignment_Service.markHelpRequested.
 * Requirements: 7.1, 7.2, 7.3, 7.5, 8.1
 */
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { KView, KText, KTextInput, KSafeAreaView, KScrollView } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { useSession } from '@/hooks/useSession'
import { useActiveInstance } from '@/hooks/useActiveInstance'
import { useJuzProgress } from '@/hooks/useJuzProgress'
import { ValidationError } from '@/lib/progress'
import { useUpdatePage } from '@/hooks/mutations/useUpdatePage'
import { useFinishJuz } from '@/hooks/mutations/useFinishJuz'
import { useMarkHelpRequested } from '@/hooks/mutations/useMarkHelpRequested'

export default function JuzDetailScreen() {
  const { id, num } = useLocalSearchParams<{ id: string; num: string }>()
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const { session } = useSession()

  const juzNum = parseInt(num ?? '1', 10)
  const safeJuzNum = isNaN(juzNum) || juzNum < 1 || juzNum > 30 ? 1 : juzNum

  const { data: instance, isLoading: instanceLoading } = useActiveInstance(id ?? '')
  const { data: currentPage, isLoading: pageLoading } = useJuzProgress(instance?.id ?? '', safeJuzNum)

  const [pageInput, setPageInput] = useState('')
  const [pageError, setPageError] = useState<string | null>(null)

  const styles = makeStyles(colors, spacing, typography)

  const currentUserId = session?.user?.id ?? null

  const updatePage = useUpdatePage(instance?.id ?? '', safeJuzNum)
  const finishJuz = useFinishJuz(id ?? '', currentUserId ?? '')
  const markHelpRequested = useMarkHelpRequested(id ?? '')

  // Sync page input when currentPage loads
  useEffect(() => {
    if (!pageLoading && currentPage != null && currentPage > 0) {
      setPageInput(String(currentPage))
    }
  }, [currentPage, pageLoading])

  // ── Derived state ───────────────────────────────────────────────────────────

  const assignedUserId = instance?.juzAssignments[safeJuzNum] ?? null
  const assignedName = instance?.juzUserFullNames[safeJuzNum] ?? t('khatmah.unassigned')
  const planbName = instance?.juzPlanbUserFullNames[safeJuzNum] ?? null
  const isCompleted = instance?.juzCompleted[safeJuzNum] === true
  const isHelpRequested = instance?.juzHelpRequested[safeJuzNum] === true
  const isMyJuz = assignedUserId === currentUserId

  const loading = instanceLoading || pageLoading

  // ── Actions ─────────────────────────────────────────────────────────────────

  function handleUpdatePage() {
    if (!instance) return
    setPageError(null)

    const page = parseInt(pageInput, 10)
    if (isNaN(page)) {
      setPageError(t('juz.pageOutOfRange'))
      return
    }

    updatePage.mutate(page, {
      onError: (err) => {
        if (err instanceof ValidationError) {
          setPageError(t('juz.pageOutOfRange'))
        } else {
          setPageError(err instanceof Error ? err.message : t('khatmah.error'))
        }
      },
    })
  }

  function handleFinishJuz() {
    if (!instance) return
    Alert.alert(
      t('juz.finishJuz'),
      undefined,
      [
        { text: t('khatmah.cancel'), style: 'cancel' },
        {
          text: t('juz.finishJuz'),
          onPress: () => {
            finishJuz.mutate(
              { instanceId: instance.id, juzNum: safeJuzNum },
              {
                onError: (err) => {
                  Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined)
                },
              },
            )
          },
        },
      ],
    )
  }

  function handleMarkHelpRequested() {
    if (!instance) return
    markHelpRequested.mutate(
      { instanceId: instance.id, juzNum: safeJuzNum },
      {
        onError: (err) => {
          Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined)
        },
      },
    )
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

  if (!instance) {
    return (
      <KSafeAreaView style={styles.safe}>
        <KView style={styles.center}>
          <KText style={styles.errorText}>{t('khatmah.notFound')}</KText>
        </KView>
      </KSafeAreaView>
    )
  }

  return (
    <KSafeAreaView style={styles.safe}>
      <KScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <KText style={styles.title}>{t('juz.title', { num: safeJuzNum })}</KText>

        {/* Assignment info */}
        <KView style={styles.infoCard}>
          <KView style={styles.infoRow}>
            <KText style={styles.infoLabel}>{t('juz.assignedTo')}</KText>
            <KText style={styles.infoValue}>{assignedName}</KText>
          </KView>
          {planbName != null ? (
            <KView style={styles.infoRow}>
              <KText style={styles.infoLabel}>{t('juz.planBUser')}</KText>
              <KText style={[styles.infoValue, styles.planbValue]}>{planbName}</KText>
            </KView>
          ) : null}
          {isCompleted ? (
            <KText style={styles.completedBadge}>{t('khatmah.completed')}</KText>
          ) : null}
          {isHelpRequested && !isCompleted ? (
            <KText style={styles.helpBadge}>{t('juz.helpRequested')}</KText>
          ) : null}
        </KView>

        {/* Current page display */}
        <KView style={styles.pageCard}>
          <KText style={styles.pageLabel}>{t('juz.currentPage')}</KText>
          <KText style={styles.pageValue}>{currentPage != null && currentPage > 0 ? String(currentPage) : '—'}</KText>
        </KView>

        {/* Page update — only for assigned user on incomplete Juz' */}
        {isMyJuz && !isCompleted ? (
          <KView style={styles.field}>
            <KText style={styles.label}>{t('juz.updatePage')}</KText>
            <KView style={styles.pageInputRow}>
              <KTextInput
                style={[styles.pageInput, pageError ? styles.inputError : null]}
                value={pageInput}
                onChangeText={(v) => {
                  setPageInput(v)
                  setPageError(null)
                }}
                keyboardType="number-pad"
                placeholder={String(currentPage || '')}
                placeholderTextColor={colors.textMuted}
                accessibilityLabel={t('juz.updatePage')}
              />
              <TouchableOpacity
                style={[styles.updateBtn, updatePage.isPending && styles.btnDisabled]}
                onPress={handleUpdatePage}
                disabled={updatePage.isPending}
                accessibilityRole="button"
                accessibilityLabel={t('juz.updatePage')}
              >
                {updatePage.isPending
                  ? <ActivityIndicator size="small" color={colors.surface} />
                  : <KText style={styles.updateBtnText}>{t('juz.updatePage')}</KText>
                }
              </TouchableOpacity>
            </KView>
            {pageError ? <KText style={styles.errorText}>{pageError}</KText> : null}
          </KView>
        ) : null}

        {/* Finish Juz' — only for assigned user on incomplete Juz' */}
        {isMyJuz && !isCompleted ? (
          <TouchableOpacity
            style={[styles.finishBtn, finishJuz.isPending && styles.btnDisabled]}
            onPress={handleFinishJuz}
            disabled={finishJuz.isPending}
            accessibilityRole="button"
            accessibilityLabel={t('juz.finishJuz')}
          >
            {finishJuz.isPending
              ? <ActivityIndicator color={colors.surface} />
              : <KText style={styles.finishBtnText}>{t('juz.finishJuz')}</KText>
            }
          </TouchableOpacity>
        ) : null}

        {/* "I Can't Read" — only for assigned user on incomplete, non-help-requested Juz' */}
        {isMyJuz && !isCompleted && !isHelpRequested ? (
          <TouchableOpacity
            style={[styles.cantReadBtn, markHelpRequested.isPending && styles.btnDisabled]}
            onPress={handleMarkHelpRequested}
            disabled={markHelpRequested.isPending}
            accessibilityRole="button"
            accessibilityLabel={t('juz.cantRead')}
          >
            {markHelpRequested.isPending
              ? <ActivityIndicator color={colors.error} />
              : <KText style={styles.cantReadText}>{t('juz.cantRead')}</KText>
            }
          </TouchableOpacity>
        ) : null}

        {/* Help already requested confirmation */}
        {isHelpRequested && !isCompleted ? (
          <KView style={styles.helpConfirm}>
            <KText style={styles.helpConfirmText}>{t('juz.helpRequested')}</KText>
          </KView>
        ) : null}
      </KScrollView>
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
    container: { flexGrow: 1, padding: spacing.lg },
    loadingText: { marginTop: spacing.sm, color: colors.textMuted, fontSize: typography.fontSizeMD },
    errorText: { fontSize: typography.fontSizeSM, color: colors.error, marginTop: spacing.xs },
    title: {
      fontSize: typography.fontSizeXL,
      fontWeight: typography.fontWeightBold,
      color: colors.text,
      marginBottom: spacing.lg,
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    infoLabel: { fontSize: typography.fontSizeSM, color: colors.textMuted },
    infoValue: { fontSize: typography.fontSizeSM, color: colors.text, fontWeight: typography.fontWeightMedium },
    planbValue: { color: colors.primary },
    completedBadge: {
      fontSize: typography.fontSizeXS,
      color: colors.success,
      fontWeight: typography.fontWeightMedium,
      marginTop: spacing.xs,
    },
    helpBadge: {
      fontSize: typography.fontSizeXS,
      color: colors.error,
      fontWeight: typography.fontWeightMedium,
      marginTop: spacing.xs,
    },
    pageCard: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.lg,
      alignItems: 'center',
    },
    pageLabel: { fontSize: typography.fontSizeSM, color: colors.textMuted, marginBottom: spacing.xs },
    pageValue: {
      fontSize: 40,
      fontWeight: typography.fontWeightBold,
      color: colors.primary,
    },
    field: { marginBottom: spacing.md },
    label: { fontSize: typography.fontSizeSM, color: colors.textMuted, marginBottom: spacing.xs },
    pageInputRow: { flexDirection: 'row', gap: spacing.sm },
    pageInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: typography.fontSizeMD,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    inputError: { borderColor: colors.error },
    updateBtn: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 100,
    },
    updateBtnText: {
      color: colors.surface,
      fontSize: typography.fontSizeSM,
      fontWeight: typography.fontWeightMedium,
    },
    finishBtn: {
      backgroundColor: colors.success,
      borderRadius: 8,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    finishBtnText: {
      color: colors.surface,
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightBold,
    },
    cantReadBtn: {
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 8,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    cantReadText: {
      color: colors.error,
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightMedium,
    },
    btnDisabled: { opacity: 0.6 },
    helpConfirm: {
      backgroundColor: colors.error,
      borderRadius: 8,
      padding: spacing.md,
      alignItems: 'center',
    },
    helpConfirmText: {
      color: colors.surface,
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightMedium,
    },
  })
}
