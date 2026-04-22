import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { KView, KText, KTextInput } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { useJuzProgress } from '@/hooks/useJuzProgress'
import { useUpdatePage } from '@/hooks/mutations/useUpdatePage'
import { useFinishJuz } from '@/hooks/mutations/useFinishJuz'
import { useMarkHelpRequested } from '@/hooks/mutations/useMarkHelpRequested'
import { ValidationError } from '@/lib/progress'

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
  khatmahId?: string
  currentUserId?: string
  onAdopt: () => void
  onReassign: () => void
  onSelfAssign: () => void
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
  khatmahId,
  currentUserId,
  onAdopt,
  onReassign,
  onSelfAssign,
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
  const finishJuz = useFinishJuz(khatmahId ?? '', currentUserId ?? '')
  const markHelpRequested = useMarkHelpRequested(khatmahId ?? '')

  useEffect(() => {
    if (!pageLoading && currentPage != null && currentPage > 0) {
      setPageInput(String(currentPage))
    }
  }, [currentPage, pageLoading])

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

  function handleFinishJuz() {
    if (!instanceId) return
    Alert.alert(t('juz.finishJuz'), undefined, [
      { text: t('khatmah.cancel'), style: 'cancel' },
      {
        text: t('juz.finishJuz'),
        onPress: () => finishJuz.mutate(
          { instanceId, juzNum },
          { onError: (err) => Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined) },
        ),
      },
    ])
  }

  function handleMarkHelpRequested() {
    if (!instanceId) return
    markHelpRequested.mutate(
      { instanceId, juzNum },
      { onError: (err) => Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined) },
    )
  }

  return (
    <View style={[styles.row, isCompleted && styles.rowCompleted]}>
      {/* Row header — always visible */}
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

      {/* Self-assign unassigned Juz' */}
      {!isCreator && isUnassigned && !isCompleted && !isHelpRequested ? (
        actionLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <TouchableOpacity
            style={styles.selfAssignBtn}
            onPress={onSelfAssign}
            accessibilityRole="button"
            accessibilityLabel={t('juz.selfAssign')}
          >
            <KText style={styles.selfAssignText}>{t('juz.selfAssign')}</KText>
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

      {/* Creator: reassign any Juz' in manual mode */}
      {isCreator && isManualMode && !isHelpRequested ? (
        actionLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, styles.creatorReassignBtn]}
            onPress={onReassign}
            accessibilityRole="button"
            accessibilityLabel={`${t('khatmah.reassign')} ${t('juz.title', { num: juzNum })}`}
          >
            <KText style={styles.actionBtnText}>{t('khatmah.reassign')}</KText>
          </TouchableOpacity>
        )
      ) : null}

      {/* Inline reassign panel */}
      {reassignPanel}

      {/* My Juz' actions: page tracking + finish + can't read */}
      {isMyJuz && !isCompleted ? (
        <KView style={styles.myJuzSection}>
          {/* Current page */}
          <KView style={styles.pageRow}>
            <KText style={styles.pageLabel}>{t('juz.currentPage')}</KText>
            {pageLoading
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <KText style={styles.pageValue}>{currentPage != null && currentPage > 0 ? String(currentPage) : '—'}</KText>
            }
          </KView>

          {/* Page input + update */}
          <KView style={styles.inputRow}>
            <KTextInput
              style={[styles.input, pageError ? styles.inputError : null]}
              value={pageInput}
              onChangeText={(v) => { setPageInput(v); setPageError(null) }}
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
            >
              {updatePage.isPending
                ? <ActivityIndicator size="small" color={colors.surface} />
                : <KText style={styles.updateBtnText}>{t('juz.updatePage')}</KText>
              }
            </TouchableOpacity>
          </KView>
          {pageError ? <KText style={styles.errorText}>{pageError}</KText> : null}

          {/* Finish */}
          <TouchableOpacity
            style={[styles.finishBtn, finishJuz.isPending && styles.btnDisabled]}
            onPress={handleFinishJuz}
            disabled={finishJuz.isPending}
            accessibilityRole="button"
          >
            {finishJuz.isPending
              ? <ActivityIndicator color={colors.surface} />
              : <KText style={styles.finishBtnText}>{t('juz.finishJuz')}</KText>
            }
          </TouchableOpacity>

          {/* Can't read / help confirmed */}
          {!isHelpRequested ? (
            <TouchableOpacity
              style={[styles.cantReadBtn, markHelpRequested.isPending && styles.btnDisabled]}
              onPress={handleMarkHelpRequested}
              disabled={markHelpRequested.isPending}
              accessibilityRole="button"
            >
              {markHelpRequested.isPending
                ? <ActivityIndicator color={colors.error} />
                : <KText style={styles.cantReadText}>{t('juz.cantRead')}</KText>
              }
            </TouchableOpacity>
          ) : (
            <KView style={styles.helpConfirm}>
              <KText style={styles.helpConfirmText}>{t('juz.helpRequested')}</KText>
            </KView>
          )}
        </KView>
      ) : null}
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
    rowCompleted: { opacity: 0.55 },
    info: { marginBottom: spacing.xs },
    juzNum: { fontSize: typography.fontSizeMD, fontWeight: typography.fontWeightBold, color: colors.text },
    assignee: { fontSize: typography.fontSizeSM, color: colors.textMuted, marginTop: 2 },
    planb: { fontSize: typography.fontSizeSM, color: colors.primary, marginTop: 2 },
    completedBadge: { fontSize: typography.fontSizeXS, color: colors.success, fontWeight: typography.fontWeightMedium, marginTop: 4 },
    helpBadge: { fontSize: typography.fontSizeXS, color: colors.error, fontWeight: typography.fontWeightMedium, marginTop: 4 },
    selfAssignBtn: {
      marginTop: spacing.sm,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 6,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      alignSelf: 'flex-start',
    },
    selfAssignText: { color: colors.primary, fontSize: typography.fontSizeSM, fontWeight: typography.fontWeightMedium },
    creatorActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    actionBtn: { backgroundColor: colors.primary, borderRadius: 6, paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
    actionBtnOutline: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary },
    actionBtnText: { color: colors.surface, fontSize: typography.fontSizeSM, fontWeight: typography.fontWeightMedium },
    actionBtnOutlineText: { color: colors.primary, fontSize: typography.fontSizeSM, fontWeight: typography.fontWeightMedium },
    creatorReassignBtn: { marginTop: spacing.sm, alignSelf: 'flex-start' },
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
