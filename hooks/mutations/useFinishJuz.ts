import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Progress_Service from '@/lib/progress'
import { queryKeys } from '@/lib/queryKeys'

export function useFinishJuz(khatmahId: string, userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ instanceId, juzNum }: { instanceId: string; juzNum: number }) =>
      Progress_Service.finishJuz(instanceId, juzNum),
    onSuccess: (_data, { instanceId, juzNum }) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.khatmah.activeInstance(khatmahId),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.instance.juzProgress(instanceId, juzNum),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.profile.totalJazah(userId),
      })
    },
  })
}
