import { useCallback, useEffect, useRef, useState } from 'react'
import type { KhatmahInstance } from '@/types/khatmah'
import * as Khatmah_Service from '@/lib/khatmah'
import { supabase } from '@/lib/supabase'

const BACKOFF_BASE_MS = 1000
const BACKOFF_MAX_MS = 30000

export interface UseActiveInstanceResult {
  instance: KhatmahInstance | null
  loading: boolean
  error: Error | null
  reconnecting: boolean
  refresh: () => void
}

/**
 * Fetches and subscribes to the active khatmah_instance for a given khatmah ID.
 * This is the primary real-time channel for Juz' completion propagation.
 * Implements exponential backoff reconnect on subscription failure.
 * Requirements: 10.6
 */
export function useActiveInstance(khatmahId: string): UseActiveInstanceResult {
  const [instance, setInstance] = useState<KhatmahInstance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [reconnecting, setReconnecting] = useState(false)

  const retryCountRef = useRef(0)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const instanceIdRef = useRef<string | null>(null)
  // Keep a ref to khatmahId so refresh() always uses the latest value
  const khatmahIdRef = useRef(khatmahId)
  useEffect(() => { khatmahIdRef.current = khatmahId }, [khatmahId])

  const refresh = useCallback((): void => {
    const kid = khatmahIdRef.current
    if (!kid) return
    Khatmah_Service.getActiveInstance(kid).then((data) => {
      setInstance(data)
      instanceIdRef.current = data.id
    }).catch(() => { /* ignore */ })
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (khatmahId == null || khatmahId === '') {
      setLoading(false)
      return
    }

    async function fetchAndSubscribe(): Promise<void> {
      // Remove any existing channel before creating a new one
      if (channelRef.current != null) {
        await supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }

      try {
        const data = await Khatmah_Service.getActiveInstance(khatmahId)
        if (!mountedRef.current) return
        setInstance(data)
        setLoading(false)
        setError(null)
        setReconnecting(false)
        retryCountRef.current = 0
        instanceIdRef.current = data.id
      } catch (err) {
        if (!mountedRef.current) return
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
        scheduleRetry()
        return
      }

      const activeInstanceId = instanceIdRef.current
      if (activeInstanceId == null) return

      // Subscribe to this specific khatmah_instances row — scoped to the active instance ID.
      // This is the real-time channel for Juz' completion propagation (Requirement 10.6).
      // Use a unique channel name with a timestamp to avoid reusing old subscriptions
      const channelName = `khatmah-instance-${activeInstanceId}-${Date.now()}`
      channelRef.current = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'khatmah_instances',
            filter: `id=eq.${activeInstanceId}`,
          },
          () => {
            if (!mountedRef.current) return
            // Re-fetch the full mapped domain object on any update
            Khatmah_Service.getActiveInstance(khatmahIdRef.current).then((data) => {
              if (mountedRef.current) {
                setInstance(data)
                instanceIdRef.current = data.id
              }
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
      if (channelRef.current != null) {
        void supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [khatmahId])

  return { instance, loading, error, reconnecting, refresh }
}
