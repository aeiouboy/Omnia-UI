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
            const summaryData = transformToSummary(retryData)
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
    const summaryData = transformToSummary(data)
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
function transformToSummary(apiResponse: any) {
  let orders = apiResponse.data && Array.isArray(apiResponse.data) ? apiResponse.data : []

  // If in development and no data (or empty data), generate mock data
  if (process.env.NODE_ENV === 'development' && orders.length === 0) {
    console.log("⚠️ Generating synthetic mock data for development...")
    orders = Array.from({ length: 150 }).map((_, i) => ({
      id: `mock-${i}`,
      order_no: `MOCK-${1000 + i}`,
      status: 'COMPLETED',
      channel: 'Web', // Will be overridden in map
      total_amount: Math.floor(Math.random() * 5000) + 500,
      order_date: new Date().toISOString(), // Will be overridden
      sla_info: { target_minutes: 60, elapsed_minutes: 30, status: 'ON_TRACK' }
    }))
  }

  const summaryOrders: OrderSummary[] = orders.map((order: any, index: number) => {
    // Mock Selling Channel Logic (matching OrderManagementHub)
    let channel = order.channel
    let orderDate = order.order_date

    if (process.env.NODE_ENV === 'development') {
      const sellingChannels = ['Web', 'Grab', 'Lineman', 'Gokoo', 'Shopee', 'Lazada']
      channel = sellingChannels[index % sellingChannels.length]

      // Mock Date: Distribute orders over the last 14 days to ensure they appear in charts
      // Current date is 2026-01-15, match this dynamic reference
      const today = new Date()
      const dayOffset = index % 14
      const mockDate = new Date(today)
      mockDate.setDate(today.getDate() - dayOffset)
      orderDate = mockDate.toISOString()
    }

    return {
      id: order.id,
      order_no: order.order_no,
      status: order.status,
      channel: channel,
      total_amount: order.total_amount,
      order_date: orderDate,
      sla_info: {
        target_minutes: order.sla_info?.target_minutes || 0,
        elapsed_minutes: order.sla_info?.elapsed_minutes || 0,
        status: order.sla_info?.status || "",
      },
    }
  })

  return {
    data: summaryOrders,
    pagination: apiResponse.pagination,
  }
}
