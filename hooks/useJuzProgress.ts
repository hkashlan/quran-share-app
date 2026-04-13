import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import * as Khatmah_Service from '@/lib/khatmah'

export interface UseJuzProgressResult {
  currentPage: number
  loading: boolean
  error: Error | null
}

/**
 * Reads juz_N_current_page from the active instance and updates reactively
 * via a real-time subscription on the khatmah_instances row.
 * Requirements: 7.1
 */
export function useJuzProgress(instanceId: string, n: number): UseJuzProgressResult {
  const [currentPage, setCurrentPage] = useState(0)
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
    if (instanceId == null || instanceId === '' || n < 1 || n > 30) {
      setLoading(false)
      return
    }

    let channel: ReturnType<typeof supabase.channel> | null = null

    async function fetchAndSubscribe(): Promise<void> {
      try {
        const instance = await Khatmah_Service.getInstance(instanceId)
        if (!mountedRef.current) return
        setCurrentPage(instance.juzCurrentPage[n] ?? 0)
        setLoading(false)
        setError(null)
      } catch (err) {
        if (!mountedRef.current) return
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
        return
      }

      // Subscribe to updates on this instance row to get reactive page updates
      channel = supabase
        .channel(`juz-progress-${instanceId}-${n}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'khatmah_instances',
            filter: `id=eq.${instanceId}`,
          },
          () => {
            if (!mountedRef.current) return
            Khatmah_Service.getInstance(instanceId).then((data) => {
              if (mountedRef.current) {
                setCurrentPage(data.juzCurrentPage[n] ?? 0)
              }
            }).catch(() => {
              // ignore refresh errors; stale data remains visible
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
  }, [instanceId, n])

  return { currentPage, loading, error }
}
