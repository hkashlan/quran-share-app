import React from 'react'
import { ActivityIndicator, Modal, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import { KView, KText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'

export interface ParticipantOption {
  userId: string
  fullName: string
}

export interface ReassignModalProps {
  visible: boolean
  juzNum: number | null
  participants: ParticipantOption[]
  selectedParticipant: ParticipantOption | null
  loadingParticipants: boolean
  actionLoading: boolean
  onSelectParticipant: (participant: ParticipantOption) => void
  onConfirm: () => void
  onCancel: () => void
}

export function ReassignModal({
  visible,
  juzNum,
  participants,
  selectedParticipant,
  loadingParticipants,
  actionLoading,
  onSelectParticipant,
  onConfirm,
  onCancel,
}: ReassignModalProps) {
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const styles = makeStyles(colors, spacing, typography)

  // Format participant display name - same logic as JuzRow
  // Shows Gmail account name if available, with shortened ID as fallback
  const formatParticipantName = (participant: ParticipantOption) => {
    // If fullName is empty or just whitespace, show shortened UUID
    if (!participant.fullName || !participant.fullName.trim()) {
      return participant.userId.substring(0, 8)
    }
    
    // If it looks like a UUID (36 chars with dashes), show shortened version
    const isUUID = participant.fullName.length === 36 && participant.fullName.includes('-')
    if (isUUID) {
      return participant.userId.substring(0, 8)
    }
    
    // Otherwise it's a real name (Gmail account name), show it with ID
    return `${participant.fullName}`
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KView style={styles.modalOverlay}>
        <KView style={styles.modalContent}>
          <KText style={styles.modalTitle}>
            {t('khatmah.reassignTitle', { num: juzNum })}
          </KText>
          <KText style={styles.modalMessage}>{t('khatmah.reassignMessage')}</KText>

          {loadingParticipants ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.modalLoading} />
          ) : participants.length === 0 ? (
            <KText style={styles.noParticipantsText}>{t('khatmah.noParticipants')}</KText>
          ) : (
            <ScrollView style={styles.participantsList} nestedScrollEnabled>
              {participants.map((participant) => (
                <TouchableOpacity
                  key={participant.userId}
                  style={[
                    styles.participantItem,
                    selectedParticipant?.userId === participant.userId && styles.participantItemSelected,
                  ]}
                  onPress={() => onSelectParticipant(participant)}
                >
                  <KText
                    style={[
                      styles.participantItemText,
                      selectedParticipant?.userId === participant.userId && styles.participantItemTextSelected,
                    ]}
                  >
                    {formatParticipantName(participant)}
                  </KText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <KView style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnCancel]}
              onPress={onCancel}
              disabled={actionLoading}
            >
              <KText style={styles.modalBtnCancelText}>{t('khatmah.cancel')}</KText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalBtn,
                styles.modalBtnConfirm,
                (!selectedParticipant || actionLoading) && styles.btnDisabled,
              ]}
              onPress={onConfirm}
              disabled={!selectedParticipant || actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color={colors.surface} />
              ) : (
                <KText style={styles.modalBtnConfirmText}>{t('khatmah.reassign')}</KText>
              )}
            </TouchableOpacity>
          </KView>
        </KView>
      </KView>
    </Modal>
  )
}

function makeStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.lg,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: typography.fontSizeLG,
      fontWeight: typography.fontWeightBold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    modalMessage: {
      fontSize: typography.fontSizeMD,
      color: colors.textMuted,
      marginBottom: spacing.md,
    },
    modalLoading: {
      marginVertical: spacing.lg,
    },
    noParticipantsText: {
      fontSize: typography.fontSizeMD,
      color: colors.textMuted,
      textAlign: 'center',
      marginVertical: spacing.lg,
    },
    participantsList: {
      maxHeight: 250,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
    },
    participantItem: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    participantItemSelected: {
      backgroundColor: colors.primary + '22',
    },
    participantItemText: {
      fontSize: typography.fontSizeMD,
      color: colors.text,
    },
    participantItemTextSelected: {
      fontWeight: typography.fontWeightMedium,
      color: colors.primary,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    modalBtn: {
      flex: 1,
      borderRadius: 8,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    modalBtnCancel: {
      backgroundColor: colors.border,
    },
    modalBtnCancelText: {
      color: colors.text,
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightMedium,
    },
    modalBtnConfirm: {
      backgroundColor: colors.primary,
    },
    modalBtnConfirmText: {
      color: colors.surface,
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightMedium,
    },
    btnDisabled: {
      opacity: 0.6,
    },
  })
}
