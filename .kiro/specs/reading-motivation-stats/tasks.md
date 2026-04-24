# Implementation Plan: Reading Motivation Stats

## Overview

Implement four motivational surfaces: yearly and lifetime Juz' counters on the Dashboard, and a progress bar + Juz' grid on the Khatmah detail screen. Backed by two new denormalized counter columns on `profiles`, two Supabase RPCs, and a yearly-reset Edge Function.

## Tasks

- [x] 1. Modify DB migration for reading stats columns and RPCs
  - Create `supabase/migrations/001_consolidated_schema.sql`
  - Add `total_juz_lifetime INTEGER NOT NULL DEFAULT 0`, `total_juz_last_year INTEGER NOT NULL DEFAULT 0`, and `last_year_reset_at TIMESTAMPTZ` columns to `profiles`
  - Create `increment_juz_counters(p_user_id UUID, p_amount INTEGER DEFAULT 1)` RPC — atomically increments both counters
  - Create `decrement_juz_counters(p_user_id UUID, p_amount INTEGER DEFAULT 1)` RPC — decrements both counters, floored at 0 via `GREATEST(0, ...)`
  - Create `reset_yearly_juz_counters()` RPC — resets `total_juz_last_year` to 0 and updates `last_year_reset_at` for all profiles where the reset is due
  - _Requirements: 1.1, 1.7, 1.8, 2.1_

- [x] 2. Update TypeScript types and query keys
  - [x] 2.1 Extend `UserProfile` in `types/khatmah.ts` with `totalJuzLifetime: number`, `totalJuzLastYear: number`, `lastYearResetAt: string | null`
    - _Requirements: 2.1, 1.1_
  - [x] 2.2 Add `readingStats` key to `profile` namespace in `lib/queryKeys.ts`
    - New entry: `readingStats: (userId: string) => ['profile', userId, 'readingStats'] as const`
    - _Requirements: 5.1, 5.2_

- [x] 3. Implement Stats_Service and useReadingStats hook
  - [x] 3.1 Create `lib/stats.ts` with `getReadingStats(userId: string): Promise<ReadingStats>`
    - Queries `profiles` selecting `total_juz_last_year` and `total_juz_lifetime` for the given user
    - Throws on Supabase error; returns `{ totalJuzLastYear, totalJuzLifetime }`
    - _Requirements: 1.3, 2.5, 5.1_
  - [x] 3.2 Create `hooks/useReadingStats.ts` exporting `useReadingStats()`
    - Uses `queryKeys.profile.readingStats(userId)`, calls `Stats_Service.getReadingStats`, `staleTime: 0`, `enabled: userId !== ''`
    - _Requirements: 1.3, 1.4, 1.5, 2.5, 2.6, 2.7, 5.1_

- [x] 4. Update Progress_Service to call counter RPCs
  - [x] 4.1 Update `finishJuz` in `lib/progress.ts` to call `increment_juz_counters` after `awardJazah`
    - Call is non-fatal: log warning on error, do not throw
    - Attribution mirrors Jazah logic: plan-b user takes priority over primary assignee
    - _Requirements: 1.2, 2.2, 5.3, 6.1, 6.2, 6.3_
  - [ ]* 4.2 Write property test for counter attribution in `finishJuz`
    - **Property 3: Attribution — plan-b takes priority**
    - **Validates: Requirements 6.1, 6.2**
  - [x] 4.3 Update `unfinishJuz` in `lib/progress.ts` to fetch the instance first, resolve the awardee, then call `decrement_juz_counters` after reverting the completion flag
    - Call is non-fatal: log warning on error, do not throw
    - _Requirements: 1.9, 1.10, 2.3, 2.4, 5.3_
  - [ ]* 4.4 Write property test for decrement floor in `unfinishJuz`
    - **Property 2: Decrement is floored at zero**
    - **Validates: Requirements 1.9, 1.10, 2.3, 2.4**

- [x] 5. Update mutation hooks to invalidate readingStats
  - [x] 5.1 Update `hooks/mutations/useFinishJuz.ts` — add `queryClient.invalidateQueries({ queryKey: queryKeys.profile.readingStats(userId) })` in `onSuccess`
    - _Requirements: 5.2_
  - [x] 5.2 Update `hooks/mutations/useUnfinishJuz.ts` — add `userId` parameter and invalidate `queryKeys.profile.readingStats(userId)` in `onSuccess`
    - _Requirements: 5.2_

- [x] 6. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 7. Add i18n keys for stats surfaces
  - Add `stats` namespace to `i18n/locales/en.json`: `readingStats`, `lastYearJuz`, `lifetimeJuz`, `cycleProgress`, `completedOf`, `missingAlert`, `allComplete`, `completed`, `missing`, `inProgress`
  - Add matching `stats` namespace to `i18n/locales/ar.json` with Arabic translations
  - _Requirements: 1.3, 2.5, 3.3, 4.4_

- [x] 8. Implement ReadingStatsCard component
  - [x] 8.1 Create `components/stats/ReadingStatsCard.tsx`
    - Props: `yearlyCount: number | null`, `lifetimeCount: number | null`, `isLoading: boolean`
    - Two stat badges side-by-side (yearly / lifetime)
    - Animated single-bar chart using `BarChart` from `react-native-gifted-charts` for the yearly count (single data point, `isAnimated`, `hideAxes`, `hideRules`)
    - Show `'—'` when value is null (error state); show loading placeholder while `isLoading`
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 2.5, 2.6, 2.7_
  - [ ]* 8.2 Write unit tests for ReadingStatsCard rendering states
    - Test: loading state shows placeholder, error state shows `'—'`, zero shows `'0'`
    - _Requirements: 1.4, 1.5, 1.6, 2.6, 2.7_

- [x] 9. Implement KhatmahProgressBar component
  - [x] 9.1 Create `components/khatmah/KhatmahProgressBar.tsx`
    - Props: `completedCount: number`, `totalCount?: number` (default 30)
    - Animated fill using `Animated.Value` + `Animated.timing` (600ms, `useNativeDriver: false`)
    - Track: `colors.border`, fill: `colors.primary` → `colors.success` at 100%
    - Label: `"{completedCount} / {totalCount}"` using `t('stats.completedOf', { completed, total })`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ]* 9.2 Write property test for progress bar ratio
    - **Property 4: Progress bar ratio is correct for any completion state**
    - **Validates: Requirements 3.1, 3.3, 3.4, 3.5**

- [x] 10. Implement CompletionDonut component
  - [x] 10.1 Create `components/khatmah/CompletionDonut.tsx`
    - Props: `completedCount: number`, `missingCount: number`, `inProgressCount: number`
    - Uses `PieChart` from `react-native-gifted-charts` with `donut`, `isAnimated`, `animationDuration={800}`, `radius={60}`, `innerRadius={40}`
    - Three segments: completed (`colors.success`), missing (`colors.error`), in-progress (`colors.textMuted`)
    - Center label shows percentage complete
    - _Requirements: 4.1, 4.2_

- [x] 11. Implement JuzGrid component
  - [x] 11.1 Create `components/khatmah/JuzGrid.tsx`
    - Props: `instance: KhatmahInstance`
    - 6-column `flexWrap` grid of 30 cells; each cell `width: '16.66%'`, `aspectRatio: 1`, `borderRadius: 4`, `margin: 2`
    - Cell status priority: `completed` (green `#4CAF50`) → `missing` (red `#F44336`, help-requested and not completed) → `unassigned` (light grey `#E0E0E0`) → `in_progress` (medium grey `#9E9E9E`)
    - Juz' number centered inside each cell
    - Missing count summary below grid using `t('stats.missingAlert', { count })` or `t('stats.allComplete')` when count is 0
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  - [ ]* 11.2 Write property test for JuzGrid cell color derivation
    - **Property 5: Juz' grid color matches instance status**
    - **Validates: Requirements 4.1, 4.2**
  - [ ]* 11.3 Write property test for missing count computation
    - **Property 6: Missing count matches instance data**
    - **Validates: Requirements 4.4, 4.6**

- [x] 12. Implement InstanceStatsPanel component
  - [x] 12.1 Create `components/khatmah/InstanceStatsPanel.tsx`
    - Props: `instance: KhatmahInstance`
    - Computes `completedCount`, `missingCount`, `inProgressCount` from instance data
    - Renders `KhatmahProgressBar`, `CompletionDonut`, and `JuzGrid` in a vertical layout
    - No new queries — derives all data from the already-fetched `instance` prop
    - _Requirements: 3.1, 3.6, 4.1, 4.5_

- [x] 13. Integrate stats components into screens
  - [x] 13.1 Update `app/(app)/index.tsx` (Dashboard) to use `useReadingStats` and render `ReadingStatsCard` above the Quick Actions section
    - Install `react-native-gifted-charts react-native-linear-gradient react-native-svg` via `npx expo install`
    - Pass `yearlyCount`, `lifetimeCount`, `isLoading` from `useReadingStats` result
    - _Requirements: 1.3, 1.4, 1.5, 2.5, 2.6_
  - [x] 13.2 Update `app/(app)/khatmah/[id]/index.tsx` (KhatmahDetail) to render `InstanceStatsPanel` in `ListHeader` after `KhatmahHeader`
    - Pass the already-fetched `instance` prop
    - _Requirements: 3.1, 3.6, 4.1, 4.5_

- [x] 14. Create yearly-reset Edge Function
  - Create `supabase/functions/yearly-reset/index.ts` following the same structure as `supabase/functions/cycle-reset/index.ts`
  - Calls `reset_yearly_juz_counters()` RPC
  - Idempotent — safe to run multiple times
  - _Requirements: 1.7, 1.8_

- [x] 15. Final checkpoint — Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- `react-native-gifted-charts` must be installed before implementing components in tasks 8 and 10
- Counter RPCs are non-fatal: a failure logs a warning but does not block Juz' completion or revert
- `InstanceStatsPanel` derives all data from the existing `useActiveInstance` query — no additional network requests on the detail screen
- Property tests validate universal correctness properties; unit tests validate specific rendering states
