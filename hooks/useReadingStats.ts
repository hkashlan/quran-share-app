import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { getReadingStats } from '@/lib/stats'
import { useSession } from '@/hooks/useSession'

export function useReadingStats() {
  const { session } = useSession()
  const userId = session?.user.id ?? ''

  return useQuery({
    queryKey: queryKeys.profile.readingStats(userId),
    queryFn: () => getReadingStats(userId),
    enabled: userId !== '',
    staleTime: 0,
  })
}
