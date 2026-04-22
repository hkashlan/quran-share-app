import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Assignment_Service from '@/lib/assignment'
import { queryKeys } from '@/lib/queryKeys'

export function useReassignJuz(khatmahId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { instanceId: string; juzNum: number; newUserId: string; newUserFullName: string }) =>
      Assignment_Service.reassignJuz(args.instanceId, args.juzNum, args.newUserId, args.newUserFullName),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.khatmah.activeInstance(khatmahId),
      })
    },
  })
}
