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
      admins: {
        Row: {
          admin_prefix: string
          company_name: string | null
          created_at: string
          created_by_super_admin: string | null
          email: string
          id: string
          is_active: boolean
          must_change_password: boolean
          name: string
          password_hash: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          admin_prefix: string
          company_name?: string | null
          created_at?: string
          created_by_super_admin?: string | null
          email?: string
          id?: string
          is_active?: boolean
          must_change_password?: boolean
          name: string
          password_hash: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          admin_prefix?: string
          company_name?: string | null
          created_at?: string
          created_by_super_admin?: string | null
          email?: string
          id?: string
          is_active?: boolean
          must_change_password?: boolean
          name?: string
          password_hash?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          read_by_admin: boolean
          read_by_client: boolean
          sender: string
          shipment_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_by_admin?: boolean
          read_by_client?: boolean
          sender: string
          shipment_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_by_admin?: boolean
          read_by_client?: boolean
          sender?: string
          shipment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          admin_id: string
          client_name: string
          created_at: string
          destination: string | null
          email: string | null
          id: string
          origin: string | null
          phone: string | null
          shipment_description: string | null
          status: string
          tracking_code: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          client_name: string
          created_at?: string
          destination?: string | null
          email?: string | null
          id?: string
          origin?: string | null
          phone?: string | null
          shipment_description?: string | null
          status?: string
          tracking_code: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          client_name?: string
          created_at?: string
          destination?: string | null
          email?: string | null
          id?: string
          origin?: string | null
          phone?: string | null
          shipment_description?: string | null
          status?: string
          tracking_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          client_email: string
          client_name: string
          created_at: string
          current_coords: Json | null
          dest_coords: Json | null
          destination: string
          dimensions: string | null
          estimated_arrival: string | null
          history: Json | null
          id: string
          origin: string
          origin_coords: Json | null
          package_type: string | null
          pause_reason: string | null
          progress: number
          route: Json | null
          status: string
          tracking_number: string
          transport_mode: string
          updated_at: string
          weight: string | null
        }
        Insert: {
          client_email?: string
          client_name: string
          created_at?: string
          current_coords?: Json | null
          dest_coords?: Json | null
          destination: string
          dimensions?: string | null
          estimated_arrival?: string | null
          history?: Json | null
          id?: string
          origin: string
          origin_coords?: Json | null
          package_type?: string | null
          pause_reason?: string | null
          progress?: number
          route?: Json | null
          status?: string
          tracking_number: string
          transport_mode?: string
          updated_at?: string
          weight?: string | null
        }
        Update: {
          client_email?: string
          client_name?: string
          created_at?: string
          current_coords?: Json | null
          dest_coords?: Json | null
          destination?: string
          dimensions?: string | null
          estimated_arrival?: string | null
          history?: Json | null
          id?: string
          origin?: string
          origin_coords?: Json | null
          package_type?: string | null
          pause_reason?: string | null
          progress?: number
          route?: Json | null
          status?: string
          tracking_number?: string
          transport_mode?: string
          updated_at?: string
          weight?: string | null
        }
        Relationships: []
      }
      super_admins: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          password_hash: string
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          name: string
          password_hash: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          password_hash?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          amount: number
          created_at: string
          currency: string
          discount: number
          due_date: string | null
          id: string
          issued_by: string | null
          issued_to: string | null
          items: Json
          notes: string | null
          payment_method: string | null
          shipment_id: string
          tax_rate: number
          ticket_number: string
          ticket_type: string
          title: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          discount?: number
          due_date?: string | null
          id?: string
          issued_by?: string | null
          issued_to?: string | null
          items?: Json
          notes?: string | null
          payment_method?: string | null
          shipment_id: string
          tax_rate?: number
          ticket_number: string
          ticket_type?: string
          title?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          discount?: number
          due_date?: string | null
          id?: string
          issued_by?: string | null
          issued_to?: string | null
          items?: Json
          notes?: string | null
          payment_method?: string | null
          shipment_id?: string
          tax_rate?: number
          ticket_number?: string
          ticket_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tracking_events: {
        Row: {
          event_description: string
          event_time: string
          id: string
          location: string | null
          tracking_code: string
          updated_by_admin_id: string | null
        }
        Insert: {
          event_description?: string
          event_time?: string
          id?: string
          location?: string | null
          tracking_code: string
          updated_by_admin_id?: string | null
        }
        Update: {
          event_description?: string
          event_time?: string
          id?: string
          location?: string | null
          tracking_code?: string
          updated_by_admin_id?: string | null
        }
        Relationships: []
      }
      used_tracking_codes: {
        Row: {
          code: string
          created_at: string
        }
        Insert: {
          code: string
          created_at?: string
        }
        Update: {
          code?: string
          created_at?: string
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
