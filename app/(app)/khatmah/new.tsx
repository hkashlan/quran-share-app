import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, ActivityIndicator, Switch } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { KView, KText, KTextInput, KSafeAreaView, KScrollView } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { useSession } from '@/hooks/useSession'
import { create } from '@/lib/khatmah'
import type { LifecycleType, ResetCalendar, AssignmentMode } from '@/types/khatmah'

export default function NewKhatmahScreen() {
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const router = useRouter()
  const { session } = useSession()

  const [name, setName] = useState('')
  const [lifecycleType, setLifecycleType] = useState<LifecycleType>('one_time')
  const [resetCalendar, setResetCalendar] = useState<ResetCalendar>('gregorian')
  const [autoRenewal, setAutoRenewal] = useState(false)
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>('manual')

  const [nameError, setNameError] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const styles = makeStyles(colors, spacing, typography)

  async function handleSubmit() {
    setNameError(null)
    setGeneralError(null)

    if (name.trim().length === 0) {
      setNameError(t('khatmah.nameRequired'))
      return
    }

    if (!session?.user) {
      setGeneralError(t('khatmah.error'))
      return
    }

    setLoading(true)

    try {
      const khatmah = await create({
        name: name.trim(),
        creatorId: session.user.id,
        lifecycleType,
        resetCalendar: lifecycleType === 'recurring' ? resetCalendar : null,
        autoRenewal,
        assignmentMode,
      })

      router.replace(`/(app)/khatmah/${khatmah.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : t('khatmah.error')
      setGeneralError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KSafeAreaView style={styles.safe}>
      <KScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <KText style={styles.title}>{t('khatmah.create')}</KText>

        {/* Name */}
        <KView style={styles.field}>
          <KText style={styles.label}>{t('khatmah.name')}</KText>
          <KTextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            value={name}
            onChangeText={setName}
            placeholder={t('khatmah.name')}
            placeholderTextColor={colors.textMuted}
          />
          {nameError ? <KText style={styles.errorText}>{nameError}</KText> : null}
        </KView>

        {/* Lifecycle type */}
        <KView style={styles.field}>
          <KText style={styles.label}>{t('khatmah.lifecycleType')}</KText>
          <KView style={styles.segmentRow}>
            <TouchableOpacity
              style={[styles.segment, lifecycleType === 'one_time' && styles.segmentActive]}
              onPress={() => setLifecycleType('one_time')}
              accessibilityRole="button"
              accessibilityState={{ selected: lifecycleType === 'one_time' }}
            >
              <KText style={[styles.segmentText, lifecycleType === 'one_time' && styles.segmentTextActive]}>
                {t('khatmah.oneTime')}
              </KText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segment, lifecycleType === 'recurring' && styles.segmentActive]}
              onPress={() => setLifecycleType('recurring')}
              accessibilityRole="button"
              accessibilityState={{ selected: lifecycleType === 'recurring' }}
            >
              <KText style={[styles.segmentText, lifecycleType === 'recurring' && styles.segmentTextActive]}>
                {t('khatmah.recurring')}
              </KText>
            </TouchableOpacity>
          </KView>
        </KView>

        {/* Reset calendar — only shown for recurring */}
        {lifecycleType === 'recurring' ? (
          <KView style={styles.field}>
            <KText style={styles.label}>{t('khatmah.resetCalendar')}</KText>
            <KView style={styles.segmentRow}>
              <TouchableOpacity
                style={[styles.segment, resetCalendar === 'gregorian' && styles.segmentActive]}
                onPress={() => setResetCalendar('gregorian')}
                accessibilityRole="button"
                accessibilityState={{ selected: resetCalendar === 'gregorian' }}
              >
                <KText style={[styles.segmentText, resetCalendar === 'gregorian' && styles.segmentTextActive]}>
                  {t('khatmah.gregorian')}
                </KText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segment, resetCalendar === 'islamic' && styles.segmentActive]}
                onPress={() => setResetCalendar('islamic')}
                accessibilityRole="button"
                accessibilityState={{ selected: resetCalendar === 'islamic' }}
              >
                <KText style={[styles.segmentText, resetCalendar === 'islamic' && styles.segmentTextActive]}>
                  {t('khatmah.islamic')}
                </KText>
              </TouchableOpacity>
            </KView>
          </KView>
        ) : null}

        {/* Auto-renewal toggle */}
        <KView style={[styles.field, styles.row]}>
          <KText style={[styles.label, styles.flex1]}>{t('khatmah.autoRenewal')}</KText>
          <Switch
            value={autoRenewal}
            onValueChange={setAutoRenewal}
            trackColor={{ true: colors.primary }}
            accessibilityLabel={t('khatmah.autoRenewal')}
          />
        </KView>

        {/* Assignment mode */}
        <KView style={styles.field}>
          <KText style={styles.label}>{t('khatmah.assignmentMode')}</KText>
          <KView style={styles.segmentRow}>
            <TouchableOpacity
              style={[styles.segment, assignmentMode === 'manual' && styles.segmentActive]}
              onPress={() => setAssignmentMode('manual')}
              accessibilityRole="button"
              accessibilityState={{ selected: assignmentMode === 'manual' }}
            >
              <KText style={[styles.segmentText, assignmentMode === 'manual' && styles.segmentTextActive]}>
                {t('khatmah.manual')}
              </KText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segment, assignmentMode === 'automatic' && styles.segmentActive]}
              onPress={() => setAssignmentMode('automatic')}
              accessibilityRole="button"
              accessibilityState={{ selected: assignmentMode === 'automatic' }}
            >
              <KText style={[styles.segmentText, assignmentMode === 'automatic' && styles.segmentTextActive]}>
                {t('khatmah.automatic')}
              </KText>
            </TouchableOpacity>
          </KView>
        </KView>

        {/* General error */}
        {generalError ? <KText style={styles.errorText}>{generalError}</KText> : null}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={t('khatmah.create')}
        >
          {loading
            ? <ActivityIndicator color={colors.surface} />
            : <KText style={styles.buttonText}>{t('khatmah.create')}</KText>
          }
        </TouchableOpacity>
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
    title: {
      fontSize: typography.fontSizeXL,
      fontWeight: typography.fontWeightBold,
      color: colors.text,
      marginBottom: spacing.xl,
    },
    field: { marginBottom: spacing.md },
    row: { flexDirection: 'row', alignItems: 'center' },
    flex1: { flex: 1 },
    label: {
      fontSize: typography.fontSizeSM,
      color: colors.textMuted,
      marginBottom: spacing.xs,
    },
    input: {
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
    errorText: {
      fontSize: typography.fontSizeSM,
      color: colors.error,
      marginTop: spacing.xs,
    },
    segmentRow: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      overflow: 'hidden',
    },
    segment: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    segmentActive: { backgroundColor: colors.primary },
    segmentText: {
      fontSize: typography.fontSizeSM,
      color: colors.text,
    },
    segmentTextActive: {
      color: colors.surface,
      fontWeight: typography.fontWeightMedium,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: {
      color: colors.surface,
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightBold,
    },
  })
}
