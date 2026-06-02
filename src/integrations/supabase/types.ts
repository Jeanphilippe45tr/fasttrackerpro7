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
