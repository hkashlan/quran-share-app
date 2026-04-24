export const queryKeys = {
  khatmahs: {
    list: (userId: string) => ['khatmahs', 'list', userId] as const,
  },
  khatmah: {
    detail: (khatmahId: string) => ['khatmah', khatmahId] as const,
    activeInstance: (khatmahId: string) =>
      ['khatmah', khatmahId, 'activeInstance'] as const,
  },
  instance: {
    juzProgress: (instanceId: string, juzNum: number) =>
      ['instance', instanceId, 'juzProgress', juzNum] as const,
  },
  profile: {
    totalJazah: (userId: string) => ['profile', userId, 'totalJazah'] as const,
    readingStats: (userId: string) => ['profile', userId, 'readingStats'] as const,
  },
} as const
