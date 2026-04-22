# Requirements Document

## Introduction

This feature replaces the single "Reassign" button on each `JuzRow` with up to four context-aware action buttons. Visibility of each button is determined by the authenticated user's role (creator vs. participant) and the Juz' assignment state (unassigned / assigned-to-me / assigned-to-other / completed). The goal is to surface the right action to the right user at the right time, without requiring the row to be expanded.

## Glossary

- **JuzRow**: The UI component that renders a single Juz' entry in the Khatmah detail screen, including its assignee name, completion status, and action buttons.
- **KhatmahDetailScreen**: The parent screen that owns all mutation state and passes callbacks down to each `JuzRow`.
- **Creator**: The user who created the Khatmah circle; identified by `isCreator === true`.
- **Assigned_User**: The participant currently assigned to a specific Juz'; identified by `isMyJuz === true`.
- **deriveJuzActions**: A pure function that maps Juz' state and user role props to a `JuzActionSet` describing which buttons are visible.
- **JuzActionSet**: The output type of `deriveJuzActions`, containing four boolean flags: `showCompleted`, `showAssign`, `showReassign`, `showCantRead`.
- **Assignment_Service**: The service layer responsible for marking help-requested state on a Juz'.
- **Progress_Service**: The service layer responsible for marking a Juz' as finished.
- **ActionLoading**: A per-row boolean that is `true` while any mutation targeting that Juz' number is pending.

---

## Requirements

### Requirement 1: Button Visibility Derivation

**User Story:** As a Khatmah participant or creator, I want to see only the action buttons that are relevant to my role and the current Juz' state, so that I am never presented with actions I cannot or should not perform.

#### Acceptance Criteria

1. THE `deriveJuzActions` function SHALL accept `isCreator`, `isMyJuz`, `isUnassigned`, `isCompleted`, `isHelpRequested`, and `isManualMode` as boolean inputs and return a `JuzActionSet`.
2. WHEN `isCompleted` is `true`, THE `deriveJuzActions` function SHALL return `{ showCompleted: false, showAssign: false, showReassign: false, showCantRead: false }` regardless of all other inputs.
3. WHEN `isCompleted` is `false` AND `isUnassigned` is `false` AND (`isMyJuz` is `true` OR `isCreator` is `true`), THE `deriveJuzActions` function SHALL set `showCompleted` to `true`.
4. WHEN `isCompleted` is `false` AND `isCreator` is `true` AND `isManualMode` is `true` AND `isUnassigned` is `true`, THE `deriveJuzActions` function SHALL set `showAssign` to `true`.
5. WHEN `isCompleted` is `false` AND `isCreator` is `true` AND `isManualMode` is `true` AND `isUnassigned` is `false`, THE `deriveJuzActions` function SHALL set `showReassign` to `true`.
6. THE `deriveJuzActions` function SHALL never return a `JuzActionSet` where both `showAssign` and `showReassign` are `true`.
7. WHEN `isCompleted` is `false` AND `isMyJuz` is `true` AND `isHelpRequested` is `false`, THE `deriveJuzActions` function SHALL set `showCantRead` to `true`.
8. WHEN `isHelpRequested` is `true`, THE `deriveJuzActions` function SHALL set `showCantRead` to `false`.
9. WHEN `isUnassigned` is `true`, THE `deriveJuzActions` function SHALL set `showCompleted` to `false`.

---

### Requirement 2: JuzRow Rendering

**User Story:** As a user viewing the Khatmah detail screen, I want each Juz' row to render the correct buttons based on the derived action set, so that I can take the appropriate action with a single tap.

#### Acceptance Criteria

1. WHEN `actionLoading` is `true`, THE `JuzRow` SHALL display an `ActivityIndicator` in place of all action buttons.
2. WHEN `actions.showCompleted` is `true`, THE `JuzRow` SHALL render a Completed button using the `completedBtn` style and the `khatmah.completed` i18n key.
3. WHEN `actions.showAssign` is `true`, THE `JuzRow` SHALL render an Assign button using the `headerBtn` style and the `khatmah.assign` i18n key.
4. WHEN `actions.showReassign` is `true`, THE `JuzRow` SHALL render a Reassign button using the `headerBtnOutline` style and the `khatmah.reassign` i18n key.
5. WHEN `actions.showCantRead` is `true`, THE `JuzRow` SHALL render a Can't Read button using the `cantReadHeaderBtn` style and the `juz.cantRead` i18n key.
6. THE `JuzRow` SHALL set `accessibilityRole="button"` on every rendered action button.

---

### Requirement 3: Parent Screen Mutation Ownership

**User Story:** As a developer maintaining the codebase, I want all mutation hooks to be owned by `KhatmahDetailScreen` and passed down as callbacks, so that mutation state is managed in one place and consistent with the existing pattern for `onReassign`, `onAdopt`, and `onSelfAssign`.

#### Acceptance Criteria

1. THE `KhatmahDetailScreen` SHALL instantiate `useFinishJuz` and `useMarkHelpRequested` mutation hooks.
2. THE `KhatmahDetailScreen` SHALL pass an `onComplete` callback to each `JuzRow` that calls `finishJuz.mutate` with the correct `instanceId` and `juzNum`.
3. THE `KhatmahDetailScreen` SHALL pass an `onCantRead` callback to each `JuzRow` that calls `markHelpRequested.mutate` with the correct `instanceId` and `juzNum`.
4. WHEN `finishJuz.mutate` succeeds, THE `KhatmahDetailScreen` SHALL invalidate the active-instance query for the current Khatmah.
5. WHEN `markHelpRequested.mutate` succeeds, THE `KhatmahDetailScreen` SHALL invalidate the active-instance query for the current Khatmah.
6. IF a mutation call fails, THEN THE `KhatmahDetailScreen` SHALL display an `Alert` with the error message.

---

### Requirement 4: Per-Row Loading State

**User Story:** As a user, I want to see a loading indicator on the specific Juz' row I just acted on, so that I have immediate feedback that my action is being processed.

#### Acceptance Criteria

1. WHILE `finishJuz.isPending` is `true` AND `finishJuz.variables.juzNum` equals the row's `juzNum`, THE `KhatmahDetailScreen` SHALL pass `actionLoading={true}` to that `JuzRow`.
2. WHILE `markHelpRequested.isPending` is `true` AND `markHelpRequested.variables.juzNum` equals the row's `juzNum`, THE `KhatmahDetailScreen` SHALL pass `actionLoading={true}` to that `JuzRow`.
3. WHILE any of `adoptJuz`, `assignManual`, `reassignJuz`, `finishJuz`, or `markHelpRequested` is pending for a given `juzNum`, THE `KhatmahDetailScreen` SHALL pass `actionLoading={true}` to that `JuzRow`.

---

### Requirement 5: JuzRow Props Interface

**User Story:** As a developer integrating the updated `JuzRow`, I want a clear and typed props interface that includes the new callbacks, so that the component contract is explicit and type-safe.

#### Acceptance Criteria

1. THE `JuzRow` component SHALL accept an `onComplete` callback prop of type `() => void`.
2. THE `JuzRow` component SHALL accept an `onCantRead` callback prop of type `() => void`.
3. THE `JuzRow` component SHALL continue to accept `onReassign` as the single callback for both the Assign and Reassign button actions (both open the `ReassignPanel`).

---

### Requirement 6: i18n Keys

**User Story:** As a user in either English or Arabic locale, I want all new button labels to be correctly translated, so that the interface is fully localised.

#### Acceptance Criteria

1. THE `i18n` module SHALL provide the key `khatmah.assign` with the value `"Assign"` in the English locale.
2. THE `i18n` module SHALL provide the key `khatmah.assign` with the value `"تعيين"` in the Arabic locale.
3. THE `i18n` module SHALL provide the key `khatmah.completed` with the value `"Completed"` in the English locale.
4. THE `i18n` module SHALL provide the key `khatmah.completed` with the value `"مكتمل"` in the Arabic locale.
