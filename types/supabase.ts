// AUTO-GENERATED — do not edit manually.
// Run `npm run generate-types` after starting local Supabase to regenerate.
// This stub keeps the project compiling before the local instance is available.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          language: string
          jazah_total: number
          created_at: string | null
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          language?: string
          jazah_total?: number
          created_at?: string | null
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          language?: string
          jazah_total?: number
          created_at?: string | null
        }
      }
      khatmahs: {
        Row: {
          id: string
          name: string
          creator_id: string
          lifecycle_type: string
          reset_calendar: string | null
          auto_renewal: boolean
          assignment_mode: string
          jazah_multiplier: number
          invitation_uuid: string
          status: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          creator_id: string
          lifecycle_type: string
          reset_calendar?: string | null
          auto_renewal?: boolean
          assignment_mode: string
          jazah_multiplier?: number
          invitation_uuid?: string
          status?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          creator_id?: string
          lifecycle_type?: string
          reset_calendar?: string | null
          auto_renewal?: boolean
          assignment_mode?: string
          jazah_multiplier?: number
          invitation_uuid?: string
          status?: string
          created_at?: string | null
        }
      }
      khatmah_participants: {
        Row: {
          khatmah_id: string
          user_id: string
          joined_at: string | null
        }
        Insert: {
          khatmah_id: string
          user_id: string
          joined_at?: string | null
        }
        Update: {
          khatmah_id?: string
          user_id?: string
          joined_at?: string | null
        }
      }
      khatmah_instances: {
        Row: {
          id: string
          khatmah_id: string
          cycle_number: number
          started_at: string | null
          ended_at: string | null
          status: string
          // Juz' 1–30 fields abbreviated — regenerate from local Supabase for full types
          juz_1_user_id: string | null
          juz_1_user_full_name: string | null
          juz_1_completed: boolean
          juz_1_planb_user_id: string | null
          juz_1_planb_user_full_name: string | null
          juz_1_help_requested: boolean
          juz_1_current_page: number
        }
        Insert: {
          id?: string
          khatmah_id: string
          cycle_number?: number
          started_at?: string | null
          ended_at?: string | null
          status?: string
        }
        Update: {
          id?: string
          khatmah_id?: string
          cycle_number?: number
          started_at?: string | null
          ended_at?: string | null
          status?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_jazah: {
        Args: {
          p_user_id: string
          p_amount: number
        }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
  }
}
