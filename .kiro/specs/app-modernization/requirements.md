# Requirements Document

## Introduction

This feature modernizes the Khatmah app's navigation, visual consistency, and user profile management. The changes introduce a bottom tab bar to replace the current stack-only navigation, a multi-theme system (Default, Dark, Quran) that persists across sessions, a centralized shared-style layer so every screen draws from the same design tokens, and a dedicated Settings/Profile screen where users can update their display name and other profile fields or sign out.

## Glossary

- **App**: The Khatmah React Native / Expo application.
- **Tab_Navigator**: The Expo Router bottom-tab navigator that hosts the Home tab and the Settings tab.
- **Home_Tab**: The tab that renders the existing Dashboard screen (Khatmah list, quick actions, stats).
- **Settings_Tab**: The tab that renders the Settings/Profile screen.
- **Settings_Screen**: The screen reachable via the Settings tab where users manage profile info, choose a theme, and sign out.
- **Theme_System**: The collection of color palettes, typography tokens, spacing tokens, and shadow tokens that drive the visual appearance of the App.
- **Theme**: A named variant of the Theme_System. Valid values: `default`, `dark`, `quran`.
- **ThemeProvider**: The React context provider that supplies the active Theme to all components.
- **Shared_Styles**: A set of reusable `StyleSheet` objects (layout helpers, card styles, typography presets) derived from the active Theme and consumed by all screens and components.
- **Profile**: The Supabase `profiles` row associated with the authenticated user, containing at minimum `full_name` and `language`.
- **Auth_Service**: The existing service layer in `lib/auth.ts` and `hooks/useSession.ts` responsible for session management and sign-out.
- **Theme_Persistence**: Storage of the user's chosen Theme name so it survives app restarts.

---

## Requirements

### Requirement 1: Bottom Tab Navigation

**User Story:** As a user, I want a persistent bottom tab bar so that I can switch between the home screen and settings without losing my place.

#### Acceptance Criteria

1. THE Tab_Navigator SHALL render a bottom tab bar containing exactly two tabs: Home_Tab and Settings_Tab.
2. WHEN the app launches and a valid session exists, THE Tab_Navigator SHALL display the Home_Tab as the initially selected tab.
3. WHEN the user taps the Home_Tab icon, THE Tab_Navigator SHALL navigate to the Dashboard screen without resetting its scroll position if it is already active.
4. WHEN the user taps the Settings_Tab icon, THE Tab_Navigator SHALL navigate to the Settings_Screen.
5. THE Tab_Navigator SHALL apply the active Theme's colors to the tab bar background, active icon tint, and inactive icon tint.
6. WHEN the user navigates into a nested stack screen (e.g., a Khatmah detail screen), THE Tab_Navigator SHALL keep the tab bar visible unless the screen explicitly opts out.

### Requirement 2: Theme System

**User Story:** As a user, I want to choose between a Default, Dark, and Quran theme so that the app looks the way I prefer.

#### Acceptance Criteria

1. THE Theme_System SHALL define three named palettes: `default` (light, green primary), `dark` (dark backgrounds, muted tones), and `quran` (warm parchment tones evoking a Quran aesthetic).
2. WHEN the user selects a Theme on the Settings_Screen, THE ThemeProvider SHALL apply the selected Theme to all screens and components immediately without requiring an app restart.
3. THE ThemeProvider SHALL expose the active Theme's `colors`, `typography`, `spacing`, and `shadows` tokens via the existing `useTheme()` hook so no call sites need to change.
4. WHEN the app launches, THE ThemeProvider SHALL restore the Theme that was last selected by the user.
5. IF no previously saved Theme exists, THEN THE ThemeProvider SHALL apply the `default` Theme.
6. THE Theme_Persistence SHALL store the selected Theme name using a local, on-device mechanism (e.g., `AsyncStorage`) that does not require a network call.
7. THE Theme_System SHALL ensure that all three palettes satisfy a minimum contrast ratio of 4.5:1 between text tokens and their corresponding background tokens.

### Requirement 3: Consistent Shared Styles

**User Story:** As a developer, I want a single shared-style layer so that every screen and component uses the same spacing, card, and typography patterns without duplicating style code.

#### Acceptance Criteria

1. THE Shared_Styles SHALL provide at minimum the following reusable style groups: `screen` (safe-area container), `card` (surface container with border and radius), `row` (horizontal flex layout), `sectionTitle` (bold heading text), and `mutedText` (secondary text).
2. THE Shared_Styles SHALL be derived from the active Theme tokens so that switching Themes automatically updates all shared styles.
3. WHEN a screen or component uses a Shared_Styles group, THE App SHALL render that element with the correct tokens for the currently active Theme.
4. THE Shared_Styles SHALL be accessible via a single import path (e.g., `useSharedStyles()` hook or equivalent) so screens do not need to import individual token files.
5. THE App SHALL migrate the Dashboard screen (`app/(app)/index.tsx`) to consume Shared_Styles for its card, row, and typography patterns, removing equivalent inline style definitions.

### Requirement 4: Settings / Profile Screen

**User Story:** As a user, I want a Settings screen where I can update my display name, choose a theme, and sign out so that I can manage my account and preferences in one place.

#### Acceptance Criteria

1. THE Settings_Screen SHALL display the authenticated user's current `full_name` in an editable text field.
2. WHEN the user edits the `full_name` field and confirms the change, THE Settings_Screen SHALL persist the updated value to the `profiles` table in Supabase.
3. IF the Supabase update fails, THEN THE Settings_Screen SHALL display an inline error message describing the failure without navigating away.
4. THE Settings_Screen SHALL display a theme selector that shows the three available Theme options (`default`, `dark`, `quran`) and highlights the currently active Theme.
5. WHEN the user selects a Theme option, THE Settings_Screen SHALL invoke the ThemeProvider to apply and persist the new Theme immediately.
6. THE Settings_Screen SHALL display a sign-out button.
7. WHEN the user taps the sign-out button, THE Settings_Screen SHALL call Auth_Service to sign the user out and navigate to the authentication flow.
8. THE Settings_Screen SHALL use Shared_Styles and Theme tokens for all layout and typography, with no hardcoded color or spacing values.
9. WHILE a profile update is in progress, THE Settings_Screen SHALL disable the confirm button and display a loading indicator.
