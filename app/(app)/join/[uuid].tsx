import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { KView, KText, KSafeAreaView, KScrollView } from '@/components/ui'
import { resolveInvite, joinKhatmah } from '@/lib/invitation'
import { AlreadyMemberError } from '@/types/khatmah'
import { useSession } from '@/hooks/useSession'
import { useTheme } from '@/theme/ThemeProvider'
import type { Khatmah } from '@/types/khatmah'

type ScreenState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'ready'; khatmah: Khatmah }
  | { status: 'already_member'; khatmah: Khatmah }
  | { status: 'joined'; khatmah: Khatmah }
  | { status: 'error'; message: string }

export default function JoinScreen() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>()
  const { session } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  const theme = useTheme()

  const [state, setState] = useState<ScreenState>({ status: 'loading' })
  const [joining, setJoining] = useState(false)

  // Resolve the invite on mount
  useEffect(() => {
    if (!uuid) {
      setState({ status: 'not_found' })
      return
    }

    resolveInvite(uuid)
      .then((khatmah) => setState({ status: 'ready', khatmah }))
      .catch(() => setState({ status: 'not_found' }))
  }, [uuid])

  async function handleJoin() {
    if (state.status !== 'ready' || !session?.user) return

    setJoining(true)
    try {
      await joinKhatmah(uuid, session.user.id)
      setState({ status: 'joined', khatmah: state.khatmah })
      // Navigate to the Khatmah detail after a brief moment
      setTimeout(() => {
        router.replace(`/(app)/khatmah/${state.khatmah.id}` as never)
      }, 1000)
    } catch (err) {
      if (err instanceof AlreadyMemberError) {
        setState({ status: 'already_member', khatmah: state.khatmah })
      } else {
        setState({ status: 'error', message: t('join.error') })
      }
    } finally {
      setJoining(false)
    }
  }

  const styles = makeStyles(theme)

  if (state.status === 'loading') {
    return (
      <KSafeAreaView style={styles.safe}>
        <KView style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <KText style={styles.loadingText}>{t('join.loading')}</KText>
        </KView>
      </KSafeAreaView>
    )
  }

  if (state.status === 'not_found') {
    return (
      <KSafeAreaView style={styles.safe}>
        <KView style={styles.centered}>
          <KText style={styles.title}>{t('join.notFound')}</KText>
          <KText style={styles.subtitle}>{t('join.notFoundDesc')}</KText>
        </KView>
      </KSafeAreaView>
    )
  }

  if (state.status === 'error') {
    return (
      <KSafeAreaView style={styles.safe}>
        <KView style={styles.centered}>
          <KText style={styles.errorText}>{state.message}</KText>
        </KView>
      </KSafeAreaView>
    )
  }

  const khatmah = state.khatmah

  return (
    <KSafeAreaView style={styles.safe}>
      <KScrollView contentContainerStyle={styles.container}>
        <KView style={styles.card}>
          <KText style={styles.khatmahName}>{khatmah.name}</KText>

          {state.status === 'already_member' && (
            <KView style={styles.messageBanner}>
              <KText style={styles.messageText}>{t('join.alreadyMember')}</KText>
            </KView>
          )}

          {state.status === 'joined' && (
            <KView style={[styles.messageBanner, styles.successBanner]}>
              <KText style={[styles.messageText, styles.successText]}>
                {t('join.joining')}
              </KText>
            </KView>
          )}

          {state.status === 'ready' && (
            <TouchableOpacity
              style={[styles.joinButton, joining && styles.joinButtonDisabled]}
              onPress={handleJoin}
              disabled={joining}
              accessibilityRole="button"
              accessibilityLabel={t('join.joinButton')}
            >
              {joining
                ? <ActivityIndicator color={theme.colors.surface} />
                : <KText style={styles.joinButtonText}>{t('join.joinButton')}</KText>
              }
            </TouchableOpacity>
          )}
        </KView>
      </KScrollView>
    </KSafeAreaView>
  )
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  const { colors, spacing, typography } = theme
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    khatmahName: {
      fontSize: typography.fontSizeXL,
      fontWeight: typography.fontWeightBold,
      color: colors.text,
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: typography.fontSizeMD,
      color: colors.textMuted,
    },
    title: {
      fontSize: typography.fontSizeLG,
      fontWeight: typography.fontWeightBold,
      color: colors.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: typography.fontSizeMD,
      color: colors.textMuted,
      textAlign: 'center',
    },
    messageBanner: {
      backgroundColor: colors.border,
      borderRadius: 8,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    successBanner: { backgroundColor: colors.success + '22' },
    messageText: {
      fontSize: typography.fontSizeMD,
      color: colors.text,
      textAlign: 'center',
    },
    successText: { color: colors.success },
    joinButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    joinButtonDisabled: { opacity: 0.6 },
    joinButtonText: {
      color: colors.surface,
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightBold,
    },
    errorText: {
      fontSize: typography.fontSizeMD,
      color: colors.error,
      textAlign: 'center',
    },
  })
}
