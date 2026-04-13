import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { KView, KText, KTextInput, KSafeAreaView, KScrollView } from '@/components/ui'
import { signUpWithEmail } from '@/lib/auth'
import { useTheme } from '@/theme/ThemeProvider'

export default function SignUpScreen() {
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignUp() {
    setEmailError(null)
    setGeneralError(null)
    setLoading(true)

    const result = await signUpWithEmail(email.trim(), password)

    setLoading(false)

    if (result.error) {
      const code = result.error.code
      if (code === 'invalid_email') {
        setEmailError(t('auth.emailInvalid'))
      } else if (code === 'user_already_exists') {
        setEmailError(t('auth.emailAlreadyExists'))
      } else {
        setGeneralError(result.error.message ?? t('auth.error'))
      }
      return
    }

    // Success — navigate into the app
    router.replace('/(app)')
  }

  const styles = makeStyles(colors, spacing, typography)

  return (
    <KSafeAreaView style={styles.safe}>
      <KScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <KText style={styles.title}>{t('auth.signUp')}</KText>

        {/* Email */}
        <KView style={styles.field}>
          <KText style={styles.label}>{t('auth.email')}</KText>
          <KTextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder={t('auth.email')}
            placeholderTextColor={colors.textMuted}
          />
          {emailError ? <KText style={styles.errorText}>{emailError}</KText> : null}
        </KView>

        {/* Password */}
        <KView style={styles.field}>
          <KText style={styles.label}>{t('auth.password')}</KText>
          <KTextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            placeholder={t('auth.password')}
            placeholderTextColor={colors.textMuted}
          />
        </KView>

        {/* General error */}
        {generalError ? <KText style={styles.errorText}>{generalError}</KText> : null}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={t('auth.signUp')}
        >
          {loading
            ? <ActivityIndicator color={colors.surface} />
            : <KText style={styles.buttonText}>{t('auth.signUp')}</KText>
          }
        </TouchableOpacity>

        {/* Link to sign-in */}
        <KView style={styles.footer}>
          <KText style={styles.footerText}>{t('auth.alreadyHaveAccount')} </KText>
          <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')} accessibilityRole="link">
            <KText style={styles.link}>{t('auth.signIn')}</KText>
          </TouchableOpacity>
        </KView>
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
    container: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
    title: {
      fontSize: typography.fontSizeXL,
      fontWeight: typography.fontWeightBold,
      color: colors.text,
      marginBottom: spacing.xl,
    },
    field: { marginBottom: spacing.md },
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
    button: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginTop: spacing.md,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: {
      color: colors.surface,
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightBold,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.lg,
    },
    footerText: { fontSize: typography.fontSizeSM, color: colors.textMuted },
    link: { fontSize: typography.fontSizeSM, color: colors.primary, fontWeight: typography.fontWeightMedium },
  })
}
