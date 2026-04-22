# Implementation Plan: TanStack Query Integration

## Overview

Replace five hand-rolled data-fetching hooks and all direct service calls in screens with thin TanStack Query wrappers. Each step builds on the previous, ending with fully wired screens and dead code removal.

## Tasks

- [x] 1. Install @tanstack/react-query
  - Run `npx expo install @tanstack/react-query` to add the package
  - Verify the dependency appears in `package.json`
  - _Requirements: 1.1, 1.2_

- [x] 2. Create query key factory
  - Create `lib/queryKeys.ts` with typed `as const` tuple builders for all five query shapes: `khatmahs.list`, `khatmah.detail`, `khatmah.activeInstance`, `instance.juzProgress`, `profile.totalJazah`
  - Export the `queryKeys` object as the single source of truth for all cache keys
  - _Requirements: 1.6, 9.3_

  - [ ]* 2.1 Write property test for query key stability and non-collision
    - **Property 1: Query key stability and non-collision**
    - For any two calls to the same builder with the same args, results must be deeply equal; for different builders or different args, results must not be deeply equal
    - Install `fast-check` dev dependency: `npm install --save-dev fast-check`
    - Create `lib/__tests__/queryKeys.test.ts`
    - **Validates: Requirements 1.6, 9.3**

- [x] 3. Set up QueryClient singleton and QueryClientProvider
  - In `app/_layout.tsx`, create a module-level `QueryClient` singleton (outside the component) with `staleTime: 60_000`, `gcTime: 300_000`, `retry: 2`
  - Wrap the existing `<ThemeProvider>` with `<QueryClientProvider client={queryClient}>`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 4. Rewrite hooks/useKhatmahList.ts as useQuery wrapper
  - Replace the entire hook body with a single `useQuery` call using `queryKeys.khatmahs.list(userId ?? '')`, `queryFn: () => Khatmah_Service.listForUser(userId!)`, and `enabled: userId != null`
  - Remove `mountedRef`, `retryCountRef`, `retryTimerRef`, `fetchAndSubscribe`, `scheduleRetry`, and the Supabase channel subscription
  - Return the raw `UseQueryResult` (or destructure `data`, `isLoading`, `isError`)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. Rewrite hooks/useKhatmah.ts as useQuery wrapper
  - Replace the entire hook body with a single `useQuery` call using `queryKeys.khatmah.detail(khatmahId)`, `queryFn: () => Khatmah_Service.getById(khatmahId)`, and `enabled: khatmahId !== ''`
  - Remove all boilerplate refs, manual state, `fetchAndSubscribe`, `scheduleRetry`, and the Supabase channel subscription
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3, 4.4_

- [x] 6. Rewrite hooks/useActiveInstance.ts as useQuery wrapper
  - Replace the entire hook body with a single `useQuery` call using `queryKeys.khatmah.activeInstance(khatmahId)`, `queryFn: () => Khatmah_Service.getActiveInstance(khatmahId)`, and `enabled: khatmahId !== ''`
  - Remove all boilerplate refs, manual state, `refresh` callback, `fetchAndSubscribe`, `scheduleRetry`, and the Supabase channel subscription
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.2, 5.3, 5.4_

- [x] 7. Rewrite hooks/useJuzProgress.ts as useQuery wrapper
  - Replace the entire hook body with a single `useQuery` call using `queryKeys.instance.juzProgress(instanceId, juzNum)`, `queryFn: () => Progress_Service.getProgress(instanceId, juzNum)`, and `enabled: instanceId !== ''`
  - Import `Progress_Service` from `@/lib/progress` (replacing the current `Khatmah_Service.getInstance` call)
  - Remove all boilerplate refs, manual state, and the Supabase channel subscription
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.1, 6.2, 6.3, 6.4_

- [x] 8. Rewrite hooks/useTotalJazah.ts as useQuery wrapper
  - Replace the entire hook body with a single `useQuery` call using `queryKeys.profile.totalJazah(userId ?? '')`, `queryFn: () => Reward_Service.getTotalJazah(userId!)`, and `enabled: userId != null`
  - Remove all boilerplate refs, manual state, and the Supabase channel subscription
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.1, 7.2_

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Create hooks/mutations/useUpdatePage.ts
  - Create `hooks/mutations/useUpdatePage.ts` with `useMutation` calling `Progress_Service.updatePage(instanceId, juzNum, page)`
  - In `onSuccess`, call `queryClient.invalidateQueries({ queryKey: queryKeys.instance.juzProgress(instanceId, juzNum) })`
  - _Requirements: 8.1, 8.2_

- [x] 11. Create hooks/mutations/useFinishJuz.ts
  - Create `hooks/mutations/useFinishJuz.ts` accepting `khatmahId` and `userId` params
  - `mutationFn` receives `{ instanceId, juzNum }` and calls `Progress_Service.finishJuz(instanceId, juzNum)`
  - In `onSuccess`, invalidate `queryKeys.khatmah.activeInstance(khatmahId)`, `queryKeys.instance.juzProgress(instanceId, juzNum)`, and `queryKeys.profile.totalJazah(userId)`
  - _Requirements: 8.1, 8.3_

  - [ ]* 11.1 Write property test for multi-target invalidation (useFinishJuz)
    - **Property 3: Multi-target mutations invalidate all expected cache keys**
    - After `useFinishJuz` succeeds, assert both `activeInstance` and `totalJazah` keys are invalidated
    - Create `hooks/mutations/__tests__/invalidation.test.ts`
    - **Validates: Requirements 8.3**

- [x] 12. Create hooks/mutations/useMarkHelpRequested.ts
  - Create `hooks/mutations/useMarkHelpRequested.ts` accepting `khatmahId`
  - `mutationFn` receives `{ instanceId, juzNum }` and calls `Assignment_Service.markHelpRequested(instanceId, juzNum)`
  - In `onSuccess`, invalidate `queryKeys.khatmah.activeInstance(khatmahId)`
  - _Requirements: 8.1, 8.4_

  - [ ]* 12.1 Write property test for single-target invalidation (useMarkHelpRequested)
    - **Property 2: Single-target mutation invalidates its cache key**
    - After `useMarkHelpRequested` succeeds, assert `activeInstance` key is marked stale
    - Add to `hooks/mutations/__tests__/invalidation.test.ts`
    - **Validates: Requirements 8.4, 8.5, 8.6, 8.7, 8.8**

  - [ ]* 12.2 Write property test for mutation failure leaving cache unchanged
    - **Property 4: Mutation failure leaves cache unchanged**
    - When the service rejects, assert `isError === true` and the pre-mutation cache value is unmodified
    - Create `hooks/mutations/__tests__/errorHandling.test.ts`
    - **Validates: Requirement 8.10**

- [x] 13. Create hooks/mutations/useDistributeAutomatic.ts
  - Create `hooks/mutations/useDistributeAutomatic.ts` accepting `khatmahId`
  - `mutationFn` receives `{ instanceId, mode }` and calls `Assignment_Service.distributeAutomatic(instanceId, mode)`
  - In `onSuccess`, invalidate `queryKeys.khatmah.activeInstance(khatmahId)`
  - _Requirements: 8.1, 8.5_

- [x] 14. Create hooks/mutations/useAssignManual.ts
  - Create `hooks/mutations/useAssignManual.ts` accepting `khatmahId`
  - `mutationFn` receives `{ instanceId, juzNum, userId, userFullName }` and calls `Assignment_Service.assignManual(...)`
  - In `onSuccess`, invalidate `queryKeys.khatmah.activeInstance(khatmahId)`
  - _Requirements: 8.1, 8.6_

- [x] 15. Create hooks/mutations/useAdoptJuz.ts
  - Create `hooks/mutations/useAdoptJuz.ts` accepting `khatmahId`
  - `mutationFn` receives `{ instanceId, juzNum, adopterId, adopterFullName }` and calls `Assignment_Service.adoptJuz(...)`
  - In `onSuccess`, invalidate `queryKeys.khatmah.activeInstance(khatmahId)`
  - _Requirements: 8.1, 8.8_

- [x] 16. Create hooks/mutations/useReassignJuz.ts
  - Create `hooks/mutations/useReassignJuz.ts` accepting `khatmahId`
  - `mutationFn` receives `{ instanceId, juzNum, newUserId, newUserFullName }` and calls `Assignment_Service.reassignJuz(...)`
  - In `onSuccess`, invalidate `queryKeys.khatmah.activeInstance(khatmahId)`
  - _Requirements: 8.1, 8.7_

- [x] 17. Create hooks/mutations/useTriggerCycleReset.ts
  - Create `hooks/mutations/useTriggerCycleReset.ts` accepting `khatmahId` and `userId`
  - `mutationFn` calls `Khatmah_Service.triggerCycleReset(khatmahId)`
  - In `onSuccess`, invalidate both `queryKeys.khatmah.activeInstance(khatmahId)` and `queryKeys.khatmahs.list(userId)`
  - _Requirements: 8.1, 8.9_

  - [ ]* 17.1 Write property test for multi-target invalidation (useTriggerCycleReset)
    - **Property 3: Multi-target mutations invalidate all expected cache keys**
    - After `useTriggerCycleReset` succeeds, assert both `activeInstance` and `khatmahs.list` keys are invalidated
    - Add to `hooks/mutations/__tests__/invalidation.test.ts`
    - **Validates: Requirements 8.9**

- [x] 18. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Migrate app/(app)/khatmah/[id]/index.tsx to new hooks
  - Replace `useKhatmah(id)` destructuring: use `data: khatmah, isLoading: khatmahLoading, isError: khatmahError`
  - Replace `useActiveInstance(id)` destructuring: use `data: instance, isLoading: instanceLoading`
  - Remove the `useFocusEffect` block that called `refresh()`
  - Remove the `ReconnectBanner` import and usage (no more `reconnecting` state)
  - Replace `handleDistributeAutomatic`: instantiate `useDistributeAutomatic(id)` and call `distributeAutomatic.mutate({ instanceId: instance.id, mode: 'random' })`; remove manual `setDistributing` state
  - Replace `handleCycleReset`: instantiate `useTriggerCycleReset(id, currentUserId)` and call `triggerCycleReset.mutate()`; remove manual `setResetting` state
  - Replace `handleCantRead`: instantiate `useMarkHelpRequested(id)` and call `markHelpRequested.mutate({ instanceId: instance.id, juzNum })`; remove manual `setActionLoading` for this action
  - Replace `handleAdopt`: instantiate `useAdoptJuz(id)` and call `adoptJuz.mutate({ instanceId, juzNum, adopterId, adopterFullName })`
  - Replace `handleReassignConfirm`: instantiate `useReassignJuz(id)` and call `reassignJuz.mutate({ instanceId, juzNum, newUserId, newUserFullName })`
  - Replace `handleSelfAssign`: instantiate `useAssignManual(id)` and call `assignManual.mutate({ instanceId, juzNum, userId, userFullName })`
  - Remove all direct imports from `@/lib/assignment` and `@/lib/khatmah` that are now covered by mutation hooks
  - _Requirements: 2.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_

- [x] 20. Migrate app/(app)/khatmah/[id]/juz/[num].tsx to new hooks
  - Replace `useActiveInstance(id)` destructuring: use `data: instance, isLoading: instanceLoading`
  - Replace `useJuzProgress(instance?.id ?? '', safeJuzNum)` destructuring: use `data: currentPage, isLoading: pageLoading`
  - Replace `handleUpdatePage`: instantiate `useUpdatePage(instance?.id ?? '', safeJuzNum)` and call `updatePage.mutate(page)` with `onError` handling `ValidationError` for the range error message; remove manual `setUpdatingPage` state
  - Replace `handleFinishJuz`: instantiate `useFinishJuz(id, currentUserId ?? '')` and call `finishJuz.mutate({ instanceId: instance.id, juzNum: safeJuzNum })`; remove manual `setFinishing` state
  - Replace `handleMarkHelpRequested`: instantiate `useMarkHelpRequested(id)` and call `markHelpRequested.mutate({ instanceId: instance.id, juzNum: safeJuzNum })`; remove manual `setMarkingHelp` state
  - Remove direct imports of `updatePage`, `finishJuz`, `markHelpRequested` from `@/lib/progress` and `@/lib/assignment`
  - _Requirements: 2.5, 5.1, 6.1, 6.2, 6.3, 6.4, 8.2, 8.3, 8.4_

  - [ ]* 20.1 Write property test for mutation → invalidation → refetch round trip
    - **Property 5: Mutation → invalidation → refetch round trip (KhatmahInstance)**
    - After `useUpdatePage` succeeds, assert `useJuzProgress` refetches and returns the written page value
    - Create `hooks/mutations/__tests__/roundTrip.test.ts`
    - **Validates: Requirements 9.1**

- [x] 21. Delete dead code: remove Supabase channel subscription code from old hooks
  - Confirm `hooks/useKhatmahList.ts`, `hooks/useKhatmah.ts`, `hooks/useActiveInstance.ts`, `hooks/useJuzProgress.ts`, and `hooks/useTotalJazah.ts` no longer contain any `supabase.channel`, `supabase.removeChannel`, `mountedRef`, `retryCountRef`, `retryTimerRef`, `fetchAndSubscribe`, or `scheduleRetry` references
  - Remove the `supabase` import from each hook file if it is no longer used
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 22. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Mutation hooks live in `hooks/mutations/` — create the directory as part of task 10
- The `useSession` hook is explicitly excluded from this migration and must not be changed
- `Progress_Service.getProgress` is the correct function for `useJuzProgress` (replaces the current `Khatmah_Service.getInstance` call)
- Property tests require `fast-check` (install in task 2.1); unit tests use the existing test setup
