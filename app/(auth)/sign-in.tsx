import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { KView, KText, KTextInput, KSafeAreaView, KScrollView } from '@/components/ui'
import { signInWithEmail, signInWithOAuth } from '@/lib/auth'
import { useTheme } from '@/theme/ThemeProvider'

export default function SignInScreen() {
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null)

  async function handleSignIn() {
    setEmailError(null)
    setGeneralError(null)
    setLoading(true)

    const result = await signInWithEmail(email.trim(), password)

    setLoading(false)

    if (result.error) {
      const code = result.error.code
      if (code === 'invalid_email') {
        setEmailError(t('auth.emailInvalid'))
      } else {
        setGeneralError(result.error.message ?? t('auth.error'))
      }
      return
    }

    router.replace('/(app)')
  }

  async function handleOAuth(provider: 'google' | 'apple') {
    setGeneralError(null)
    setOauthLoading(provider)

    const result = await signInWithOAuth(provider)

    setOauthLoading(null)

    if (result.error) {
      setGeneralError(result.error.message ?? t('auth.error'))
    }
    // OAuth flow redirects externally; no navigation needed here
  }

  const styles = makeStyles(colors, spacing, typography)

  return (
    <KSafeAreaView style={styles.safe}>
      <KScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <KText style={styles.title}>{t('auth.signIn')}</KText>

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
            autoComplete="current-password"
            placeholder={t('auth.password')}
            placeholderTextColor={colors.textMuted}
          />
        </KView>

        {/* General error */}
        {generalError ? <KText style={styles.errorText}>{generalError}</KText> : null}

        {/* Sign-in button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading || oauthLoading !== null}
          accessibilityRole="button"
          accessibilityLabel={t('auth.signIn')}
        >
          {loading
            ? <ActivityIndicator color={colors.surface} />
            : <KText style={styles.buttonText}>{t('auth.signIn')}</KText>
          }
        </TouchableOpacity>

        {/* Divider */}
        <KView style={styles.dividerRow}>
          <KView style={styles.dividerLine} />
          <KText style={styles.dividerText}>{'—'}</KText>
          <KView style={styles.dividerLine} />
        </KView>

        {/* Google OAuth */}
        <TouchableOpacity
          style={[styles.oauthButton, oauthLoading === 'google' && styles.buttonDisabled]}
          onPress={() => handleOAuth('google')}
          disabled={loading || oauthLoading !== null}
          accessibilityRole="button"
          accessibilityLabel={t('auth.signInWithGoogle')}
        >
          {oauthLoading === 'google'
            ? <ActivityIndicator color={colors.text} />
            : <KText style={styles.oauthButtonText}>{t('auth.signInWithGoogle')}</KText>
          }
        </TouchableOpacity>

        {/* Apple OAuth */}
        <TouchableOpacity
          style={[styles.oauthButton, styles.appleButton, oauthLoading === 'apple' && styles.buttonDisabled]}
          onPress={() => handleOAuth('apple')}
          disabled={loading || oauthLoading !== null}
          accessibilityRole="button"
          accessibilityLabel={t('auth.signInWithApple')}
        >
          {oauthLoading === 'apple'
            ? <ActivityIndicator color={colors.surface} />
            : <KText style={[styles.oauthButtonText, styles.appleButtonText]}>{t('auth.signInWithApple')}</KText>
          }
        </TouchableOpacity>

        {/* Link to sign-up */}
        <KView style={styles.footer}>
          <KText style={styles.footerText}>{t('auth.noAccount')} </KText>
          <TouchableOpacity onPress={() => router.replace('/(auth)/sign-up')} accessibilityRole="link">
            <KText style={styles.link}>{t('auth.signUp')}</KText>
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
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.md,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerText: { marginHorizontal: spacing.sm, color: colors.textMuted },
    oauthButton: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginBottom: spacing.sm,
      backgroundColor: colors.surface,
    },
    oauthButtonText: {
      fontSize: typography.fontSizeMD,
      color: colors.text,
      fontWeight: typography.fontWeightMedium,
    },
    appleButton: { backgroundColor: '#000' },
    appleButtonText: { color: '#fff' },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.lg,
    },
    footerText: { fontSize: typography.fontSizeSM, color: colors.textMuted },
    link: { fontSize: typography.fontSizeSM, color: colors.primary, fontWeight: typography.fontWeightMedium },
  })
}
