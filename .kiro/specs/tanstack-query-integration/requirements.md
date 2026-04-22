# Requirements Document

## Introduction

This feature integrates TanStack Query (React Query) into the Khatmah app as the primary data-fetching and caching layer for all Supabase-backed data. The existing hooks (`useKhatmah`, `useKhatmahList`, `useActiveInstance`, `useJuzProgress`, `useTotalJazah`) currently manage their own loading state, error state, and retry logic manually — each duplicating the same `mountedRef`, `retryCountRef`, manual `loading`/`error` state, and `fetchAndSubscribe` + `scheduleRetry` pattern. TanStack Query replaces all of this boilerplate with a unified, declarative cache.

There is no real-time subscription layer in this integration. Data refreshes only when the current user performs a mutation: on success, `invalidateQueries` is called to refetch the affected data. The hooks are thin wrappers around `useQuery` and `useMutation` and return TanStack Query's native result shape (or a simple destructured subset). The `useSession` hook is explicitly excluded from this migration and remains as-is.

## Glossary

- **Query_Client**: The TanStack Query `QueryClient` instance that owns the in-memory cache and coordinates all queries and mutations. Created once at module level (outside the component tree) to prevent re-creation on re-renders.
- **Query_Provider**: The `QueryClientProvider` React component that makes the `Query_Client` available to the component tree.
- **Query_Key**: A serialisable `as const` tuple that uniquely identifies a cached query (e.g. `['khatmah', id] as const`).
- **Query**: A TanStack Query `useQuery` call that fetches and caches a single piece of server state.
- **Mutation**: A TanStack Query `useMutation` call that performs a write operation and triggers cache invalidation on success.
- **Stale_Time**: The duration after which cached data is considered stale and eligible for background refetch.
- **Cache_Invalidation**: The act of marking one or more cached queries as stale so they are refetched on next use, via `queryClient.invalidateQueries`.
- **Query_Key_Factory**: A centralised module (`lib/queryKeys.ts`) that exports typed `as const` tuple builders for every query in the app.
- **Khatmah_Service**: The existing `lib/khatmah.ts` module that performs Supabase queries for Khatmah and KhatmahInstance data.
- **Progress_Service**: The existing `lib/progress.ts` module that reads and writes per-Juz' reading progress.
- **Assignment_Service**: The existing `lib/assignment.ts` module that handles Juz' distribution and reassignment.
- **Reward_Service**: The existing `lib/reward.ts` module that computes and records Jazah totals.

## Requirements

### Requirement 1: Query Client Setup

**User Story:** As a developer, I want a single, correctly configured `QueryClient` available throughout the app, so that all screens share one cache and configuration.

#### Acceptance Criteria

1. THE Query_Client SHALL be created as a module-level singleton (outside the component tree) so that it is never re-created on re-renders.
2. THE Query_Provider SHALL wrap the root application layout (`app/_layout.tsx`) so that every screen in the app has access to the Query_Client.
3. THE Query_Client SHALL be configured with a default `Stale_Time` of 60 seconds for all queries.
4. THE Query_Client SHALL be configured with a default `gcTime` (garbage-collection time) of 5 minutes for all queries.
5. THE Query_Client SHALL be configured to retry failed queries a maximum of 2 times before surfacing an error.
6. THE Query_Key_Factory SHALL be defined in `lib/queryKeys.ts`, SHALL export typed key-builder functions for every query in the app, and SHALL use `as const` tuples to enable full TypeScript inference.

---

### Requirement 2: Boilerplate Removal

**User Story:** As a developer, I want all manual state-management boilerplate removed from the data-fetching hooks, so that the codebase is simpler and easier to maintain.

#### Acceptance Criteria

1. THE refactored hooks SHALL NOT contain `mountedRef`, `retryCountRef`, or `retryTimerRef` refs.
2. THE refactored hooks SHALL NOT contain manual `loading` or `error` state variables managed via `useState` — these SHALL be derived from the TanStack Query result.
3. THE refactored hooks SHALL NOT contain `fetchAndSubscribe` or `scheduleRetry` helper functions.
4. THE refactored hooks SHALL NOT contain any Supabase real-time channel subscriptions.
5. WHEN a screen currently uses `useFocusEffect` with a manual `refresh()` call, THE `useFocusEffect` block SHALL be removed; TanStack Query's `refetchOnMount` behaviour handles re-navigation refetches.

---

### Requirement 3: Khatmah List Query

**User Story:** As a participant, I want my list of Khatmahs to load from cache instantly on re-navigation and refresh in the background, so that the home screen feels fast.

#### Acceptance Criteria

1. WHEN the home screen mounts and a user session exists, THE Query SHALL fetch the user's Khatmah list via `Khatmah_Service.listForUser` and cache it under the key `['khatmahs', 'list', userId] as const`.
2. WHILE the Query is loading for the first time, THE home screen SHALL display a loading indicator.
3. IF the Query fails, THEN THE home screen SHALL display an error message with a retry affordance.
4. WHEN the user session is null, THE Query SHALL not execute and SHALL return an empty list.
5. WHEN the user navigates away from and back to the home screen, THE Query SHALL serve cached data immediately and trigger a background refetch if the data is stale.

---

### Requirement 4: Khatmah Detail Query

**User Story:** As a participant, I want the Khatmah detail screen to load instantly from cache when I navigate back to it, so that I don't see a loading spinner on every visit.

#### Acceptance Criteria

1. WHEN the Khatmah detail screen mounts with a valid `khatmahId`, THE Query SHALL fetch the Khatmah record via `Khatmah_Service.getById` and cache it under the key `['khatmah', khatmahId] as const`.
2. WHILE the Query is loading for the first time, THE Khatmah detail screen SHALL display a loading indicator.
3. IF the Query fails, THEN THE Khatmah detail screen SHALL display an error message.
4. WHEN the Khatmah detail screen regains focus, THE Query SHALL trigger a background refetch if the data is stale, without showing a loading spinner over existing data.

---

### Requirement 5: Active Instance Query

**User Story:** As a participant, I want Juz' assignment and completion state to load from cache when I open the Khatmah detail screen, so that the screen feels instant on re-navigation.

#### Acceptance Criteria

1. WHEN the Khatmah detail screen mounts with a valid `khatmahId`, THE Query SHALL fetch the active `KhatmahInstance` via `Khatmah_Service.getActiveInstance` and cache it under the key `['khatmah', khatmahId, 'activeInstance'] as const`.
2. WHILE the Query is loading for the first time, THE Khatmah detail screen SHALL display a loading indicator.
3. IF the Query fails, THEN THE Khatmah detail screen SHALL display an error message.
4. WHEN the Khatmah detail screen regains focus, THE Query SHALL trigger a background refetch if the data is stale.

---

### Requirement 6: Juz' Progress Query

**User Story:** As an assigned participant, I want the current page I'm on to be loaded from cache when I open the Juz' detail screen, so that I don't lose my place.

#### Acceptance Criteria

1. WHEN the Juz' detail screen mounts with a valid `instanceId` and `juzNum`, THE Query SHALL fetch the current page via `Progress_Service.getProgress` and cache it under the key `['instance', instanceId, 'juzProgress', juzNum] as const`.
2. WHILE the Query is loading for the first time, THE Juz' detail screen SHALL display a loading indicator.
3. IF the Query fails, THEN THE Juz' detail screen SHALL display an error message.
4. WHEN `instanceId` is an empty string, THE Query SHALL not execute.

---

### Requirement 7: Total Jazah Query

**User Story:** As a participant, I want my Jazah total to update after I complete a Juz', so that I can see my reward without manually refreshing.

#### Acceptance Criteria

1. WHEN a screen that displays the Jazah total mounts and a user session exists, THE Query SHALL fetch the total via `Reward_Service.getTotalJazah` and cache it under the key `['profile', userId, 'totalJazah'] as const`.
2. WHEN the user session is null, THE Query SHALL not execute.

---

### Requirement 8: Write Mutations

**User Story:** As a participant or creator, I want all write operations wrapped in `useMutation` hooks, so that loading state, error handling, and cache invalidation are managed consistently.

#### Acceptance Criteria

1. THE app SHALL expose a `useMutation` hook for each write operation: `updatePage`, `finishJuz`, `markHelpRequested`, `distributeAutomatic`, `triggerCycleReset`, `assignManual`, `adoptJuz`, and `reassignJuz`.
2. THE Mutation for `updatePage` SHALL call `Progress_Service.updatePage` and on success SHALL invalidate the `['instance', instanceId, 'juzProgress', juzNum]` cache entry.
3. THE Mutation for `finishJuz` SHALL call `Progress_Service.finishJuz` and on success SHALL invalidate both the `['khatmah', khatmahId, 'activeInstance']` and `['profile', userId, 'totalJazah']` cache entries.
4. THE Mutation for `markHelpRequested` SHALL call `Assignment_Service.markHelpRequested` and on success SHALL invalidate the `['khatmah', khatmahId, 'activeInstance']` cache entry.
5. THE Mutation for `distributeAutomatic` SHALL call `Assignment_Service.distributeAutomatic` and on success SHALL invalidate the `['khatmah', khatmahId, 'activeInstance']` cache entry.
6. THE Mutation for `assignManual` SHALL call `Assignment_Service.assignManual` and on success SHALL invalidate the `['khatmah', khatmahId, 'activeInstance']` cache entry.
7. THE Mutation for `reassignJuz` SHALL call `Assignment_Service.reassignJuz` and on success SHALL invalidate the `['khatmah', khatmahId, 'activeInstance']` cache entry.
8. THE Mutation for `adoptJuz` SHALL call `Assignment_Service.adoptJuz` and on success SHALL invalidate the `['khatmah', khatmahId, 'activeInstance']` cache entry.
9. THE Mutation for `triggerCycleReset` SHALL call `Khatmah_Service.triggerCycleReset` and on success SHALL invalidate both the `['khatmah', khatmahId, 'activeInstance']` and `['khatmahs', 'list', userId]` cache entries.
10. IF a Mutation fails, THEN THE Mutation SHALL surface the error to the calling component without modifying the cache.

---

### Requirement 9: Round-Trip Data Integrity

**User Story:** As a developer, I want to be confident that data written through a Mutation is correctly reflected when the same Query re-fetches, so that the cache never shows inconsistent state.

#### Acceptance Criteria

1. FOR ALL write operations that modify a `KhatmahInstance`, the subsequent Query refetch SHALL return a `KhatmahInstance` whose fields reflect the written values.
2. FOR ALL write operations that modify a `Khatmah`, the subsequent Query refetch SHALL return a `Khatmah` whose fields reflect the written values.
3. THE Query_Key_Factory SHALL produce unique, non-colliding keys such that invalidating one query does not unintentionally invalidate an unrelated query.
