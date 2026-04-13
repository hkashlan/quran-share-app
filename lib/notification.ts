/**
 * Notification_Service — handles device push token registration, in-app notifications,
 * and dispatching push notifications via Expo's push API.
 * Requirements: 7.6, 8.2, 9.3
 */
import { supabase } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NotificationPayload {
  title: string
  body: string
  data?: Record<string, unknown>
}

// ── Push token registration ───────────────────────────────────────────────────

/**
 * Register an Expo push token for the current user in the `push_tokens` table.
 * Called on login after obtaining the token from expo-notifications.
 * Uses upsert to avoid duplicates (unique constraint on user_id + token).
 * Requirements: 7.6, 8.2, 9.3
 */
export async function registerPushToken(userId: string, token: string): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .upsert({ user_id: userId, token }, { onConflict: 'user_id,token' })

  if (error != null) {
    // Non-fatal: log and continue — push notifications are best-effort
    console.warn('[Notification_Service] Failed to register push token:', error.message)
  }
}

/**
 * Remove a push token for the current user (e.g., on sign-out).
 */
export async function unregisterPushToken(userId: string, token: string): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('user_id', userId)
    .eq('token', token)

  if (error != null) {
    console.warn('[Notification_Service] Failed to unregister push token:', error.message)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Fetch all push tokens for a list of user IDs.
 * Returns a flat array of Expo push token strings.
 */
async function fetchTokensForUsers(userIds: string[]): Promise<string[]> {
  if (userIds.length === 0) return []

  const { data, error } = await supabase
    .from('push_tokens')
    .select('token')
    .in('user_id', userIds)

  if (error != null) {
    console.warn('[Notification_Service] Failed to fetch push tokens:', error.message)
    return []
  }

  return data.map((row) => row.token)
}

/**
 * Fetch all participant user IDs for a given Khatmah.
 */
async function fetchParticipantIds(khatmahId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('khatmah_participants')
    .select('user_id')
    .eq('khatmah_id', khatmahId)

  if (error != null) {
    console.warn('[Notification_Service] Failed to fetch participants:', error.message)
    return []
  }

  return data.map((row) => row.user_id)
}

/**
 * Fetch the creator_id for a given Khatmah.
 */
async function fetchCreatorId(khatmahId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('khatmahs')
    .select('creator_id')
    .eq('id', khatmahId)
    .single()

  if (error != null) {
    console.warn('[Notification_Service] Failed to fetch creator:', error.message)
    return null
  }

  return data.creator_id
}

/**
 * Send push notifications to a list of Expo push tokens via Expo's push API.
 * Batches up to 100 tokens per request (Expo limit).
 * Non-fatal: logs errors but does not throw.
 */
async function sendExpoPushNotifications(
  tokens: string[],
  payload: NotificationPayload,
): Promise<void> {
  if (tokens.length === 0) return

  const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
  const BATCH_SIZE = 100

  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const batch = tokens.slice(i, i + BATCH_SIZE)
    const messages = batch.map((to) => ({
      to,
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
      sound: 'default',
    }))

    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      })

      if (!response.ok) {
        console.warn(
          `[Notification_Service] Expo push API returned ${response.status}`,
        )
      }
    } catch (err) {
      console.warn('[Notification_Service] Failed to send push notifications:', err)
    }
  }
}

// ── Notification functions ────────────────────────────────────────────────────

/**
 * Notify all participants in a Khatmah that a Juz' has been completed.
 * Sends both an in-app log and a push notification to all participants.
 * Requirements: 7.6
 */
export async function notifyJuzCompleted(
  khatmahId: string,
  participantName: string,
  juzNum: number,
): Promise<void> {
  const participantIds = await fetchParticipantIds(khatmahId)
  const tokens = await fetchTokensForUsers(participantIds)

  const payload: NotificationPayload = {
    title: 'Juz\' Completed 🎉',
    body: `${participantName} completed Juz' ${juzNum}`,
    data: { khatmahId, juzNum, type: 'juz_completed' },
  }

  console.log(
    `[Notification_Service] notifyJuzCompleted: khatmahId=${khatmahId}, ` +
    `participant=${participantName}, juz=${juzNum}, recipients=${participantIds.length}`,
  )

  await sendExpoPushNotifications(tokens, payload)
}

/**
 * Notify the Khatmah Creator that a participant has requested help with a Juz'.
 * Requirements: 8.2
 */
export async function notifyHelpRequested(
  khatmahId: string,
  participantName: string,
  juzNum: number,
): Promise<void> {
  const creatorId = await fetchCreatorId(khatmahId)
  if (creatorId === null) return

  const tokens = await fetchTokensForUsers([creatorId])

  const payload: NotificationPayload = {
    title: 'Help Requested',
    body: `${participantName} needs help with Juz' ${juzNum}`,
    data: { khatmahId, juzNum, type: 'help_requested' },
  }

  console.log(
    `[Notification_Service] notifyHelpRequested: khatmahId=${khatmahId}, ` +
    `participant=${participantName}, juz=${juzNum}, creatorId=${creatorId}`,
  )

  await sendExpoPushNotifications(tokens, payload)
}

/**
 * Notify each participant of their new Juz' assignment after a cycle reset.
 * Sends a per-participant push notification with their specific new assignment.
 * Requirements: 9.3
 *
 * @param khatmahId - The Khatmah ID
 * @param assignments - Map of userId → juzNum for the new cycle
 */
export async function notifyCycleReset(
  khatmahId: string,
  assignments: Record<string, number>,
): Promise<void> {
  const userIds = Object.keys(assignments)
  if (userIds.length === 0) return

  console.log(
    `[Notification_Service] notifyCycleReset: khatmahId=${khatmahId}, ` +
    `participants=${userIds.length}`,
  )

  // Fetch tokens per user individually to send personalized messages
  for (const userId of userIds) {
    const juzNum = assignments[userId]
    if (juzNum === undefined) continue

    const tokens = await fetchTokensForUsers([userId])
    if (tokens.length === 0) continue

    const payload: NotificationPayload = {
      title: 'New Cycle Started 🌙',
      body: `A new cycle has begun. Your assignment: Juz' ${juzNum}`,
      data: { khatmahId, juzNum, type: 'cycle_reset' },
    }

    await sendExpoPushNotifications(tokens, payload)
  }
}
