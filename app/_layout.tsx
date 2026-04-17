import React from 'react'
import { Stack } from 'expo-router'
import { ThemeProvider } from '@/theme/ThemeProvider'
import '@/i18n'

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  )
}
