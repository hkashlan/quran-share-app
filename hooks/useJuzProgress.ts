import { useQuery } from '@tanstack/react-query'
import * as Progress_Service from '@/lib/progress'
import { queryKeys } from '@/lib/queryKeys'

export function useJuzProgress(instanceId: string, juzNum: number) {
  return useQuery({
    queryKey: queryKeys.instance.juzProgress(instanceId, juzNum),
    queryFn: () => Progress_Service.getProgress(instanceId, juzNum),
    enabled: instanceId !== '',
  })
}
