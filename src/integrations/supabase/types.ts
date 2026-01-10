export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      journal_entries: {
        Row: {
          created_at: string
          description: string | null
          entry_type: string
          fulfilled_date: string | null
          fulfilled_note: string | null
          id: string
          scripture_reference: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          entry_type?: string
          fulfilled_date?: string | null
          fulfilled_note?: string | null
          id?: string
          scripture_reference?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          entry_type?: string
          fulfilled_date?: string | null
          fulfilled_note?: string | null
          id?: string
          scripture_reference?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prayer_formats: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          is_system: boolean
          name: string
          phases: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          is_system?: boolean
          name: string
          phases?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          is_system?: boolean
          name?: string
          phases?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      prayer_requests: {
        Row: {
          answer_type: string | null
          answered_date: string | null
          answered_note: string | null
          created_at: string
          description: string | null
          gratitude_note: string | null
          id: string
          is_answered: boolean
          is_recurring: boolean
          tag: string
          testimony: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer_type?: string | null
          answered_date?: string | null
          answered_note?: string | null
          created_at?: string
          description?: string | null
          gratitude_note?: string | null
          id?: string
          is_answered?: boolean
          is_recurring?: boolean
          tag?: string
          testimony?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer_type?: string | null
          answered_date?: string | null
          answered_note?: string | null
          created_at?: string
          description?: string | null
          gratitude_note?: string | null
          id?: string
          is_answered?: boolean
          is_recurring?: boolean
          tag?: string
          testimony?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prayer_sessions: {
        Row: {
          created_at: string
          format_id: string | null
          generated_prayer: string | null
          id: string
          phases: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          format_id?: string | null
          generated_prayer?: string | null
          id?: string
          phases?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          format_id?: string | null
          generated_prayer?: string | null
          id?: string
          phases?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_sessions_format_id_fkey"
            columns: ["format_id"]
            isOneToOne: false
            referencedRelation: "prayer_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_topics: {
        Row: {
          answered_date: string | null
          answered_note: string | null
          content: string
          created_at: string
          id: string
          last_prayed_at: string
          phase: string
          session_id: string | null
          status: string
          summary: string
          user_id: string
        }
        Insert: {
          answered_date?: string | null
          answered_note?: string | null
          content: string
          created_at?: string
          id?: string
          last_prayed_at?: string
          phase: string
          session_id?: string | null
          status?: string
          summary: string
          user_id: string
        }
        Update: {
          answered_date?: string | null
          answered_note?: string | null
          content?: string
          created_at?: string
          id?: string
          last_prayed_at?: string
          phase?: string
          session_id?: string | null
          status?: string
          summary?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_topics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "prayer_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
