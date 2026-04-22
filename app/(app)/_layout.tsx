import React, { useEffect } from 'react'
import { I18nManager } from 'react-native'
import { Stack } from 'expo-router'
import { useSession } from '@/hooks/useSession'
import { supabase } from '@/lib/supabase'
import i18n from '@/i18n'
import { isRTLLanguage } from '@/i18n/rtl'
import type { SupportedLocale } from '@/types/khatmah'

export default function AppLayout() {
  const { session } = useSession()

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

  return <Stack />
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
