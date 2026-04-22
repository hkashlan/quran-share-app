import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Assignment_Service from '@/lib/assignment'
import { queryKeys } from '@/lib/queryKeys'

export function useAssignManual(khatmahId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { instanceId: string; juzNum: number; userId: string; userFullName: string }) =>
      Assignment_Service.assignManual(args.instanceId, args.juzNum, args.userId, args.userFullName),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.khatmah.activeInstance(khatmahId),
      })
    },
  })
}
