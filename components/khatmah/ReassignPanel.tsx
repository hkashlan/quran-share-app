import React from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import { KView, KText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'

export interface ParticipantOption {
  userId: string
  fullName: string
}

export interface ReassignPanelProps {
  participants: ParticipantOption[]
  selectedParticipant: ParticipantOption | null
  loadingParticipants: boolean
  actionLoading: boolean
  onSelectParticipant: (participant: ParticipantOption) => void
  onConfirm: () => void
  onCancel: () => void
}

function formatName(participant: ParticipantOption): string {
  if (!participant.fullName?.trim()) return participant.userId.substring(0, 8)
  const isUUID = participant.fullName.length === 36 && participant.fullName.includes('-')
  return isUUID ? participant.userId.substring(0, 8) : participant.fullName
}

export function ReassignPanel({
  participants,
  selectedParticipant,
  loadingParticipants,
  actionLoading,
  onSelectParticipant,
  onConfirm,
  onCancel,
}: ReassignPanelProps) {
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const styles = makeStyles(colors, spacing, typography)

  return (
    <KView style={styles.panel}>
      <KText style={styles.title}>{t('khatmah.reassignMessage')}</KText>

      {loadingParticipants ? (
        <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
      ) : participants.length === 0 ? (
        <KText style={styles.empty}>{t('khatmah.noParticipants')}</KText>
      ) : (
        <ScrollView style={styles.list} nestedScrollEnabled>
          {participants.map((p) => (
            <TouchableOpacity
              key={p.userId}
              style={[styles.item, selectedParticipant?.userId === p.userId && styles.itemSelected]}
              onPress={() => onSelectParticipant(p)}
            >
              <KText
                style={[
                  styles.itemText,
                  selectedParticipant?.userId === p.userId && styles.itemTextSelected,
                ]}
              >
                {formatName(p)}
              </KText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <KView style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnCancel]}
          onPress={onCancel}
          disabled={actionLoading}
        >
          <KText style={styles.btnCancelText}>{t('khatmah.cancel')}</KText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnConfirm, (!selectedParticipant || actionLoading) && styles.btnDisabled]}
          onPress={onConfirm}
          disabled={!selectedParticipant || actionLoading}
        >
          {actionLoading ? (
            <ActivityIndicator size="small" color={colors.surface} />
          ) : (
            <KText style={styles.btnConfirmText}>{t('khatmah.reassign')}</KText>
          )}
        </TouchableOpacity>
      </KView>
    </KView>
  )
}

function makeStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    panel: {
      marginTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.sm,
    },
    title: {
      fontSize: typography.fontSizeSM,
      color: colors.textMuted,
      marginBottom: spacing.xs,
    },
    loader: { marginVertical: spacing.sm },
    empty: {
      fontSize: typography.fontSizeSM,
      color: colors.textMuted,
      textAlign: 'center',
      marginVertical: spacing.sm,
    },
    list: {
      maxHeight: 180,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      marginBottom: spacing.sm,
    },
    item: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    itemSelected: { backgroundColor: colors.primary + '22' },
    itemText: { fontSize: typography.fontSizeSM, color: colors.text },
    itemTextSelected: { color: colors.primary, fontWeight: typography.fontWeightMedium },
    actions: { flexDirection: 'row', gap: spacing.sm },
    btn: {
      flex: 1,
      borderRadius: 6,
      paddingVertical: spacing.xs,
      alignItems: 'center',
    },
    btnCancel: { backgroundColor: colors.border },
    btnCancelText: {
      color: colors.text,
      fontSize: typography.fontSizeSM,
      fontWeight: typography.fontWeightMedium,
    },
    btnConfirm: { backgroundColor: colors.primary },
    btnConfirmText: {
      color: colors.surface,
      fontSize: typography.fontSizeSM,
      fontWeight: typography.fontWeightMedium,
    },
    btnDisabled: { opacity: 0.6 },
  })
}
