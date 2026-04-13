import { useEffect, useRef, useState } from 'react'
import type { Khatmah } from '@/types/khatmah'
import * as Khatmah_Service from '@/lib/khatmah'
import { supabase } from '@/lib/supabase'

const BACKOFF_BASE_MS = 1000
const BACKOFF_MAX_MS = 30000

export interface UseKhatmahResult {
  khatmah: Khatmah | null
  loading: boolean
  error: Error | null
  reconnecting: boolean
}

export function useKhatmah(id: string): UseKhatmahResult {
  const [khatmah, setKhatmah] = useState<Khatmah | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [reconnecting, setReconnecting] = useState(false)

  const retryCountRef = useRef(0)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (id == null || id === '') {
      setLoading(false)
      return
    }

    let channel: ReturnType<typeof supabase.channel> | null = null

    async function fetchAndSubscribe(): Promise<void> {
      try {
        const data = await Khatmah_Service.getById(id)
        if (!mountedRef.current) return
        setKhatmah(data)
        setLoading(false)
        setError(null)
        setReconnecting(false)
        retryCountRef.current = 0
      } catch (err) {
        if (!mountedRef.current) return
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
        scheduleRetry()
        return
      }

      // Subscribe to this specific khatmah row changes
      channel = supabase
        .channel(`khatmah-${id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'khatmahs',
            filter: `id=eq.${id}`,
          },
          (payload) => {
            if (!mountedRef.current) return
            if (payload.eventType === 'DELETE') {
              setKhatmah(null)
              return
            }
            // Re-fetch to get the fully mapped domain object
            Khatmah_Service.getById(id).then((data) => {
              if (mountedRef.current) setKhatmah(data)
            }).catch(() => {
              // ignore refresh errors; stale data remains visible
            })
          },
        )
        .subscribe((status) => {
          if (!mountedRef.current) return
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setReconnecting(true)
            scheduleRetry()
          } else if (status === 'SUBSCRIBED') {
            setReconnecting(false)
            retryCountRef.current = 0
          }
        })
    }

    function scheduleRetry(): void {
      if (retryTimerRef.current != null) return
      const delay = Math.min(
        BACKOFF_BASE_MS * Math.pow(2, retryCountRef.current),
        BACKOFF_MAX_MS,
      )
      retryCountRef.current += 1
      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null
        if (mountedRef.current) {
          void fetchAndSubscribe()
        }
      }, delay)
    }

    void fetchAndSubscribe()

    return () => {
      if (retryTimerRef.current != null) {
        clearTimeout(retryTimerRef.current)
        retryTimerRef.current = null
      }
      if (channel != null) {
        void supabase.removeChannel(channel)
      }
    }
  }, [id])

  return { khatmah, loading, error, reconnecting }
}
