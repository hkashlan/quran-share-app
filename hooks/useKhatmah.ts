import { useQuery } from '@tanstack/react-query'
import * as Khatmah_Service from '@/lib/khatmah'
import { queryKeys } from '@/lib/queryKeys'

export function useKhatmah(khatmahId: string) {
  return useQuery({
    queryKey: queryKeys.khatmah.detail(khatmahId),
    queryFn: () => Khatmah_Service.getById(khatmahId),
    enabled: khatmahId !== '',
  })
}
