import { createClient } from "@supabase/supabase-js"

// แก้ไขการสร้าง Supabase client ให้มีการตรวจสอบ environment variables
// และใช้ค่า default หรือแสดงข้อความแจ้งเตือนที่ชัดเจน

// เปลี่ยนจาก
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// เป็น
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// ตรวจสอบว่ามี environment variables ที่จำเป็นหรือไม่
let supabaseClient: ReturnType<typeof createClient>

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Using mock client.")

  // สร้าง mock client เมื่อไม่มี credentials
  supabaseClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            data: [],
            error: null,
          }),
        }),
        data: [],
        error: null,
      }),
      insert: () => ({
        data: null,
        error: null,
      }),
      update: () => ({
        data: null,
        error: null,
      }),
      delete: () => ({
        data: null,
        error: null,
      }),
    }),
    rpc: () => ({
      data: [],
      error: null,
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
  } as any
} else {
  // สร้าง client จริงเมื่อมี credentials
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseClient

// Database types
export interface Order {
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
  fulfillment_location_id: string | null
  items_list: string[]
  order_date: string
  return_status: string | null
  on_hold: boolean
  confirmed: boolean
  allow_substitution: boolean
  created_date: string
  created_at: string
  updated_at: string
}

export interface EscalationRecord {
  id: string
  alert_id: string
  alert_type: string
  message: string
  severity: "HIGH" | "MEDIUM" | "LOW"
  timestamp: string
  status: "PENDING" | "SENT" | "FAILED" | "RESOLVED"
  escalated_by: string
  escalated_to: string
  created_at: string
  updated_at: string
}
