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
      allowed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      "automations-hub": {
        Row: {
          action_config: Json | null
          action_type: string | null
          active: boolean | null
          board_id: string
          created_at: string | null
          id: string
          name: string | null
          trigger_config: Json | null
          trigger_type: string | null
        }
        Insert: {
          action_config?: Json | null
          action_type?: string | null
          active?: boolean | null
          board_id?: string
          created_at?: string | null
          id?: string
          name?: string | null
          trigger_config?: Json | null
          trigger_type?: string | null
        }
        Update: {
          action_config?: Json | null
          action_type?: string | null
          active?: boolean | null
          board_id?: string
          created_at?: string | null
          id?: string
          name?: string | null
          trigger_config?: Json | null
          trigger_type?: string | null
        }
        Relationships: []
      }
      boards: {
        Row: {
          board_type: string | null
          created_at: string | null
          folder_id: string | null
          id: string
          name: string
          position: number | null
          workspace_id: string | null
        }
        Insert: {
          board_type?: string | null
          created_at?: string | null
          folder_id?: string | null
          id?: string
          name: string
          position?: number | null
          workspace_id?: string | null
        }
        Update: {
          board_type?: string | null
          created_at?: string | null
          folder_id?: string | null
          id?: string
          name?: string
          position?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boards_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boards_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      column_values: {
        Row: {
          column_id: string | null
          id: string
          item_id: string | null
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          column_id?: string | null
          id?: string
          item_id?: string | null
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          column_id?: string | null
          id?: string
          item_id?: string | null
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "column_values_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "column_values_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      columns: {
        Row: {
          board_id: string | null
          id: string
          position: number | null
          settings: Json | null
          title: string
          type: string
        }
        Insert: {
          board_id?: string | null
          id?: string
          position?: number | null
          settings?: Json | null
          title: string
          type: string
        }
        Update: {
          board_id?: string | null
          id?: string
          position?: number | null
          settings?: Json | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "columns_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_accounts: {
        Row: {
          id: string
          industry: string | null
          item_id: string | null
          name: string
          size: string | null
          website: string | null
        }
        Insert: {
          id?: string
          industry?: string | null
          item_id?: string | null
          name: string
          size?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          industry?: string | null
          item_id?: string | null
          name?: string
          size?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_accounts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_activities: {
        Row: {
          body: string | null
          contact_id: string | null
          created_at: string | null
          deal_id: string | null
          done: boolean | null
          due_at: string | null
          id: string
          title: string | null
          type: string | null
        }
        Insert: {
          body?: string | null
          contact_id?: string | null
          created_at?: string | null
          deal_id?: string | null
          done?: boolean | null
          due_at?: string | null
          id?: string
          title?: string | null
          type?: string | null
        }
        Update: {
          body?: string | null
          contact_id?: string | null
          created_at?: string | null
          deal_id?: string | null
          done?: boolean | null
          due_at?: string | null
          id?: string
          title?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          item_id: string | null
          last_name: string | null
          phone: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          item_id?: string | null
          last_name?: string | null
          phone?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          item_id?: string | null
          last_name?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          account_id: string | null
          close_date: string | null
          contact_id: string | null
          currency: string | null
          id: string
          item_id: string | null
          probability: number | null
          stage: string | null
          value: number | null
        }
        Insert: {
          account_id?: string | null
          close_date?: string | null
          contact_id?: string | null
          currency?: string | null
          id?: string
          item_id?: string | null
          probability?: number | null
          stage?: string | null
          value?: number | null
        }
        Update: {
          account_id?: string | null
          close_date?: string | null
          contact_id?: string | null
          currency?: string | null
          id?: string
          item_id?: string | null
          probability?: number | null
          stage?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      culture_documents: {
        Row: {
          created_at: string
          description: string
          detail: string
          icon: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          detail?: string
          icon?: string
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          detail?: string
          icon?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      dashboard_metrics: {
        Row: {
          active_projects: number
          active_projects_sub: string
          global_nps: number
          global_nps_sub: string
          id: string
          quote_author: string
          quote_text: string
          revenue_current: number
          revenue_goal: number
          ytd_revenue: string
          ytd_revenue_sub: string
        }
        Insert: {
          active_projects?: number
          active_projects_sub?: string
          global_nps?: number
          global_nps_sub?: string
          id?: string
          quote_author?: string
          quote_text?: string
          revenue_current?: number
          revenue_goal?: number
          ytd_revenue?: string
          ytd_revenue_sub?: string
        }
        Update: {
          active_projects?: number
          active_projects_sub?: string
          global_nps?: number
          global_nps_sub?: string
          id?: string
          quote_author?: string
          quote_text?: string
          revenue_current?: number
          revenue_goal?: number
          ytd_revenue?: string
          ytd_revenue_sub?: string
        }
        Relationships: []
      }
      department_metrics: {
        Row: {
          department_id: string
          id: string
          label: string
          sort_order: number
          value: string
        }
        Insert: {
          department_id: string
          id?: string
          label: string
          sort_order?: number
          value: string
        }
        Update: {
          department_id?: string
          id?: string
          label?: string
          sort_order?: number
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_metrics_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      folders: {
        Row: {
          id: string
          name: string
          position: number | null
          workspace_id: string | null
        }
        Insert: {
          id?: string
          name: string
          position?: number | null
          workspace_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          position?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folders_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          board_id: string | null
          collapsed: boolean | null
          color: string | null
          id: string
          position: number | null
          title: string
        }
        Insert: {
          board_id?: string | null
          collapsed?: boolean | null
          color?: string | null
          id?: string
          position?: number | null
          title: string
        }
        Update: {
          board_id?: string | null
          collapsed?: boolean | null
          color?: string | null
          id?: string
          position?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_journey: {
        Row: {
          id: string
          label: string
          sort_order: number
          status: string
          value_text: string
          year: string
        }
        Insert: {
          id?: string
          label: string
          sort_order?: number
          status?: string
          value_text: string
          year: string
        }
        Update: {
          id?: string
          label?: string
          sort_order?: number
          status?: string
          value_text?: string
          year?: string
        }
        Relationships: []
      }
      impact_projects: {
        Row: {
          id: string
          owner: string
          progress: number
          title: string
        }
        Insert: {
          id?: string
          owner?: string
          progress?: number
          title: string
        }
        Update: {
          id?: string
          owner?: string
          progress?: number
          title?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          board_id: string | null
          created_at: string | null
          group_id: string | null
          id: string
          name: string
          parent_item_id: string | null
          position: number | null
          updated_at: string | null
        }
        Insert: {
          board_id?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          name: string
          parent_item_id?: string | null
          position?: number | null
          updated_at?: string | null
        }
        Update: {
          board_id?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          name?: string
          parent_item_id?: string | null
          position?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_parent_item_id_fkey"
            columns: ["parent_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: string
          squad: string
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          name: string
          role?: string
          squad?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          squad?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          stage: string
          tag: string
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          name: string
          stage?: string
          tag?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          stage?: string
          tag?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      quarterly_priorities: {
        Row: {
          created_at: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
