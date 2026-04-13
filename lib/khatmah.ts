import { supabase } from '@/lib/supabase'
import type { Khatmah, KhatmahInstance, LifecycleType, ResetCalendar, AssignmentMode } from '@/types/khatmah'

// ── Param types ───────────────────────────────────────────────────────────────

export interface CreateKhatmahParams {
  name: string
  creatorId: string
  lifecycleType: LifecycleType
  resetCalendar?: ResetCalendar | null
  autoRenewal?: boolean
  assignmentMode: AssignmentMode
}

export interface KhatmahConfig {
  name?: string
  lifecycleType?: LifecycleType
  resetCalendar?: ResetCalendar | null
  autoRenewal?: boolean
  assignmentMode?: AssignmentMode
  jazahMultiplier?: number
}

// ── Row → domain mappers ──────────────────────────────────────────────────────

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

function mapInstance(row: Record<string, unknown>): KhatmahInstance {
  const juzAssignments: Record<number, string | null> = {}
  const juzUserFullNames: Record<number, string | null> = {}
  const juzCompleted: Record<number, boolean> = {}
  const juzPlanbUsers: Record<number, string | null> = {}
  const juzPlanbUserFullNames: Record<number, string | null> = {}
  const juzHelpRequested: Record<number, boolean> = {}
  const juzCurrentPage: Record<number, number> = {}

  for (let i = 1; i <= 30; i++) {
    juzAssignments[i]      = (row[`juz_${i}_user_id`] as string | null) ?? null
    juzUserFullNames[i]    = (row[`juz_${i}_user_full_name`] as string | null) ?? null
    juzCompleted[i]        = (row[`juz_${i}_completed`] as boolean | null) ?? false
    juzPlanbUsers[i]       = (row[`juz_${i}_planb_user_id`] as string | null) ?? null
    juzPlanbUserFullNames[i] = (row[`juz_${i}_planb_user_full_name`] as string | null) ?? null
    juzHelpRequested[i]    = (row[`juz_${i}_help_requested`] as boolean | null) ?? false
    juzCurrentPage[i]      = (row[`juz_${i}_current_page`] as number | null) ?? 0
  }

  return {
    id: row['id'] as string,
    khatmahId: row['khatmah_id'] as string,
    cycleNumber: row['cycle_number'] as number,
    startedAt: (row['started_at'] as string | null) ?? '',
    endedAt: (row['ended_at'] as string | null) ?? null,
    status: (row['status'] as KhatmahInstance['status']),
    juzAssignments,
    juzUserFullNames,
    juzCompleted,
    juzPlanbUsers,
    juzPlanbUserFullNames,
    juzHelpRequested,
    juzCurrentPage,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build the reset-fields object for a new khatmah_instances row (all juz progress cleared). */
function buildResetFields(): Record<string, boolean | number | null> {
  const fields: Record<string, boolean | number | null> = {}
  for (let i = 1; i <= 30; i++) {
    fields[`juz_${i}_completed`]           = false
    fields[`juz_${i}_current_page`]        = 0
    fields[`juz_${i}_help_requested`]      = false
    fields[`juz_${i}_planb_user_id`]       = null
    fields[`juz_${i}_planb_user_full_name`] = null
  }
  return fields
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * Create a new Khatmah, add the creator as the first participant, and create
 * the first khatmah_instances row (cycle_number = 1, all fields at defaults).
 * Requirements: 3.1, 3.2, 3.3, 3.6
 */
export async function create(params: CreateKhatmahParams): Promise<Khatmah> {
  const { data: khatmahRow, error: khatmahError } = await supabase
    .from('khatmahs')
    .insert({
      name: params.name,
      creator_id: params.creatorId,
      lifecycle_type: params.lifecycleType,
      reset_calendar: params.resetCalendar ?? null,
      auto_renewal: params.autoRenewal ?? false,
      assignment_mode: params.assignmentMode,
      // jazah_multiplier defaults to 1 in DB; invitation_uuid auto-generated
    })
    .select()
    .single()

  if (khatmahError != null) {
    throw new Error(`Failed to create khatmah: ${khatmahError.message}`)
  }

  const khatmahId = khatmahRow.id

  // Insert creator as first participant
  const { error: participantError } = await supabase
    .from('khatmah_participants')
    .insert({ khatmah_id: khatmahId, user_id: params.creatorId })

  if (participantError != null) {
    throw new Error(`Failed to add creator as participant: ${participantError.message}`)
  }

  // Create first khatmah_instances row (cycle 1, all defaults)
  const { error: instanceError } = await supabase
    .from('khatmah_instances')
    .insert({ khatmah_id: khatmahId, cycle_number: 1 })

  if (instanceError != null) {
    throw new Error(`Failed to create first khatmah instance: ${instanceError.message}`)
  }

  return mapKhatmah(khatmahRow)
}

/**
 * Fetch a single Khatmah by ID.
 * Requirements: 9.1
 */
export async function getById(id: string): Promise<Khatmah> {
  const { data, error } = await supabase
    .from('khatmahs')
    .select('*')
    .eq('id', id)
    .single()

  if (error != null) {
    throw new Error(`Failed to fetch khatmah: ${error.message}`)
  }

  return mapKhatmah(data)
}

/**
 * List all Khatmahs the user participates in (via khatmah_participants).
 * Requirements: 9.4
 */
export async function listForUser(userId: string): Promise<Khatmah[]> {
  const { data, error } = await supabase
    .from('khatmah_participants')
    .select('khatmah_id')
    .eq('user_id', userId)

  if (error != null) {
    throw new Error(`Failed to list khatmahs for user: ${error.message}`)
  }

  if (data.length === 0) return []

  const ids = data.map((r) => r.khatmah_id)

  const { data: khatmahs, error: khatmahsError } = await supabase
    .from('khatmahs')
    .select('*')
    .in('id', ids)

  if (khatmahsError != null) {
    throw new Error(`Failed to fetch khatmahs: ${khatmahsError.message}`)
  }

  return khatmahs.map(mapKhatmah)
}

/**
 * Update mutable config fields on a Khatmah.
 * Requirements: 3.6
 */
export async function updateConfig(id: string, config: Partial<KhatmahConfig>): Promise<Khatmah> {
  const update: Record<string, unknown> = {}
  if (config.name !== undefined)            update['name']             = config.name
  if (config.lifecycleType !== undefined)   update['lifecycle_type']   = config.lifecycleType
  if (config.resetCalendar !== undefined)   update['reset_calendar']   = config.resetCalendar
  if (config.autoRenewal !== undefined)     update['auto_renewal']     = config.autoRenewal
  if (config.assignmentMode !== undefined)  update['assignment_mode']  = config.assignmentMode
  if (config.jazahMultiplier !== undefined) update['jazah_multiplier'] = config.jazahMultiplier

  const { data, error } = await supabase
    .from('khatmahs')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error != null) {
    throw new Error(`Failed to update khatmah config: ${error.message}`)
  }

  return mapKhatmah(data)
}

/**
 * Mark a Khatmah as completed.
 * Requirements: 3.8, 3.9
 */
export async function markCompleted(id: string): Promise<void> {
  const { error } = await supabase
    .from('khatmahs')
    .update({ status: 'completed' })
    .eq('id', id)

  if (error != null) {
    throw new Error(`Failed to mark khatmah as completed: ${error.message}`)
  }
}

/**
 * Get the active (status = 'active') khatmah_instances row for a Khatmah.
 * Requirements: 9.1
 */
export async function getActiveInstance(khatmahId: string): Promise<KhatmahInstance> {
  const { data, error } = await supabase
    .from('khatmah_instances')
    .select('*')
    .eq('khatmah_id', khatmahId)
    .eq('status', 'active')
    .order('cycle_number', { ascending: false })
    .limit(1)
    .single()

  if (error != null) {
    throw new Error(`Failed to fetch active instance: ${error.message}`)
  }

  return mapInstance(data as Record<string, unknown>)
}

/**
 * Get a specific khatmah_instances row by its ID.
 * Requirements: 9.1
 */
export async function getInstance(instanceId: string): Promise<KhatmahInstance> {
  const { data, error } = await supabase
    .from('khatmah_instances')
    .select('*')
    .eq('id', instanceId)
    .single()

  if (error != null) {
    throw new Error(`Failed to fetch instance: ${error.message}`)
  }

  return mapInstance(data as Record<string, unknown>)
}

/**
 * Insert a new khatmah_instances row with cycle_number + 1.
 * All completion/progress fields are reset; user assignments are NOT copied here
 * (that is handled by Assignment_Service auto-renewal logic in task 18).
 * Requirements: 3.8, 3.9, 9.1, 9.4
 */
export async function triggerCycleReset(id: string): Promise<KhatmahInstance> {
  // Fetch the current active instance to get the latest cycle_number
  const currentInstance = await getActiveInstance(id)

  // Mark the current instance as completed
  const { error: endError } = await supabase
    .from('khatmah_instances')
    .update({ status: 'completed', ended_at: new Date().toISOString() })
    .eq('id', currentInstance.id)

  if (endError != null) {
    throw new Error(`Failed to close current instance: ${endError.message}`)
  }

  // Insert new instance with incremented cycle_number and all progress reset
  const resetFields = buildResetFields()
  const { data: newInstance, error: insertError } = await supabase
    .from('khatmah_instances')
    .insert({
      khatmah_id: id,
      cycle_number: currentInstance.cycleNumber + 1,
      ...resetFields,
    })
    .select()
    .single()

  if (insertError != null) {
    throw new Error(`Failed to create new instance: ${insertError.message}`)
  }

  return mapInstance(newInstance as Record<string, unknown>)
}
