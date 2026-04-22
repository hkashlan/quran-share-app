import React, { useCallback } from 'react'
import { StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { KView, KText, KSafeAreaView } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { useSharedStyles } from '@/hooks/useSharedStyles'
import { useKhatmahList } from '@/hooks/useKhatmahList'
import { useActiveInstance } from '@/hooks/useActiveInstance'
import { useTotalJazah } from '@/hooks/useTotalJazah'
import { useSession } from '@/hooks/useSession'
import { useFinishJuz } from '@/hooks/mutations/useFinishJuz'
import type { Khatmah } from '@/types/khatmah'

// ── Quick Action Card ─────────────────────────────────────────────────────────

interface QuickActionCardProps {
  khatmahId: string
  khatmahName: string
  userId: string
}

function QuickActionCard({ khatmahId, khatmahName, userId }: QuickActionCardProps) {
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const shared = useSharedStyles()
  const { data: instance } = useActiveInstance(khatmahId)
  const finishJuz = useFinishJuz(khatmahId, userId)

  const styles = makeCardStyles(colors, spacing, typography)

  if (instance == null) return null

  // Find all active (non-completed) Juz' assigned to this user
  const activeJuz: number[] = []
  for (let n = 1; n <= 30; n++) {
    const assignee = instance.juzAssignments[n]
    const planb = instance.juzPlanbUsers[n]
    const completed = instance.juzCompleted[n]
    const effectiveUser = planb ?? assignee
    if (effectiveUser === userId && !completed) {
      activeJuz.push(n)
    }
  }

  if (activeJuz.length === 0) return null

  function handleFinish(juzNum: number) {
    finishJuz.mutate({ instanceId: instance!.id, juzNum })
  }

  return (
    <KView style={[shared.card, styles.cardSpacing]}>
      <KText style={styles.khatmahName}>{khatmahName}</KText>
      {activeJuz.map((juzNum) => (
        <KView key={juzNum} style={[shared.row, styles.rowSpaced]}>
          <KText style={styles.juzLabel}>
            {t('khatmah.juz')} {juzNum}
          </KText>
          <TouchableOpacity
            style={[styles.button, finishJuz.isPending && styles.buttonDisabled]}
            onPress={() => handleFinish(juzNum)}
            disabled={finishJuz.isPending}
            accessibilityRole="button"
            accessibilityLabel={`${t('dashboard.quickAction')} ${t('khatmah.juz')} ${juzNum}`}
          >
            {finishJuz.isPending && (finishJuz.variables as { juzNum: number } | undefined)?.juzNum === juzNum
              ? <ActivityIndicator color={colors.surface} size="small" />
              : <KText style={styles.buttonText}>{t('khatmah.complete')}</KText>
            }
          </TouchableOpacity>
        </KView>
      ))}
    </KView>
  )
}

// ── Khatmah List Item ─────────────────────────────────────────────────────────

interface KhatmahItemProps {
  khatmah: Khatmah
  onPress: (id: string) => void
}

function KhatmahItem({ khatmah, onPress }: KhatmahItemProps) {
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const shared = useSharedStyles()
  const styles = makeItemStyles(colors, spacing, typography)

  return (
    <TouchableOpacity
      style={[shared.card, shared.row, styles.itemSpaced]}
      onPress={() => onPress(khatmah.id)}
      accessibilityRole="button"
      accessibilityLabel={khatmah.name}
    >
      <KText style={styles.itemName}>{khatmah.name}</KText>
      <KText style={shared.mutedText}>
        {khatmah.status === 'active' ? t('khatmah.active') : t('khatmah.completed')}
      </KText>
    </TouchableOpacity>
  )
}

// ── Dashboard Screen ──────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const shared = useSharedStyles()
  const router = useRouter()
  const { session, logout } = useSession()
  const userId = session?.user.id ?? ''

  const { data: khatmahs = [], isLoading: khatmahsLoading } = useKhatmahList()
  const { data: totalJazah, isLoading: jazahLoading } = useTotalJazah()

  const styles = makeStyles(colors, spacing, typography)

  const handleKhatmahPress = useCallback((id: string) => {
    router.push(`/(app)/khatmah/${id}`)
  }, [router])

  const handleCreatePress = useCallback(() => {
    router.push('/(app)/khatmah/new')
  }, [router])

  const handleLogout = useCallback(async () => {
    await logout()
  }, [logout])

  const activeKhatmahs = khatmahs.filter((k) => k.status === 'active')

  const renderKhatmah = useCallback(({ item }: { item: Khatmah }) => (
    <KhatmahItem khatmah={item} onPress={handleKhatmahPress} />
  ), [handleKhatmahPress])

  const keyExtractor = useCallback((item: Khatmah) => item.id, [])

  const ListHeader = (
    <KView>
      {/* Stats row */}
      <KView style={styles.statsRow}>
        <KView style={styles.statCard}>
          <KText style={styles.statValue}>
            {jazahLoading || totalJazah == null ? '—' : String(totalJazah)}
          </KText>
          <KText style={styles.statLabel}>{t('dashboard.totalJazah')}</KText>
        </KView>
      </KView>

      {/* Quick Actions */}
      {activeKhatmahs.length > 0 && userId ? (
        <KView style={styles.section}>
          <KText style={shared.sectionTitle}>{t('dashboard.quickAction')}</KText>
          {activeKhatmahs.map((k) => (
            <QuickActionCard
              key={k.id}
              khatmahId={k.id}
              khatmahName={k.name}
              userId={userId}
            />
          ))}
        </KView>
      ) : null}

      {/* Khatmahs section header */}
      <KView style={styles.sectionHeader}>
        <KText style={shared.sectionTitle}>{t('dashboard.myKhatmahs')}</KText>
        <TouchableOpacity
          onPress={handleCreatePress}
          accessibilityRole="button"
          accessibilityLabel={t('khatmah.create')}
        >
          <KText style={styles.createLink}>{t('khatmah.create')}</KText>
        </TouchableOpacity>
      </KView>
    </KView>
  )

  if (khatmahsLoading) {
    return (
      <KSafeAreaView style={shared.screen}>
        <KView style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </KView>
      </KSafeAreaView>
    )
  }

  return (
    <KSafeAreaView style={shared.screen}>
      <KView style={styles.header}>
        <KText style={styles.screenTitle}>{t('dashboard.title')}</KText>
        <TouchableOpacity
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel={t('auth.logout')}
        >
          <KText style={styles.logoutLink}>{t('auth.logout')}</KText>
        </TouchableOpacity>
      </KView>
      <FlatList
        data={khatmahs}
        keyExtractor={keyExtractor}
        renderItem={renderKhatmah}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <KView style={styles.empty}>
            <KText style={shared.mutedText}>{t('dashboard.noKhatmahs')}</KText>
            <TouchableOpacity
              onPress={handleCreatePress}
              accessibilityRole="button"
              accessibilityLabel={t('khatmah.create')}
            >
              <KText style={styles.createLink}>{t('dashboard.createFirst')}</KText>
            </TouchableOpacity>
          </KView>
        }
        contentContainerStyle={styles.listContent}
      />
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
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    screenTitle: {
      fontSize: typography.fontSizeXL,
      fontWeight: typography.fontWeightBold,
      color: colors.text,
    },
    logoutLink: {
      fontSize: typography.fontSizeSM,
      color: colors.error,
      fontWeight: typography.fontWeightMedium,
    },
    listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    statsRow: { flexDirection: 'row', marginBottom: spacing.lg },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValue: {
      fontSize: typography.fontSizeXL,
      fontWeight: typography.fontWeightBold,
      color: colors.primary,
    },
    statLabel: { fontSize: typography.fontSizeSM, color: colors.textMuted, marginTop: spacing.xs },
    section: { marginBottom: spacing.lg },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    createLink: {
      fontSize: typography.fontSizeSM,
      color: colors.primary,
      fontWeight: typography.fontWeightMedium,
    },
    empty: { alignItems: 'center', paddingVertical: spacing.xl },
  })
}

function makeCardStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    // card and row are now from useSharedStyles(); these are card-specific overrides
    cardSpacing: { marginBottom: spacing.sm },
    rowSpaced: { justifyContent: 'space-between', marginTop: spacing.xs },
    khatmahName: {
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightBold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    juzLabel: { fontSize: typography.fontSizeMD, color: colors.text },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 6,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      minWidth: 80,
      alignItems: 'center',
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: {
      color: colors.surface,
      fontSize: typography.fontSizeSM,
      fontWeight: typography.fontWeightMedium,
    },
  })
}

function makeItemStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    // item base (card + row) is now from useSharedStyles(); this adds item-specific overrides
    itemSpaced: { justifyContent: 'space-between', marginBottom: spacing.sm },
    itemName: {
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightMedium,
      color: colors.text,
      flex: 1,
    },
  })
}
