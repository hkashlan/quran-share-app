// App-level domain types — mapped from DB rows by service layer functions.
// Import DB row types from types/supabase.ts; use these types in hooks and screens.

// ── Union type aliases ────────────────────────────────────────────────────────

export type LifecycleType   = 'one_time' | 'recurring'
export type ResetCalendar   = 'gregorian' | 'islamic'
export type AssignmentMode  = 'manual' | 'automatic'
export type KhatmahStatus   = 'active' | 'completed'
export type InstanceStatus  = 'active' | 'completed'
export type SupportedLocale = 'ar' | 'en'
export type OAuthProvider   = 'google' | 'apple'

// ── Domain types ─────────────────────────────────────────────────────────────

/** Configuration-only — maps to the `khatmahs` table. */
export interface Khatmah {
  id: string
  name: string
  creatorId: string
  lifecycleType: LifecycleType
  resetCalendar: ResetCalendar | null
  autoRenewal: boolean
  assignmentMode: AssignmentMode
  jazahMultiplier: number
  invitationUuid: string
  status: KhatmahStatus
  createdAt: string
}

/** Per-cycle data — maps to the `khatmah_instances` table. */
export interface KhatmahInstance {
  id: string
  khatmahId: string
  cycleNumber: number
  startedAt: string
  endedAt: string | null
  status: InstanceStatus
  /** juz number (1–30) → primary assignee userId */
  juzAssignments: Record<number, string | null>
  /** juz number (1–30) → display name frozen at assignment time */
  juzUserFullNames: Record<number, string | null>
  /** juz number (1–30) → completion flag */
  juzCompleted: Record<number, boolean>
  /** juz number (1–30) → plan-b adopter userId */
  juzPlanbUsers: Record<number, string | null>
  /** juz number (1–30) → plan-b display name frozen at adoption time */
  juzPlanbUserFullNames: Record<number, string | null>
  /** juz number (1–30) → help-requested flag */
  juzHelpRequested: Record<number, boolean>
  /** juz number (1–30) → current page (0 = not started) */
  juzCurrentPage: Record<number, number>
}

/** Maps to the `profiles` table. */
export interface UserProfile {
  id: string
  displayName: string | null
  avatarUrl: string | null
  language: SupportedLocale
  /** Lifetime Jazah count — read from profiles.jazah_total */
  jazahTotal: number
}

// ── Service result types ──────────────────────────────────────────────────────

export interface AuthResult {
  session: { accessToken: string; expiresAt: number } | null
  error: AuthError | null
}

export interface AuthError {
  message: string
  code?: string
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AlreadyMemberError extends Error {
  constructor() {
    super('User is already a member of this Khatmah')
    this.name = 'AlreadyMemberError'
  }
}
