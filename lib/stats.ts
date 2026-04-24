import { supabase } from '@/lib/supabase'

export interface ReadingStats {
  totalJuzLastYear: number
  totalJuzLifetime: number
}

export async function getReadingStats(userId: string): Promise<ReadingStats> {
  const { data, error } = await supabase
    .from('profiles')
    .select('total_juz_last_year, total_juz_lifetime')
    .eq('id', userId)
    .single()

  if (error != null) throw new Error(`Failed to fetch reading stats: ${error.message}`)

  return {
    totalJuzLastYear: data.total_juz_last_year,
    totalJuzLifetime: data.total_juz_lifetime,
  }
}
