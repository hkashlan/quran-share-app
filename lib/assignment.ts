import { supabase } from '@/lib/supabase'

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
 * Requirements: 5.4, 5.5
 */
async function fetchParticipants(instanceId: string): Promise<Participant[]> {
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
    return {
      userId: row.user_id,
      fullName: (profile as { display_name: string | null } | null)?.display_name ?? '',
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

  const update: Record<string, string | null> = {}

  for (let juz = 1; juz <= 30; juz++) {
    // When ≥ 30 participants, cap at one Juz' per participant (index = juz - 1)
    // When < 30 participants, cycle round-robin through the ordered list
    const participantIndex = (juz - 1) % ordered.length
    const participant = ordered[participantIndex]

    // When ≥ 30 participants: index = juz-1 (0..29), each maps to a unique participant.
    // When < 30 participants: round-robin ensures all 30 Juz' are covered.
    // In both cases `participant` is always defined since index < ordered.length.
    update[`juz_${juz}_user_id`] = participant!.userId
    update[`juz_${juz}_user_full_name`] = participant!.fullName
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
  const { error } = await supabase
    .from('khatmah_instances')
    .update({
      [`juz_${juzNum}_user_id`]: userId,
      [`juz_${juzNum}_user_full_name`]: userFullName,
    })
    .eq('id', instanceId)

  if (error != null) {
    throw new Error(`Failed to assign Juz' ${juzNum}: ${error.message}`)
  }
}

/**
 * Flag a Juz' as help-requested (the "I Can't Read" toggle).
 * Requirements: 8.1
 */
export async function markHelpRequested(instanceId: string, juzNum: number): Promise<void> {
  const { error } = await supabase
    .from('khatmah_instances')
    .update({ [`juz_${juzNum}_help_requested`]: true })
    .eq('id', instanceId)

  if (error != null) {
    throw new Error(`Failed to mark help requested for Juz' ${juzNum}: ${error.message}`)
  }
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
  const { error } = await supabase
    .from('khatmah_instances')
    .update({
      [`juz_${juzNum}_planb_user_id`]: adopterId,
      [`juz_${juzNum}_planb_user_full_name`]: adopterFullName,
    })
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
  const { error } = await supabase
    .from('khatmah_instances')
    .update({
      [`juz_${juzNum}_user_id`]: newUserId,
      [`juz_${juzNum}_user_full_name`]: newUserFullName,
    })
    .eq('id', instanceId)

  if (error != null) {
    throw new Error(`Failed to reassign Juz' ${juzNum}: ${error.message}`)
  }
}
