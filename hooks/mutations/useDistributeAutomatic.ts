import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Assignment_Service from '@/lib/assignment'
import { queryKeys } from '@/lib/queryKeys'

export function useDistributeAutomatic(khatmahId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ instanceId, mode }: { instanceId: string; mode: 'random' | 'sequential' }) =>
      Assignment_Service.distributeAutomatic(instanceId, mode),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.khatmah.activeInstance(khatmahId),
      })
    },
  })
}
