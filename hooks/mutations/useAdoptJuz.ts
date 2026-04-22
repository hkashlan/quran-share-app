import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Assignment_Service from '@/lib/assignment'
import { queryKeys } from '@/lib/queryKeys'

export function useAdoptJuz(khatmahId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { instanceId: string; juzNum: number; adopterId: string; adopterFullName: string }) =>
      Assignment_Service.adoptJuz(args.instanceId, args.juzNum, args.adopterId, args.adopterFullName),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.khatmah.activeInstance(khatmahId),
      })
    },
  })
}
