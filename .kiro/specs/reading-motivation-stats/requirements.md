# Requirements Document

## Introduction

This feature adds reading motivation and statistics to the Khatmah app. Users currently lack visibility into their personal reading history and progress, which reduces long-term engagement. The feature introduces four motivational surfaces:

1. **Juz' read in the last year** — a yearly count of Juz' completed by the current user across all Khatmahs
2. **Lifetime reading stats** — total Juz' completed and total Khatmah cycles contributed to, all-time
3. **Current Khatmah instance progress bar** — a visual indicator of how many of the 30 Juz' have been completed in the active cycle
4. **Missing/not-reading Juz' panel** — a visual grid and statistics showing which Juz' are unassigned or have help-requested in the current instance

Yearly and lifetime Juz' counts are stored as denormalized counter fields directly on the `profiles` table and are incremented atomically each time a user finishes a Juz', rather than being computed by aggregating across `khatmah_instances` at query time.

Visual charting libraries (e.g. `react-native-gifted-charts` or `victory-native`) may be used where appropriate.

---

## Glossary

- **Stats_Service**: Client-side service responsible for reading and displaying reading statistics from Supabase
- **Counter_Service**: Server-side logic (within `lib/progress.ts` or a Supabase RPC function) responsible for atomically incrementing profile counter fields when a Juz' is finished
- **Dashboard_Screen**: The home screen (`app/(app)/index.tsx`) where lifetime and yearly stats are displayed
- **KhatmahDetail_Screen**: The Khatmah detail screen (`app/(app)/khatmah/[id]/index.tsx`) where instance-level stats are displayed
- **Progress_Bar**: A horizontal visual component showing the ratio of completed Juz' to 30 in the current instance
- **Juz_Grid**: A 6×5 visual grid of 30 cells, each representing one Juz', color-coded by status
- **Yearly_Counter**: The `total_juz_last_year` integer field on the `profiles` table, representing the count of Juz' the user has completed in the last calendar year
- **Lifetime_Counter**: The `total_juz_lifetime` integer field on the `profiles` table, representing the all-time count of Juz' the user has completed
- **Missing_Juz**: A Juz' in the active instance that is either unassigned (`juz_N_user_id IS NULL`) or has help requested (`juz_N_help_requested = true`) and is not yet completed
- **Khatmah_Instance**: One cycle row in the `khatmah_instances` table, representing a single round of a Khatmah

---

## Requirements

### Requirement 1: Yearly Juz' Counter on Profile

**User Story:** As a participant, I want to see how many Juz' I completed in the last year, so that I feel motivated by my annual reading achievement.

#### Acceptance Criteria

1. THE `profiles` table SHALL contain a `total_juz_last_year` integer field (defaulting to 0) representing the Yearly_Counter for each user.
2. WHEN a Juz' is marked as completed via the `useFinishJuz` mutation, THE Counter_Service SHALL increment the attributed user's `total_juz_last_year` by 1 using an atomic database operation.
3. THE Dashboard_Screen SHALL display the Yearly_Counter value read directly from the current user's profile row as a numeric value with a label identifying it as the last-year count.
4. WHILE the yearly count is loading, THE Dashboard_Screen SHALL display a loading placeholder in place of the numeric value.
5. IF the Stats_Service fails to fetch the profile data, THEN THE Dashboard_Screen SHALL display a dash ("—") in place of the numeric value.
6. IF the current user's `total_juz_last_year` is zero, THEN THE Dashboard_Screen SHALL display "0" as the yearly count.
7. THE `profiles` table SHALL contain a `last_year_reset_at` timestamp field recording when the Yearly_Counter was last reset, so that a yearly reset mechanism can determine which completions fall within the current year window.
8. WHEN the yearly reset period elapses, THE Counter_Service SHALL reset `total_juz_last_year` to 0 and update `last_year_reset_at` to the current timestamp for all affected profiles.
9. WHEN a Juz' completion is reverted on the attributed user's profile, THE Counter_Service SHALL decrement `total_juz_last_year` by 1 using an atomic database operation.
10. IF decrementing `total_juz_last_year` would result in a value below 0, THEN THE Counter_Service SHALL set `total_juz_last_year` to 0 instead.

---

### Requirement 2: Lifetime Juz' Counter on Profile

**User Story:** As a participant, I want to see my all-time reading statistics, so that I can appreciate my total contribution to Quran reading circles.

#### Acceptance Criteria

1. THE `profiles` table SHALL contain a `total_juz_lifetime` integer field (defaulting to 0) representing the Lifetime_Counter for each user.
2. WHEN a Juz' is marked as completed via the `useFinishJuz` mutation, THE Counter_Service SHALL increment the attributed user's `total_juz_lifetime` by 1 using an atomic database operation.
3. WHEN a Juz' completion is reverted on the attributed user's profile, THE Counter_Service SHALL decrement `total_juz_lifetime` by 1 using an atomic database operation.
4. IF decrementing `total_juz_lifetime` would result in a value below 0, THEN THE Counter_Service SHALL set `total_juz_lifetime` to 0 instead.
5. THE Dashboard_Screen SHALL display the Lifetime_Counter value read directly from the current user's profile row as a labeled numeric value.
6. WHILE lifetime stats are loading, THE Dashboard_Screen SHALL display a loading placeholder for the value.
7. IF the Stats_Service fails to fetch the profile data, THEN THE Dashboard_Screen SHALL display "—" for the lifetime count.

---

### Requirement 3: Current Khatmah Instance Progress Bar

**User Story:** As a participant, I want to see a progress bar for the current Khatmah cycle, so that I can quickly understand how close the group is to completing the full Quran.

#### Acceptance Criteria

1. WHEN the KhatmahDetail_Screen loads with an active instance, THE KhatmahDetail_Screen SHALL display a Progress_Bar showing the ratio of completed Juz' to 30.
2. THE Progress_Bar SHALL update in real time when a Juz' is marked as completed or reverted, without requiring a full screen reload.
3. THE Progress_Bar SHALL display the numeric count of completed Juz' (e.g. "12 / 30") alongside the visual bar.
4. WHEN all 30 Juz' are completed, THE Progress_Bar SHALL visually indicate full completion (100% fill).
5. WHEN zero Juz' are completed, THE Progress_Bar SHALL display an empty bar (0% fill).
6. THE Progress_Bar SHALL be visible above the Juz' list in the KhatmahDetail_Screen header area.

---

### Requirement 4: Missing / Not-Reading Juz' Panel

**User Story:** As a Khatmah creator or participant, I want to see which Juz' are unassigned or have help requested, so that I can take action to ensure all 30 Juz' are covered.

#### Acceptance Criteria

1. WHEN the KhatmahDetail_Screen loads with an active instance, THE KhatmahDetail_Screen SHALL display a Juz_Grid of 30 cells representing all Juz'.
2. THE Juz_Grid SHALL color-code each cell using at least three distinct states: completed (green), missing/help-requested (red/orange), and assigned-in-progress (neutral/grey).
3. THE Juz_Grid SHALL display the Juz' number inside each cell.
4. THE KhatmahDetail_Screen SHALL display a summary statistic showing the count of Missing_Juz (unassigned + help-requested, not yet completed) below or adjacent to the Juz_Grid.
5. THE Juz_Grid SHALL update in real time when instance data changes, without requiring a full screen reload.
6. IF all 30 Juz' are assigned and none have help requested, THEN THE KhatmahDetail_Screen SHALL display a count of zero missing Juz'.
7. WHERE the instance has no Missing_Juz, THE Juz_Grid SHALL display all cells in completed or in-progress states with no red/orange cells.

---

### Requirement 5: Stats Data Freshness

**User Story:** As a participant, I want my statistics to reflect recent activity, so that I trust the numbers I see are accurate.

#### Acceptance Criteria

1. THE Stats_Service SHALL re-fetch the current user's profile (including `total_juz_last_year` and `total_juz_lifetime`) whenever the Dashboard_Screen gains focus (navigated to or returned to).
2. WHEN a Juz' is marked as completed or reverted via the `useFinishJuz` or `useUnfinishJuz` mutations, THE Dashboard_Screen SHALL invalidate and re-fetch the profile stats query within 2 seconds of the mutation completing, so the updated counter values are reflected immediately.
3. THE Counter_Service SHALL increment or decrement both `total_juz_last_year` and `total_juz_lifetime` in the same atomic operation as the Juz' completion or revert, ensuring the profile counters are never out of sync with the actual completion state.

---

### Requirement 6: Stats Attribution

**User Story:** As a participant, I want my stats to correctly credit me whether I was the primary assignee or the plan-b reader, so that my contribution is always recognized.

#### Acceptance Criteria

1. WHEN a Juz' is marked as completed, THE Counter_Service SHALL increment the `total_juz_last_year` and `total_juz_lifetime` counters on the plan-b user's profile (`juz_N_planb_user_id`) when one is present, consistent with the existing Jazah award logic in `lib/progress.ts`.
2. IF no plan-b user is present for a completed Juz', THEN THE Counter_Service SHALL increment the counters on the primary assignee's profile (`juz_N_user_id`).
3. IF a completed Juz' has neither a primary assignee nor a plan-b user, THEN THE Counter_Service SHALL not increment any profile counter and SHALL exclude the completion from all personal stats.
