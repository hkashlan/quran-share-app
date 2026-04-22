# Implementation Plan: Juz Action Buttons

## Overview

Replace the single "Reassign" button in `JuzRow` with up to four context-aware action buttons (`Completed`, `Assign`, `Reassign`, `Can't Read`). Visibility is derived by a pure `deriveJuzActions()` function. Mutation hooks are lifted to `KhatmahDetailScreen` and passed down as `onComplete`/`onCantRead` callbacks, consistent with the existing pattern for `onReassign`, `onAdopt`, and `onSelfAssign`.

## Tasks

- [x] 1. Add i18n keys for new button labels
  - Add `"assign": "Assign"` and `"completed": "Completed"` inside the `"khatmah"` object in `i18n/locales/en.json`
  - Add `"assign": "تعيين"` and `"completed": "مكتمل"` inside the `"khatmah"` object in `i18n/locales/ar.json`
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 2. Implement `deriveJuzActions()` and update `JuzRow`
  - [x] 2.1 Add `deriveJuzActions()` pure function and new styles to `JuzRow.tsx`
    - Define the `JuzActionSet` interface (`showCompleted`, `showAssign`, `showReassign`, `showCantRead`)
    - Implement `deriveJuzActions()` following the visibility table in the design
    - Add `completedBtn`, `completedBtnText`, `cantReadHeaderBtn`, `cantReadHeaderBtnText` to `makeStyles()`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

  - [ ]* 2.2 Write property tests for `deriveJuzActions()`
    - **Property 1: Completed juz hides all buttons** — for any input with `isCompleted === true`, all four flags are `false`
    - **Validates: Requirement 1.2**
    - **Property 2: Assign and Reassign are mutually exclusive** — result never has both `showAssign` and `showReassign` as `true`
    - **Validates: Requirement 1.6**
    - **Property 3: Assign button visibility** — `showAssign` is `true` iff `isCreator && isManualMode && isUnassigned` (when `!isCompleted`)
    - **Validates: Requirement 1.4**
    - **Property 4: Reassign button visibility** — `showReassign` is `true` iff `isCreator && isManualMode && !isUnassigned` (when `!isCompleted`)
    - **Validates: Requirement 1.5**
    - **Property 5: Can't Read requires the assigned user** — if `showCantRead` is `true` then `isMyJuz` must be `true`
    - **Validates: Requirement 1.7**
    - **Property 6: Can't Read hidden when help already requested** — if `isHelpRequested` is `true`, `showCantRead` is `false`
    - **Validates: Requirement 1.8**
    - **Property 7: Completed button requires an assigned juz** — if `showCompleted` is `true` then `isUnassigned` must be `false`
    - **Validates: Requirement 1.9**

  - [x] 2.3 Update `JuzRowProps` interface and remove internal mutation hooks
    - Add `onComplete: () => void` and `onCantRead: () => void` to the `JuzRowProps` interface
    - Remove `useFinishJuz` and `useMarkHelpRequested` hook calls from inside `JuzRow`
    - Remove the `handleFinishJuz` and `handleMarkHelpRequested` internal functions
    - Remove the "My Juz'" expanded section (the `isMyJuz && !isCompleted` block containing page tracking, Finish, and Can't Read buttons) — keep only the `useJuzProgress` / `useUpdatePage` page-tracking sub-section
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 2.4 Replace the inline action button block in `JuzRow` with derived actions
    - Call `deriveJuzActions()` with the row's props to get the `actions` object
    - Replace the existing single-button block with the four-button render pattern from the design
    - Render `ActivityIndicator` when `actionLoading` is `true`; otherwise render buttons conditionally based on `actions`
    - Set `accessibilityRole="button"` on every rendered action button
    - Use `khatmah.completed` i18n key for the Completed button (`completedBtn` style)
    - Use `khatmah.assign` i18n key for the Assign button (`headerBtn` style)
    - Use `khatmah.reassign` i18n key for the Reassign button (`headerBtnOutline` style)
    - Use `juz.cantRead` i18n key for the Can't Read button (`cantReadHeaderBtn` style)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Lift mutation hooks to `KhatmahDetailScreen` and wire callbacks
  - [x] 4.1 Add `useFinishJuz` and `useMarkHelpRequested` to `KhatmahDetailScreen`
    - Import `useFinishJuz` and `useMarkHelpRequested` at the top of `app/(app)/khatmah/[id]/index.tsx`
    - Instantiate `finishJuz = useFinishJuz(id ?? '', currentUserId ?? '')` and `markHelpRequested = useMarkHelpRequested(id ?? '')` alongside the existing mutation hooks
    - _Requirements: 3.1_

  - [x] 4.2 Implement `handleComplete` and `handleCantRead` callbacks
    - Add `handleComplete(juzNum: number)` using `useCallback`: guard on `instance`, call `finishJuz.mutate({ instanceId: instance.id, juzNum })`, show `Alert` on error
    - Add `handleCantRead(juzNum: number)` using `useCallback`: guard on `instance`, call `markHelpRequested.mutate({ instanceId: instance.id, juzNum })`, show `Alert` on error
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 4.3 Extend `isActionLoading` to include the two new mutations
    - Update the per-row `isActionLoading` computation to also check `finishJuz.isPending && finishJuz.variables?.juzNum === juzNum` and `markHelpRequested.isPending && markHelpRequested.variables?.juzNum === juzNum`
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 4.4 Write property test for per-row loading state
    - **Property 8: Per-row loading state covers all mutations** — for any `juzNum`, if any of the five mutations is pending with matching `variables.juzNum`, `actionLoading` passed to that row is `true`
    - **Validates: Requirement 4.3**

  - [x] 4.5 Pass `onComplete` and `onCantRead` to each `JuzRow` in the render list
    - Add `onComplete={() => { handleComplete(juzNum) }}` and `onCantRead={() => { handleCantRead(juzNum) }}` to the `<JuzRow>` call site
    - _Requirements: 3.2, 3.3_

- [x] 5. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- `deriveJuzActions()` can be exported from `JuzRow.tsx` or a co-located `juzActions.ts` utility — either works
- The page-tracking sub-section (`useJuzProgress` / `useUpdatePage`) inside `JuzRow` is out of scope and must not be changed
- `onReassign` continues to serve both the Assign and Reassign button actions (both open `ReassignPanel`)
