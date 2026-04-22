import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Assignment_Service from '@/lib/assignment'
import { queryKeys } from '@/lib/queryKeys'

export function useMarkHelpRequested(khatmahId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ instanceId, juzNum }: { instanceId: string; juzNum: number }) =>
      Assignment_Service.markHelpRequested(instanceId, juzNum),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.khatmah.activeInstance(khatmahId),
      })
    },
  })
}
