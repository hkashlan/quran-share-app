import React, { useCallback, useState } from 'react'
import { StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { KView, KText, KSafeAreaView } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { useKhatmahList } from '@/hooks/useKhatmahList'
import { useActiveInstance } from '@/hooks/useActiveInstance'
import { useTotalJazah } from '@/hooks/useTotalJazah'
import { useSession } from '@/hooks/useSession'
import { finishJuz } from '@/lib/progress'
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
  const { instance } = useActiveInstance(khatmahId)
  const [finishing, setFinishing] = useState<number | null>(null)

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

  async function handleFinish(juzNum: number) {
    if (finishing != null) return
    setFinishing(juzNum)
    try {
      await finishJuz(instance!.id, juzNum)
    } catch {
      // error is non-critical for the dashboard; user can retry from Juz' detail
    } finally {
      setFinishing(null)
    }
  }

  return (
    <KView style={styles.card}>
      <KText style={styles.khatmahName}>{khatmahName}</KText>
      {activeJuz.map((juzNum) => (
        <KView key={juzNum} style={styles.row}>
          <KText style={styles.juzLabel}>
            {t('khatmah.juz')} {juzNum}
          </KText>
          <TouchableOpacity
            style={[styles.button, finishing === juzNum && styles.buttonDisabled]}
            onPress={() => handleFinish(juzNum)}
            disabled={finishing != null}
            accessibilityRole="button"
            accessibilityLabel={`${t('dashboard.quickAction')} ${t('khatmah.juz')} ${juzNum}`}
          >
            {finishing === juzNum
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
  const styles = makeItemStyles(colors, spacing, typography)

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onPress(khatmah.id)}
      accessibilityRole="button"
      accessibilityLabel={khatmah.name}
    >
      <KText style={styles.itemName}>{khatmah.name}</KText>
      <KText style={styles.itemStatus}>
        {khatmah.status === 'active' ? t('khatmah.active') : t('khatmah.completed')}
      </KText>
    </TouchableOpacity>
  )
}

// ── Dashboard Screen ──────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { t } = useTranslation()
  const { colors, spacing, typography } = useTheme()
  const router = useRouter()
  const { session, logout } = useSession()
  const userId = session?.user.id ?? ''

  const { khatmahs, loading: khatmahsLoading, reconnecting } = useKhatmahList()
  const { totalJazah, loading: jazahLoading } = useTotalJazah()

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
      {/* Reconnecting banner */}
      {reconnecting ? (
        <KView style={styles.reconnectBanner}>
          <KText style={styles.reconnectText}>{t('khatmah.loading')}</KText>
        </KView>
      ) : null}

      {/* Stats row */}
      <KView style={styles.statsRow}>
        <KView style={styles.statCard}>
          <KText style={styles.statValue}>
            {jazahLoading ? '—' : String(totalJazah)}
          </KText>
          <KText style={styles.statLabel}>{t('dashboard.totalJazah')}</KText>
        </KView>
      </KView>

      {/* Quick Actions */}
      {activeKhatmahs.length > 0 && userId ? (
        <KView style={styles.section}>
          <KText style={styles.sectionTitle}>{t('dashboard.quickAction')}</KText>
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
        <KText style={styles.sectionTitle}>{t('dashboard.myKhatmahs')}</KText>
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
      <KSafeAreaView style={styles.safe}>
        <KView style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </KView>
      </KSafeAreaView>
    )
  }

  return (
    <KSafeAreaView style={styles.safe}>
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
            <KText style={styles.emptyText}>{t('dashboard.noKhatmahs')}</KText>
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
    safe: { flex: 1, backgroundColor: colors.background },
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
    reconnectBanner: {
      backgroundColor: colors.border,
      padding: spacing.sm,
      borderRadius: 6,
      marginBottom: spacing.sm,
      alignItems: 'center',
    },
    reconnectText: { fontSize: typography.fontSizeSM, color: colors.textMuted },
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
    sectionTitle: {
      fontSize: typography.fontSizeLG,
      fontWeight: typography.fontWeightBold,
      color: colors.text,
    },
    createLink: {
      fontSize: typography.fontSizeSM,
      color: colors.primary,
      fontWeight: typography.fontWeightMedium,
    },
    empty: { alignItems: 'center', paddingVertical: spacing.xl },
    emptyText: { fontSize: typography.fontSizeMD, color: colors.textMuted, marginBottom: spacing.sm },
  })
}

function makeCardStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    khatmahName: {
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightBold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
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
    item: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    itemName: {
      fontSize: typography.fontSizeMD,
      fontWeight: typography.fontWeightMedium,
      color: colors.text,
      flex: 1,
    },
    itemStatus: {
      fontSize: typography.fontSizeSM,
      color: colors.textMuted,
    },
  })
}
