import React, { useEffect } from 'react'
import { I18nManager } from 'react-native'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useSession } from '@/hooks/useSession'
import { useTheme } from '@/theme/ThemeProvider'
import { supabase } from '@/lib/supabase'
import i18n from '@/i18n'
import { isRTLLanguage } from '@/i18n/rtl'
import type { SupportedLocale } from '@/types/khatmah'

export default function AppLayout() {
  const { session } = useSession()
  const { t } = useTranslation()
  const { colors } = useTheme()

  // Apply locale from user profile once session is available
  useEffect(() => {
    if (!session?.user) return

    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (!data) return
        const language = (data as { language: string }).language as SupportedLocale
        applyLocale(language)
      })
  }, [session?.user?.id])

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('nav.settings'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Nested khatmah screens — hidden from tab bar, tab bar stays visible */}
      <Tabs.Screen name="khatmah/new" options={{ href: null }} />
      <Tabs.Screen name="khatmah/[id]/index" options={{ href: null }} />
      <Tabs.Screen name="khatmah/[id]/settings" options={{ href: null }} />
      <Tabs.Screen name="khatmah/[id]/juz/[num]" options={{ href: null }} />
    </Tabs>
  )
}

async function applyLocale(language: string) {
  await i18n.changeLanguage(language)
  const rtl = isRTLLanguage(language)
  if (I18nManager.isRTL !== rtl) {
    I18nManager.forceRTL(rtl)
    // Note: a full app reload is required for native RTL changes to take effect.
    // This is handled at the OS level; Expo will reload on next launch.
  }
}
