// AUTO-GENERATED — do not edit manually.
// Re-run `npm run generate-types` after any schema migration.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      khatmah_instances: {
        Row: {
          cycle_number: number
          ended_at: string | null
          id: string
          juz_1_completed: boolean
          juz_1_current_page: number
          juz_1_help_requested: boolean
          juz_1_planb_user_full_name: string | null
          juz_1_planb_user_id: string | null
          juz_1_user_full_name: string | null
          juz_1_user_id: string | null
          juz_10_completed: boolean
          juz_10_current_page: number
          juz_10_help_requested: boolean
          juz_10_planb_user_full_name: string | null
          juz_10_planb_user_id: string | null
          juz_10_user_full_name: string | null
          juz_10_user_id: string | null
          juz_11_completed: boolean
          juz_11_current_page: number
          juz_11_help_requested: boolean
          juz_11_planb_user_full_name: string | null
          juz_11_planb_user_id: string | null
          juz_11_user_full_name: string | null
          juz_11_user_id: string | null
          juz_12_completed: boolean
          juz_12_current_page: number
          juz_12_help_requested: boolean
          juz_12_planb_user_full_name: string | null
          juz_12_planb_user_id: string | null
          juz_12_user_full_name: string | null
          juz_12_user_id: string | null
          juz_13_completed: boolean
          juz_13_current_page: number
          juz_13_help_requested: boolean
          juz_13_planb_user_full_name: string | null
          juz_13_planb_user_id: string | null
          juz_13_user_full_name: string | null
          juz_13_user_id: string | null
          juz_14_completed: boolean
          juz_14_current_page: number
          juz_14_help_requested: boolean
          juz_14_planb_user_full_name: string | null
          juz_14_planb_user_id: string | null
          juz_14_user_full_name: string | null
          juz_14_user_id: string | null
          juz_15_completed: boolean
          juz_15_current_page: number
          juz_15_help_requested: boolean
          juz_15_planb_user_full_name: string | null
          juz_15_planb_user_id: string | null
          juz_15_user_full_name: string | null
          juz_15_user_id: string | null
          juz_16_completed: boolean
          juz_16_current_page: number
          juz_16_help_requested: boolean
          juz_16_planb_user_full_name: string | null
          juz_16_planb_user_id: string | null
          juz_16_user_full_name: string | null
          juz_16_user_id: string | null
          juz_17_completed: boolean
          juz_17_current_page: number
          juz_17_help_requested: boolean
          juz_17_planb_user_full_name: string | null
          juz_17_planb_user_id: string | null
          juz_17_user_full_name: string | null
          juz_17_user_id: string | null
          juz_18_completed: boolean
          juz_18_current_page: number
          juz_18_help_requested: boolean
          juz_18_planb_user_full_name: string | null
          juz_18_planb_user_id: string | null
          juz_18_user_full_name: string | null
          juz_18_user_id: string | null
          juz_19_completed: boolean
          juz_19_current_page: number
          juz_19_help_requested: boolean
          juz_19_planb_user_full_name: string | null
          juz_19_planb_user_id: string | null
          juz_19_user_full_name: string | null
          juz_19_user_id: string | null
          juz_2_completed: boolean
          juz_2_current_page: number
          juz_2_help_requested: boolean
          juz_2_planb_user_full_name: string | null
          juz_2_planb_user_id: string | null
          juz_2_user_full_name: string | null
          juz_2_user_id: string | null
          juz_20_completed: boolean
          juz_20_current_page: number
          juz_20_help_requested: boolean
          juz_20_planb_user_full_name: string | null
          juz_20_planb_user_id: string | null
          juz_20_user_full_name: string | null
          juz_20_user_id: string | null
          juz_21_completed: boolean
          juz_21_current_page: number
          juz_21_help_requested: boolean
          juz_21_planb_user_full_name: string | null
          juz_21_planb_user_id: string | null
          juz_21_user_full_name: string | null
          juz_21_user_id: string | null
          juz_22_completed: boolean
          juz_22_current_page: number
          juz_22_help_requested: boolean
          juz_22_planb_user_full_name: string | null
          juz_22_planb_user_id: string | null
          juz_22_user_full_name: string | null
          juz_22_user_id: string | null
          juz_23_completed: boolean
          juz_23_current_page: number
          juz_23_help_requested: boolean
          juz_23_planb_user_full_name: string | null
          juz_23_planb_user_id: string | null
          juz_23_user_full_name: string | null
          juz_23_user_id: string | null
          juz_24_completed: boolean
          juz_24_current_page: number
          juz_24_help_requested: boolean
          juz_24_planb_user_full_name: string | null
          juz_24_planb_user_id: string | null
          juz_24_user_full_name: string | null
          juz_24_user_id: string | null
          juz_25_completed: boolean
          juz_25_current_page: number
          juz_25_help_requested: boolean
          juz_25_planb_user_full_name: string | null
          juz_25_planb_user_id: string | null
          juz_25_user_full_name: string | null
          juz_25_user_id: string | null
          juz_26_completed: boolean
          juz_26_current_page: number
          juz_26_help_requested: boolean
          juz_26_planb_user_full_name: string | null
          juz_26_planb_user_id: string | null
          juz_26_user_full_name: string | null
          juz_26_user_id: string | null
          juz_27_completed: boolean
          juz_27_current_page: number
          juz_27_help_requested: boolean
          juz_27_planb_user_full_name: string | null
          juz_27_planb_user_id: string | null
          juz_27_user_full_name: string | null
          juz_27_user_id: string | null
          juz_28_completed: boolean
          juz_28_current_page: number
          juz_28_help_requested: boolean
          juz_28_planb_user_full_name: string | null
          juz_28_planb_user_id: string | null
          juz_28_user_full_name: string | null
          juz_28_user_id: string | null
          juz_29_completed: boolean
          juz_29_current_page: number
          juz_29_help_requested: boolean
          juz_29_planb_user_full_name: string | null
          juz_29_planb_user_id: string | null
          juz_29_user_full_name: string | null
          juz_29_user_id: string | null
          juz_3_completed: boolean
          juz_3_current_page: number
          juz_3_help_requested: boolean
          juz_3_planb_user_full_name: string | null
          juz_3_planb_user_id: string | null
          juz_3_user_full_name: string | null
          juz_3_user_id: string | null
          juz_30_completed: boolean
          juz_30_current_page: number
          juz_30_help_requested: boolean
          juz_30_planb_user_full_name: string | null
          juz_30_planb_user_id: string | null
          juz_30_user_full_name: string | null
          juz_30_user_id: string | null
          juz_4_completed: boolean
          juz_4_current_page: number
          juz_4_help_requested: boolean
          juz_4_planb_user_full_name: string | null
          juz_4_planb_user_id: string | null
          juz_4_user_full_name: string | null
          juz_4_user_id: string | null
          juz_5_completed: boolean
          juz_5_current_page: number
          juz_5_help_requested: boolean
          juz_5_planb_user_full_name: string | null
          juz_5_planb_user_id: string | null
          juz_5_user_full_name: string | null
          juz_5_user_id: string | null
          juz_6_completed: boolean
          juz_6_current_page: number
          juz_6_help_requested: boolean
          juz_6_planb_user_full_name: string | null
          juz_6_planb_user_id: string | null
          juz_6_user_full_name: string | null
          juz_6_user_id: string | null
          juz_7_completed: boolean
          juz_7_current_page: number
          juz_7_help_requested: boolean
          juz_7_planb_user_full_name: string | null
          juz_7_planb_user_id: string | null
          juz_7_user_full_name: string | null
          juz_7_user_id: string | null
          juz_8_completed: boolean
          juz_8_current_page: number
          juz_8_help_requested: boolean
          juz_8_planb_user_full_name: string | null
          juz_8_planb_user_id: string | null
          juz_8_user_full_name: string | null
          juz_8_user_id: string | null
          juz_9_completed: boolean
          juz_9_current_page: number
          juz_9_help_requested: boolean
          juz_9_planb_user_full_name: string | null
          juz_9_planb_user_id: string | null
          juz_9_user_full_name: string | null
          juz_9_user_id: string | null
          khatmah_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          cycle_number?: number
          ended_at?: string | null
          id?: string
          juz_1_completed?: boolean
          juz_1_current_page?: number
          juz_1_help_requested?: boolean
          juz_1_planb_user_full_name?: string | null
          juz_1_planb_user_id?: string | null
          juz_1_user_full_name?: string | null
          juz_1_user_id?: string | null
          juz_10_completed?: boolean
          juz_10_current_page?: number
          juz_10_help_requested?: boolean
          juz_10_planb_user_full_name?: string | null
          juz_10_planb_user_id?: string | null
          juz_10_user_full_name?: string | null
          juz_10_user_id?: string | null
          juz_11_completed?: boolean
          juz_11_current_page?: number
          juz_11_help_requested?: boolean
          juz_11_planb_user_full_name?: string | null
          juz_11_planb_user_id?: string | null
          juz_11_user_full_name?: string | null
          juz_11_user_id?: string | null
          juz_12_completed?: boolean
          juz_12_current_page?: number
          juz_12_help_requested?: boolean
          juz_12_planb_user_full_name?: string | null
          juz_12_planb_user_id?: string | null
          juz_12_user_full_name?: string | null
          juz_12_user_id?: string | null
          juz_13_completed?: boolean
          juz_13_current_page?: number
          juz_13_help_requested?: boolean
          juz_13_planb_user_full_name?: string | null
          juz_13_planb_user_id?: string | null
          juz_13_user_full_name?: string | null
          juz_13_user_id?: string | null
          juz_14_completed?: boolean
          juz_14_current_page?: number
          juz_14_help_requested?: boolean
          juz_14_planb_user_full_name?: string | null
          juz_14_planb_user_id?: string | null
          juz_14_user_full_name?: string | null
          juz_14_user_id?: string | null
          juz_15_completed?: boolean
          juz_15_current_page?: number
          juz_15_help_requested?: boolean
          juz_15_planb_user_full_name?: string | null
          juz_15_planb_user_id?: string | null
          juz_15_user_full_name?: string | null
          juz_15_user_id?: string | null
          juz_16_completed?: boolean
          juz_16_current_page?: number
          juz_16_help_requested?: boolean
          juz_16_planb_user_full_name?: string | null
          juz_16_planb_user_id?: string | null
          juz_16_user_full_name?: string | null
          juz_16_user_id?: string | null
          juz_17_completed?: boolean
          juz_17_current_page?: number
          juz_17_help_requested?: boolean
          juz_17_planb_user_full_name?: string | null
          juz_17_planb_user_id?: string | null
          juz_17_user_full_name?: string | null
          juz_17_user_id?: string | null
          juz_18_completed?: boolean
          juz_18_current_page?: number
          juz_18_help_requested?: boolean
          juz_18_planb_user_full_name?: string | null
          juz_18_planb_user_id?: string | null
          juz_18_user_full_name?: string | null
          juz_18_user_id?: string | null
          juz_19_completed?: boolean
          juz_19_current_page?: number
          juz_19_help_requested?: boolean
          juz_19_planb_user_full_name?: string | null
          juz_19_planb_user_id?: string | null
          juz_19_user_full_name?: string | null
          juz_19_user_id?: string | null
          juz_2_completed?: boolean
          juz_2_current_page?: number
          juz_2_help_requested?: boolean
          juz_2_planb_user_full_name?: string | null
          juz_2_planb_user_id?: string | null
          juz_2_user_full_name?: string | null
          juz_2_user_id?: string | null
          juz_20_completed?: boolean
          juz_20_current_page?: number
          juz_20_help_requested?: boolean
          juz_20_planb_user_full_name?: string | null
          juz_20_planb_user_id?: string | null
          juz_20_user_full_name?: string | null
          juz_20_user_id?: string | null
          juz_21_completed?: boolean
          juz_21_current_page?: number
          juz_21_help_requested?: boolean
          juz_21_planb_user_full_name?: string | null
          juz_21_planb_user_id?: string | null
          juz_21_user_full_name?: string | null
          juz_21_user_id?: string | null
          juz_22_completed?: boolean
          juz_22_current_page?: number
          juz_22_help_requested?: boolean
          juz_22_planb_user_full_name?: string | null
          juz_22_planb_user_id?: string | null
          juz_22_user_full_name?: string | null
          juz_22_user_id?: string | null
          juz_23_completed?: boolean
          juz_23_current_page?: number
          juz_23_help_requested?: boolean
          juz_23_planb_user_full_name?: string | null
          juz_23_planb_user_id?: string | null
          juz_23_user_full_name?: string | null
          juz_23_user_id?: string | null
          juz_24_completed?: boolean
          juz_24_current_page?: number
          juz_24_help_requested?: boolean
          juz_24_planb_user_full_name?: string | null
          juz_24_planb_user_id?: string | null
          juz_24_user_full_name?: string | null
          juz_24_user_id?: string | null
          juz_25_completed?: boolean
          juz_25_current_page?: number
          juz_25_help_requested?: boolean
          juz_25_planb_user_full_name?: string | null
          juz_25_planb_user_id?: string | null
          juz_25_user_full_name?: string | null
          juz_25_user_id?: string | null
          juz_26_completed?: boolean
          juz_26_current_page?: number
          juz_26_help_requested?: boolean
          juz_26_planb_user_full_name?: string | null
          juz_26_planb_user_id?: string | null
          juz_26_user_full_name?: string | null
          juz_26_user_id?: string | null
          juz_27_completed?: boolean
          juz_27_current_page?: number
          juz_27_help_requested?: boolean
          juz_27_planb_user_full_name?: string | null
          juz_27_planb_user_id?: string | null
          juz_27_user_full_name?: string | null
          juz_27_user_id?: string | null
          juz_28_completed?: boolean
          juz_28_current_page?: number
          juz_28_help_requested?: boolean
          juz_28_planb_user_full_name?: string | null
          juz_28_planb_user_id?: string | null
          juz_28_user_full_name?: string | null
          juz_28_user_id?: string | null
          juz_29_completed?: boolean
          juz_29_current_page?: number
          juz_29_help_requested?: boolean
          juz_29_planb_user_full_name?: string | null
          juz_29_planb_user_id?: string | null
          juz_29_user_full_name?: string | null
          juz_29_user_id?: string | null
          juz_3_completed?: boolean
          juz_3_current_page?: number
          juz_3_help_requested?: boolean
          juz_3_planb_user_full_name?: string | null
          juz_3_planb_user_id?: string | null
          juz_3_user_full_name?: string | null
          juz_3_user_id?: string | null
          juz_30_completed?: boolean
          juz_30_current_page?: number
          juz_30_help_requested?: boolean
          juz_30_planb_user_full_name?: string | null
          juz_30_planb_user_id?: string | null
          juz_30_user_full_name?: string | null
          juz_30_user_id?: string | null
          juz_4_completed?: boolean
          juz_4_current_page?: number
          juz_4_help_requested?: boolean
          juz_4_planb_user_full_name?: string | null
          juz_4_planb_user_id?: string | null
          juz_4_user_full_name?: string | null
          juz_4_user_id?: string | null
          juz_5_completed?: boolean
          juz_5_current_page?: number
          juz_5_help_requested?: boolean
          juz_5_planb_user_full_name?: string | null
          juz_5_planb_user_id?: string | null
          juz_5_user_full_name?: string | null
          juz_5_user_id?: string | null
          juz_6_completed?: boolean
          juz_6_current_page?: number
          juz_6_help_requested?: boolean
          juz_6_planb_user_full_name?: string | null
          juz_6_planb_user_id?: string | null
          juz_6_user_full_name?: string | null
          juz_6_user_id?: string | null
          juz_7_completed?: boolean
          juz_7_current_page?: number
          juz_7_help_requested?: boolean
          juz_7_planb_user_full_name?: string | null
          juz_7_planb_user_id?: string | null
          juz_7_user_full_name?: string | null
          juz_7_user_id?: string | null
          juz_8_completed?: boolean
          juz_8_current_page?: number
          juz_8_help_requested?: boolean
          juz_8_planb_user_full_name?: string | null
          juz_8_planb_user_id?: string | null
          juz_8_user_full_name?: string | null
          juz_8_user_id?: string | null
          juz_9_completed?: boolean
          juz_9_current_page?: number
          juz_9_help_requested?: boolean
          juz_9_planb_user_full_name?: string | null
          juz_9_planb_user_id?: string | null
          juz_9_user_full_name?: string | null
          juz_9_user_id?: string | null
          khatmah_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          cycle_number?: number
          ended_at?: string | null
          id?: string
          juz_1_completed?: boolean
          juz_1_current_page?: number
          juz_1_help_requested?: boolean
          juz_1_planb_user_full_name?: string | null
          juz_1_planb_user_id?: string | null
          juz_1_user_full_name?: string | null
          juz_1_user_id?: string | null
          juz_10_completed?: boolean
          juz_10_current_page?: number
          juz_10_help_requested?: boolean
          juz_10_planb_user_full_name?: string | null
          juz_10_planb_user_id?: string | null
          juz_10_user_full_name?: string | null
          juz_10_user_id?: string | null
          juz_11_completed?: boolean
          juz_11_current_page?: number
          juz_11_help_requested?: boolean
          juz_11_planb_user_full_name?: string | null
          juz_11_planb_user_id?: string | null
          juz_11_user_full_name?: string | null
          juz_11_user_id?: string | null
          juz_12_completed?: boolean
          juz_12_current_page?: number
          juz_12_help_requested?: boolean
          juz_12_planb_user_full_name?: string | null
          juz_12_planb_user_id?: string | null
          juz_12_user_full_name?: string | null
          juz_12_user_id?: string | null
          juz_13_completed?: boolean
          juz_13_current_page?: number
          juz_13_help_requested?: boolean
          juz_13_planb_user_full_name?: string | null
          juz_13_planb_user_id?: string | null
          juz_13_user_full_name?: string | null
          juz_13_user_id?: string | null
          juz_14_completed?: boolean
          juz_14_current_page?: number
          juz_14_help_requested?: boolean
          juz_14_planb_user_full_name?: string | null
          juz_14_planb_user_id?: string | null
          juz_14_user_full_name?: string | null
          juz_14_user_id?: string | null
          juz_15_completed?: boolean
          juz_15_current_page?: number
          juz_15_help_requested?: boolean
          juz_15_planb_user_full_name?: string | null
          juz_15_planb_user_id?: string | null
          juz_15_user_full_name?: string | null
          juz_15_user_id?: string | null
          juz_16_completed?: boolean
          juz_16_current_page?: number
          juz_16_help_requested?: boolean
          juz_16_planb_user_full_name?: string | null
          juz_16_planb_user_id?: string | null
          juz_16_user_full_name?: string | null
          juz_16_user_id?: string | null
          juz_17_completed?: boolean
          juz_17_current_page?: number
          juz_17_help_requested?: boolean
          juz_17_planb_user_full_name?: string | null
          juz_17_planb_user_id?: string | null
          juz_17_user_full_name?: string | null
          juz_17_user_id?: string | null
          juz_18_completed?: boolean
          juz_18_current_page?: number
          juz_18_help_requested?: boolean
          juz_18_planb_user_full_name?: string | null
          juz_18_planb_user_id?: string | null
          juz_18_user_full_name?: string | null
          juz_18_user_id?: string | null
          juz_19_completed?: boolean
          juz_19_current_page?: number
          juz_19_help_requested?: boolean
          juz_19_planb_user_full_name?: string | null
          juz_19_planb_user_id?: string | null
          juz_19_user_full_name?: string | null
          juz_19_user_id?: string | null
          juz_2_completed?: boolean
          juz_2_current_page?: number
          juz_2_help_requested?: boolean
          juz_2_planb_user_full_name?: string | null
          juz_2_planb_user_id?: string | null
          juz_2_user_full_name?: string | null
          juz_2_user_id?: string | null
          juz_20_completed?: boolean
          juz_20_current_page?: number
          juz_20_help_requested?: boolean
          juz_20_planb_user_full_name?: string | null
          juz_20_planb_user_id?: string | null
          juz_20_user_full_name?: string | null
          juz_20_user_id?: string | null
          juz_21_completed?: boolean
          juz_21_current_page?: number
          juz_21_help_requested?: boolean
          juz_21_planb_user_full_name?: string | null
          juz_21_planb_user_id?: string | null
          juz_21_user_full_name?: string | null
          juz_21_user_id?: string | null
          juz_22_completed?: boolean
          juz_22_current_page?: number
          juz_22_help_requested?: boolean
          juz_22_planb_user_full_name?: string | null
          juz_22_planb_user_id?: string | null
          juz_22_user_full_name?: string | null
          juz_22_user_id?: string | null
          juz_23_completed?: boolean
          juz_23_current_page?: number
          juz_23_help_requested?: boolean
          juz_23_planb_user_full_name?: string | null
          juz_23_planb_user_id?: string | null
          juz_23_user_full_name?: string | null
          juz_23_user_id?: string | null
          juz_24_completed?: boolean
          juz_24_current_page?: number
          juz_24_help_requested?: boolean
          juz_24_planb_user_full_name?: string | null
          juz_24_planb_user_id?: string | null
          juz_24_user_full_name?: string | null
          juz_24_user_id?: string | null
          juz_25_completed?: boolean
          juz_25_current_page?: number
          juz_25_help_requested?: boolean
          juz_25_planb_user_full_name?: string | null
          juz_25_planb_user_id?: string | null
          juz_25_user_full_name?: string | null
          juz_25_user_id?: string | null
          juz_26_completed?: boolean
          juz_26_current_page?: number
          juz_26_help_requested?: boolean
          juz_26_planb_user_full_name?: string | null
          juz_26_planb_user_id?: string | null
          juz_26_user_full_name?: string | null
          juz_26_user_id?: string | null
          juz_27_completed?: boolean
          juz_27_current_page?: number
          juz_27_help_requested?: boolean
          juz_27_planb_user_full_name?: string | null
          juz_27_planb_user_id?: string | null
          juz_27_user_full_name?: string | null
          juz_27_user_id?: string | null
          juz_28_completed?: boolean
          juz_28_current_page?: number
          juz_28_help_requested?: boolean
          juz_28_planb_user_full_name?: string | null
          juz_28_planb_user_id?: string | null
          juz_28_user_full_name?: string | null
          juz_28_user_id?: string | null
          juz_29_completed?: boolean
          juz_29_current_page?: number
          juz_29_help_requested?: boolean
          juz_29_planb_user_full_name?: string | null
          juz_29_planb_user_id?: string | null
          juz_29_user_full_name?: string | null
          juz_29_user_id?: string | null
          juz_3_completed?: boolean
          juz_3_current_page?: number
          juz_3_help_requested?: boolean
          juz_3_planb_user_full_name?: string | null
          juz_3_planb_user_id?: string | null
          juz_3_user_full_name?: string | null
          juz_3_user_id?: string | null
          juz_30_completed?: boolean
          juz_30_current_page?: number
          juz_30_help_requested?: boolean
          juz_30_planb_user_full_name?: string | null
          juz_30_planb_user_id?: string | null
          juz_30_user_full_name?: string | null
          juz_30_user_id?: string | null
          juz_4_completed?: boolean
          juz_4_current_page?: number
          juz_4_help_requested?: boolean
          juz_4_planb_user_full_name?: string | null
          juz_4_planb_user_id?: string | null
          juz_4_user_full_name?: string | null
          juz_4_user_id?: string | null
          juz_5_completed?: boolean
          juz_5_current_page?: number
          juz_5_help_requested?: boolean
          juz_5_planb_user_full_name?: string | null
          juz_5_planb_user_id?: string | null
          juz_5_user_full_name?: string | null
          juz_5_user_id?: string | null
          juz_6_completed?: boolean
          juz_6_current_page?: number
          juz_6_help_requested?: boolean
          juz_6_planb_user_full_name?: string | null
          juz_6_planb_user_id?: string | null
          juz_6_user_full_name?: string | null
          juz_6_user_id?: string | null
          juz_7_completed?: boolean
          juz_7_current_page?: number
          juz_7_help_requested?: boolean
          juz_7_planb_user_full_name?: string | null
          juz_7_planb_user_id?: string | null
          juz_7_user_full_name?: string | null
          juz_7_user_id?: string | null
          juz_8_completed?: boolean
          juz_8_current_page?: number
          juz_8_help_requested?: boolean
          juz_8_planb_user_full_name?: string | null
          juz_8_planb_user_id?: string | null
          juz_8_user_full_name?: string | null
          juz_8_user_id?: string | null
          juz_9_completed?: boolean
          juz_9_current_page?: number
          juz_9_help_requested?: boolean
          juz_9_planb_user_full_name?: string | null
          juz_9_planb_user_id?: string | null
          juz_9_user_full_name?: string | null
          juz_9_user_id?: string | null
          khatmah_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "khatmah_instances_juz_1_planb_user_id_fkey"
            columns: ["juz_1_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_1_user_id_fkey"
            columns: ["juz_1_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_10_planb_user_id_fkey"
            columns: ["juz_10_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_10_user_id_fkey"
            columns: ["juz_10_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_11_planb_user_id_fkey"
            columns: ["juz_11_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_11_user_id_fkey"
            columns: ["juz_11_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_12_planb_user_id_fkey"
            columns: ["juz_12_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_12_user_id_fkey"
            columns: ["juz_12_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_13_planb_user_id_fkey"
            columns: ["juz_13_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_13_user_id_fkey"
            columns: ["juz_13_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_14_planb_user_id_fkey"
            columns: ["juz_14_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_14_user_id_fkey"
            columns: ["juz_14_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_15_planb_user_id_fkey"
            columns: ["juz_15_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_15_user_id_fkey"
            columns: ["juz_15_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_16_planb_user_id_fkey"
            columns: ["juz_16_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_16_user_id_fkey"
            columns: ["juz_16_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_17_planb_user_id_fkey"
            columns: ["juz_17_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_17_user_id_fkey"
            columns: ["juz_17_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_18_planb_user_id_fkey"
            columns: ["juz_18_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_18_user_id_fkey"
            columns: ["juz_18_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_19_planb_user_id_fkey"
            columns: ["juz_19_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_19_user_id_fkey"
            columns: ["juz_19_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_2_planb_user_id_fkey"
            columns: ["juz_2_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_2_user_id_fkey"
            columns: ["juz_2_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_20_planb_user_id_fkey"
            columns: ["juz_20_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_20_user_id_fkey"
            columns: ["juz_20_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_21_planb_user_id_fkey"
            columns: ["juz_21_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_21_user_id_fkey"
            columns: ["juz_21_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_22_planb_user_id_fkey"
            columns: ["juz_22_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_22_user_id_fkey"
            columns: ["juz_22_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_23_planb_user_id_fkey"
            columns: ["juz_23_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_23_user_id_fkey"
            columns: ["juz_23_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_24_planb_user_id_fkey"
            columns: ["juz_24_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_24_user_id_fkey"
            columns: ["juz_24_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_25_planb_user_id_fkey"
            columns: ["juz_25_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_25_user_id_fkey"
            columns: ["juz_25_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_26_planb_user_id_fkey"
            columns: ["juz_26_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_26_user_id_fkey"
            columns: ["juz_26_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_27_planb_user_id_fkey"
            columns: ["juz_27_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_27_user_id_fkey"
            columns: ["juz_27_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_28_planb_user_id_fkey"
            columns: ["juz_28_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_28_user_id_fkey"
            columns: ["juz_28_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_29_planb_user_id_fkey"
            columns: ["juz_29_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_29_user_id_fkey"
            columns: ["juz_29_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_3_planb_user_id_fkey"
            columns: ["juz_3_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_3_user_id_fkey"
            columns: ["juz_3_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_30_planb_user_id_fkey"
            columns: ["juz_30_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_30_user_id_fkey"
            columns: ["juz_30_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_4_planb_user_id_fkey"
            columns: ["juz_4_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_4_user_id_fkey"
            columns: ["juz_4_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_5_planb_user_id_fkey"
            columns: ["juz_5_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_5_user_id_fkey"
            columns: ["juz_5_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_6_planb_user_id_fkey"
            columns: ["juz_6_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_6_user_id_fkey"
            columns: ["juz_6_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_7_planb_user_id_fkey"
            columns: ["juz_7_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_7_user_id_fkey"
            columns: ["juz_7_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_8_planb_user_id_fkey"
            columns: ["juz_8_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_8_user_id_fkey"
            columns: ["juz_8_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_9_planb_user_id_fkey"
            columns: ["juz_9_planb_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_juz_9_user_id_fkey"
            columns: ["juz_9_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_instances_khatmah_id_fkey"
            columns: ["khatmah_id"]
            isOneToOne: false
            referencedRelation: "khatmahs"
            referencedColumns: ["id"]
          },
        ]
      }
      khatmah_participants: {
        Row: {
          joined_at: string | null
          khatmah_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string | null
          khatmah_id: string
          user_id: string
        }
        Update: {
          joined_at?: string | null
          khatmah_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "khatmah_participants_khatmah_id_fkey"
            columns: ["khatmah_id"]
            isOneToOne: false
            referencedRelation: "khatmahs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khatmah_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      khatmahs: {
        Row: {
          assignment_mode: string
          auto_renewal: boolean
          created_at: string | null
          creator_id: string
          id: string
          invitation_uuid: string
          jazah_multiplier: number
          lifecycle_type: string
          name: string
          reset_calendar: string | null
          status: string
        }
        Insert: {
          assignment_mode: string
          auto_renewal?: boolean
          created_at?: string | null
          creator_id: string
          id?: string
          invitation_uuid?: string
          jazah_multiplier?: number
          lifecycle_type: string
          name: string
          reset_calendar?: string | null
          status?: string
        }
        Update: {
          assignment_mode?: string
          auto_renewal?: boolean
          created_at?: string | null
          creator_id?: string
          id?: string
          invitation_uuid?: string
          jazah_multiplier?: number
          lifecycle_type?: string
          name?: string
          reset_calendar?: string | null
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          jazah_total: number
          language: string
          last_year_reset_at: string | null
          total_juz_last_year: number
          total_juz_lifetime: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          jazah_total?: number
          language?: string
          last_year_reset_at?: string | null
          total_juz_last_year?: number
          total_juz_lifetime?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          jazah_total?: number
          language?: string
          last_year_reset_at?: string | null
          total_juz_last_year?: number
          total_juz_lifetime?: number
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string | null
          id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_juz_counters: {
        Args: { p_amount?: number; p_user_id: string }
        Returns: undefined
      }
      increment_jazah: {
        Args: { p_amount: number; p_user_id: string }
        Returns: undefined
      }
      increment_juz_counters: {
        Args: { p_amount?: number; p_user_id: string }
        Returns: undefined
      }
      is_khatmah_member: { Args: { p_khatmah_id: string }; Returns: boolean }
      reset_yearly_juz_counters: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

