import { supabase } from '@/lib/supabase'

export interface RewardService {
  awardJazah(khatmahId: string, juzNum: number, userId: string): Promise<void>
  getTotalJazah(userId: string): Promise<number>
}

/**
 * Increments profiles.jazah_total by the Khatmah's current jazah_multiplier value.
 * Fetches the multiplier from khatmahs, then issues a single atomic UPDATE.
 * Requirements: 4.1, 4.3, 4.4
 */
export async function awardJazah(
  khatmahId: string,
  _juzNum: number,
  userId: string,
): Promise<void> {
  // Step 1: fetch the current multiplier for this Khatmah
  const { data: khatmah, error: fetchError } = await supabase
    .from('khatmahs')
    .select('jazah_multiplier')
    .eq('id', khatmahId)
    .single()

  if (fetchError != null) {
    throw new Error(`Failed to fetch khatmah multiplier: ${fetchError.message}`)
  }

  const multiplier: number = khatmah.jazah_multiplier

  // Step 2: atomically increment jazah_total by the multiplier
  // Uses a Postgres expression via rpc to avoid a read-modify-write race condition
  const { error: updateError } = await supabase.rpc('increment_jazah', {
    p_user_id: userId,
    p_amount: multiplier,
  })

  if (updateError != null) {
    throw new Error(`Failed to award jazah: ${updateError.message}`)
  }
}

/**
 * Reads profiles.jazah_total for the given user — single row fetch, no aggregation.
 * Requirements: 4.2, 4.5
 */
export async function getTotalJazah(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('profiles')
    .select('jazah_total')
    .eq('id', userId)
    .single()

  if (error != null) {
    throw new Error(`Failed to fetch jazah total: ${error.message}`)
  }

  return data.jazah_total
}
