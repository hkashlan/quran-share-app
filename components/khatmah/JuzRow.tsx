import React, { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { KView, KText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { useJuzProgress } from '@/hooks/useJuzProgress'
import { useUpdatePage } from '@/hooks/mutations/useUpdatePage'
import { ValidationError } from '@/lib/progress'

export interface JuzActionSet {
  showCompleted: boolean
  showAssign: boolean
  showReassign: boolean
  showCantRead: boolean
}

export function deriveJuzActions(props: {
  isCreator: boolean
  isMyJuz: boolean
  isUnassigned: boolean
  isCompleted: boolean
  isHelpRequested: boolean
  isManualMode: boolean
}): JuzActionSet {
  const { isCreator, isMyJuz, isUnassigned, isCompleted, isHelpRequested, isManualMode } = props
  if (isCompleted) {
    return { showCompleted: false, showAssign: false, showReassign: false, showCantRead: false }
  }
  const isAssigned = !isUnassigned
  return {
    showCompleted: isAssigned && (isMyJuz || isCreator),
    showAssign: isCreator && isManualMode && isUnassigned,
    showReassign: isCreator && isManualMode && isAssigned,
    showCantRead: isMyJuz && !isHelpRequested,
  }
}

export interface JuzRowProps {
  juzNum: number
  assignedName: string
  planbName: string | null
  isCompleted: boolean
  isHelpRequested: boolean
  isCreator: boolean
  isManualMode: boolean
  isMyJuz: boolean
  isUnassigned: boolean
  actionLoading: boolean
  // IDs needed for mutations when isMyJuz
  instanceId?: string
  onAdopt: () => void
  onReassign: () => void
  onSelfAssign: () => void
  onComplete: () => void
  onCantRead: () => void
  reassignPanel?: React.ReactNode
}

export function JuzRow({
  juzNum,
  assignedName,
  planbName,
  isCompleted,
  isHelpRequested,
  isCreator,
  isManualMode,
  isMyJuz,
  isUnassigned,
  actionLoading,
  instanceId,
  onAdopt,
  onReassign,
  onSelfAssign,
  onComplete,
  onCantRead,
  reassignPanel,
}: JuzRowProps) {
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const styles = makeStyles(colors, spacing, typography)

  // ── Progress (only fetched when this is the user's own juz) ─────────────────
  const { data: currentPage, isLoading: pageLoading } = useJuzProgress(
    isMyJuz && instanceId ? instanceId : '',
    juzNum,
  )
  const [pageInput, setPageInput] = useState('')
  const [pageError, setPageError] = useState<string | null>(null)

  const updatePage = useUpdatePage(instanceId ?? '', juzNum)

  useEffect(() => {
    if (!pageLoading && currentPage != null && currentPage > 0) {
      setPageInput(String(currentPage))
    }
  }, [currentPage, pageLoading])

  const actions = deriveJuzActions({
    isCreator,
    isMyJuz,
    isUnassigned,
    isCompleted,
    isHelpRequested,
    isManualMode,
  })

  function handleUpdatePage() {
    setPageError(null)
    const page = parseInt(pageInput, 10)
    if (isNaN(page)) { setPageError(t('juz.pageOutOfRange')); return }
    updatePage.mutate(page, {
      onError: (err) => setPageError(
        err instanceof ValidationError
          ? t('juz.pageOutOfRange')
          : err instanceof Error ? err.message : t('khatmah.error'),
      ),
    })
  }

  return (
    <View style={[styles.row, isCompleted && styles.rowCompleted]}>
      {/* Row header — always visible */}
      <KView style={styles.info}>
        <KText style={styles.juzNum}>{t('juz.title', { num: juzNum })}</KText>
        <KText style={styles.assignee} numberOfLines={1}>{assignedName}</KText>
        {planbName != null ? (
          <KText style={styles.planb} numberOfLines={1}>{`${t('juz.planBUser')}: ${planbName}`}</KText>
        ) : null}
        {isCompleted ? (
          <Ionicons name="checkmark-circle" size={24} color={colors.success} accessibilityLabel={t('khatmah.completed')} />
        ) : null}
        {isHelpRequested && !isCompleted ? (
          <KText style={styles.helpBadge}>{t('juz.helpRequested')}</KText>
        ) : null}

        {/* Inline action buttons */}
        {actionLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <>
            {!isCreator && isUnassigned && !isCompleted && !isHelpRequested ? (
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={onSelfAssign}
                accessibilityRole="button"
                accessibilityLabel={t('juz.selfAssign')}
              >
                <KText style={styles.headerBtnText}>{t('juz.selfAssign')}</KText>
              </TouchableOpacity>
            ) : null}
            {isCreator && isHelpRequested && !isCompleted ? (
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={onAdopt}
                accessibilityRole="button"
                accessibilityLabel={`${t('khatmah.adopt')} ${t('juz.title', { num: juzNum })}`}
              >
                <KText style={styles.headerBtnText}>{t('khatmah.adopt')}</KText>
              </TouchableOpacity>
            ) : null}
            {actions.showCompleted && (
              <TouchableOpacity style={styles.completedBtn} onPress={onComplete} accessibilityRole="button">
                <KText style={styles.completedBtnText}>{t('khatmah.completed')}</KText>
              </TouchableOpacity>
            )}
            {actions.showAssign && (
              <TouchableOpacity style={styles.headerBtn} onPress={onReassign} accessibilityRole="button">
                <KText style={styles.headerBtnText}>{t('khatmah.assign')}</KText>
              </TouchableOpacity>
            )}
            {actions.showReassign && (
              <TouchableOpacity style={[styles.headerBtn, styles.headerBtnOutline]} onPress={onReassign} accessibilityRole="button">
                <KText style={styles.headerBtnOutlineText}>{t('khatmah.reassign')}</KText>
              </TouchableOpacity>
            )}
            {actions.showCantRead && (
              <TouchableOpacity style={styles.cantReadHeaderBtn} onPress={onCantRead} accessibilityRole="button">
                <KText style={styles.cantReadHeaderBtnText}>{t('juz.cantRead')}</KText>
              </TouchableOpacity>
            )}
          </>
        )}
      </KView>

      {/* Inline reassign panel */}
      {reassignPanel}
    </View>
  )
}

function makeStyles(
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
    rowCompleted: {
      backgroundColor: '#F1F8F1',
      borderColor: colors.success,
      borderLeftWidth: 4,
    },
    info: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs, flexWrap: 'wrap' },
    juzNum: { fontSize: typography.fontSizeMD, fontWeight: typography.fontWeightBold, color: colors.text },
    assignee: { fontSize: typography.fontSizeMD, color: colors.text, fontWeight: typography.fontWeightMedium, flex: 1 },
    planb: { fontSize: typography.fontSizeXS, color: colors.primary },
    helpBadge: { fontSize: typography.fontSizeXS, color: colors.error, fontWeight: typography.fontWeightMedium },
    headerBtn: {
      backgroundColor: colors.primary,
      borderRadius: 6,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    headerBtnOutline: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary },
    headerBtnText: { color: colors.surface, fontSize: typography.fontSizeSM, fontWeight: typography.fontWeightBold },
    headerBtnOutlineText: { color: colors.primary, fontSize: typography.fontSizeSM, fontWeight: typography.fontWeightBold },
    completedBtn: {
      backgroundColor: colors.success,
      borderRadius: 6,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    completedBtnText: {
      color: colors.surface,
      fontSize: typography.fontSizeSM,
      fontWeight: typography.fontWeightBold,
    },
    cantReadHeaderBtn: {
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 6,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    cantReadHeaderBtnText: {
      color: colors.error,
      fontSize: typography.fontSizeSM,
      fontWeight: typography.fontWeightMedium,
    },
    // My Juz' section
    myJuzSection: {
      marginTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.sm,
      gap: spacing.sm,
    },
    pageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    pageLabel: { fontSize: typography.fontSizeSM, color: colors.textMuted },
    pageValue: { fontSize: typography.fontSizeLG, fontWeight: typography.fontWeightBold, color: colors.primary },
    inputRow: { flexDirection: 'row', gap: spacing.sm },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      fontSize: typography.fontSizeMD,
      color: colors.text,
      backgroundColor: colors.background,
    },
    inputError: { borderColor: colors.error },
    errorText: { fontSize: typography.fontSizeXS, color: colors.error },
    updateBtn: {
      backgroundColor: colors.primary,
      borderRadius: 6,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 90,
    },
    updateBtnText: { color: colors.surface, fontSize: typography.fontSizeSM, fontWeight: typography.fontWeightMedium },
    finishBtn: { backgroundColor: colors.success, borderRadius: 6, paddingVertical: spacing.sm, alignItems: 'center' },
    finishBtnText: { color: colors.surface, fontSize: typography.fontSizeSM, fontWeight: typography.fontWeightBold },
    cantReadBtn: { borderWidth: 1, borderColor: colors.error, borderRadius: 6, paddingVertical: spacing.sm, alignItems: 'center' },
    cantReadText: { color: colors.error, fontSize: typography.fontSizeSM, fontWeight: typography.fontWeightMedium },
    helpConfirm: { backgroundColor: colors.error, borderRadius: 6, padding: spacing.sm, alignItems: 'center' },
    helpConfirmText: { color: colors.surface, fontSize: typography.fontSizeSM, fontWeight: typography.fontWeightMedium },
    btnDisabled: { opacity: 0.6 },
  })
}
