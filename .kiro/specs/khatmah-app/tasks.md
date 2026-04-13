# Implementation Plan: Khatmah App

## Overview

Incremental implementation of the Khatmah App — a React Native + Expo mobile app backed by self-hosted Supabase. Tasks are ordered so each step builds on the previous: infrastructure first, then data layer, then service modules, then screens, then real-time and notifications.

## Tasks

- [ ] 1. Project scaffolding and infrastructure
  - Initialize Expo project with TypeScript (`npx create-expo-app --template`)
  - Configure `tsconfig.json` with `strict: true`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`
  - Create the folder structure: `app/`, `components/ui/`, `components/khatmah/`, `hooks/`, `lib/`, `theme/`, `styles/`, `i18n/locales/`, `types/`, `supabase/migrations/`, `scripts/`
  - Add `supabase/docker-compose.yml` for local Supabase development
  - Add `scripts/generate-types.sh` and register `"generate-types"` npm script in `package.json`
  - _Requirements: 10.2, 10.4, 10.5_

- [ ] 2. Theme, styles, and i18n foundation
  - [ ] 2.1 Implement theme tokens and ThemeProvider
    - Create `theme/colors.ts`, `theme/typography.ts`, `theme/spacing.ts`, `theme/shadows.ts`, `theme/index.ts`
    - Create `theme/ThemeProvider.tsx` with `useTheme` hook
    - Create `styles/layout.ts` and `styles/typography.ts`
    - _Requirements: 10.2_

  - [ ] 2.2 Implement i18n setup and RTL helpers
    - Install `i18next` and `react-i18next`
    - Create `i18n/index.ts` with i18next initialization (default locale `'ar'`, fallback `'en'`)
    - Create `i18n/rtl.ts` with `RTL_LANGUAGES` set and `isRTLLanguage` function
    - Create `i18n/locales/ar.json` and `i18n/locales/en.json` with all user-visible strings (auth, dashboard, khatmah, juz, notifications)
    - Create `hooks/useLocale.ts` returning `{ locale, isRTL }`
    - _Requirements: 10.2_

  - [ ]* 2.3 Write property test for RTL language detection (Property 10)
    - **Property 10: RTL wrapper applies correct direction for any language**
    - Generate arbitrary language codes; assert `isRTLLanguage` returns `true` iff code is in the RTL set
    - **Validates: Requirements — RTL-aware component wrapper design**

  - [ ]* 2.4 Write property test for i18n key coverage (Property 11)
    - **Property 11: i18n lookup returns non-empty string for all keys in all supported locales**
    - For each key in `en.json`, assert `t(key, { lng: locale })` returns a non-empty, non-undefined string for `'ar'` and `'en'`
    - **Validates: Requirements — Multi-language support design**

- [ ] 3. RTL-aware UI primitive wrappers
  - [ ] 3.1 Implement KView, KText, KTextInput, KScrollView, KSafeAreaView
    - Create `components/ui/KView.tsx`, `KText.tsx`, `KTextInput.tsx`, `KScrollView.tsx`, `KSafeAreaView.tsx`
    - Each wrapper reads `isRTL` from `useLocale` and applies correct `direction` / `textAlign` / `writingDirection`
    - Create `components/ui/index.ts` re-exporting all wrappers
    - _Requirements: 10.2_

  - [ ]* 3.2 Write unit tests for RTL component wrappers
    - Verify RTL styles applied for `'ar'`, LTR styles for `'en'` on `KText`, `KView`, `KTextInput`
    - _Requirements: 10.2_

- [ ] 4. Database schema migrations
  - [ ] 4.1 Create migration for `profiles`, `khatmahs`, `khatmah_participants`, and `khatmah_instances` tables
    - Write `supabase/migrations/001_initial_schema.sql` expanding all 30 Juz' columns explicitly for `khatmah_instances` (user_id, user_full_name, completed, planb_user_id, planb_user_full_name, help_requested, current_page per Juz')
    - Include `profiles` table with `jazah_total INTEGER NOT NULL DEFAULT 0` and `language TEXT NOT NULL DEFAULT 'ar'`
    - Include `khatmahs` table with all config columns and `invitation_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid()`
    - Include `khatmah_participants` table with composite PK
    - _Requirements: 10.1, 10.3_

  - [ ] 4.2 Create migration for Row-Level Security policies
    - Write `supabase/migrations/002_rls_policies.sql`
    - Participants can only read `khatmah_instances` for Khatmahs they belong to (via `khatmah_participants`)
    - Only Creators can update `khatmahs` config columns
    - Users can only update their own `profiles` row
    - _Requirements: 10.3_

  - [ ] 4.3 Create `supabase/seed.sql` with sample data for local development
    - Seed at least one Khatmah with participants and an active instance
    - _Requirements: 10.4_

- [ ] 5. Supabase client and generated types
  - Create `lib/supabase.ts` — typed singleton `createClient<Database>` using `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - Run `npm run generate-types` to produce `types/supabase.ts`
  - Create `types/khatmah.ts` with all app-level domain types: `Khatmah`, `KhatmahInstance`, `UserProfile`, and all union type aliases
  - _Requirements: 10.3_

- [ ] 6. Auth_Service and authentication screens
  - [ ] 6.1 Implement Auth_Service (`lib/auth.ts`)
    - Implement `signUpWithEmail`, `signInWithEmail`, `signInWithOAuth` (google, apple), `signOut`, `getSession`
    - Surface `AuthApiError` with `user_already_exists` code for duplicate email
    - Client-side email format validation before Supabase call
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 6.2 Implement `app/(auth)/sign-up.tsx` and `app/(auth)/sign-in.tsx` screens
    - Sign-up form: email + password fields with inline validation errors
    - Sign-in form: email/password + Google/Apple OAuth buttons
    - Use `KView`, `KText`, `KTextInput` throughout; all strings via `t()`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 6.3 Implement session lifecycle in root layout
    - Create `hooks/useSession.ts` wrapping `supabase.auth.getSession` and `onAuthStateChange`
    - In `app/(app)/_layout.tsx`: load session, apply locale from `profile.language`, call `I18nManager.forceRTL` if needed, redirect to sign-in on `SIGNED_OUT` event and clear local session data
    - _Requirements: 1.5, 1.6_

  - [ ]* 6.4 Write unit tests for Auth_Service validation
    - Test duplicate email returns correct error code
    - Test invalid email format is caught client-side without a network call
    - _Requirements: 1.3, 1.4_

- [ ] 7. User profile creation and Reward_Service
  - [ ] 7.1 Implement automatic profile creation on sign-up
    - Add Supabase trigger or `Auth_Service` post-sign-up call to insert a `profiles` row with `id = auth.users.id`
    - _Requirements: 2.1_

  - [ ] 7.2 Implement Reward_Service (`lib/reward.ts`)
    - `awardJazah(khatmahId, juzNum, userId)`: fetch `jazah_multiplier` from `khatmahs`, then `UPDATE profiles SET jazah_total = jazah_total + multiplier WHERE id = userId`
    - `getTotalJazah(userId)`: single row fetch of `profiles.jazah_total`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 7.3 Write property test for Jazah award equals multiplier (Property 1)
    - **Property 1: Jazah award equals multiplier**
    - Generate random multipliers (1–100) and completion events; assert `jazah_total` increments by exactly the multiplier value
    - **Validates: Requirements 4.1, 4.4**

  - [ ]* 7.4 Write unit tests for Reward_Service
    - Verify `jazah_total` increments by multiplier values 1, 2, 3, 10
    - _Requirements: 4.1, 4.4_

- [ ] 8. Khatmah_Service and creation flow
  - [ ] 8.1 Implement Khatmah_Service (`lib/khatmah.ts`)
    - `create`: insert into `khatmahs` with `creator_id`, default `jazah_multiplier = 1`, auto-generated `invitation_uuid`; also insert creator into `khatmah_participants` and create first `khatmah_instances` row
    - `getById`, `listForUser`, `updateConfig`, `markCompleted`, `getActiveInstance`, `getInstance`
    - `triggerCycleReset`: insert new `khatmah_instances` row with `cycle_number + 1`, all completion/progress fields reset to `false`/`0`
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 3.8, 3.9, 9.1, 9.4_

  - [ ] 8.2 Implement Khatmah creation screen (`app/(app)/khatmah/new.tsx`)
    - Form fields: name, lifecycle type, reset calendar (shown only for Recurring), auto-renewal toggle, assignment mode
    - On submit call `Khatmah_Service.create`; navigate to new Khatmah detail on success
    - _Requirements: 3.1, 3.2, 3.3, 3.6_

  - [ ]* 8.3 Write unit tests for Khatmah_Service lifecycle logic
    - Test One-Time Khatmah marks completed when all 30 Juz' done
    - Test Recurring + auto-renewal starts new cycle; Recurring + no auto-renewal marks completed
    - _Requirements: 3.7, 3.8, 3.9_

- [ ] 9. Assignment_Service
  - [ ] 9.1 Implement Assignment_Service (`lib/assignment.ts`)
    - `distributeAutomatic(instanceId, mode)`: fetch participants, distribute 30 Juz' using random or sequential round-robin; cap at one primary Juz' per participant when ≥ 30 participants; assign multiple Juz' per participant when < 30 participants; update `khatmah_instances` row with `juz_X_user_id` and `juz_X_user_full_name` for all 30 slots
    - `assignManual`, `markHelpRequested`, `adoptJuz`, `reassignJuz`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 9.2 Write property test for automatic distribution covers all 30 Juz' (Property 2)
    - **Property 2: Automatic distribution covers all 30 Juz'**
    - Generate participant lists (1–100 users); assert all 30 `juz_X_user_id` fields are non-null after distribution
    - **Validates: Requirements 5.4, 5.7**

  - [ ]* 9.3 Write property test for at-most-one primary Juz' per participant when ≥ 30 (Property 3)
    - **Property 3: Automatic distribution assigns at most one primary Juz' per participant when participants ≥ 30**
    - Generate participant lists (30–100 users); assert no user ID appears as primary assignee more than once
    - **Validates: Requirements 5.6**

  - [ ]* 9.4 Write unit tests for Assignment_Service distribution
    - Verify round-robin for participant counts 1, 15, 30, 31
    - _Requirements: 5.4, 5.6, 5.7_

- [ ] 10. Invitation_Service
  - [ ] 10.1 Implement Invitation_Service (`lib/invitation.ts`)
    - `getInviteUrl(khatmahId)`: read `invitation_uuid` from `khatmahs`, return `app.com/join/{uuid}`
    - `resolveInvite(uuid)`: query `khatmahs` by `invitation_uuid`; return the Khatmah or throw if not found
    - `joinKhatmah(uuid, userId)`: resolve invite, check `khatmah_participants` for existing row, insert if absent, return `AlreadyMemberError` without insert if already a member
    - _Requirements: 6.1, 6.2, 6.4, 6.6_

  - [ ] 10.2 Implement invitation landing screen (`app/(app)/join/[uuid].tsx`)
    - Display Khatmah name and Join button for authenticated users
    - Redirect unauthenticated users to sign-in, resume join flow on return
    - Show "already a member" message if applicable
    - _Requirements: 6.3, 6.4, 6.5, 6.6_

  - [ ]* 10.3 Write property test for invitation UUID maps to exactly one Khatmah (Property 5)
    - **Property 5: Invitation UUID maps to exactly one Khatmah**
    - Generate random UUIDs; assert `resolveInvite` returns at most one Khatmah and it matches the one the UUID was generated for
    - **Validates: Requirements 6.1, 6.2**

  - [ ]* 10.4 Write property test for no duplicate Khatmah membership (Property 6)
    - **Property 6: No duplicate Khatmah membership**
    - Generate repeated `joinKhatmah` calls for the same (khatmah_id, user_id) pair; assert `khatmah_participants` row count stays at 1
    - **Validates: Requirements 6.6**

  - [ ]* 10.5 Write unit tests for Invitation_Service
    - Test idempotency: second join call does not insert duplicate row
    - _Requirements: 6.6_

- [ ] 11. Progress_Service and Juz' page ranges
  - [ ] 11.1 Implement `lib/juzPages.ts` with `JUZ_PAGE_RANGES` for all 30 Juz'
    - Define `{ start, end }` for each Juz' (Juz' 1: pages 1–21, Juz' 30: pages 582–604, etc.)
    - _Requirements: 7.2, 7.4_

  - [ ] 11.2 Implement Progress_Service (`lib/progress.ts`)
    - `getProgress(instanceId, juzNum)`: read `juz_X_current_page` from `khatmah_instances`
    - `updatePage(instanceId, juzNum, page)`: validate page against `JUZ_PAGE_RANGES`; update `juz_X_current_page` if valid; return `ValidationError` without update if out of range
    - `finishJuz(instanceId, juzNum)`: set `juz_X_completed = true`, call `Reward_Service.awardJazah`, trigger notification
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 11.3 Write property test for page number validation (Property 4)
    - **Property 4: Page number validation rejects out-of-range values**
    - Generate random page numbers for each Juz'; assert out-of-range values are rejected and `current_page` remains unchanged
    - **Validates: Requirements 7.2, 7.4**

  - [ ]* 11.4 Write unit tests for Progress_Service
    - Verify boundary pages accepted and out-of-range pages rejected for each Juz'
    - _Requirements: 7.2, 7.4_

- [ ] 12. "I Can't Read" emergency system
  - [ ] 12.1 Wire `markHelpRequested`, `adoptJuz`, and `reassignJuz` into the Khatmah detail screen
    - Participant view: show "I Can't Read" toggle on assigned Juz'; call `Assignment_Service.markHelpRequested` on activation
    - Creator view: show alert listing `help_requested` Juz' numbers and participant names; "Adopt" button calls `Assignment_Service.adoptJuz`; in Manual mode, show reassign option calling `Assignment_Service.reassignJuz`
    - _Requirements: 8.1, 8.3, 8.4, 8.5_

  - [ ] 12.2 Implement Plan-B Jazah award logic
    - In `Progress_Service.finishJuz`: if `juz_X_planb_user_id` is set, call `Reward_Service.awardJazah` with the Plan-B User's ID; otherwise award to the primary assignee
    - _Requirements: 8.6_

  - [ ]* 12.3 Write property test for Jazah awarded to Plan-B User (Property 7)
    - **Property 7: Jazah awarded to Plan-B User, not original assignee**
    - Generate adoption + completion events; assert Plan-B User's `jazah_total` increments and original assignee's does not
    - **Validates: Requirements 8.6**

- [ ] 13. Checkpoint — core services complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Custom hooks and real-time subscriptions
  - [ ] 14.1 Implement `useKhatmahList`, `useKhatmah`, and `useActiveInstance` hooks
    - `useKhatmahList()`: call `Khatmah_Service.listForUser`; subscribe to `khatmahs` changes for the user
    - `useKhatmah(id)`: call `Khatmah_Service.getById`; subscribe to `khatmahs` row changes
    - `useActiveInstance(id)`: call `Khatmah_Service.getActiveInstance`; subscribe to `khatmah_instances` row changes scoped to the active instance ID — this is the real-time channel for Juz' completion propagation
    - Implement exponential backoff reconnect; show "reconnecting…" banner on subscription failure
    - _Requirements: 10.6_

  - [ ] 14.2 Implement `useJuzProgress` and `useTotalJazah` hooks
    - `useJuzProgress(instanceId, n)`: read `juz_X_current_page` from the active instance; update reactively via subscription
    - `useTotalJazah()`: call `Reward_Service.getTotalJazah` for the current user
    - _Requirements: 7.1, 4.5, 2.5_

- [ ] 15. Dashboard screen
  - [ ] 15.1 Implement `app/(app)/index.tsx` (Dashboard)
    - List all Khatmahs via `useKhatmahList`
    - Display lifetime completed Juz' count and total Jazah via `useTotalJazah`
    - For each active Juz' assignment, render a Quick Action button; tapping it calls `Progress_Service.finishJuz`
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 4.5_

- [ ] 16. Khatmah detail, settings, and Juz' screens
  - [ ] 16.1 Implement `app/(app)/khatmah/[id]/index.tsx` (Khatmah detail)
    - Show all 30 Juz' with assignee names, completion status, and help-requested indicators using `useActiveInstance`
    - Creator controls: trigger automatic distribution, manual assignment, cycle reset (with confirmation dialog)
    - _Requirements: 5.2, 5.3, 5.4, 8.3, 9.4, 9.5_

  - [ ] 16.2 Implement `app/(app)/khatmah/[id]/settings.tsx`
    - Display and edit Khatmah config: name, lifecycle, reset calendar, auto-renewal, assignment mode, Jazah Multiplier
    - Show invitation URL with copy/share button
    - _Requirements: 3.6, 4.3, 6.7_

  - [ ] 16.3 Implement `app/(app)/khatmah/[id]/juz/[num].tsx` (Juz' detail)
    - Display current page via `useJuzProgress`; page number input calls `Progress_Service.updatePage`
    - "Finish Juz'" button calls `Progress_Service.finishJuz`
    - "I Can't Read" toggle calls `Assignment_Service.markHelpRequested`
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 8.1_

- [ ] 17. Notification_Service and push notifications
  - [ ] 17.1 Implement Notification_Service (`lib/notification.ts`)
    - Register device push token with Supabase on login
    - `notifyJuzCompleted(khatmahId, participantName, juzNum)`: send in-app + push notification to all Khatmah participants
    - `notifyHelpRequested(khatmahId, participantName, juzNum)`: send notification to Creator
    - `notifyCycleReset(khatmahId, assignments)`: send per-participant notification with new Juz' assignment
    - _Requirements: 7.6, 8.2, 9.3_

  - [ ] 17.2 Create Supabase Edge Function for scheduled cycle resets
    - Write `supabase/functions/cycle-reset/index.ts`
    - Query all Recurring Khatmahs whose reset date has passed; call cycle reset logic; dispatch notifications via push gateway
    - Handle Islamic calendar via `intl-hijri` or equivalent; fall back to Gregorian on error
    - _Requirements: 3.4, 3.5, 9.1, 9.2, 9.3_

- [ ] 18. Cycle reset and auto-renewal wiring
  - [ ] 18.1 Implement cycle reset logic in Khatmah_Service
    - `triggerCycleReset`: insert new `khatmah_instances` row with `cycle_number + 1`; if auto-renewal enabled, copy `juz_X_user_id` and `juz_X_user_full_name` values from previous instance; all completion/progress fields start at `false`/`0`
    - If auto-renewal disabled, call `markCompleted` on the Khatmah
    - _Requirements: 3.7, 3.8, 9.1, 9.2_

  - [ ]* 18.2 Write property test for cycle reset clears all state (Property 8)
    - **Property 8: Cycle reset clears all completion and progress state**
    - Generate `khatmah_instances` with arbitrary completion/progress state; assert new instance after reset has all `juz_X_completed = false` and all `juz_X_current_page = 0`
    - **Validates: Requirements 9.1**

  - [ ]* 18.3 Write property test for auto-renewal preserves assignments (Property 9)
    - **Property 9: Auto-renewal preserves assignments across cycles**
    - Generate instances with auto-renewal enabled; assert new instance `juz_X_user_id` values match the previous instance's values
    - **Validates: Requirements 9.2, 3.7**

  - [ ]* 18.4 Write unit tests for cycle reset
    - Verify new `khatmah_instances` row has all completion flags false and all `current_page` fields at 0
    - _Requirements: 9.1_

- [ ] 19. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
