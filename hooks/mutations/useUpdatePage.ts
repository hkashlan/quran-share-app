import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Progress_Service from '@/lib/progress'
import { queryKeys } from '@/lib/queryKeys'

export function useUpdatePage(instanceId: string, juzNum: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (page: number) =>
      Progress_Service.updatePage(instanceId, juzNum, page),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.instance.juzProgress(instanceId, juzNum),
      })
    },
  })
}
