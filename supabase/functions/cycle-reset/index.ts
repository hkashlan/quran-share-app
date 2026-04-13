/**
 * Supabase Edge Function: cycle-reset
 * Scheduled task that finds all Recurring Khatmahs whose reset date has passed,
 * triggers a cycle reset, re-assigns Juz' (auto-renewal), and dispatches push notifications.
 *
 * Requirements: 3.4, 3.5, 9.1, 9.2, 9.3
 *
 * Deploy: supabase functions deploy cycle-reset
 * Schedule via pg_cron or Supabase Dashboard cron (run daily at 00:05 UTC).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Khatmah {
  id: string
  name: string
  creator_id: string
  lifecycle_type: string
  reset_calendar: string | null
  auto_renewal: boolean
  assignment_mode: string
}

interface KhatmahInstance {
  id: string
  khatmah_id: string
  cycle_number: number
  status: string
  [key: string]: unknown
}

interface PushToken {
  user_id: string
  token: string
}

interface NotificationPayload {
  to: string
  title: string
  body: string
  data: Record<string, unknown>
  sound: string
}

// ── Hijri calendar helpers ────────────────────────────────────────────────────

/**
 * Convert a Gregorian date to a Hijri date using the Kuwaiti algorithm.
 * Returns { year, month, day } in the Islamic (Hijri) calendar.
 * Falls back gracefully — if calculation fails, caller catches and uses Gregorian.
 *
 * Algorithm reference: https://www.islamicfinder.org/islamic-date-converter/
 */
function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
  const day   = date.getUTCDate()
  const month = date.getUTCMonth() + 1
  const year  = date.getUTCFullYear()

  // Julian Day Number
  const jd =
    Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4) +
    Math.floor((367 * (month - 2 - 12 * Math.floor((month - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100)) / 4) +
    day -
    32075

  // Hijri conversion
  let l = jd - 1948440 + 10632
  const n = Math.floor((l - 1) / 10631)
  l = l - 10631 * n + 354
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238)
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29
  const hijriMonth = Math.floor((24 * l) / 709)
  const hijriDay   = l - Math.floor((709 * hijriMonth) / 24)
  const hijriYear  = 30 * n + j - 30

  return { year: hijriYear, month: hijriMonth, day: hijriDay }
}

/**
 * Returns true if today is the 1st day of the current Hijri month.
 * Falls back to false on any calculation error.
 */
function isFirstDayOfHijriMonth(now: Date): boolean {
  try {
    const hijri = gregorianToHijri(now)
    return hijri.day === 1
  } catch {
    console.error('[cycle-reset] Hijri calculation failed, falling back to Gregorian')
    return false
  }
}

/**
 * Returns true if today is the 1st day of the current Gregorian month.
 */
function isFirstDayOfGregorianMonth(now: Date): boolean {
  return now.getUTCDate() === 1
}

// ── Push notification dispatch ────────────────────────────────────────────────

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

async function sendExpoPushNotifications(messages: NotificationPayload[]): Promise<void> {
  if (messages.length === 0) return

  const BATCH_SIZE = 100
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE)
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      })
      if (!res.ok) {
        console.warn(`[cycle-reset] Expo push API returned ${res.status}`)
      }
    } catch (err) {
      console.warn('[cycle-reset] Failed to send push batch:', err)
    }
  }
}

// ── Cycle reset logic ─────────────────────────────────────────────────────────

/**
 * Build the reset fields for a new khatmah_instances row.
 * All completion/progress fields are cleared; assignments optionally copied from previous instance.
 */
function buildResetFields(
  prevInstance: KhatmahInstance | null,
  autoRenewal: boolean,
): Record<string, unknown> {
  const fields: Record<string, unknown> = {}

  for (let i = 1; i <= 30; i++) {
    // Always clear progress and completion state (Requirement 9.1)
    fields[`juz_${i}_completed`]            = false
    fields[`juz_${i}_current_page`]         = 0
    fields[`juz_${i}_help_requested`]       = false
    fields[`juz_${i}_planb_user_id`]        = null
    fields[`juz_${i}_planb_user_full_name`] = null

    // Copy assignments from previous cycle if auto-renewal is enabled (Requirement 9.2)
    if (autoRenewal && prevInstance !== null) {
      fields[`juz_${i}_user_id`]        = prevInstance[`juz_${i}_user_id`] ?? null
      fields[`juz_${i}_user_full_name`] = prevInstance[`juz_${i}_user_full_name`] ?? null
    } else {
      fields[`juz_${i}_user_id`]        = null
      fields[`juz_${i}_user_full_name`] = null
    }
  }

  return fields
}

/**
 * Build a userId → juzNum assignment map from a khatmah_instances row.
 * Used to send per-participant cycle reset notifications.
 */
function buildAssignmentMap(instance: KhatmahInstance): Record<string, number> {
  const map: Record<string, number> = {}
  for (let i = 1; i <= 30; i++) {
    const userId = instance[`juz_${i}_user_id`]
    if (typeof userId === 'string' && userId.length > 0) {
      map[userId] = i
    }
  }
  return map
}

/**
 * Process a single Khatmah: close the current instance, create a new one,
 * and dispatch per-participant push notifications.
 */
async function processCycleReset(
  supabase: ReturnType<typeof createClient>,
  khatmah: Khatmah,
): Promise<void> {
  console.log(`[cycle-reset] Processing khatmah ${khatmah.id} (${khatmah.name})`)

  // 1. Fetch the current active instance
  const { data: activeInstances, error: fetchError } = await supabase
    .from('khatmah_instances')
    .select('*')
    .eq('khatmah_id', khatmah.id)
    .eq('status', 'active')
    .order('cycle_number', { ascending: false })
    .limit(1)

  if (fetchError != null || !activeInstances || activeInstances.length === 0) {
    console.warn(`[cycle-reset] No active instance for khatmah ${khatmah.id}:`, fetchError?.message)
    return
  }

  const currentInstance = activeInstances[0] as KhatmahInstance

  // 2. Mark current instance as completed
  const { error: closeError } = await supabase
    .from('khatmah_instances')
    .update({ status: 'completed', ended_at: new Date().toISOString() })
    .eq('id', currentInstance.id)

  if (closeError != null) {
    console.error(`[cycle-reset] Failed to close instance ${currentInstance.id}:`, closeError.message)
    return
  }

  // 3. Build reset fields (with optional auto-renewal assignment copy)
  const resetFields = buildResetFields(currentInstance, khatmah.auto_renewal)

  // 4. Insert new instance
  const { data: newInstanceData, error: insertError } = await supabase
    .from('khatmah_instances')
    .insert({
      khatmah_id: khatmah.id,
      cycle_number: currentInstance.cycle_number + 1,
      ...resetFields,
    })
    .select()
    .single()

  if (insertError != null || newInstanceData === null) {
    console.error(`[cycle-reset] Failed to create new instance for khatmah ${khatmah.id}:`, insertError?.message)
    return
  }

  const newInstance = newInstanceData as KhatmahInstance
  console.log(`[cycle-reset] Created new instance ${newInstance.id} (cycle ${newInstance.cycle_number})`)

  // 5. Dispatch per-participant push notifications (Requirement 9.3)
  if (khatmah.auto_renewal) {
    const assignments = buildAssignmentMap(newInstance)
    const userIds = Object.keys(assignments)

    if (userIds.length > 0) {
      // Fetch push tokens for all assigned participants
      const { data: tokenRows, error: tokenError } = await supabase
        .from('push_tokens')
        .select('user_id, token')
        .in('user_id', userIds)

      if (tokenError != null) {
        console.warn('[cycle-reset] Failed to fetch push tokens:', tokenError.message)
        return
      }

      const messages: NotificationPayload[] = (tokenRows as PushToken[]).map((row) => {
        const juzNum = assignments[row.user_id] ?? 0
        return {
          to: row.token,
          title: 'New Cycle Started 🌙',
          body: `A new cycle has begun. Your assignment: Juz' ${juzNum}`,
          data: { khatmahId: khatmah.id, juzNum, type: 'cycle_reset' },
          sound: 'default',
        }
      })

      await sendExpoPushNotifications(messages)
      console.log(`[cycle-reset] Sent ${messages.length} cycle-reset notifications for khatmah ${khatmah.id}`)
    }
  } else {
    // No auto-renewal: notify all participants that a new cycle started (no assignment info)
    const { data: participants, error: partError } = await supabase
      .from('khatmah_participants')
      .select('user_id')
      .eq('khatmah_id', khatmah.id)

    if (partError != null) {
      console.warn('[cycle-reset] Failed to fetch participants:', partError.message)
      return
    }

    const participantIds = (participants as { user_id: string }[]).map((p) => p.user_id)

    if (participantIds.length > 0) {
      const { data: tokenRows, error: tokenError } = await supabase
        .from('push_tokens')
        .select('user_id, token')
        .in('user_id', participantIds)

      if (tokenError != null) {
        console.warn('[cycle-reset] Failed to fetch push tokens:', tokenError.message)
        return
      }

      const messages: NotificationPayload[] = (tokenRows as PushToken[]).map((row) => ({
        to: row.token,
        title: 'New Cycle Started 🌙',
        body: 'A new Khatmah cycle has begun. Check your assignments.',
        data: { khatmahId: khatmah.id, type: 'cycle_reset' },
        sound: 'default',
      }))

      await sendExpoPushNotifications(messages)
    }
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (_req: Request) => {
  const supabaseUrl  = Deno.env.get('SUPABASE_URL')!
  const serviceKey   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // Use service role key so Edge Function bypasses RLS
  const supabase = createClient(supabaseUrl, serviceKey)

  const now = new Date()
  console.log(`[cycle-reset] Running at ${now.toISOString()}`)

  // Determine which calendar types are due for reset today
  const gregorianDue = isFirstDayOfGregorianMonth(now)
  const hijriDue     = isFirstDayOfHijriMonth(now)

  if (!gregorianDue && !hijriDue) {
    console.log('[cycle-reset] No resets due today.')
    return new Response(JSON.stringify({ message: 'No resets due today.' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Build the calendar filter: include khatmahs whose reset_calendar is due today
  const calendarFilter: string[] = []
  if (gregorianDue) calendarFilter.push('gregorian')
  if (hijriDue)     calendarFilter.push('islamic')

  // Fetch all active Recurring Khatmahs with a due reset calendar
  const { data: khatmahs, error: fetchError } = await supabase
    .from('khatmahs')
    .select('id, name, creator_id, lifecycle_type, reset_calendar, auto_renewal, assignment_mode')
    .eq('lifecycle_type', 'recurring')
    .eq('status', 'active')
    .in('reset_calendar', calendarFilter)

  if (fetchError != null) {
    console.error('[cycle-reset] Failed to fetch khatmahs:', fetchError.message)
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const khatmahList = (khatmahs ?? []) as Khatmah[]
  console.log(`[cycle-reset] Found ${khatmahList.length} khatmah(s) to reset.`)

  const results: { id: string; status: string; error?: string }[] = []

  for (const khatmah of khatmahList) {
    try {
      await processCycleReset(supabase, khatmah)
      results.push({ id: khatmah.id, status: 'reset' })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[cycle-reset] Error processing khatmah ${khatmah.id}:`, message)
      results.push({ id: khatmah.id, status: 'error', error: message })
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
