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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bank_accounts: {
        Row: {
          connection_id: string | null
          created_at: string
          environment: string
          id: string
          institution_name: string | null
          iso_currency_code: string | null
          link_status: string
          mask: string | null
          name: string
          official_name: string | null
          owner_id: string
          provider_account_id: string | null
          review_note: string | null
          source: string
          subtype: string | null
          superseded_by: string | null
          type: string
          updated_at: string
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          environment?: string
          id?: string
          institution_name?: string | null
          iso_currency_code?: string | null
          link_status?: string
          mask?: string | null
          name: string
          official_name?: string | null
          owner_id: string
          provider_account_id?: string | null
          review_note?: string | null
          source?: string
          subtype?: string | null
          superseded_by?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          environment?: string
          id?: string
          institution_name?: string | null
          iso_currency_code?: string | null
          link_status?: string
          mask?: string | null
          name?: string
          official_name?: string | null
          owner_id?: string
          provider_account_id?: string | null
          review_note?: string | null
          source?: string
          subtype?: string | null
          superseded_by?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "bank_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_balance_snapshots: {
        Row: {
          account_id: string
          as_of: string | null
          available_balance: number | null
          created_at: string
          credit_limit: number | null
          current_balance: number | null
          id: string
          owner_id: string
          source: string
        }
        Insert: {
          account_id: string
          as_of?: string | null
          available_balance?: number | null
          created_at?: string
          credit_limit?: number | null
          current_balance?: number | null
          id?: string
          owner_id: string
          source?: string
        }
        Update: {
          account_id?: string
          as_of?: string | null
          available_balance?: number | null
          created_at?: string
          credit_limit?: number | null
          current_balance?: number | null
          id?: string
          owner_id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_balance_snapshots_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_connection_secrets: {
        Row: {
          access_token_ciphertext: string
          access_token_iv: string
          connection_id: string
          transactions_cursor: string | null
          updated_at: string
        }
        Insert: {
          access_token_ciphertext: string
          access_token_iv: string
          connection_id: string
          transactions_cursor?: string | null
          updated_at?: string
        }
        Update: {
          access_token_ciphertext?: string
          access_token_iv?: string
          connection_id?: string
          transactions_cursor?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_connection_secrets_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: true
            referencedRelation: "bank_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_connections: {
        Row: {
          created_at: string
          environment: string
          id: string
          initial_sync_complete: boolean
          institution_name: string | null
          last_synced_at: string | null
          owner_id: string
          provider: string
          provider_item_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          environment?: string
          id?: string
          initial_sync_complete?: boolean
          institution_name?: string | null
          last_synced_at?: string | null
          owner_id: string
          provider?: string
          provider_item_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          environment?: string
          id?: string
          initial_sync_complete?: boolean
          institution_name?: string | null
          last_synced_at?: string | null
          owner_id?: string
          provider?: string
          provider_item_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      bank_transactions: {
        Row: {
          account_id: string
          amount: number
          authorized_date: string | null
          category_detailed: string | null
          category_primary: string | null
          created_at: string
          environment: string
          id: string
          is_transfer: boolean
          iso_currency_code: string | null
          merchant_name: string | null
          name: string
          owner_id: string
          pending: boolean
          pending_transaction_id: string | null
          posted_date: string | null
          provider_transaction_id: string | null
          refund_of_transaction_id: string | null
          removed_at: string | null
          source: string
          updated_at: string
        }
        Insert: {
          account_id: string
          amount: number
          authorized_date?: string | null
          category_detailed?: string | null
          category_primary?: string | null
          created_at?: string
          environment?: string
          id?: string
          is_transfer?: boolean
          iso_currency_code?: string | null
          merchant_name?: string | null
          name: string
          owner_id: string
          pending?: boolean
          pending_transaction_id?: string | null
          posted_date?: string | null
          provider_transaction_id?: string | null
          refund_of_transaction_id?: string | null
          removed_at?: string | null
          source?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount?: number
          authorized_date?: string | null
          category_detailed?: string | null
          category_primary?: string | null
          created_at?: string
          environment?: string
          id?: string
          is_transfer?: boolean
          iso_currency_code?: string | null
          merchant_name?: string | null
          name?: string
          owner_id?: string
          pending?: boolean
          pending_transaction_id?: string | null
          posted_date?: string | null
          provider_transaction_id?: string | null
          refund_of_transaction_id?: string | null
          removed_at?: string | null
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_data: {
        Row: {
          created_at: string
          data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
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
      is_finance_owner: { Args: never; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
