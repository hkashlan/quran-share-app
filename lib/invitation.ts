import { supabase } from '@/lib/supabase'
import type { Khatmah, LifecycleType, ResetCalendar, AssignmentMode } from '@/types/khatmah'
import { AlreadyMemberError } from '@/types/khatmah'

export { AlreadyMemberError }

// ── Row → domain mapper ───────────────────────────────────────────────────────

function mapKhatmah(row: {
  id: string
  name: string
  creator_id: string
  lifecycle_type: string
  reset_calendar: string | null
  auto_renewal: boolean
  assignment_mode: string
  jazah_multiplier: number
  invitation_uuid: string
  status: string
  created_at: string | null
}): Khatmah {
  return {
    id: row.id,
    name: row.name,
    creatorId: row.creator_id,
    lifecycleType: row.lifecycle_type as LifecycleType,
    resetCalendar: row.reset_calendar as ResetCalendar | null,
    autoRenewal: row.auto_renewal,
    assignmentMode: row.assignment_mode as AssignmentMode,
    jazahMultiplier: row.jazah_multiplier,
    invitationUuid: row.invitation_uuid,
    status: row.status as Khatmah['status'],
    createdAt: row.created_at ?? '',
  }
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * Returns the invitation URL for a Khatmah.
 * Requirements: 6.1
 */
export async function getInviteUrl(khatmahId: string): Promise<string> {
  const { data, error } = await supabase
    .from('khatmahs')
    .select('invitation_uuid')
    .eq('id', khatmahId)
    .single()

  if (error != null) {
    throw new Error(`Failed to fetch invitation UUID: ${error.message}`)
  }

  return `app.com/join/${data.invitation_uuid}`
}

/**
 * Resolves an invitation UUID to a Khatmah.
 * Throws if the UUID does not match any Khatmah.
 * Requirements: 6.2
 */
export async function resolveInvite(uuid: string): Promise<Khatmah> {
  const { data, error } = await supabase
    .from('khatmahs')
    .select('*')
    .eq('invitation_uuid', uuid)
    .single()

  if (error != null || data == null) {
    throw new Error(`No Khatmah found for invitation UUID: ${uuid}`)
  }

  return mapKhatmah(data)
}

/**
 * Joins a Khatmah via invitation UUID.
 * Throws AlreadyMemberError if the user is already a participant.
 * Requirements: 6.4, 6.6
 */
export async function joinKhatmah(uuid: string, userId: string): Promise<void> {
  const khatmah = await resolveInvite(uuid)

  const { data: existing, error: checkError } = await supabase
    .from('khatmah_participants')
    .select('user_id')
    .eq('khatmah_id', khatmah.id)
    .eq('user_id', userId)
    .maybeSingle()

  if (checkError != null) {
    throw new Error(`Failed to check membership: ${checkError.message}`)
  }

  if (existing != null) {
    throw new AlreadyMemberError()
  }

  const { error: insertError } = await supabase
    .from('khatmah_participants')
    .insert({ khatmah_id: khatmah.id, user_id: userId })

  if (insertError != null) {
    throw new Error(`Failed to join Khatmah: ${insertError.message}`)
  }
}
