import React, { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { useSession } from '@/hooks/useSession'
import '@/i18n'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 300_000,
      retry: 2,
    },
  },
})

export default function RootLayout() {
  const { session, loading } = useSession()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (loading) return

    const inAuthGroup = segments[0] === '(auth)'
    const inJoinScreen = segments[0] === 'join'

    if (!session && !inAuthGroup && !inJoinScreen) {
      // Not authenticated and not on auth or join screen → redirect to sign-in
      router.replace('/(auth)/sign-in')
    } else if (session && inAuthGroup) {
      // Authenticated but on auth screen → redirect to app
      router.replace('/(app)')
    }
  }, [session, loading, segments, router])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
