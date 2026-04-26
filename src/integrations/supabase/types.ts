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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_suggestion_decisions: {
        Row: {
          decided_at: string
          decided_by: string
          decision: string
          final_quantity: number | null
          human_reason: string | null
          id: string
          prediction_id: string
        }
        Insert: {
          decided_at?: string
          decided_by: string
          decision: string
          final_quantity?: number | null
          human_reason?: string | null
          id?: string
          prediction_id: string
        }
        Update: {
          decided_at?: string
          decided_by?: string
          decision?: string
          final_quantity?: number | null
          human_reason?: string | null
          id?: string
          prediction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestion_decisions_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_suggestion_decisions_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "demand_predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      app_users: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string
          id: string
          name: string
          status: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email: string
          id: string
          name: string
          status?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string
          id?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_hash: string | null
          readable_description: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_hash?: string | null
          readable_description: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_hash?: string | null
          readable_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_predictions: {
        Row: {
          confidence_score: number
          created_at: string
          explanation: string
          id: string
          is_safe_mode: boolean
          model_version: string
          product_id: string
          reference_date: string
          status: string
          store_id: string
          suggested_quantity: number
        }
        Insert: {
          confidence_score: number
          created_at?: string
          explanation: string
          id?: string
          is_safe_mode?: boolean
          model_version: string
          product_id: string
          reference_date?: string
          status?: string
          store_id: string
          suggested_quantity: number
        }
        Update: {
          confidence_score?: number
          created_at?: string
          explanation?: string
          id?: string
          is_safe_mode?: boolean
          model_version?: string
          product_id?: string
          reference_date?: string
          status?: string
          store_id?: string
          suggested_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "demand_predictions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_balances: {
        Row: {
          batch_id: string | null
          current_quantity: number
          id: string
          location_code: string | null
          minimum_stock: number
          product_id: string
          store_id: string
          updated_at: string
        }
        Insert: {
          batch_id?: string | null
          current_quantity?: number
          id?: string
          location_code?: string | null
          minimum_stock?: number
          product_id: string
          store_id?: string
          updated_at?: string
        }
        Update: {
          batch_id?: string | null
          current_quantity?: number
          id?: string
          location_code?: string | null
          minimum_stock?: number
          product_id?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_balances_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "product_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_balances_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          batch_id: string | null
          id: string
          movement_type: string
          occurred_at: string
          performed_by: string | null
          product_id: string
          quantity: number
          reason: string | null
          store_id: string
        }
        Insert: {
          batch_id?: string | null
          id?: string
          movement_type: string
          occurred_at?: string
          performed_by?: string | null
          product_id: string
          quantity: number
          reason?: string | null
          store_id: string
        }
        Update: {
          batch_id?: string | null
          id?: string
          movement_type?: string
          occurred_at?: string
          performed_by?: string | null
          product_id?: string
          quantity?: number
          reason?: string | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "product_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_consents: {
        Row: {
          accepted: boolean
          accepted_at: string | null
          consent_type: string
          id: string
          policy_version: string
          revoked_at: string | null
          user_id: string
        }
        Insert: {
          accepted: boolean
          accepted_at?: string | null
          consent_type: string
          id?: string
          policy_version: string
          revoked_at?: string | null
          user_id: string
        }
        Update: {
          accepted?: boolean
          accepted_at?: string | null
          consent_type?: string
          id?: string
          policy_version?: string
          revoked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operator_consents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_sales_clean: {
        Row: {
          created_at: string
          external_transaction_id: string
          id: string
          product_id: string
          quantity: number
          sold_at: string
          store_id: string
          total_value: number
        }
        Insert: {
          created_at?: string
          external_transaction_id: string
          id?: string
          product_id: string
          quantity: number
          sold_at: string
          store_id: string
          total_value: number
        }
        Update: {
          created_at?: string
          external_transaction_id?: string
          id?: string
          product_id?: string
          quantity?: number
          sold_at?: string
          store_id?: string
          total_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "pos_sales_clean_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_batches: {
        Row: {
          batch_code: string
          created_at: string
          expiration_date: string
          id: string
          product_id: string
          supplier_id: string | null
        }
        Insert: {
          batch_code: string
          created_at?: string
          expiration_date: string
          id?: string
          product_id: string
          supplier_id?: string | null
        }
        Update: {
          batch_code?: string
          created_at?: string
          expiration_date?: string
          id?: string
          product_id?: string
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          id: string
          minimum_shelf_life_days: number
          name: string
          sku: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          minimum_shelf_life_days?: number
          name: string
          sku: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          minimum_shelf_life_days?: number
          name?: string
          sku?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          login: string
          nome_completo: string
        }
        Insert: {
          created_at?: string
          id: string
          login: string
          nome_completo: string
        }
        Update: {
          created_at?: string
          id?: string
          login?: string
          nome_completo?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
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
      app_role:
        | "admin"
        | "inventory_manager"
        | "buyer"
        | "logistics_operator"
        | "auditor"
        | "consumer"
        | "merchant"
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
      app_role: [
        "admin",
        "inventory_manager",
        "buyer",
        "logistics_operator",
        "auditor",
        "consumer",
        "merchant",
      ],
    },
  },
} as const
