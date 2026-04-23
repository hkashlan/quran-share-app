/**
 * Progress_Service — tracks per-participant reading progress within a Juz'.
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
import { QueryData } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { JUZ_PAGE_RANGES } from '@/lib/juzPages'
import { awardJazah } from '@/lib/reward'
import { notifyJuzCompleted } from '@/lib/notification'
import type { Database } from '@/types/supabase'

// ── Query-derived types ───────────────────────────────────────────────────────

const instanceProgressQuery = supabase.from('khatmah_instances').select('*').single()
type InstanceRow    = QueryData<typeof instanceProgressQuery>
type InstanceUpdate = Database['public']['Tables']['khatmah_instances']['Update']

// ── Custom error ──────────────────────────────────────────────────────────────

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function currentPageCol(juzNum: number): keyof InstanceRow {
  return `juz_${juzNum}_current_page` as keyof InstanceRow
}

function completedCol(juzNum: number): keyof InstanceUpdate {
  return `juz_${juzNum}_completed` as keyof InstanceUpdate
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * Returns the current saved page number for the given Juz' in the instance.
 * Requirements: 7.1
 */
export async function getProgress(instanceId: string, juzNum: number): Promise<number> {
  const { data, error } = await supabase
    .from('khatmah_instances')
    .select('*')
    .eq('id', instanceId)
    .single()

  if (error != null) throw new Error(`Failed to fetch progress: ${error.message}`)

  const page = data[currentPageCol(juzNum)]
  return typeof page === 'number' ? page : 0
}

/**
 * Validates the page number against JUZ_PAGE_RANGES and updates juz_X_current_page.
 * Throws ValidationError without updating if the page is out of range.
 * Requirements: 7.2, 7.4
 */
export async function updatePage(instanceId: string, juzNum: number, page: number): Promise<void> {
  const range = JUZ_PAGE_RANGES[juzNum]
  if (range === undefined) throw new ValidationError(`Invalid Juz' number: ${juzNum}`)

  if (page < range.start || page > range.end) {
    throw new ValidationError(
      `Page ${page} is out of range for Juz' ${juzNum} (valid: ${range.start}–${range.end})`,
    )
  }

  const update: InstanceUpdate = {
    [currentPageCol(juzNum) as keyof InstanceUpdate]: page,
  } as InstanceUpdate

  const { error } = await supabase
    .from('khatmah_instances')
    .update(update)
    .eq('id', instanceId)

  if (error != null) throw new Error(`Failed to update page: ${error.message}`)
}

/**
 * Reverts a completed Juz' back to incomplete (un-marks completion).
 * Requirements: 7.3
 */
export async function unfinishJuz(instanceId: string, juzNum: number): Promise<void> {
  const revertUpdate: InstanceUpdate = {
    [completedCol(juzNum)]: false,
  } as InstanceUpdate

  const { error } = await supabase
    .from('khatmah_instances')
    .update(revertUpdate)
    .eq('id', instanceId)

  if (error != null) throw new Error(`Failed to revert Juz' completion: ${error.message}`)
}

/**
 * Marks the Juz' as completed, awards Jazah to the appropriate user,
 * and notifies all Khatmah participants via Notification_Service.
 * Requirements: 7.3, 7.5, 7.6
 */
export async function finishJuz(instanceId: string, juzNum: number): Promise<void> {
  const { data: instance, error: fetchError } = await supabase
    .from('khatmah_instances')
    .select('*')
    .eq('id', instanceId)
    .single()

  if (fetchError != null) throw new Error(`Failed to fetch instance: ${fetchError.message}`)

  // Mark the Juz' as completed
  const completedUpdate: InstanceUpdate = {
    [completedCol(juzNum)]: true,
  } as InstanceUpdate

  const { error: updateError } = await supabase
    .from('khatmah_instances')
    .update(completedUpdate)
    .eq('id', instanceId)

  if (updateError != null) throw new Error(`Failed to mark Juz' completed: ${updateError.message}`)

  // Plan-B user takes priority for Jazah award (Requirement 8.6)
  const planbUserId   = instance[`juz_${juzNum}_planb_user_id` as keyof InstanceRow]
  const primaryUserId = instance[`juz_${juzNum}_user_id` as keyof InstanceRow]
  const khatmahId     = instance.khatmah_id

  const awardeeId = typeof planbUserId === 'string'
    ? planbUserId
    : typeof primaryUserId === 'string'
      ? primaryUserId
      : null

  if (awardeeId !== null) {
    await awardJazah(khatmahId, juzNum, awardeeId)
  }

  // Notify all participants (Requirement 7.6)
  const planbName   = instance[`juz_${juzNum}_planb_user_full_name` as keyof InstanceRow]
  const primaryName = instance[`juz_${juzNum}_user_full_name` as keyof InstanceRow]
  const participantName =
    typeof planbName === 'string' && planbName.length > 0
      ? planbName
      : typeof primaryName === 'string' && primaryName.length > 0
        ? primaryName
        : 'A participant'

  await notifyJuzCompleted(khatmahId, participantName, juzNum)
}
