import { NextResponse } from "next/server"
import { getAuthToken } from "@/lib/auth-client"

export const dynamic = "force-dynamic"

// Base URL for the external API
const BASE_URL = process.env.API_BASE_URL || "https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1"

// Handle CORS preflight requests
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

// Lightweight order summary interface
interface OrderSummary {
  id: string
  order_no: string
  status: string
  channel: string
  total_amount: number
  order_date: string
  sla_info: {
    target_minutes: number
    elapsed_minutes: number
    status: string
  }
  delivery_type?: string
}

/**
 * Generate mock order data for development mode
 * Creates 149 orders with ~฿117,699 total revenue (~฿790 avg per order)
 * Channel distribution: 60% TOL, 40% MKP
 * Includes delivery_type for platform subdivision in exports
 */
function generateMockOrderData(dateFrom: string, dateTo: string): OrderSummary[] {
  // Parse date range for distribution
  const endDate = dateTo ? new Date(dateTo) : new Date()
  const startDate = dateFrom ? new Date(dateFrom) : new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000) // Default 7 days
  const dayCount = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1)

  // Target: 149 orders with ~฿117,699 total revenue (avg ~฿790 per order)
  const TARGET_ORDERS = 149

  // Channel arrays for distribution
  const tolChannels = ['Web', 'TOL', 'Tops Online']
  const mkpChannels = ['Shopee', 'Lazada']  // Only Shopee and Lazada for MKP

  // TOL delivery types for platform subdivision
  const tolDeliveryTypes = ['Standard Delivery', 'Express Delivery', 'Click & Collect']

  return Array.from({ length: TARGET_ORDERS }).map((_, i) => {
    // Distribute orders evenly across the date range
    const dayOffset = i % dayCount
    const orderDate = new Date(startDate)
    orderDate.setDate(startDate.getDate() + dayOffset)

    // Generate revenue around ฿790 average with some variation (฿400 - ฿1200 range)
    // Use seeded random based on index for consistency
    const seed = (i * 9301 + 49297) % 233280
    const revenue = Math.floor(400 + (seed / 233280) * 800)

    // 60% TOL, 40% MKP distribution
    let channel: string
    let deliveryType: string

    if (i % 10 < 6) {
      // TOL channels - assign delivery type based on index
      channel = tolChannels[i % tolChannels.length]
      deliveryType = tolDeliveryTypes[i % tolDeliveryTypes.length]
    } else {
      // MKP channels - use channel name as platform (Shopee or Lazada)
      channel = mkpChannels[i % mkpChannels.length]
      deliveryType = channel  // For MKP, delivery_type is the marketplace name
    }

    return {
      id: `mock-${i}`,
      order_no: `MOCK-${1000 + i}`,
      status: 'COMPLETED',
      channel: channel,
      total_amount: revenue,
      order_date: orderDate.toISOString(),
      sla_info: { target_minutes: 60, elapsed_minutes: 30, status: 'ON_TRACK' },
      delivery_type: deliveryType
    }
  })
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract pagination parameters
    const page = searchParams.get("page") || "1"
    const pageSize = searchParams.get("pageSize") || "10"
    const status = searchParams.get("status") || ""
    const channel = searchParams.get("channel") || ""
    const search = searchParams.get("search") || ""
    const dateFrom = searchParams.get("dateFrom") || ""
    const dateTo = searchParams.get("dateTo") || ""

    console.log(`🔄 Orders summary API request:`, { page, pageSize, status, channel, search, dateFrom, dateTo })

    // Get authentication token
    let token: string
    try {
      token = await getAuthToken()
    } catch (authError) {
      console.error("❌ Authentication failed:", authError)

      // In development mode, return mock data instead of empty error
      if (process.env.NODE_ENV === 'development') {
        console.log("⚠️ Auth failed, using mock data for development")
        const mockOrders = generateMockOrderData(dateFrom, dateTo)
        const mockResponse = NextResponse.json({
          success: true,
          data: {
            data: mockOrders,
            pagination: {
              page: Number.parseInt(page),
              pageSize: mockOrders.length,
              total: mockOrders.length,
              hasNext: false,
              hasPrev: false,
            },
          },
        })

        mockResponse.headers.set('Access-Control-Allow-Origin', '*')
        mockResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        mockResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

        return mockResponse
      }

      const authErrorResponse = NextResponse.json({
        success: false,
        error: `Authentication failed: ${authError instanceof Error ? authError.message : "Unknown auth error"}`,
        data: {
          data: [],
          pagination: {
            page: Number.parseInt(page),
            pageSize: Number.parseInt(pageSize),
            total: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      })

      authErrorResponse.headers.set('Access-Control-Allow-Origin', '*')
      authErrorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      authErrorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      return authErrorResponse
    }

    // Build API URL with pagination
    const apiUrl = new URL(`${BASE_URL}/merchant/orders`)
    apiUrl.searchParams.set("page", page)
    apiUrl.searchParams.set("pageSize", pageSize)

    // Add optional filters
    if (status && status !== "all-status") apiUrl.searchParams.set("status", status)
    if (channel && channel !== "all-channels") apiUrl.searchParams.set("channel", channel)
    if (search) apiUrl.searchParams.set("search", search)

    // Add date filtering (YYYY-MM-DD format)
    if (dateFrom) apiUrl.searchParams.set("dateFrom", dateFrom)
    if (dateTo) apiUrl.searchParams.set("dateTo", dateTo)

    console.log(`🔄 Fetching from API: ${apiUrl.toString()}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} - ${response.statusText}`)

      if (response.status === 401) {
        console.log("🔄 Token may be expired, refreshing and retrying...")

        try {
          const newToken = await getAuthToken(true)
          const retryController = new AbortController()
          const retryTimeoutId = setTimeout(() => retryController.abort(), 30000)

          const retryResponse = await fetch(apiUrl.toString(), {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${newToken}`,
            },
            signal: retryController.signal,
          })

          clearTimeout(retryTimeoutId)

          if (retryResponse.ok) {
            const retryData = await retryResponse.json()
            const summaryData = transformToSummary(retryData, dateFrom, dateTo)
            console.log(`✅ Summary API Success (retry): Page ${page}, ${summaryData.data?.length || 0} orders`)

            const retrySuccessResponse = NextResponse.json({
              success: true,
              data: summaryData,
            })

            retrySuccessResponse.headers.set('Access-Control-Allow-Origin', '*')
            retrySuccessResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            retrySuccessResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

            return retrySuccessResponse
          }
        } catch (retryError) {
          console.error("❌ Retry failed:", retryError)
        }
      }

      // In development mode, return mock data instead of empty error
      if (process.env.NODE_ENV === 'development') {
        console.log("⚠️ API error, using mock data for development")
        const mockOrders = generateMockOrderData(dateFrom, dateTo)
        const mockResponse = NextResponse.json({
          success: true,
          data: {
            data: mockOrders,
            pagination: {
              page: Number.parseInt(page),
              pageSize: mockOrders.length,
              total: mockOrders.length,
              hasNext: false,
              hasPrev: false,
            },
          },
        })

        mockResponse.headers.set('Access-Control-Allow-Origin', '*')
        mockResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        mockResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

        return mockResponse
      }

      const errorResponse = NextResponse.json({
        success: false,
        error: `API Error: ${response.status} - ${response.statusText}`,
        data: {
          data: [],
          pagination: {
            page: Number.parseInt(page),
            pageSize: Number.parseInt(pageSize),
            total: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      })

      errorResponse.headers.set('Access-Control-Allow-Origin', '*')
      errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      return errorResponse
    }

    const data = await response.json()
    const summaryData = transformToSummary(data, dateFrom, dateTo)
    console.log(`✅ Summary API Success: Page ${page}, ${summaryData.data?.length || 0} orders`)

    const successResponse = NextResponse.json({
      success: true,
      data: summaryData,
    })

    successResponse.headers.set('Access-Control-Allow-Origin', '*')
    successResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    successResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return successResponse
  } catch (error: any) {
    console.error("❌ Server proxy error:", error)

    const { searchParams: fallbackParams } = new URL(request.url)
    const fallbackPage = fallbackParams.get("page") || "1"
    const fallbackPageSize = fallbackParams.get("pageSize") || "10"
    const fallbackDateFrom = fallbackParams.get("dateFrom") || ""
    const fallbackDateTo = fallbackParams.get("dateTo") || ""

    // In development mode, return mock data instead of empty error
    if (process.env.NODE_ENV === 'development') {
      console.log("⚠️ Server error, using mock data for development")
      const mockOrders = generateMockOrderData(fallbackDateFrom, fallbackDateTo)
      const mockResponse = NextResponse.json({
        success: true,
        data: {
          data: mockOrders,
          pagination: {
            page: Number.parseInt(fallbackPage),
            pageSize: mockOrders.length,
            total: mockOrders.length,
            hasNext: false,
            hasPrev: false,
          },
        },
      })

      mockResponse.headers.set('Access-Control-Allow-Origin', '*')
      mockResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      mockResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      return mockResponse
    }

    let errorMessage = "Unknown server error"
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "Request timeout"
      } else {
        errorMessage = error.message
      }
    }

    const fallbackResponse = NextResponse.json({
      success: false,
      error: errorMessage,
      data: {
        data: [],
        pagination: {
          page: Number.parseInt(fallbackPage),
          pageSize: Number.parseInt(fallbackPageSize),
          total: 0,
          hasNext: false,
          hasPrev: false,
        },
      },
    })

    fallbackResponse.headers.set('Access-Control-Allow-Origin', '*')
    fallbackResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    fallbackResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return fallbackResponse
  }
}

// Transform full order objects to lightweight summary objects
function transformToSummary(apiResponse: any, dateFrom?: string, dateTo?: string) {
  let orders = apiResponse.data && Array.isArray(apiResponse.data) ? apiResponse.data : []

  // If in development and no data (or empty data), use the shared mock data generator
  if (process.env.NODE_ENV === 'development' && orders.length === 0) {
    console.log("⚠️ Empty API response, using mock data for development")
    orders = generateMockOrderData(dateFrom || '', dateTo || '')
  }

  const summaryOrders: OrderSummary[] = orders.map((order: any) => {
    return {
      id: order.id,
      order_no: order.order_no,
      status: order.status,
      channel: order.channel,
      total_amount: order.total_amount,
      order_date: order.order_date,
      sla_info: {
        target_minutes: order.sla_info?.target_minutes || 0,
        elapsed_minutes: order.sla_info?.elapsed_minutes || 0,
        status: order.sla_info?.status || "",
      },
      delivery_type: order.delivery_type,
    }
  })

  return {
    data: summaryOrders,
    pagination: apiResponse.pagination || {
      page: 1,
      pageSize: summaryOrders.length,
      total: summaryOrders.length,
      hasNext: false,
      hasPrev: false,
    },
  }
}
