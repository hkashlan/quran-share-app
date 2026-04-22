import { useQuery } from '@tanstack/react-query'
import * as Khatmah_Service from '@/lib/khatmah'
import { queryKeys } from '@/lib/queryKeys'

export function useActiveInstance(khatmahId: string) {
  return useQuery({
    queryKey: queryKeys.khatmah.activeInstance(khatmahId),
    queryFn: () => Khatmah_Service.getActiveInstance(khatmahId),
    enabled: khatmahId !== '',
  })
}
