import { supabase } from "./supabase"

const mockOrdersData = [
  {
    order_no: "CG-TOPS-2025052301-A789B0",
    customer: "John Smith",
    email: "john.smith@example.com",
    phone_number: "0891234567",
    channel: "SHOPEE",
    status: "FULFILLED",
    business_unit: "TOPS",
    order_type: "HGH-HD-STD",
    items: 3,
    total: "฿1,052.00",
    date: "Today, 10:23 AM",
    sla_target_minutes: 5,
    elapsed_minutes: 7,
    sla_status: "COMPLIANT",
    store_name: "Central World",
    selling_location_id: "Central World",
    priority: "HIGH",
    billing_method: "COD",
    payment_status: "PAID",
    fulfillment_location_id: "TOPS-CW-001",
    items_list: ["Fresh Milk", "Bread", "Eggs"],
    order_date: "2025-05-23",
    return_status: "",
    on_hold: false,
    confirmed: true,
    allow_substitution: false,
    created_date: "02/20/2025 10:58 ICT",
  },
  {
    order_no: "CG-TOPS-2025052302-B123C4",
    customer: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone_number: "0812345678",
    channel: "LAZADA",
    status: "SHIPPED",
    business_unit: "TOPS",
    order_type: "HGH-HD-STD",
    items: 2,
    total: "฿1,250.00",
    date: "Today, 09:45 AM",
    sla_target_minutes: 60,
    elapsed_minutes: 45,
    sla_status: "COMPLIANT",
    store_name: "Central Warehouse",
    selling_location_id: "Sukhumvit",
    priority: "NORMAL",
    billing_method: "CARD",
    payment_status: "PAID",
    fulfillment_location_id: "CW-BKK-001",
    items_list: ["Organic Vegetables", "Chicken Breast"],
    order_date: "2025-05-23",
    return_status: "",
    on_hold: false,
    confirmed: true,
    allow_substitution: true,
    created_date: "02/19/2025 09:45 ICT",
  },
  {
    order_no: "CG-TOPS-2025052203-H012I3",
    customer: "David Miller",
    email: "d.miller@example.com",
    phone_number: "0845678901",
    channel: "GRAB",
    status: "PROCESSING",
    business_unit: "TOPS",
    order_type: "HGH-HD-STD",
    items: 2,
    total: "฿320.00",
    date: "Yesterday, 13:15 PM",
    sla_target_minutes: 5,
    elapsed_minutes: 6,
    sla_status: "BREACH",
    store_name: "Tops Pattaya",
    selling_location_id: "Tops Pattaya",
    priority: "HIGH",
    billing_method: "COD",
    payment_status: "PAID",
    fulfillment_location_id: "TOPS-PTY-001",
    items_list: ["Bottled Water", "Snacks"],
    order_date: "2025-05-22",
    return_status: "",
    on_hold: false,
    confirmed: true,
    allow_substitution: false,
    created_date: "02/18/2025 13:15 ICT",
  },
  {
    order_no: "CG-TOPS-2025052303-C456D7",
    customer: "Alice Brown",
    email: "alice.brown@example.com",
    phone_number: "0867890123",
    channel: "GRAB",
    status: "PROCESSING",
    business_unit: "TOPS",
    order_type: "HGH-HD-STD",
    items: 2,
    total: "฿450.00",
    date: "Today, 11:30 AM",
    sla_target_minutes: 5,
    elapsed_minutes: 4,
    sla_status: "COMPLIANT",
    store_name: "Tops Silom",
    selling_location_id: "Tops Silom",
    priority: "HIGH",
    billing_method: "COD",
    payment_status: "PAID",
    fulfillment_location_id: "TOPS-SLM-001",
    items_list: ["Coffee", "Sandwich"],
    order_date: "2025-05-23",
    return_status: "",
    on_hold: false,
    confirmed: true,
    allow_substitution: false,
    created_date: "02/20/2025 11:30 ICT",
  },
  {
    order_no: "CG-TOPS-2025052304-E789F0",
    customer: "Robert Wilson",
    email: "robert.w@example.com",
    phone_number: "0878901234",
    channel: "LAZADA",
    status: "PROCESSING",
    business_unit: "TOPS",
    order_type: "HGH-HD-STD",
    items: 1,
    total: "฿280.00",
    date: "Today, 12:15 PM",
    sla_target_minutes: 60,
    elapsed_minutes: 50,
    sla_status: "COMPLIANT",
    store_name: "Tops Thonglor",
    selling_location_id: "Tops Thonglor",
    priority: "NORMAL",
    billing_method: "CARD",
    payment_status: "PAID",
    fulfillment_location_id: "TOPS-TGL-001",
    items_list: ["Protein Shake"],
    order_date: "2025-05-23",
    return_status: "",
    on_hold: false,
    confirmed: true,
    allow_substitution: true,
    created_date: "02/20/2025 12:15 ICT",
  },
]

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...")

    // Clear existing data
    await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000")
    await supabase.from("escalation_history").delete().neq("id", "00000000-0000-0000-0000-000000000000")

    // Insert orders
    const { data: orders, error: ordersError } = await supabase.from("orders").insert(mockOrdersData).select()

    if (ordersError) {
      console.error("Error seeding orders:", ordersError)
      throw ordersError
    }

    console.log(`Successfully seeded ${orders?.length || 0} orders`)

    // Insert sample escalation history
    const escalationData = [
      {
        alert_id: "CG-TOPS-2025052203-H012I3",
        alert_type: "SLA_BREACH",
        message: "SLA breach for order CG-TOPS-2025052203-H012I3",
        severity: "HIGH",
        timestamp: "2025-05-23 08:30:00",
        status: "SENT",
        escalated_by: "System",
        escalated_to: "Tops Central World",
      },
      {
        alert_id: "INVENTORY-001",
        alert_type: "INVENTORY",
        message: "Low stock for multiple items",
        severity: "MEDIUM",
        timestamp: "2025-05-23 08:15:00",
        status: "SENT",
        escalated_by: "System",
        escalated_to: "Inventory Management Team",
      },
    ]

    const { data: escalations, error: escalationsError } = await supabase
      .from("escalation_history")
      .insert(escalationData)
      .select()

    if (escalationsError) {
      console.error("Error seeding escalations:", escalationsError)
      throw escalationsError
    }

    console.log(`Successfully seeded ${escalations?.length || 0} escalation records`)
    console.log("Database seeding completed successfully!")

    return { orders, escalations }
  } catch (error) {
    console.error("Database seeding failed:", error)
    throw error
  }
}
