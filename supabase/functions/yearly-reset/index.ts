/**
 * Supabase Edge Function: yearly-reset
 * Scheduled task that resets the `total_juz_last_year` counter to 0 for all
 * profiles whose yearly reset is due (i.e. `last_year_reset_at` is NULL or
 * older than 1 year). Updates `last_year_reset_at` to the current timestamp.
 *
 * Requirements: 1.7, 1.8
 *
 * Deploy: supabase functions deploy yearly-reset
 * Schedule via Supabase Dashboard cron: `0 0 1 1 *` (January 1st, midnight UTC).
 *
 * Idempotent — safe to run multiple times. The underlying RPC only resets
 * profiles where the reset is actually due, so re-running on the same day
 * has no effect after the first successful run.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (_req: Request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // Use service role key so Edge Function bypasses RLS
  const supabase = createClient(supabaseUrl, serviceKey)

  const now = new Date()
  console.log(`[yearly-reset] Running at ${now.toISOString()}`)

  // Call the idempotent RPC — resets total_juz_last_year to 0 and updates
  // last_year_reset_at for all profiles where the reset is due.
  const { error } = await supabase.rpc('reset_yearly_juz_counters')

  if (error != null) {
    console.error('[yearly-reset] RPC failed:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  console.log('[yearly-reset] reset_yearly_juz_counters completed successfully.')
  return new Response(JSON.stringify({ message: 'Yearly reset completed.' }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
