import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { z } from "zod"

// Input validation schema
const OrderQuerySchema = z.object({
  // Filtering parameters
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  customerId: z.string().optional(),
  customerEmail: z.string().email().optional(),
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"]).optional(),
  productId: z.string().optional(),
  channel: z.string().optional(),
  businessUnit: z.string().optional(),

  // Pagination parameters
  page: z
    .string()
    .transform((val) => Number.parseInt(val) || 1)
    .optional(),
  pageSize: z
    .string()
    .transform((val) => {
      const size = Number.parseInt(val) || 20
      return Math.min(Math.max(size, 1), 100) // Limit between 1-100
    })
    .optional(),

  // Sorting parameters
  sortBy: z.enum(["order_date", "total", "created_at", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),

  // Search parameter
  search: z.string().optional(),
})

type OrderQuery = z.infer<typeof OrderQuerySchema>

// Response types
interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  total_price: number
  product_details?: {
    description: string
    category: string
    brand: string
  }
}

interface OrderResponse {
  id: string
  order_no: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  order_date: string
  status: string
  channel: string
  business_unit: string
  order_type: string
  items: OrderItem[]
  total_amount: number
  shipping_address: {
    street?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  payment_info: {
    method: string
    status: string
    transaction_id?: string
  }
  sla_info: {
    target_minutes: number
    elapsed_minutes: number
    status: string
  }
  metadata: {
    created_at: string
    updated_at: string
    priority: string
    store_name: string
  }
}

interface PaginatedResponse {
  data: OrderResponse[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: OrderQuery
}

// Authentication middleware
async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, error: "Missing or invalid authorization header" }
  }

  const token = authHeader.substring(7)

  // In a real implementation, you would validate the JWT token
  // For now, we'll do a simple check
  if (!token || token.length < 10) {
    return { authenticated: false, error: "Invalid token" }
  }

  // You could also check user permissions here
  return { authenticated: true, userId: "user-id-from-token" }
}

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(clientId: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now()
  const clientData = rateLimitMap.get(clientId)

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (clientData.count >= limit) {
    return false
  }

  clientData.count++
  return true
}

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const auth = await authenticateRequest(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized", message: auth.error }, { status: 401 })
    }

    // Rate limiting
    const clientId = request.ip || "unknown"
    if (!checkRateLimit(clientId)) {
      return NextResponse.json({ error: "Rate limit exceeded", message: "Too many requests" }, { status: 429 })
    }

    // Parse and validate query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())

    const validationResult = OrderQuerySchema.safeParse(queryParams)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const query = validationResult.data
    const page = query.page || 1
    const pageSize = query.pageSize || 20
    const offset = (page - 1) * pageSize

    // Build the base query
    let supabaseQuery = supabase.from("orders").select(`
        *,
        items_list
      `)

    // Apply filters
    if (query.startDate) {
      supabaseQuery = supabaseQuery.gte("order_date", query.startDate)
    }

    if (query.endDate) {
      supabaseQuery = supabaseQuery.lte("order_date", query.endDate)
    }

    if (query.customerId) {
      supabaseQuery = supabaseQuery.eq("customer", query.customerId)
    }

    if (query.customerEmail) {
      supabaseQuery = supabaseQuery.eq("email", query.customerEmail)
    }

    if (query.status) {
      supabaseQuery = supabaseQuery.eq("status", query.status)
    }

    if (query.channel) {
      supabaseQuery = supabaseQuery.eq("channel", query.channel)
    }

    if (query.businessUnit) {
      supabaseQuery = supabaseQuery.eq("business_unit", query.businessUnit)
    }

    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        `order_no.ilike.%${query.search}%,customer.ilike.%${query.search}%,email.ilike.%${query.search}%`,
      )
    }

    // Apply sorting
    const sortBy = query.sortBy || "created_at"
    const sortOrder = query.sortOrder || "desc"
    supabaseQuery = supabaseQuery.order(sortBy, { ascending: sortOrder === "asc" })

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })

    if (countError) {
      throw new Error(`Failed to get total count: ${countError.message}`)
    }

    // Apply pagination
    supabaseQuery = supabaseQuery.range(offset, offset + pageSize - 1)

    // Execute query
    const { data: orders, error } = await supabaseQuery

    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }

    // Transform data to match response format
    const transformedOrders: OrderResponse[] = (orders || []).map((order) => ({
      id: order.id,
      order_no: order.order_no,
      customer: {
        id: order.id, // In a real app, this would be a separate customer ID
        name: order.customer,
        email: order.email,
        phone: order.phone_number,
      },
      order_date: order.order_date,
      status: order.status,
      channel: order.channel,
      business_unit: order.business_unit,
      order_type: order.order_type,
      items: Array.isArray(order.items_list)
        ? order.items_list.map((item: any) => ({
            id: item.id || `${order.id}-${item.product_id}`,
            product_id: item.product_id,
            product_name: item.name || item.product_name,
            product_sku: item.sku || item.product_sku,
            quantity: item.quantity,
            unit_price: Number.parseFloat(item.price || item.unit_price || "0"),
            total_price: Number.parseFloat(item.price || item.unit_price || "0") * item.quantity,
            product_details: {
              description: item.description || "",
              category: item.category || "",
              brand: item.brand || "",
            },
          }))
        : [],
      total_amount: Number.parseFloat(order.total.replace(/[^0-9.-]+/g, "") || "0"),
      shipping_address: {
        street: order.shipping_street,
        city: order.shipping_city,
        state: order.shipping_state,
        postal_code: order.shipping_postal_code,
        country: order.shipping_country || "US",
      },
      payment_info: {
        method: order.billing_method,
        status: order.payment_status,
        transaction_id: order.transaction_id,
      },
      sla_info: {
        target_minutes: order.sla_target_minutes,
        elapsed_minutes: order.elapsed_minutes,
        status: order.sla_status,
      },
      metadata: {
        created_at: order.created_at,
        updated_at: order.updated_at,
        priority: order.priority,
        store_name: order.store_name,
      },
    }))

    // Calculate pagination metadata
    const total = totalCount || 0
    const totalPages = Math.ceil(total / pageSize)

    const response: PaginatedResponse = {
      data: transformedOrders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: query,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("API Error:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: "Method not allowed", message: "This endpoint only supports GET requests" },
    { status: 405 },
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed", message: "This endpoint only supports GET requests" },
    { status: 405 },
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed", message: "This endpoint only supports GET requests" },
    { status: 405 },
  )
}
