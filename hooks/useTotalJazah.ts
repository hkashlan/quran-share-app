import { useEffect, useRef, useState } from 'react'
import { getTotalJazah } from '@/lib/reward'
import { supabase } from '@/lib/supabase'
import { useSession } from '@/hooks/useSession'

export interface UseTotalJazahResult {
  totalJazah: number
  loading: boolean
  error: Error | null
}

/**
 * Fetches the current user's lifetime Jazah total and keeps it reactive
 * via a real-time subscription on the profiles row.
 * Requirements: 4.5, 2.5
 */
export function useTotalJazah(): UseTotalJazahResult {
  const { session } = useSession()
  const userId = session?.user.id ?? null

  const [totalJazah, setTotalJazah] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (userId == null) {
      setLoading(false)
      return
    }

    let channel: ReturnType<typeof supabase.channel> | null = null

    async function fetchAndSubscribe(): Promise<void> {
      try {
        const total = await getTotalJazah(userId!)
        if (!mountedRef.current) return
        setTotalJazah(total)
        setLoading(false)
        setError(null)
      } catch (err) {
        if (!mountedRef.current) return
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
        return
      }

      // Subscribe to profile row changes to keep jazah_total reactive
      channel = supabase
        .channel(`profile-jazah-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${userId}`,
          },
          () => {
            if (!mountedRef.current) return
            getTotalJazah(userId!).then((total) => {
              if (mountedRef.current) setTotalJazah(total)
            }).catch(() => {
              // ignore refresh errors; stale value remains visible
            })
          },
        )
        .subscribe()
    }

    void fetchAndSubscribe()

    return () => {
      if (channel != null) {
        void supabase.removeChannel(channel)
      }
    }
  }, [userId])

  return { totalJazah, loading, error }
}
