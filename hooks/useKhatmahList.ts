import { useQuery } from '@tanstack/react-query'
import * as Khatmah_Service from '@/lib/khatmah'
import { queryKeys } from '@/lib/queryKeys'
import { useSession } from '@/hooks/useSession'

export function useKhatmahList() {
  const { session } = useSession()
  const userId = session?.user.id ?? null

  return useQuery({
    queryKey: queryKeys.khatmahs.list(userId ?? ''),
    queryFn: () => Khatmah_Service.listForUser(userId!),
    enabled: userId != null,
  })
}
