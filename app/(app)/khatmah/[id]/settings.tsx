/**
 * Khatmah Settings Screen
 * Display and edit Khatmah config: name, lifecycle, reset calendar, auto-renewal,
 * assignment mode, Jazah Multiplier. Shows invitation URL with copy/share.
 * Requirements: 3.6, 4.3, 6.7
 */
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Clipboard,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { KView, KText, KTextInput, KSafeAreaView, KScrollView } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { useKhatmah } from '@/hooks/useKhatmah'
import { updateConfig } from '@/lib/khatmah'
import { getInviteUrl } from '@/lib/invitation'
import type { LifecycleType, ResetCalendar, AssignmentMode } from '@/types/khatmah'

export default function KhatmahSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()

  const { data: khatmah, isLoading: khatmahLoading } = useKhatmah(id ?? '')

  // Local form state — initialised from khatmah once loaded
  const [name, setName] = useState('')
  const [lifecycleType, setLifecycleType] = useState<LifecycleType>('one_time')
  const [resetCalendar, setResetCalendar] = useState<ResetCalendar>('gregorian')
  const [autoRenewal, setAutoRenewal] = useState(false)
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>('manual')
  const [jazahMultiplier, setJazahMultiplier] = useState('1')

  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [inviteLoading, setInviteLoading] = useState(false)

  const [saving, setSaving] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const styles = makeStyles(colors, spacing, typography)

  // Populate form when khatmah loads
  useEffect(() => {
    if (khatmah == null) return
    setName(khatmah.name)
    setLifecycleType(khatmah.lifecycleType)
    setResetCalendar(khatmah.resetCalendar ?? 'gregorian')
    setAutoRenewal(khatmah.autoRenewal)
    setAssignmentMode(khatmah.assignmentMode)
    setJazahMultiplier(String(khatmah.jazahMultiplier))
  }, [khatmah])

  // Load invite URL once
  useEffect(() => {
    if (!id) return
    setInviteLoading(true)
    getInviteUrl(id)
      .then((url) => { setInviteUrl(url) })
      .catch(() => { /* non-critical */ })
      .finally(() => { setInviteLoading(false) })
  }, [id])

  // ── Actions ─────────────────────────────────────────────────────────────────

  async function handleSave() {
    setNameError(null)
    setSaveError(null)
    setSaved(false)

    if (name.trim().length === 0) {
      setNameError(t('khatmah.nameRequired'))
      return
    }

    const multiplier = parseInt(jazahMultiplier, 10)
    if (isNaN(multiplier) || multiplier < 1) {
      setSaveError(t('khatmah.error'))
      return
    }

    setSaving(true)
    try {
      await updateConfig(id ?? '', {
        name: name.trim(),
        lifecycleType,
        resetCalendar: lifecycleType === 'recurring' ? resetCalendar : null,
        autoRenewal,
        assignmentMode,
        jazahMultiplier: multiplier,
      })
      setSaved(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t('khatmah.error'))
    } finally {
      setSaving(false)
    }
  }

  function handleCopyInvite() {
    if (!inviteUrl) return
    Clipboard.setString(inviteUrl)
    Alert.alert(t('khatmah.copyInvite'), inviteUrl)
  }

  async function handleShareInvite() {
    if (!inviteUrl) return
    try {
      await Share.share({ message: inviteUrl, url: inviteUrl })
    } catch {
      // user dismissed share sheet — no-op
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (khatmahLoading) {
    return (
      <KSafeAreaView style={styles.safe}>
        <KView style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <KText style={styles.loadingText}>{t('khatmah.loading')}</KText>
        </KView>
      </KSafeAreaView>
    )
  }

  if (khatmah == null) {
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
        <KText style={styles.title}>{t('khatmah.settings')}</KText>

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
              onPress={() => { setLifecycleType('one_time') }}
              accessibilityRole="button"
              accessibilityState={{ selected: lifecycleType === 'one_time' }}
            >
              <KText style={[styles.segmentText, lifecycleType === 'one_time' && styles.segmentTextActive]}>
                {t('khatmah.oneTime')}
              </KText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segment, lifecycleType === 'recurring' && styles.segmentActive]}
              onPress={() => { setLifecycleType('recurring') }}
              accessibilityRole="button"
              accessibilityState={{ selected: lifecycleType === 'recurring' }}
            >
              <KText style={[styles.segmentText, lifecycleType === 'recurring' && styles.segmentTextActive]}>
                {t('khatmah.recurring')}
              </KText>
            </TouchableOpacity>
          </KView>
        </KView>

        {/* Reset calendar — only for recurring */}
        {lifecycleType === 'recurring' ? (
          <KView style={styles.field}>
            <KText style={styles.label}>{t('khatmah.resetCalendar')}</KText>
            <KView style={styles.segmentRow}>
              <TouchableOpacity
                style={[styles.segment, resetCalendar === 'gregorian' && styles.segmentActive]}
                onPress={() => { setResetCalendar('gregorian') }}
                accessibilityRole="button"
                accessibilityState={{ selected: resetCalendar === 'gregorian' }}
              >
                <KText style={[styles.segmentText, resetCalendar === 'gregorian' && styles.segmentTextActive]}>
                  {t('khatmah.gregorian')}
                </KText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segment, resetCalendar === 'islamic' && styles.segmentActive]}
                onPress={() => { setResetCalendar('islamic') }}
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
              onPress={() => { setAssignmentMode('manual') }}
              accessibilityRole="button"
              accessibilityState={{ selected: assignmentMode === 'manual' }}
            >
              <KText style={[styles.segmentText, assignmentMode === 'manual' && styles.segmentTextActive]}>
                {t('khatmah.manual')}
              </KText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segment, assignmentMode === 'automatic' && styles.segmentActive]}
              onPress={() => { setAssignmentMode('automatic') }}
              accessibilityRole="button"
              accessibilityState={{ selected: assignmentMode === 'automatic' }}
            >
              <KText style={[styles.segmentText, assignmentMode === 'automatic' && styles.segmentTextActive]}>
                {t('khatmah.automatic')}
              </KText>
            </TouchableOpacity>
          </KView>
        </KView>

        {/* Jazah Multiplier */}
        <KView style={styles.field}>
          <KText style={styles.label}>{t('khatmah.jazahMultiplier')}</KText>
          <KTextInput
            style={styles.input}
            value={jazahMultiplier}
            onChangeText={setJazahMultiplier}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={colors.textMuted}
          />
        </KView>

        {/* Save feedback */}
        {saveError ? <KText style={styles.errorText}>{saveError}</KText> : null}
        {saved ? (
          <KText style={styles.savedText}>{t('khatmah.active')}</KText>
        ) : null}

        {/* Save button */}
        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={() => { void handleSave() }}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel={t('khatmah.settings')}
        >
          {saving
            ? <ActivityIndicator color={colors.surface} />
            : <KText style={styles.buttonText}>{t('khatmah.settings')}</KText>
          }
        </TouchableOpacity>

        {/* Invite URL */}
        <KView style={styles.inviteSection}>
          <KText style={styles.label}>{t('khatmah.inviteUrl')}</KText>
          {inviteLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : inviteUrl != null ? (
            <>
              <KText style={styles.inviteUrl} selectable>{inviteUrl}</KText>
              <KView style={styles.inviteActions}>
                <TouchableOpacity
                  style={styles.inviteBtn}
                  onPress={handleCopyInvite}
                  accessibilityRole="button"
                  accessibilityLabel={t('khatmah.copyInvite')}
                >
                  <KText style={styles.inviteBtnText}>{t('khatmah.copyInvite')}</KText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.inviteBtn, styles.inviteBtnOutline]}
                  onPress={() => { void handleShareInvite() }}
                  accessibilityRole="button"
                  accessibilityLabel={t('khatmah.inviteUrl')}
                >
                  <KText style={styles.inviteBtnOutlineText}>{t('khatmah.inviteUrl')}</KText>
                </TouchableOpacity>
              </KView>
            </>
          ) : null}
        </KView>
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
    savedText: {
      fontSize: typography.fontSizeSM,
      color: colors.success,
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
    segmentText: { fontSize: typography.fontSizeSM, color: colors.text },
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
    inviteSection: {
      marginTop: spacing.xl,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inviteUrl: {
      fontSize: typography.fontSizeSM,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    inviteActions: { flexDirection: 'row', gap: spacing.sm },
    inviteBtn: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 6,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    inviteBtnOutline: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    inviteBtnText: {
      color: colors.surface,
      fontSize: typography.fontSizeSM,
      fontWeight: typography.fontWeightMedium,
    },
    inviteBtnOutlineText: {
      color: colors.primary,
      fontSize: typography.fontSizeSM,
      fontWeight: typography.fontWeightMedium,
    },
  })
}
