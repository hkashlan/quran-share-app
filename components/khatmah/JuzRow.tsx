import React from 'react'
import { ActivityIndicator, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { KView, KText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'

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
  onCantRead: () => void
  onAdopt: () => void
  onReassign: () => void
  onSelfAssign: () => void
  onPress: () => void
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
  onCantRead,
  onAdopt,
  onReassign,
  onSelfAssign,
  onPress,
}: JuzRowProps) {
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const styles = makeRowStyles(colors, spacing, typography)

  return (
    <View style={[styles.row, isCompleted && styles.rowCompleted]}>
      <Pressable
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
      </Pressable>

      {/* Any user: self-assign unassigned Juz' */}
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

      {/* Creator: can reassign any Juz' in manual mode */}
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
    </View>
  )
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
    selfAssignBtn: {
      marginTop: spacing.sm,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 6,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      alignSelf: 'flex-start',
    },
    selfAssignText: {
      color: colors.primary,
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
    creatorReassignBtn: {
      marginTop: spacing.sm,
      alignSelf: 'flex-start',
    },
  })
}
