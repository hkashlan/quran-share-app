# Tasks: App Modernization

## Task List

- [x] 1. Define RNEUI theme palettes
  - [x] 1.1 Create `theme/rneui.ts` exporting `ThemeName` type and `themeMap` with `defaultTheme`, `darkTheme`, `quranTheme` objects using the color palette values from the design document
  - [x] 1.2 Add RNEUI module augmentation (declare `Colors` extension with `textMuted`, `border`; declare `Theme` extension with `typography`, `spacing`, `shadows`) in `theme/rneui.ts`

- [x] 2. Replace ThemeProvider with RNEUI-backed implementation
  - [x] 2.1 Rewrite `theme/ThemeProvider.tsx` to wrap `@rneui/themed`'s `ThemeProvider`, load persisted theme from `AsyncStorage` on mount, and expose `useThemeSwitcher()` context (themeName + setTheme)
  - [x] 2.2 Keep `useTheme()` export signature identical to current (returns `{ colors, typography, spacing, shadows }`) by mapping from RNEUI's `useTheme()` internally — no call-site changes required
  - [x] 2.3 Update `app/_layout.tsx` to import `ThemeProvider` from `@rneui/themed` wrapper (no structural change needed if re-export is preserved)

- [x] 3. Convert app layout to Tab navigator
  - [x] 3.1 Rewrite `app/(app)/_layout.tsx` to use Expo Router `Tabs` with two tabs: `index` (Home) and `settings` (Settings), preserving the locale/RTL `useEffect` logic
  - [x] 3.2 Style the tab bar using active theme tokens (`tabBarStyle.backgroundColor`, `tabBarActiveTintColor`, `tabBarInactiveTintColor`) via `useTheme()`
  - [x] 3.3 Declare nested stack screens (`khatmah/[id]`, `khatmah/[id]/juz/[num]`) as `href: null` tabs or via a nested Stack so the tab bar remains visible during deep navigation

- [x] 4. Implement `useSharedStyles` hook
  - [x] 4.1 Create `hooks/useSharedStyles.ts` returning a memoized `StyleSheet` with groups: `screen`, `card`, `row`, `sectionTitle`, `mutedText` derived from `useTheme()` tokens

- [x] 5. Build Settings screen
  - [x] 5.1 Create `app/(app)/settings.tsx` with Profile section: RNEUI `Input` pre-filled with `full_name` from Supabase profile, RNEUI `Button` (Save) that calls `supabase.from('profiles').update(...)` for the authenticated user
  - [x] 5.2 Add loading state: disable Save button and show `ActivityIndicator` while update is in progress (Requirement 4.9)
  - [x] 5.3 Add inline error display below the Save button when the Supabase update fails, without navigating away (Requirement 4.3)
  - [x] 5.4 Add Theme section: three RNEUI `ListItem.CheckBox` rows for `default`, `dark`, `quran`; highlight active theme; call `setTheme()` from `useThemeSwitcher()` on tap
  - [x] 5.5 Add Account section: RNEUI `Button` (Sign Out) that calls `auth.signOut()` then navigates to `/(auth)/sign-in`
  - [x] 5.6 Apply `useSharedStyles()` and `useTheme()` tokens throughout — no hardcoded colors or spacing values

- [x] 6. Migrate Dashboard screen to Shared Styles
  - [x] 6.1 Update `app/(app)/index.tsx` to import and use `useSharedStyles()` for `card`, `row`, `sectionTitle`, and `mutedText` patterns, removing equivalent inline style definitions from `makeStyles`, `makeCardStyles`, and `makeItemStyles`
  - [x] 6.2 Replace `import { useTheme } from '@/theme/ThemeProvider'` with the updated hook if the import path changed; verify no TypeScript errors

- [x] 7. Add i18n keys for new UI strings
  - [x] 7.1 Add translation keys to `i18n/locales/en.json` and `i18n/locales/ar.json` for: `nav.home`, `nav.settings`, `settings.profile`, `settings.theme`, `settings.signOut`, `settings.save`, `settings.themeDefault`, `settings.themeDark`, `settings.themeQuran`, `settings.updateSuccess`, `settings.updateError`

- [x] 8. Verify and clean up
  - [x] 8.1 Run `npm run typecheck` and resolve any TypeScript errors introduced by the RNEUI module augmentation or hook changes
  - [x] 8.2 Remove or deprecate `theme/ThemeProvider.tsx`'s old static context if it is no longer referenced anywhere
  - [x] 8.3 Confirm all existing screens that call `useTheme()` still compile and render correctly (KhatmahHeader, JuzRow, ReassignModal, sign-in/sign-up screens)
