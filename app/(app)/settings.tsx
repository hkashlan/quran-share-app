import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native'
import { Button, Input, ListItem, Divider } from '@rneui/themed'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { KSafeAreaView, KText, KView } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { useThemeSwitcher } from '@/theme/ThemeProvider'
import { useSharedStyles } from '@/hooks/useSharedStyles'
import { useSession } from '@/hooks/useSession'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import type { ThemeName } from '@/theme/rneui'

const THEME_OPTIONS: { name: ThemeName; labelKey: string }[] = [
  { name: 'default', labelKey: 'settings.themeDefault' },
  { name: 'dark',    labelKey: 'settings.themeDark' },
  { name: 'quran',   labelKey: 'settings.themeQuran' },
]

export default function SettingsScreen() {
  const { t } = useTranslation()
  const { colors, typography, spacing } = useTheme()
  const shared = useSharedStyles()
  const { themeName, setTheme } = useThemeSwitcher()
  const { session } = useSession()
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Pre-fill display_name from Supabase profile
  useEffect(() => {
    if (!session?.user) return
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data?.display_name) setFullName(data.display_name)
      })
  }, [session?.user?.id])

  async function handleSave() {
    if (!session?.user) return
    setSaving(true)
    setSaveError(null)

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: fullName })
      .eq('id', session.user.id)

    setSaving(false)
    if (error) {
      setSaveError(error.message ?? t('settings.updateError'))
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
    } catch {
      // Sign out best-effort; navigate regardless
    }
    router.replace('/(auth)/sign-in')
  }

  const styles = makeStyles(colors, typography, spacing)

  return (
    <KSafeAreaView style={shared.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ── Profile Section ─────────────────────────────────────── */}
        <KText style={[shared.sectionTitle, styles.sectionSpacing]}>
          {t('settings.profile')}
        </KText>

        <KView style={[shared.card, styles.sectionSpacing]}>
          <Input
            label={t('settings.displayName')}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            autoComplete="name"
            disabled={saving}
            labelStyle={styles.inputLabel}
            inputStyle={styles.inputText}
            containerStyle={styles.inputContainer}
          />

          {saveError ? (
            <KText style={styles.errorText}>{saveError}</KText>
          ) : null}

          <Button
            title={saving ? '' : t('settings.save')}
            onPress={handleSave}
            disabled={saving}
            icon={saving ? <ActivityIndicator color={colors.surface} size="small" /> : undefined}
            buttonStyle={[styles.saveButton, saving && styles.buttonDisabled]}
            titleStyle={styles.saveButtonTitle}
          />
        </KView>

        <Divider style={styles.divider} color={colors.border} />

        {/* ── Theme Section ────────────────────────────────────────── */}
        <KText style={[shared.sectionTitle, styles.sectionSpacing]}>
          {t('settings.theme')}
        </KText>

        <KView style={[shared.card, styles.sectionSpacing]}>
          {THEME_OPTIONS.map(({ name, labelKey }) => (
            <ListItem
              key={name}
              onPress={() => setTheme(name)}
              containerStyle={styles.listItemContainer}
            >
              <ListItem.Content>
                <ListItem.Title style={styles.listItemTitle}>
                  {t(labelKey)}
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.CheckBox
                checked={themeName === name}
                onPress={() => setTheme(name)}
                checkedColor={colors.primary}
                uncheckedColor={colors.textMuted}
                containerStyle={styles.checkboxContainer}
              />
            </ListItem>
          ))}
        </KView>

        <Divider style={styles.divider} color={colors.border} />

        {/* ── Account Section ──────────────────────────────────────── */}
        <KText style={[shared.sectionTitle, styles.sectionSpacing]}>
          {'Account'}
        </KText>

        <KView style={[shared.card, styles.sectionSpacing]}>
          <Button
            title={t('settings.signOut')}
            onPress={handleSignOut}
            buttonStyle={styles.signOutButton}
            titleStyle={styles.signOutTitle}
          />
        </KView>

      </ScrollView>
    </KSafeAreaView>
  )
}

function makeStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useTheme>['typography'],
  spacing: ReturnType<typeof useTheme>['spacing'],
) {
  return StyleSheet.create({
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xl,
    },
    sectionSpacing: {
      marginBottom: spacing.md,
    },
    inputContainer: {
      paddingHorizontal: 0,
    },
    inputLabel: {
      fontSize: typography.fontSizeSM,
      color: colors.textMuted,
      fontWeight: typography.fontWeightMedium,
    },
    inputText: {
      fontSize: typography.fontSizeMD,
      color: colors.text,
    },
    errorText: {
      fontSize: typography.fontSizeSM,
      color: colors.error,
      marginBottom: spacing.sm,
      marginHorizontal: spacing.sm,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: spacing.sm,
      marginHorizontal: spacing.sm,
      marginTop: spacing.xs,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    saveButtonTitle: {
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightBold,
    },
    divider: {
      marginVertical: spacing.md,
    },
    listItemContainer: {
      backgroundColor: 'transparent',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
    },
    listItemTitle: {
      fontSize: typography.fontSizeMD,
      color: colors.text,
    },
    checkboxContainer: {
      backgroundColor: 'transparent',
      margin: 0,
      padding: 0,
    },
    signOutButton: {
      backgroundColor: colors.error,
      borderRadius: 8,
      paddingVertical: spacing.sm,
      marginHorizontal: spacing.sm,
    },
    signOutTitle: {
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightBold,
    },
  })
}
