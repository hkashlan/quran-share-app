import React from 'react'
import { Modal, StyleSheet, TouchableOpacity } from 'react-native'
import { KView, KText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'

export interface DialogAction {
  label: string
  onPress: () => void
  style?: 'default' | 'cancel' | 'destructive'
}

export interface ConfirmDialogProps {
  visible: boolean
  title: string
  message?: string
  actions: DialogAction[]
  onDismiss: () => void
}

export function ConfirmDialog({ visible, title, message, actions, onDismiss }: ConfirmDialogProps) {
  const { colors, spacing, typography } = useTheme()
  const styles = makeStyles(colors, spacing, typography)

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onDismiss}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <KView style={styles.card}>
            <KText style={styles.title}>{title}</KText>
            {message != null && <KText style={styles.message}>{message}</KText>}
            <KView style={styles.actions}>
              {actions.map((action) => (
                <TouchableOpacity
                  key={action.label}
                  style={[
                    styles.btn,
                    action.style === 'destructive' && styles.btnDestructive,
                    action.style === 'cancel' && styles.btnCancel,
                    action.style === 'default' && styles.btnDefault,
                  ]}
                  onPress={action.onPress}
                  accessibilityRole="button"
                >
                  <KText
                    style={[
                      styles.btnText,
                      action.style === 'destructive' && styles.btnTextDestructive,
                      action.style === 'cancel' && styles.btnTextCancel,
                    ]}
                  >
                    {action.label}
                  </KText>
                </TouchableOpacity>
              ))}
            </KView>
          </KView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

function makeStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.lg,
      width: 320,
      maxWidth: '100%',
    },
    title: {
      fontSize: typography.fontSizeLG,
      fontWeight: typography.fontWeightBold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    message: {
      fontSize: typography.fontSizeMD,
      color: colors.textMuted,
      marginBottom: spacing.md,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    btn: {
      borderRadius: 8,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      minWidth: 80,
      alignItems: 'center',
    },
    btnDefault: {
      backgroundColor: colors.primary,
    },
    btnDestructive: {
      backgroundColor: colors.error,
    },
    btnCancel: {
      backgroundColor: colors.border,
    },
    btnText: {
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightMedium,
      color: colors.surface,
    },
    btnTextDestructive: {
      color: colors.surface,
    },
    btnTextCancel: {
      color: colors.text,
    },
  })
}
