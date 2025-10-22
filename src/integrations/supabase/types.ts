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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          company_name: string
          contact_person: string | null
          created_at: string | null
          created_by: string
          email: string | null
          id: string
          industry: string | null
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company_name: string
          contact_person?: string | null
          created_at?: string | null
          created_by: string
          email?: string | null
          id?: string
          industry?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_person?: string | null
          created_at?: string | null
          created_by?: string
          email?: string | null
          id?: string
          industry?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conversions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          commission_amount: number | null
          commission_rate: number | null
          commissionable_amount: number | null
          conversion_date: string
          created_at: string | null
          currency: string | null
          deductions_applied: Json | null
          id: string
          lead_id: string
          notes: string | null
          recommended_at: string | null
          recommended_by: string | null
          rejection_reason: string | null
          rep_id: string
          revenue_amount: number
          status: Database["public"]["Enums"]["conversion_status"] | null
          submitted_at: string | null
          submitted_by: string | null
          workflow_notes: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          commissionable_amount?: number | null
          conversion_date?: string
          created_at?: string | null
          currency?: string | null
          deductions_applied?: Json | null
          id?: string
          lead_id: string
          notes?: string | null
          recommended_at?: string | null
          recommended_by?: string | null
          rejection_reason?: string | null
          rep_id: string
          revenue_amount: number
          status?: Database["public"]["Enums"]["conversion_status"] | null
          submitted_at?: string | null
          submitted_by?: string | null
          workflow_notes?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          commissionable_amount?: number | null
          conversion_date?: string
          created_at?: string | null
          currency?: string | null
          deductions_applied?: Json | null
          id?: string
          lead_id?: string
          notes?: string | null
          recommended_at?: string | null
          recommended_by?: string | null
          rejection_reason?: string | null
          rep_id?: string
          revenue_amount?: number
          status?: Database["public"]["Enums"]["conversion_status"] | null
          submitted_at?: string | null
          submitted_by?: string | null
          workflow_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversions_rep_id_fkey1"
            columns: ["rep_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversions_rep_id_fkey1"
            columns: ["rep_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_visits: {
        Row: {
          company_name: string
          contact_email: string | null
          contact_person: string | null
          created_at: string | null
          duration_minutes: number | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          lead_generated: boolean | null
          lead_id: string | null
          notes: string | null
          outcome: string | null
          rep_id: string
          status: string | null
          visit_date: string
          visit_time: string | null
          visit_type: Database["public"]["Enums"]["visit_type"]
        }
        Insert: {
          company_name: string
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          lead_generated?: boolean | null
          lead_id?: string | null
          notes?: string | null
          outcome?: string | null
          rep_id: string
          status?: string | null
          visit_date?: string
          visit_time?: string | null
          visit_type: Database["public"]["Enums"]["visit_type"]
        }
        Update: {
          company_name?: string
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          lead_generated?: boolean | null
          lead_id?: string | null
          notes?: string | null
          outcome?: string | null
          rep_id?: string
          status?: string | null
          visit_date?: string
          visit_time?: string | null
          visit_type?: Database["public"]["Enums"]["visit_type"]
        }
        Relationships: [
          {
            foreignKeyName: "daily_visits_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_visits_rep_id_fkey1"
            columns: ["rep_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_visits_rep_id_fkey1"
            columns: ["rep_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      deductions: {
        Row: {
          applies_before_commission: boolean | null
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          label: string
          percentage: number
          updated_at: string | null
        }
        Insert: {
          applies_before_commission?: boolean | null
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          label: string
          percentage: number
          updated_at?: string | null
        }
        Update: {
          applies_before_commission?: boolean | null
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          label?: string
          percentage?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string | null
          currency: string | null
          current_value: number | null
          description: string | null
          goal_type: string
          id: string
          period_end: string
          period_start: string
          target_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          current_value?: number | null
          description?: string | null
          goal_type: string
          id?: string
          period_end: string
          period_start: string
          target_value: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          current_value?: number | null
          description?: string | null
          goal_type?: string
          id?: string
          period_end?: string
          period_start?: string
          target_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          created_by_waitlist: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          max_uses: number | null
          status: string | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          created_by_waitlist?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          status?: string | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          created_by_waitlist?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          status?: string | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_codes_created_by_waitlist_fkey"
            columns: ["created_by_waitlist"]
            isOneToOne: false
            referencedRelation: "waitlist"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_source_options: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          label: string
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label: string
          user_id: string
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      lead_status_options: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          label: string
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label: string
          user_id: string
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          address: string | null
          company_name: string
          contact_email: string | null
          contact_name: string
          contact_phone: string
          created_at: string | null
          created_by: string
          currency: string | null
          estimated_revenue: number | null
          id: string
          industry: string | null
          lead_date: string | null
          next_follow_up: string | null
          notes: string | null
          source: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company_name: string
          contact_email?: string | null
          contact_name: string
          contact_phone: string
          created_at?: string | null
          created_by: string
          currency?: string | null
          estimated_revenue?: number | null
          id?: string
          industry?: string | null
          lead_date?: string | null
          next_follow_up?: string | null
          notes?: string | null
          source: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string
          created_at?: string | null
          created_by?: string
          currency?: string | null
          estimated_revenue?: number | null
          id?: string
          industry?: string | null
          lead_date?: string | null
          next_follow_up?: string | null
          notes?: string | null
          source?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_created_by_fkey1"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_created_by_fkey1"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          default_commission_rate: number | null
          department: string | null
          email: string | null
          full_name: string | null
          hire_date: string | null
          id: string
          is_active: boolean | null
          manager_id: string | null
          phone: string | null
          position: string | null
          preferred_currency: string | null
          role_id: string | null
          sys_role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          default_commission_rate?: number | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          hire_date?: string | null
          id: string
          is_active?: boolean | null
          manager_id?: string | null
          phone?: string | null
          position?: string | null
          preferred_currency?: string | null
          role_id?: string | null
          sys_role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          default_commission_rate?: number | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          phone?: string | null
          position?: string | null
          preferred_currency?: string | null
          role_id?: string | null
          sys_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_role"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referee_id: string | null
          referrer_id: string | null
          reward_points: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referee_id?: string | null
          referrer_id?: string | null
          reward_points?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referee_id?: string | null
          referrer_id?: string | null
          reward_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: false
            referencedRelation: "waitlist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "waitlist"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invites: {
        Row: {
          id: string
          invites_accepted: number | null
          invites_remaining: number | null
          invites_sent: number | null
          invites_total: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          invites_accepted?: number | null
          invites_remaining?: number | null
          invites_sent?: number | null
          invites_total?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          invites_accepted?: number | null
          invites_remaining?: number | null
          invites_sent?: number | null
          invites_total?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          invited_at: string | null
          metadata: Json | null
          position: number | null
          referral_code: string
          referral_count: number | null
          referred_by: string | null
          signed_up_at: string | null
          status: string | null
          team_size: string | null
          use_case: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          invited_at?: string | null
          metadata?: Json | null
          position?: number | null
          referral_code: string
          referral_count?: number | null
          referred_by?: string | null
          signed_up_at?: string | null
          status?: string | null
          team_size?: string | null
          use_case?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          invited_at?: string | null
          metadata?: Json | null
          position?: number | null
          referral_code?: string
          referral_count?: number | null
          referred_by?: string | null
          signed_up_at?: string | null
          status?: string | null
          team_size?: string | null
          use_case?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "waitlist"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profiles_with_roles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string | null
          full_name: string | null
          hire_date: string | null
          id: string | null
          is_active: boolean | null
          manager_id: string | null
          phone: string | null
          position: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          role_id: string | null
          sys_role: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_role"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_commission_with_deductions: {
        Args:
          | {
              commission_rate: number
              currency: string
              deduction_settings?: Json
              revenue_amount: number
            }
          | {
              commission_rate: number
              currency?: string
              revenue_amount: number
            }
        Returns: {
          commissionable_amount: number
          deductions_applied: Json
          final_commission: number
        }[]
      }
      calculate_waitlist_position: {
        Args: { waitlist_id: string }
        Returns: number
      }
      create_user_invite_codes: {
        Args: { num_codes?: number; user_id: string }
        Returns: undefined
      }
      generate_invite_code: {
        Args: { user_id: string }
        Returns: string
      }
      generate_referral_code: {
        Args: { user_email: string }
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_waitlist_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_manager_or_above: {
        Args: { _user_id: string }
        Returns: boolean
      }
      process_referral: {
        Args: { referee_id: string; referrer_code: string }
        Returns: Json
      }
      update_all_waitlist_positions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      use_invite_code: {
        Args: { code_to_use: string; user_id: string }
        Returns: Json
      }
    }
    Enums: {
      conversion_status: "pending" | "recommended" | "approved" | "rejected"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "closed_won"
        | "closed_lost"
      user_role: "rep" | "manager" | "director" | "admin"
      visit_type:
        | "cold_call"
        | "follow_up"
        | "presentation"
        | "meeting"
        | "phone_call"
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
    Enums: {
      conversion_status: ["pending", "recommended", "approved", "rejected"],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "negotiation",
        "closed_won",
        "closed_lost",
      ],
      user_role: ["rep", "manager", "director", "admin"],
      visit_type: [
        "cold_call",
        "follow_up",
        "presentation",
        "meeting",
        "phone_call",
      ],
    },
  },
} as const
