# Design Document: Reading Motivation Stats

## Overview

This feature adds four motivational surfaces to the Khatmah app:

1. **Yearly Juz' counter** — how many Juz' the current user completed in the last year, shown on the Dashboard
2. **Lifetime Juz' counter** — all-time Juz' completions, shown on the Dashboard
3. **Khatmah progress bar** — X/30 completed Juz' in the active cycle, shown on KhatmahDetail
4. **Juz' grid** — 6×5 color-coded grid of all 30 Juz' by status, shown on KhatmahDetail

### Library Choice: `react-native-gifted-charts`

**`react-native-gifted-charts`** is the chosen charting library. It is the most feature-complete charting library for React Native, supporting Bar, Line, Area, Pie, Donut, Stacked Bar, Radar, and Population Pyramid charts with 2D/3D rendering, gradients, animations, and live data updates. It works with Expo out of the box (pure JS, no native modules), is actively maintained, and has the richest visual output of any RN chart library.

Install:
```bash
npx expo install react-native-gifted-charts react-native-linear-gradient react-native-svg
```

Charts used in this feature:
- **`BarChart`** — yearly Juz' count as an animated bar (single bar, styled as a progress indicator)
- **`PieChart` / `DonutChart`** — Khatmah instance completion donut on the detail screen
- **`ProgressBar`** (custom animated `View`) — horizontal bar above the Juz' list (gifted-charts does not have a standalone progress bar; we use RN `Animated.View` for this one component)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard Screen (app/(app)/index.tsx)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ReadingStatsCard                                        │   │
│  │  ├─ StatBadge: total_juz_last_year  (BarChart sparkline) │   │
│  │  └─ StatBadge: total_juz_lifetime   (numeric + label)    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  KhatmahDetail Screen (app/(app)/khatmah/[id]/index.tsx)        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  InstanceStatsPanel                                      │   │
│  │  ├─ KhatmahProgressBar  (Animated.View fill)             │   │
│  │  ├─ CompletionDonut     (PieChart donut from gifted)     │   │
│  │  └─ JuzGrid             (6×5 color-coded cells)          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  lib/progress.ts                                                │
│  finishJuz()   → mark completed + awardJazah + increment RPCs   │
│  unfinishJuz() → fetch instance + revert + decrement RPCs       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Supabase DB                                                    │
│  profiles.total_juz_lifetime   INT DEFAULT 0                    │
│  profiles.total_juz_last_year  INT DEFAULT 0                    │
│  profiles.last_year_reset_at   TIMESTAMPTZ                      │
│  RPC: increment_juz_counters(p_user_id, p_amount)               │
│  RPC: decrement_juz_counters(p_user_id, p_amount)               │
│  Edge Function: yearly-reset (scheduled annually)               │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **Denormalized counters**: Reading stats from a single profile row is O(1). Same pattern as existing `jazah_total` / `increment_jazah` RPC.
- **Progress bar and Juz' grid from existing instance data**: `KhatmahInstance` is already fetched by `useActiveInstance` — no new queries needed on the detail screen.
- **Attribution mirrors Jazah logic**: Plan-B user takes priority over primary assignee.
- **Annual reset via Edge Function**: Scheduled Supabase Edge Function resets `total_juz_last_year` once per year, idempotent via `last_year_reset_at`.

---

## DB Schema Changes (`supabase/migrations/004_reading_stats.sql`)

```sql
-- Add counter columns to profiles
ALTER TABLE profiles
  ADD COLUMN total_juz_lifetime  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN total_juz_last_year INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN last_year_reset_at  TIMESTAMPTZ;

-- Atomic increment: both counters +1
CREATE OR REPLACE FUNCTION public.increment_juz_counters(
  p_user_id UUID,
  p_amount  INTEGER DEFAULT 1
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    total_juz_lifetime  = total_juz_lifetime  + p_amount,
    total_juz_last_year = total_juz_last_year + p_amount
  WHERE id = p_user_id;
END;
$$;

-- Atomic decrement: both counters -1, floored at 0
CREATE OR REPLACE FUNCTION public.decrement_juz_counters(
  p_user_id UUID,
  p_amount  INTEGER DEFAULT 1
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    total_juz_lifetime  = GREATEST(0, total_juz_lifetime  - p_amount),
    total_juz_last_year = GREATEST(0, total_juz_last_year - p_amount)
  WHERE id = p_user_id;
END;
$$;

-- Annual reset RPC (called by yearly-reset Edge Function)
CREATE OR REPLACE FUNCTION public.reset_yearly_juz_counters()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    total_juz_last_year = 0,
    last_year_reset_at  = now()
  WHERE last_year_reset_at IS NULL
     OR last_year_reset_at < now() - INTERVAL '1 year';
END;
$$;
```

---

## Components

### 1. `ReadingStatsCard` (`components/stats/ReadingStatsCard.tsx`)

Displayed on the Dashboard above the Quick Actions section. Shows two stat badges side-by-side plus an animated single-bar chart for the yearly count.

```typescript
interface ReadingStatsCardProps {
  yearlyCount: number | null   // null = loading
  lifetimeCount: number | null // null = loading
  isLoading: boolean
}
```

**Visual layout:**
```
┌─────────────────────────────────────────┐
│  📖 Reading Stats                        │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │     12       │  │       87         │ │
│  │  This Year   │  │  Lifetime Juz'   │ │
│  └──────────────┘  └──────────────────┘ │
│  [████████░░░░░░░░░░] 12 / 30 this year │
└─────────────────────────────────────────┘
```

The horizontal bar under the badges uses `BarChart` from `react-native-gifted-charts` with a single data point, `isAnimated`, gradient fill (`frontColor` = primary color, `gradientColor` = lighter tint), and `hideAxes` / `hideRules` for a clean look.

---

### 2. `InstanceStatsPanel` (`components/khatmah/InstanceStatsPanel.tsx`)

Displayed in the KhatmahDetail `ListHeader`, between `KhatmahHeader` and the Juz' list. Contains the progress bar, donut chart, and Juz' grid.

```typescript
interface InstanceStatsPanelProps {
  instance: KhatmahInstance
}
```

**Visual layout:**
```
┌─────────────────────────────────────────┐
│  Cycle Progress                          │
│  [████████████████░░░░░░] 20 / 30       │
│                                          │
│     ┌──────────┐   Completed: 20        │
│     │  Donut   │   Missing:    3        │
│     │  67%     │   In Progress: 7       │
│     └──────────┘                        │
│                                          │
│  [1✓][2✓][3 ][4!][5✓][6 ]             │
│  [7✓][8 ][9✓][10!][11✓][12]           │
│  ... (30 cells total)                   │
│                                          │
│  ⚠ 3 Juz' need attention               │
└─────────────────────────────────────────┘
```

---

### 3. `KhatmahProgressBar` (`components/khatmah/KhatmahProgressBar.tsx`)

Animated horizontal progress bar using React Native `Animated.Value`. Animates fill width on mount and on `completedCount` change.

```typescript
interface KhatmahProgressBarProps {
  completedCount: number  // 0–30
  totalCount?: number     // defaults to 30
}
```

- Track: `colors.border`, height 10, borderRadius 5
- Fill: `colors.primary` → `colors.success` (green) when 100%
- Label: `"{completedCount} / {totalCount}"` right-aligned above bar
- Animation: `Animated.timing`, duration 600ms, `useNativeDriver: false`

---

### 4. `CompletionDonut` (`components/khatmah/CompletionDonut.tsx`)

Donut chart using `PieChart` from `react-native-gifted-charts` showing completed vs missing vs in-progress Juz'.

```typescript
interface CompletionDonutProps {
  completedCount: number
  missingCount: number
  inProgressCount: number
}
```

Three segments:
- Completed → `colors.success` (green)
- Missing/help-requested → `colors.error` (red)
- In-progress → `colors.textMuted` (grey)

Props: `donut`, `isAnimated`, `animationDuration={800}`, `radius={60}`, `innerRadius={40}`, center label shows percentage complete.

---

### 5. `JuzGrid` (`components/khatmah/JuzGrid.tsx`)

6-column flexWrap grid of 30 cells. Each cell is a colored square with the Juz' number.

```typescript
type JuzCellStatus = 'completed' | 'missing' | 'in_progress' | 'unassigned'

interface JuzGridProps {
  instance: KhatmahInstance
}
```

Cell status priority:
1. `completed` — `juzCompleted[n] === true` → green (`#4CAF50`)
2. `missing` — `juzHelpRequested[n] === true` AND not completed → red (`#F44336`)
3. `unassigned` — `juzAssignments[n] == null` AND not completed → light grey (`#E0E0E0`)
4. `in_progress` — assigned, not completed, no help requested → medium grey (`#9E9E9E`)

Each cell: `width: '16.66%'`, `aspectRatio: 1`, centered number text, `borderRadius: 4`, `margin: 2`.

Missing count summary below grid:
```typescript
const missingCount = Array.from({ length: 30 }, (_, i) => i + 1).filter(
  (n) => (instance.juzAssignments[n] == null || instance.juzHelpRequested[n] === true)
       && instance.juzCompleted[n] !== true
).length
```

---

## New Hook: `useReadingStats` (`hooks/useReadingStats.ts`)

```typescript
export interface ReadingStats {
  totalJuzLastYear: number
  totalJuzLifetime: number
}

export function useReadingStats(): UseQueryResult<ReadingStats> {
  const { session } = useSession()
  const userId = session?.user.id ?? ''
  return useQuery({
    queryKey: queryKeys.profile.readingStats(userId),
    queryFn: () => Stats_Service.getReadingStats(userId),
    enabled: userId !== '',
    staleTime: 0,  // always re-fetch on focus
  })
}
```

---

## New Service: `lib/stats.ts`

```typescript
import { supabase } from '@/lib/supabase'
import type { ReadingStats } from '@/hooks/useReadingStats'

export async function getReadingStats(userId: string): Promise<ReadingStats> {
  const { data, error } = await supabase
    .from('profiles')
    .select('total_juz_last_year, total_juz_lifetime')
    .eq('id', userId)
    .single()

  if (error != null) throw new Error(`Failed to fetch reading stats: ${error.message}`)

  return {
    totalJuzLastYear: data.total_juz_last_year,
    totalJuzLifetime: data.total_juz_lifetime,
  }
}
```

---

## Service Layer Changes

### `lib/progress.ts` — `finishJuz` addition

After `awardJazah`, call the increment RPC (non-fatal):

```typescript
if (awardeeId !== null) {
  await awardJazah(khatmahId, juzNum, awardeeId)

  // NEW: increment juz counters
  const { error: counterError } = await supabase.rpc('increment_juz_counters', {
    p_user_id: awardeeId, p_amount: 1,
  })
  if (counterError != null) {
    console.warn(`[finishJuz] counter increment failed: ${counterError.message}`)
  }
}
```

### `lib/progress.ts` — `unfinishJuz` update

Fetch instance first to resolve awardee, then decrement (non-fatal):

```typescript
export async function unfinishJuz(instanceId: string, juzNum: number): Promise<void> {
  const { data: instance, error: fetchError } = await supabase
    .from('khatmah_instances').select('*').eq('id', instanceId).single()
  if (fetchError != null) throw new Error(`Failed to fetch instance: ${fetchError.message}`)

  const planbUserId   = instance[`juz_${juzNum}_planb_user_id`]
  const primaryUserId = instance[`juz_${juzNum}_user_id`]
  const awardeeId = typeof planbUserId === 'string' ? planbUserId
    : typeof primaryUserId === 'string' ? primaryUserId : null

  // Revert completion flag
  const { error } = await supabase.from('khatmah_instances')
    .update({ [`juz_${juzNum}_completed`]: false }).eq('id', instanceId)
  if (error != null) throw new Error(`Failed to revert Juz' completion: ${error.message}`)

  // NEW: decrement counters (floored at 0 by RPC)
  if (awardeeId !== null) {
    const { error: counterError } = await supabase.rpc('decrement_juz_counters', {
      p_user_id: awardeeId, p_amount: 1,
    })
    if (counterError != null) {
      console.warn(`[unfinishJuz] counter decrement failed: ${counterError.message}`)
    }
  }
}
```

---

## Query Key Additions (`lib/queryKeys.ts`)

```typescript
profile: {
  totalJazah:   (userId: string) => ['profile', userId, 'totalJazah'] as const,
  readingStats: (userId: string) => ['profile', userId, 'readingStats'] as const,  // NEW
},
```

---

## Mutation Hook Updates

### `hooks/mutations/useFinishJuz.ts`

Add `readingStats` invalidation in `onSuccess`:
```typescript
void queryClient.invalidateQueries({ queryKey: queryKeys.profile.readingStats(userId) })
```

### `hooks/mutations/useUnfinishJuz.ts`

Add `userId` parameter and `readingStats` invalidation:
```typescript
export function useUnfinishJuz(khatmahId: string, userId: string) {
  // ...
  onSuccess: () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.khatmah.activeInstance(khatmahId) })
    void queryClient.invalidateQueries({ queryKey: queryKeys.profile.readingStats(userId) })
  }
}
```

---

## Screen Integration

### Dashboard (`app/(app)/index.tsx`)

```tsx
const { data: readingStats, isLoading: statsLoading } = useReadingStats()

// In ListHeader, above Quick Actions:
<ReadingStatsCard
  yearlyCount={readingStats?.totalJuzLastYear ?? null}
  lifetimeCount={readingStats?.totalJuzLifetime ?? null}
  isLoading={statsLoading}
/>
```

### KhatmahDetail (`app/(app)/khatmah/[id]/index.tsx`)

```tsx
// In ListHeader, after KhatmahHeader:
<InstanceStatsPanel instance={instance} />
```

`InstanceStatsPanel` derives all data from the already-fetched `instance` — no new queries.

---

## Annual Reset Edge Function (`supabase/functions/yearly-reset/index.ts`)

Follows the same structure as `supabase/functions/cycle-reset/index.ts`. Calls `reset_yearly_juz_counters()` RPC. Scheduled via Supabase Dashboard cron: `0 0 1 1 *` (January 1st, midnight UTC). Idempotent — safe to run multiple times.

---

## Type Updates (`types/khatmah.ts`)

```typescript
export interface UserProfile {
  id: string
  displayName: string | null
  avatarUrl: string | null
  language: SupportedLocale
  jazahTotal: number
  totalJuzLifetime: number   // NEW
  totalJuzLastYear: number   // NEW
  lastYearResetAt: string | null  // NEW
}
```

---

## i18n Keys

### `i18n/locales/en.json`
```json
"stats": {
  "readingStats": "Reading Stats",
  "lastYearJuz": "This Year",
  "lifetimeJuz": "Lifetime Juz'",
  "cycleProgress": "Cycle Progress",
  "completedOf": "{{completed}} / {{total}}",
  "missingAlert": "{{count}} Juz' need attention",
  "allComplete": "All Juz' complete!",
  "completed": "Completed",
  "missing": "Missing",
  "inProgress": "In Progress"
}
```

### `i18n/locales/ar.json`
```json
"stats": {
  "readingStats": "إحصائيات القراءة",
  "lastYearJuz": "هذا العام",
  "lifetimeJuz": "إجمالي الأجزاء",
  "cycleProgress": "تقدم الدورة",
  "completedOf": "{{completed}} / {{total}}",
  "missingAlert": "{{count}} أجزاء تحتاج اهتمام",
  "allComplete": "اكتملت جميع الأجزاء!",
  "completed": "مكتمل",
  "missing": "ناقص",
  "inProgress": "قيد القراءة"
}
```

---

## Correctness Properties

### Property 1: Increment atomically updates both counters
For any user, calling `increment_juz_counters(userId, 1)` increases both `total_juz_lifetime` and `total_juz_last_year` by exactly 1.
**Validates: Req 1.2, 2.2, 5.3**

### Property 2: Decrement is floored at zero
For any user, calling `decrement_juz_counters(userId, 1)` decreases each counter by 1 if > 0, or leaves it at 0.
**Validates: Req 1.9, 1.10, 2.3, 2.4**

### Property 3: Attribution — plan-b takes priority
For any Juz' with a plan-b user, `finishJuz` increments the plan-b user's counters and not the primary assignee's.
**Validates: Req 6.1, 6.2**

### Property 4: Progress bar ratio is correct for any completion state
For any `completedCount` in [0, 30], `KhatmahProgressBar` displays the correct label and proportional fill.
**Validates: Req 3.1, 3.3, 3.4, 3.5**

### Property 5: Juz' grid color matches instance status
For any `KhatmahInstance`, each cell color correctly reflects its derived status.
**Validates: Req 4.1, 4.2**

### Property 6: Missing count matches instance data
For any `KhatmahInstance`, the displayed missing count equals the computed count from instance data.
**Validates: Req 4.4, 4.6**

---

## Error Handling

| Scenario | Behavior |
|---|---|
| `getReadingStats` fails | `useReadingStats` returns error; `ReadingStatsCard` shows `'—'` |
| `increment_juz_counters` RPC fails | Non-fatal warning logged; Juz' completion still recorded |
| `decrement_juz_counters` RPC fails | Non-fatal warning logged; Juz' revert still recorded |
| `unfinishJuz` instance fetch fails | Fatal — throws, mutation fails, UI shows error alert |
| Counter goes below 0 | Prevented by `GREATEST(0, ...)` in RPC |
