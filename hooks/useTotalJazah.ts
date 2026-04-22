import { useQuery } from '@tanstack/react-query'
import * as Reward_Service from '@/lib/reward'
import { queryKeys } from '@/lib/queryKeys'
import { useSession } from '@/hooks/useSession'

export function useTotalJazah() {
  const { session } = useSession()
  const userId = session?.user.id ?? null

  return useQuery({
    queryKey: queryKeys.profile.totalJazah(userId ?? ''),
    queryFn: () => Reward_Service.getTotalJazah(userId!),
    enabled: userId != null,
  })
}
