export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      conversions: {
        Row: {
          commission_amount: number | null
          commission_rate: number | null
          conversion_date: string
          created_at: string | null
          currency: string | null
          id: string
          lead_id: string
          notes: string | null
          rep_id: string
          revenue_amount: number
        }
        Insert: {
          commission_amount?: number | null
          commission_rate?: number | null
          conversion_date?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          lead_id: string
          notes?: string | null
          rep_id: string
          revenue_amount: number
        }
        Update: {
          commission_amount?: number | null
          commission_rate?: number | null
          conversion_date?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          lead_id?: string
          notes?: string | null
          rep_id?: string
          revenue_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_visits: {
        Row: {
          company_name: string
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
          visit_date: string
          visit_type: Database["public"]["Enums"]["visit_type"]
        }
        Insert: {
          company_name: string
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
          visit_date?: string
          visit_type: Database["public"]["Enums"]["visit_type"]
        }
        Update: {
          company_name?: string
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
          visit_date?: string
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
        ]
      }
      goals: {
        Row: {
          created_at: string | null
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
          next_follow_up: string | null
          notes: string | null
          source: string
          status: Database["public"]["Enums"]["lead_status"] | null
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
          next_follow_up?: string | null
          notes?: string | null
          source: string
          status?: Database["public"]["Enums"]["lead_status"] | null
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
          next_follow_up?: string | null
          notes?: string | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
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
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_manager_or_above: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
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
