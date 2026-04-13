/**
 * Progress_Service — tracks per-participant reading progress within a Juz'.
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
import { supabase } from '@/lib/supabase'
import { JUZ_PAGE_RANGES } from '@/lib/juzPages'
import { awardJazah } from '@/lib/reward'
import { notifyJuzCompleted } from '@/lib/notification'

// ── Custom error ──────────────────────────────────────────────────────────────

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the column name for the current page of a given Juz' number. */
function currentPageCol(juzNum: number): string {
  return `juz_${juzNum}_current_page`
}

/** Returns the column name for the completed flag of a given Juz' number. */
function completedCol(juzNum: number): string {
  return `juz_${juzNum}_completed`
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * Returns the current saved page number for the given Juz' in the instance.
 * Requirements: 7.1
 */
export async function getProgress(
  instanceId: string,
  juzNum: number,
): Promise<number> {
  const col = currentPageCol(juzNum)

  const { data, error } = await supabase
    .from('khatmah_instances')
    .select(col)
    .eq('id', instanceId)
    .single()

  if (error != null) {
    throw new Error(`Failed to fetch progress: ${error.message}`)
  }

  // noUncheckedIndexedAccess-safe: cast via unknown then access with fallback
  const row = data as Record<string, unknown>
  const page = row[col]
  return typeof page === 'number' ? page : 0
}

/**
 * Validates the page number against JUZ_PAGE_RANGES and updates juz_X_current_page.
 * Throws ValidationError without updating if the page is out of range.
 * Requirements: 7.2, 7.4
 */
export async function updatePage(
  instanceId: string,
  juzNum: number,
  page: number,
): Promise<void> {
  const range = JUZ_PAGE_RANGES[juzNum]
  if (range === undefined) {
    throw new ValidationError(`Invalid Juz' number: ${juzNum}`)
  }

  if (page < range.start || page > range.end) {
    throw new ValidationError(
      `Page ${page} is out of range for Juz' ${juzNum} (valid: ${range.start}–${range.end})`,
    )
  }

  const col = currentPageCol(juzNum)
  const update: Record<string, number> = { [col]: page }

  const { error } = await supabase
    .from('khatmah_instances')
    .update(update)
    .eq('id', instanceId)

  if (error != null) {
    throw new Error(`Failed to update page: ${error.message}`)
  }
}

/**
 * Marks the Juz' as completed, awards Jazah to the appropriate user,
 * and notifies all Khatmah participants via Notification_Service.
 * Requirements: 7.3, 7.5, 7.6
 */
export async function finishJuz(
  instanceId: string,
  juzNum: number,
): Promise<void> {
  // Fetch the instance row to get khatmah_id, assignee user IDs, and display names
  const planbCol     = `juz_${juzNum}_planb_user_id`
  const userCol      = `juz_${juzNum}_user_id`
  const planbNameCol = `juz_${juzNum}_planb_user_full_name`
  const userNameCol  = `juz_${juzNum}_user_full_name`

  const { data: instance, error: fetchError } = await supabase
    .from('khatmah_instances')
    .select(`khatmah_id, ${userCol}, ${planbCol}, ${userNameCol}, ${planbNameCol}`)
    .eq('id', instanceId)
    .single()

  if (fetchError != null) {
    throw new Error(`Failed to fetch instance: ${fetchError.message}`)
  }

  // Mark the Juz' as completed
  const completedUpdate: Record<string, boolean> = { [completedCol(juzNum)]: true }

  const { error: updateError } = await supabase
    .from('khatmah_instances')
    .update(completedUpdate)
    .eq('id', instanceId)

  if (updateError != null) {
    throw new Error(`Failed to mark Juz' completed: ${updateError.message}`)
  }

  // Determine which user receives the Jazah award:
  // Plan-B user takes priority if one is set (Requirement 8.6)
  const row = instance as Record<string, unknown>
  const khatmahId = row['khatmah_id']
  const planbUserId = row[planbCol]
  const primaryUserId = row[userCol]

  const awardeeId = typeof planbUserId === 'string'
    ? planbUserId
    : typeof primaryUserId === 'string'
      ? primaryUserId
      : null

  if (typeof khatmahId === 'string' && awardeeId !== null) {
    await awardJazah(khatmahId, juzNum, awardeeId)
  }

  // Notify all participants that this Juz' was completed (Requirement 7.6)
  if (typeof khatmahId === 'string') {
    // Fetch the completer's display name for the notification
    const nameRow = instance as Record<string, unknown>
    const planbName = nameRow[planbNameCol]
    const primaryName = nameRow[userNameCol]
    const participantName =
      typeof planbName === 'string' && planbName.length > 0
        ? planbName
        : typeof primaryName === 'string' && primaryName.length > 0
          ? primaryName
          : 'A participant'

    await notifyJuzCompleted(khatmahId, participantName, juzNum)
  }
}
