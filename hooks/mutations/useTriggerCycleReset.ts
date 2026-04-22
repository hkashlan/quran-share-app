import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Khatmah_Service from '@/lib/khatmah'
import { queryKeys } from '@/lib/queryKeys'

export function useTriggerCycleReset(khatmahId: string, userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => Khatmah_Service.triggerCycleReset(khatmahId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.khatmah.activeInstance(khatmahId),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.khatmahs.list(userId),
      })
    },
  })
}
