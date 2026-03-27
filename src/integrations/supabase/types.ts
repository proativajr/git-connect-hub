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
      access_codes: {
        Row: {
          code_hash: string
          id: string
          section_key: string
          updated_at: string
        }
        Insert: {
          code_hash: string
          id?: string
          section_key: string
          updated_at?: string
        }
        Update: {
          code_hash?: string
          id?: string
          section_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_leads: {
        Row: {
          created_at: string
          created_by: string | null
          data_entrada: string | null
          email: string | null
          empresa: string | null
          etapa: string | null
          id: string
          nome: string
          observacoes: string | null
          responsavel: string | null
          telefone: string | null
          ultimo_contato: string | null
          updated_at: string
          valor: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_entrada?: string | null
          email?: string | null
          empresa?: string | null
          etapa?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          responsavel?: string | null
          telefone?: string | null
          ultimo_contato?: string | null
          updated_at?: string
          valor?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_entrada?: string | null
          email?: string | null
          empresa?: string | null
          etapa?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          responsavel?: string | null
          telefone?: string | null
          ultimo_contato?: string | null
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_config: {
        Row: {
          id: string
          meta_externa: number | null
          meta_interna: number | null
          receita_atual: number | null
          scope: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          meta_externa?: number | null
          meta_interna?: number | null
          receita_atual?: number | null
          scope?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          meta_externa?: number | null
          meta_interna?: number | null
          receita_atual?: number | null
          scope?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      financeiro_lancamentos: {
        Row: {
          categoria: string
          created_at: string
          created_by: string | null
          data: string
          descricao: string | null
          id: string
          origem: string | null
          status: string | null
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          created_by?: string | null
          data?: string
          descricao?: string | null
          id?: string
          origem?: string | null
          status?: string | null
          tipo: string
          updated_at?: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          created_by?: string | null
          data?: string
          descricao?: string | null
          id?: string
          origem?: string | null
          status?: string | null
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_lancamentos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gente_metas: {
        Row: {
          created_at: string
          created_by: string | null
          descricao: string
          id: string
          position: number
          progresso: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          descricao: string
          id?: string
          position?: number
          progresso?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          descricao?: string
          id?: string
          position?: number
          progresso?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gente_metas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gente_uploads: {
        Row: {
          created_at: string
          id: string
          nome_arquivo: string
          storage_path: string
          tamanho_bytes: number | null
          tipo: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nome_arquivo: string
          storage_path: string
          tamanho_bytes?: number | null
          tipo: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nome_arquivo?: string
          storage_path?: string
          tamanho_bytes?: number | null
          tipo?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gente_uploads_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mej_metas: {
        Row: {
          created_at: string
          created_by: string | null
          descricao: string
          id: string
          position: number
          progresso: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          descricao: string
          id?: string
          position?: number
          progresso?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          descricao?: string
          id?: string
          position?: number
          progresso?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mej_metas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monday_boards: {
        Row: {
          board_id: string
          created_at: string
          diretoria: string
          id: string
          title: string
        }
        Insert: {
          board_id: string
          created_at?: string
          diretoria: string
          id?: string
          title: string
        }
        Update: {
          board_id?: string
          created_at?: string
          diretoria?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      monday_columns: {
        Row: {
          board_id: string
          color: string | null
          created_at: string
          id: string
          position: number
          title: string
        }
        Insert: {
          board_id: string
          color?: string | null
          created_at?: string
          id?: string
          position?: number
          title: string
        }
        Update: {
          board_id?: string
          color?: string | null
          created_at?: string
          id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "monday_columns_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "monday_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      monday_items: {
        Row: {
          assignee_id: string | null
          column_id: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          position: number
          priority: string | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          column_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          priority?: string | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          column_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          priority?: string | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monday_items_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monday_items_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "monday_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monday_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mvv_config: {
        Row: {
          id: string
          missao: string | null
          scope: string | null
          updated_at: string
          valores: string | null
          visao: string | null
        }
        Insert: {
          id?: string
          missao?: string | null
          scope?: string | null
          updated_at?: string
          valores?: string | null
          visao?: string | null
        }
        Update: {
          id?: string
          missao?: string | null
          scope?: string | null
          updated_at?: string
          valores?: string | null
          visao?: string | null
        }
        Relationships: []
      }
      parcerias: {
        Row: {
          beneficios: string | null
          contato: string | null
          created_at: string
          created_by: string | null
          id: string
          logo_url: string | null
          oferece: string | null
          parceiro: string
          position: number
          status: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          beneficios?: string | null
          contato?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          oferece?: string | null
          parceiro: string
          position?: number
          status?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          beneficios?: string | null
          contato?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          oferece?: string | null
          parceiro?: string
          position?: number
          status?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parcerias_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projetos_lista: {
        Row: {
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          nome: string
          position: number
          responsavel: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          nome: string
          position?: number
          responsavel?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          position?: number
          responsavel?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projetos_lista_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      relacao_institucional: {
        Row: {
          chave: string
          id: string
          updated_at: string
          valor: string | null
        }
        Insert: {
          chave: string
          id?: string
          updated_at?: string
          valor?: string | null
        }
        Update: {
          chave?: string
          id?: string
          updated_at?: string
          valor?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          id: string
          sidebar_state: Json | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          sidebar_state?: Json | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          sidebar_state?: Json | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas_contratos: {
        Row: {
          cliente: string
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          observacoes: string | null
          servico: string
          status: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          cliente: string
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          observacoes?: string | null
          servico: string
          status?: string | null
          updated_at?: string
          valor?: number
        }
        Update: {
          cliente?: string
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          observacoes?: string | null
          servico?: string
          status?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_contratos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      crm_metrics: {
        Row: {
          count_negociacao: number | null
          count_primeiro_contato: number | null
          count_proposta: number | null
          count_prospeccao: number | null
          leads_ativos: number | null
          leads_fechados: number | null
          leads_perdidos: number | null
          taxa_conversao: number | null
          total_leads: number | null
          valor_total_fechado: number | null
        }
        Relationships: []
      }
      financeiro_saldo: {
        Row: {
          saldo: number | null
          total_despesas: number | null
          total_receitas: number | null
        }
        Relationships: []
      }
      gente_indicadores: {
        Row: {
          total_pcos: number | null
          total_pdis: number | null
          ultimo_pco: string | null
          ultimo_pdi: string | null
        }
        Relationships: []
      }
      projetos_indicadores: {
        Row: {
          projetos_ativos: number | null
          projetos_concluidos: number | null
          projetos_pausados: number | null
          total_projetos: number | null
        }
        Relationships: []
      }
      vendas_contratos_view: {
        Row: {
          cliente: string | null
          created_at: string | null
          created_by: string | null
          data_fim: string | null
          data_inicio: string | null
          duracao_dias: number | null
          id: string | null
          observacoes: string | null
          servico: string | null
          status: string | null
          updated_at: string | null
          valor: number | null
        }
        Insert: {
          cliente?: string | null
          created_at?: string | null
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          duracao_dias?: never
          id?: string | null
          observacoes?: string | null
          servico?: string | null
          status?: string | null
          updated_at?: string | null
          valor?: number | null
        }
        Update: {
          cliente?: string | null
          created_at?: string | null
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          duracao_dias?: never
          id?: string | null
          observacoes?: string | null
          servico?: string | null
          status?: string | null
          updated_at?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendas_contratos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visao_geral_dashboard: {
        Row: {
          crm_leads_ativos: number | null
          crm_taxa_conversao: number | null
          meta_externa: number | null
          meta_interna: number | null
          n_projetos_ativos: number | null
          receita_atual: number | null
          total_caixa: number | null
          total_pcos: number | null
          total_pdis: number | null
          ultimo_pco: string | null
          ultimo_pdi: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_access_code: {
        Args: {
          p_current_code: string
          p_new_code: string
          p_section_key: string
        }
        Returns: boolean
      }
      verify_access_code: {
        Args: { p_candidate: string; p_section_key: string }
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
