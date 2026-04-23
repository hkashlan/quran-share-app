import React, { useEffect, useState, useCallback } from 'react'
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { ListItem, Badge } from '@rneui/themed'
import { KText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { useJuzProgress } from '@/hooks/useJuzProgress'
import { useUpdatePage } from '@/hooks/mutations/useUpdatePage'
import { ValidationError } from '@/lib/progress'
import { ReassignPanel, ParticipantOption } from '@/components/khatmah/ReassignPanel'
import { fetchParticipants } from '@/lib/assignment'

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
  instanceId: string
  onAdopt: () => void
  onSelfAssign: () => void
  onComplete: () => void
  onCantRead: () => void
  onReassignConfirm: (juzNum: number, userId: string, fullName: string) => void
  reassignLoading: boolean
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
  onSelfAssign,
  onComplete,
  onCantRead,
  onReassignConfirm,
  reassignLoading,
}: JuzRowProps) {
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const styles = makeStyles(colors, spacing, typography)

  const [expanded, setExpanded] = useState(false)
  const [showReassignPanel, setShowReassignPanel] = useState(false)
  const [participants, setParticipants] = useState<ParticipantOption[]>([])
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantOption | null>(null)
  const [loadingParticipants, setLoadingParticipants] = useState(false)

  // ── Progress ─────────────────────────────────────────────────────────────────
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

  // ── Reassign panel ────────────────────────────────────────────────────────────
  const openReassignPanel = useCallback(() => {
    setShowReassignPanel(true)
    setExpanded(true)
    if (participants.length === 0) {
      setLoadingParticipants(true)
      fetchParticipants(instanceId)
        .then((fetched) => setParticipants(fetched.map((p) => ({ userId: p.userId, fullName: p.fullName }))))
        .catch((err) => Alert.alert(t('khatmah.error'), err instanceof Error ? err.message : undefined))
        .finally(() => setLoadingParticipants(false))
    }
  }, [instanceId, participants.length, t])

  const closeReassignPanel = useCallback(() => {
    setShowReassignPanel(false)
    setSelectedParticipant(null)
  }, [])

  const handleReassignConfirm = useCallback(() => {
    if (!selectedParticipant) return
    onReassignConfirm(juzNum, selectedParticipant.userId, selectedParticipant.fullName)
    closeReassignPanel()
  }, [selectedParticipant, onReassignConfirm, juzNum, closeReassignPanel])

  const actions = deriveJuzActions({
    isCreator,
    isMyJuz,
    isUnassigned,
    isCompleted,
    isHelpRequested,
    isManualMode,
  })

  const hasExpandableContent =
    planbName != null ||
    actions.showReassign ||
    actions.showAssign ||
    actions.showCantRead

  // ── Primary header action ─────────────────────────────────────────────────────
  const primaryAction = actionLoading ? (
    <ActivityIndicator size="small" color={colors.primary} style={styles.headerSpinner} />
  ) : actions.showCompleted ? (
    <TouchableOpacity style={styles.primaryBtn} onPress={onComplete} accessibilityRole="button">
      <KText style={styles.primaryBtnText}>{t('khatmah.markCompleted')}</KText>
    </TouchableOpacity>
  ) : actions.showAssign ? (
    <TouchableOpacity style={styles.primaryBtn} onPress={openReassignPanel} accessibilityRole="button">
      <KText style={styles.primaryBtnText}>{t('khatmah.assign')}</KText>
    </TouchableOpacity>
  ) : !isCreator && isUnassigned && !isCompleted ? (
    <TouchableOpacity style={styles.primaryBtn} onPress={onSelfAssign} accessibilityRole="button">
      <KText style={styles.primaryBtnText}>{t('juz.selfAssign')}</KText>
    </TouchableOpacity>
  ) : isCreator && isHelpRequested && !isCompleted ? (
    <TouchableOpacity style={styles.adoptBtn} onPress={onAdopt} accessibilityRole="button">
      <KText style={styles.primaryBtnText}>{t('khatmah.adopt')}</KText>
    </TouchableOpacity>
  ) : null

  return (
    <ListItem.Accordion
      containerStyle={[
        styles.accordionContainer,
        isCompleted && styles.accordionCompleted,
        isHelpRequested && !isCompleted && styles.accordionHelp,
      ]}
      content={
        <View style={styles.headerContent}>
          <View style={styles.juzNumBadge}>
            <KText style={styles.juzNumText}>{juzNum}</KText>
          </View>
          <View style={styles.headerMeta}>
            <KText style={styles.assigneeName} numberOfLines={1}>{assignedName}</KText>
            <View style={styles.badgeRow}>
              {isCompleted && (
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              )}
              {isHelpRequested && !isCompleted && (
                <Badge
                  value={t('juz.helpRequested')}
                  badgeStyle={styles.helpBadge}
                  textStyle={styles.helpBadgeText}
                />
              )}
            </View>
          </View>
          {primaryAction}
        </View>
      }
      isExpanded={expanded}
      onPress={() => {
        if (!hasExpandableContent) return
        if (actions.showAssign && !expanded) openReassignPanel()
        else setExpanded((v) => !v)
      }}
      icon={
        hasExpandableContent
          ? <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
          : <View style={styles.iconPlaceholder} />
      }
    >
      <ListItem containerStyle={styles.expandedBody}>
        <ListItem.Content>
          {planbName != null && (
            <View style={styles.detailRow}>
              <Ionicons name="person-add-outline" size={14} color={colors.primary} />
              <KText style={styles.detailText}>{`${t('juz.planBUser')}: ${planbName}`}</KText>
            </View>
          )}

          <View style={styles.secondaryActions}>
            {actions.showReassign && (
              <TouchableOpacity style={styles.outlineBtn} onPress={openReassignPanel} accessibilityRole="button">
                <Ionicons name="swap-horizontal-outline" size={14} color={colors.primary} />
                <KText style={styles.outlineBtnText}>{t('khatmah.reassign')}</KText>
              </TouchableOpacity>
            )}
            {actions.showCantRead && (
              <TouchableOpacity style={styles.dangerBtn} onPress={onCantRead} accessibilityRole="button">
                <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
                <KText style={styles.dangerBtnText}>{t('juz.cantRead')}</KText>
              </TouchableOpacity>
            )}
          </View>

          {showReassignPanel && (
            <ReassignPanel
              participants={participants}
              selectedParticipant={selectedParticipant}
              loadingParticipants={loadingParticipants}
              actionLoading={reassignLoading}
              onSelectParticipant={setSelectedParticipant}
              onConfirm={handleReassignConfirm}
              onCancel={closeReassignPanel}
            />
          )}
        </ListItem.Content>
      </ListItem>
    </ListItem.Accordion>
  )
}

function makeStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    accordionContainer: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    accordionCompleted: {
      backgroundColor: '#F1F8F1',
      borderColor: colors.success,
      borderLeftWidth: 4,
    },
    accordionHelp: {
      borderColor: colors.error,
      borderLeftWidth: 4,
    },
    headerContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    juzNumBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    juzNumText: {
      color: colors.surface,
      fontSize: typography.fontSizeSM,
      fontWeight: typography.fontWeightBold,
    },
    headerMeta: { flex: 1, gap: 2 },
    assigneeName: {
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightMedium,
      color: colors.text,
    },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    helpBadge: { backgroundColor: colors.error, borderRadius: 4, height: 18 },
    helpBadgeText: { fontSize: 10, fontWeight: typography.fontWeightMedium },
    headerSpinner: { marginLeft: spacing.xs },
    iconPlaceholder: { width: 16 },
    primaryBtn: {
      backgroundColor: colors.primary,
      borderRadius: 6,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    adoptBtn: {
      backgroundColor: colors.error,
      borderRadius: 6,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    primaryBtnText: {
      color: colors.surface,
      fontSize: typography.fontSizeSM,
      fontWeight: typography.fontWeightBold,
    },
    expandedBody: {
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    detailText: { fontSize: typography.fontSizeSM, color: colors.primary },
    secondaryActions: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
    outlineBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 6,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    outlineBtnText: {
      color: colors.primary,
      fontSize: typography.fontSizeSM,
      fontWeight: typography.fontWeightMedium,
    },
    dangerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 6,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    dangerBtnText: {
      color: colors.error,
      fontSize: typography.fontSizeSM,
      fontWeight: typography.fontWeightMedium,
    },
  })
}
