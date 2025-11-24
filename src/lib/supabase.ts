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
    from: (table: string) => {
      // Mock escalation data
      const mockEscalations = [
        {
          id: "1",
          alert_id: "SLA-BREACH-001",
          alert_type: "SLA_BREACH",
          message: "Order #12345 has exceeded SLA target time",
          severity: "HIGH",
          timestamp: "2025-11-23 10:30:00",
          status: "PENDING",
          escalated_by: "System",
          escalated_to: "store-manager@company.com",
          created_at: "2025-11-23T10:30:00Z",
          updated_at: "2025-11-23T10:30:00Z",
        },
        {
          id: "2",
          alert_id: "SLA-APPROACH-002",
          alert_type: "SLA_APPROACHING",
          message: "Order #12346 is approaching SLA breach threshold",
          severity: "MEDIUM",
          timestamp: "2025-11-23 11:15:00",
          status: "SENT",
          escalated_by: "System",
          escalated_to: "team-lead@company.com",
          created_at: "2025-11-23T11:15:00Z",
          updated_at: "2025-11-23T11:20:00Z",
        },
        {
          id: "3",
          alert_id: "SYSTEM-003",
          alert_type: "SYSTEM_ALERT",
          message: "High order volume detected - additional staff may be needed",
          severity: "LOW",
          timestamp: "2025-11-23 12:00:00",
          status: "RESOLVED",
          escalated_by: "System",
          escalated_to: "ops@company.com",
          created_at: "2025-11-23T12:00:00Z",
          updated_at: "2025-11-23T13:30:00Z",
        },
      ];

      const mockOrders = [
        {
          id: "1",
          order_no: "ORD-001",
          customer: "John Doe",
          email: "john@example.com",
          phone_number: "+1234567890",
          channel: "ONLINE",
          status: "PROCESSING",
          business_unit: "RETAIL",
          order_type: "DELIVERY",
          items: 5,
          total: "1500.00",
          date: "2025-11-23",
          sla_target_minutes: 300,
          elapsed_minutes: 240,
          sla_status: "COMPLIANT",
          store_name: "Tops Central World",
          selling_location_id: "LOC001",
          priority: "NORMAL",
          billing_method: "CREDIT_CARD",
          payment_status: "PAID",
          fulfillment_location_id: "FUL001",
          items_list: ["Item A", "Item B", "Item C", "Item D", "Item E"],
          order_date: "2025-11-23T10:00:00Z",
          return_status: null,
          on_hold: false,
          confirmed: true,
          allow_substitution: true,
          created_date: "2025-11-23T10:00:00Z",
          created_at: "2025-11-23T10:00:00Z",
          updated_at: "2025-11-23T10:30:00Z",
        },
        {
          id: "2",
          order_no: "ORD-002",
          customer: "Jane Smith",
          email: "jane@example.com",
          phone_number: "+1234567891",
          channel: "OFFLINE",
          status: "DELIVERED",
          business_unit: "RETAIL",
          order_type: "PICKUP",
          items: 3,
          total: "750.00",
          date: "2025-11-23",
          sla_target_minutes: 180,
          elapsed_minutes: 200,
          sla_status: "BREACH",
          store_name: "Tops Sukhumvit 39",
          selling_location_id: "LOC002",
          priority: "HIGH",
          billing_method: "CASH",
          payment_status: "PAID",
          fulfillment_location_id: "FUL002",
          items_list: ["Item X", "Item Y", "Item Z"],
          order_date: "2025-11-23T09:00:00Z",
          return_status: null,
          on_hold: false,
          confirmed: true,
          allow_substitution: false,
          created_date: "2025-11-23T09:00:00Z",
          created_at: "2025-11-23T09:00:00Z",
          updated_at: "2025-11-23T12:00:00Z",
        },
      ];

      const data = table === "escalation_history" ? mockEscalations : mockOrders;

      return {
        select: (columns?: string, options?: any) => ({
          eq: (column: string, value: any) => ({
            data: data.filter((item: any) => item[column] === value),
            error: null,
            count: data.filter((item: any) => item[column] === value).length,
            then: (resolve: any) => resolve({
              data: data.filter((item: any) => item[column] === value),
              error: null,
              count: data.filter((item: any) => item[column] === value).length,
            }),
          }),
          ilike: (column: string, value: any) => ({
            data: data.filter((item: any) =>
              String(item[column]).toLowerCase().includes(String(value).replace(/%/g, '').toLowerCase())
            ),
            error: null,
            count: data.filter((item: any) =>
              String(item[column]).toLowerCase().includes(String(value).replace(/%/g, '').toLowerCase())
            ).length,
            then: (resolve: any) => resolve({
              data: data.filter((item: any) =>
                String(item[column]).toLowerCase().includes(String(value).replace(/%/g, '').toLowerCase())
              ),
              error: null,
              count: data.filter((item: any) =>
                String(item[column]).toLowerCase().includes(String(value).replace(/%/g, '').toLowerCase())
              ).length,
            }),
          }),
          or: (condition: string) => ({
            data: data, // Simplified - in real implementation would parse the condition
            error: null,
            count: data.length,
            then: (resolve: any) => resolve({
              data: data,
              error: null,
              count: data.length,
            }),
          }),
          gte: (column: string, value: any) => ({
            data: data.filter((item: any) =>
              new Date(item[column]) >= new Date(value)
            ),
            error: null,
            count: data.filter((item: any) =>
              new Date(item[column]) >= new Date(value)
            ).length,
            then: (resolve: any) => resolve({
              data: data.filter((item: any) =>
                new Date(item[column]) >= new Date(value)
              ),
              error: null,
              count: data.filter((item: any) =>
                new Date(item[column]) >= new Date(value)
              ).length,
            }),
          }),
          lte: (column: string, value: any) => ({
            data: data.filter((item: any) =>
              new Date(item[column]) <= new Date(value)
            ),
            error: null,
            count: data.filter((item: any) =>
              new Date(item[column]) <= new Date(value)
            ).length,
            then: (resolve: any) => resolve({
              data: data.filter((item: any) =>
                new Date(item[column]) <= new Date(value)
              ),
              error: null,
              count: data.filter((item: any) =>
                new Date(item[column]) <= new Date(value)
              ).length,
            }),
          }),
          order: (column: string, options?: { ascending: boolean }) => {
            const sorted = [...data].sort((a: any, b: any) => {
              const aVal = a[column];
              const bVal = b[column];
              const asc = options?.ascending !== false;
              if (aVal < bVal) return asc ? -1 : 1;
              if (aVal > bVal) return asc ? 1 : -1;
              return 0;
            });
            return {
              data: sorted,
              error: null,
              count: sorted.length,
              range: (start: number, end: number) => ({
                data: sorted.slice(start, end + 1),
                error: null,
                count: sorted.length,
                then: (resolve: any) => resolve({
                  data: sorted.slice(start, end + 1),
                  error: null,
                  count: sorted.length,
                }),
              }),
              then: (resolve: any) => resolve({
                data: sorted,
                error: null,
                count: sorted.length,
              }),
            };
          },
          range: (start: number, end: number) => ({
            data: data.slice(start, end + 1),
            error: null,
            count: data.length,
            then: (resolve: any) => resolve({
              data: data.slice(start, end + 1),
              error: null,
              count: data.length,
            }),
          }),
          data: data,
          error: null,
          count: data.length,
          then: (resolve: any) => resolve({
            data: data,
            error: null,
            count: data.length,
          }),
        }),
        insert: (newData: any) => ({
          select: () => ({
            single: () => ({
              data: Array.isArray(newData) ? newData[0] : newData,
              error: null,
              then: (resolve: any) => resolve({
                data: Array.isArray(newData) ? newData[0] : newData,
                error: null,
              }),
            }),
            data: Array.isArray(newData) ? newData : [newData],
            error: null,
            then: (resolve: any) => resolve({
              data: Array.isArray(newData) ? newData : [newData],
              error: null,
            }),
          }),
          single: () => ({
            data: Array.isArray(newData) ? newData[0] : newData,
            error: null,
            then: (resolve: any) => resolve({
              data: Array.isArray(newData) ? newData[0] : newData,
              error: null,
            }),
          }),
          data: Array.isArray(newData) ? newData : [newData],
          error: null,
          then: (resolve: any) => resolve({
            data: Array.isArray(newData) ? newData : [newData],
            error: null,
          }),
        }),
        update: (updateData: any) => ({
          eq: (column: string, value: any) => ({
            select: () => ({
              single: () => {
                const existing = data.find((item: any) => item[column] === value);
                const updated = existing ? { ...existing, ...updateData } : null;
                return {
                  data: updated,
                  error: null,
                  then: (resolve: any) => resolve({
                    data: updated,
                    error: null,
                  }),
                };
              },
              data: existing ? [{ ...existing, ...updateData }] : [],
              error: null,
              then: (resolve: any) => resolve({
                data: existing ? [{ ...existing, ...updateData }] : [],
                error: null,
              }),
            }),
            single: () => {
              const existing = data.find((item: any) => item[column] === value);
              const updated = existing ? { ...existing, ...updateData } : null;
              return {
                data: updated,
                error: null,
                then: (resolve: any) => resolve({
                  data: updated,
                  error: null,
                }),
              };
            },
            data: existing ? [{ ...existing, ...updateData }] : [],
            error: null,
            then: (resolve: any) => resolve({
              data: existing ? [{ ...existing, ...updateData }] : [],
              error: null,
            }),
          }),
        }),
        delete: () => ({
          eq: (column: string, value: any) => ({
            select: () => ({
              single: () => {
                const existing = data.find((item: any) => item[column] === value);
                return {
                  data: existing,
                  error: null,
                  then: (resolve: any) => resolve({
                    data: existing,
                    error: null,
                  }),
                };
              },
              data: data.filter((item: any) => item[column] === value),
              error: null,
              then: (resolve: any) => resolve({
                data: data.filter((item: any) => item[column] === value),
                error: null,
              }),
            }),
            single: () => {
              const existing = data.find((item: any) => item[column] === value);
              return {
                data: existing,
                error: null,
                then: (resolve: any) => resolve({
                  data: existing,
                  error: null,
                }),
              };
            },
            data: data.filter((item: any) => item[column] === value),
            error: null,
            then: (resolve: any) => resolve({
              data: data.filter((item: any) => item[column] === value),
              error: null,
            }),
          }),
        }),
      };
    },
    rpc: () => ({
      data: [],
      error: null,
      then: (resolve: any) => resolve({
        data: [],
        error: null,
      }),
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
