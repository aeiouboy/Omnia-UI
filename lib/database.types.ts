export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          order_no: string
          customer: string
          email: string
          phone_number: string
          channel: string
          status: string
          business_unit: string
          order_type: string
          items: number
          total: string
          date: string
          sla_target_minutes: number
          elapsed_minutes: number
          sla_status: string
          store_name: string
          selling_location_id: string
          priority: string
          billing_method: string
          payment_status: string
          fulfillment_location_id: string
          items_list: Json
          order_date: string
          return_status: string | null
          on_hold: boolean
          confirmed: boolean
          allow_substitution: boolean
          created_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_no: string
          customer: string
          email: string
          phone_number: string
          channel: string
          status: string
          business_unit: string
          order_type: string
          items: number
          total: string
          date: string
          sla_target_minutes: number
          elapsed_minutes: number
          sla_status: string
          store_name: string
          selling_location_id: string
          priority: string
          billing_method: string
          payment_status: string
          fulfillment_location_id: string
          items_list: Json
          order_date: string
          return_status?: string | null
          on_hold?: boolean
          confirmed?: boolean
          allow_substitution?: boolean
          created_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_no?: string
          customer?: string
          email?: string
          phone_number?: string
          channel?: string
          status?: string
          business_unit?: string
          order_type?: string
          items?: number
          total?: string
          date?: string
          sla_target_minutes?: number
          elapsed_minutes?: number
          sla_status?: string
          store_name?: string
          selling_location_id?: string
          priority?: string
          billing_method?: string
          payment_status?: string
          fulfillment_location_id?: string
          items_list?: Json
          order_date?: string
          return_status?: string | null
          on_hold?: boolean
          confirmed?: boolean
          allow_substitution?: boolean
          created_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      escalation_history: {
        Row: {
          id: string
          alert_id: string
          alert_type: string
          message: string
          severity: string
          timestamp: string
          status: string
          escalated_by: string
          escalated_to: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          alert_id: string
          alert_type: string
          message: string
          severity: string
          timestamp: string
          status: string
          escalated_by: string
          escalated_to: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          alert_id?: string
          alert_type?: string
          message?: string
          severity?: string
          timestamp?: string
          status?: string
          escalated_by?: string
          escalated_to?: string
          created_at?: string
          updated_at?: string
        }
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
