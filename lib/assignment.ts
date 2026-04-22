import { QueryData } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { notifyHelpRequested } from '@/lib/notification'
import type { Database } from '@/types/supabase'

type InstanceUpdate = Database['public']['Tables']['khatmah_instances']['Update']

// Query-derived type for reading instance rows
const instanceSelectQuery = supabase.from('khatmah_instances').select('*').single()
type InstanceRow = QueryData<typeof instanceSelectQuery>

// ── Interface ─────────────────────────────────────────────────────────────────

export interface AssignmentService {
  distributeAutomatic(instanceId: string, mode: 'random' | 'sequential'): Promise<void>
  assignManual(instanceId: string, juzNum: number, userId: string, userFullName: string): Promise<void>
  markHelpRequested(instanceId: string, juzNum: number): Promise<void>
  adoptJuz(instanceId: string, juzNum: number, adopterId: string, adopterFullName: string): Promise<void>
  reassignJuz(instanceId: string, juzNum: number, newUserId: string, newUserFullName: string): Promise<void>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Fisher-Yates shuffle — returns a new shuffled array without mutating the original. */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j] as T, result[i] as T]
  }
  return result
}

interface Participant {
  userId: string
  fullName: string
}

/**
 * Fetch participants for a given instance by:
 * 1. Looking up khatmah_id from khatmah_instances
 * 2. Querying khatmah_participants joined with profiles for display names
 * Uses display_name from profiles (which is set from Gmail account name on signup)
 * Requirements: 5.4, 5.5
 */
export async function fetchParticipants(instanceId: string): Promise<Participant[]> {
  // Step 1: get khatmah_id from the instance
  const { data: instance, error: instanceError } = await supabase
    .from('khatmah_instances')
    .select('khatmah_id')
    .eq('id', instanceId)
    .single()

  if (instanceError != null) {
    throw new Error(`Failed to fetch instance: ${instanceError.message}`)
  }

  const khatmahId: string = instance.khatmah_id

  // Step 2: fetch participants with their display names via profiles
  const { data: rows, error: participantsError } = await supabase
    .from('khatmah_participants')
    .select('user_id, profiles(display_name)')
    .eq('khatmah_id', khatmahId)

  if (participantsError != null) {
    throw new Error(`Failed to fetch participants: ${participantsError.message}`)
  }

  return rows.map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
    const displayName = (profile as { display_name: string | null } | null)?.display_name

    // Use display_name if available and not empty, otherwise use shortened user_id
    const fullName = displayName && displayName.trim() ? displayName : row.user_id.substring(0, 8)

    return {
      userId: row.user_id,
      fullName,
    }
  })
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * Distribute all 30 Juz' among participants using random or sequential round-robin.
 * - ≥ 30 participants: each gets at most 1 Juz'; excess participants get nothing.
 * - < 30 participants: all 30 Juz' are assigned, cycling through participants.
 * Requirements: 5.4, 5.6, 5.7
 */
export async function distributeAutomatic(
  instanceId: string,
  mode: 'random' | 'sequential',
): Promise<void> {
  const participants = await fetchParticipants(instanceId)

  if (participants.length === 0) {
    throw new Error('Cannot distribute: no participants found for this instance')
  }

  // For random mode, shuffle the participants array before round-robin
  const ordered: Participant[] = mode === 'random' ? shuffle(participants) : [...participants]

  const update: InstanceUpdate = {}

  for (let juz = 1; juz <= 30; juz++) {
    const participantIndex = (juz - 1) % ordered.length
    const participant = ordered[participantIndex]

    const userIdKey   = `juz_${juz}_user_id`   as keyof InstanceUpdate
    const nameKey     = `juz_${juz}_user_full_name` as keyof InstanceUpdate
    ;(update as Record<keyof InstanceUpdate, unknown>)[userIdKey] = participant!.userId
    ;(update as Record<keyof InstanceUpdate, unknown>)[nameKey]   = participant!.fullName
  }

  const { error } = await supabase
    .from('khatmah_instances')
    .update(update)
    .eq('id', instanceId)

  if (error != null) {
    throw new Error(`Failed to distribute Juz': ${error.message}`)
  }
}

/**
 * Manually assign a single Juz' slot to a specific user.
 * Requirements: 5.2, 5.5
 */
export async function assignManual(
  instanceId: string,
  juzNum: number,
  userId: string,
  userFullName: string,
): Promise<void> {
  const update: InstanceUpdate = {
    [`juz_${juzNum}_user_id` as keyof InstanceUpdate]:        userId,
    [`juz_${juzNum}_user_full_name` as keyof InstanceUpdate]: userFullName,
  } as InstanceUpdate

  const { error } = await supabase
    .from('khatmah_instances')
    .update(update)
    .eq('id', instanceId)

  if (error != null) {
    throw new Error(`Failed to assign Juz' ${juzNum}: ${error.message}`)
  }
}

/**
 * Flag a Juz' as help-requested (the "I Can't Read" toggle).
 * Notifies the Khatmah Creator.
 * Requirements: 8.1, 8.2
 */
export async function markHelpRequested(instanceId: string, juzNum: number): Promise<void> {
  const { data: instance, error: fetchError } = await supabase
    .from('khatmah_instances')
    .select('*')
    .eq('id', instanceId)
    .single()

  if (fetchError != null) {
    throw new Error(`Failed to fetch instance for help request: ${fetchError.message}`)
  }

  const helpUpdate: InstanceUpdate = {
    [`juz_${juzNum}_help_requested` as keyof InstanceUpdate]: true,
  } as InstanceUpdate

  const { error } = await supabase
    .from('khatmah_instances')
    .update(helpUpdate)
    .eq('id', instanceId)

  if (error != null) {
    throw new Error(`Failed to mark help requested for Juz' ${juzNum}: ${error.message}`)
  }

  // Notify the Creator (Requirement 8.2)
  const khatmahId = instance.khatmah_id
  const nameVal   = instance[`juz_${juzNum}_user_full_name` as keyof InstanceRow]
  const participantName =
    typeof nameVal === 'string' && nameVal.length > 0 ? nameVal : 'A participant'

  await notifyHelpRequested(khatmahId, participantName, juzNum)
}

/**
 * Record a Plan-B adopter for a help-requested Juz'.
 * Requirements: 8.4
 */
export async function adoptJuz(
  instanceId: string,
  juzNum: number,
  adopterId: string,
  adopterFullName: string,
): Promise<void> {
  const update: InstanceUpdate = {
    [`juz_${juzNum}_planb_user_id` as keyof InstanceUpdate]:        adopterId,
    [`juz_${juzNum}_planb_user_full_name` as keyof InstanceUpdate]: adopterFullName,
  } as InstanceUpdate

  const { error } = await supabase
    .from('khatmah_instances')
    .update(update)
    .eq('id', instanceId)

  if (error != null) {
    throw new Error(`Failed to adopt Juz' ${juzNum}: ${error.message}`)
  }
}

/**
 * Reassign a Juz' to a new primary user (replaces the original assignee).
 * Requirements: 5.2, 8.5
 */
export async function reassignJuz(
  instanceId: string,
  juzNum: number,
  newUserId: string,
  newUserFullName: string,
): Promise<void> {
  const update: InstanceUpdate = {
    [`juz_${juzNum}_user_id` as keyof InstanceUpdate]:        newUserId,
    [`juz_${juzNum}_user_full_name` as keyof InstanceUpdate]: newUserFullName,
  } as InstanceUpdate

  const { error } = await supabase
    .from('khatmah_instances')
    .update(update)
    .eq('id', instanceId)

  if (error != null) {
    throw new Error(`Failed to reassign Juz' ${juzNum}: ${error.message}`)
  }
}
