import { NextResponse } from "next/server"
import { getAuthToken } from "@/lib/auth-client"
import { getMockOrders } from "@/lib/mock-data"

export const dynamic = "force-dynamic"

// Base URL for the external API (merchant orders endpoint)
const BASE_URL = "https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1/merchant/orders"

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract pagination parameters
    const page = searchParams.get("page") || "1"
    const pageSize = searchParams.get("pageSize") || "10"
    const status = searchParams.get("status") || ""
    const channel = searchParams.get("channel") || ""
    const businessUnit = searchParams.get("businessUnit") || ""
    const search = searchParams.get("search") || ""
    const dateFrom = searchParams.get("dateFrom") || ""
    const dateTo = searchParams.get("dateTo") || ""

    // Extract advanced filter parameters
    const orderNumber = searchParams.get("orderNumber") || ""
    const customerName = searchParams.get("customerName") || ""
    const phoneNumber = searchParams.get("phoneNumber") || ""
    const email = searchParams.get("email") || ""
    const exceedSLA = searchParams.get("exceedSLA") || ""
    const location = searchParams.get("location") || ""
    const items = searchParams.get("items") || ""
    const paymentStatus = searchParams.get("paymentStatus") || ""

    console.log(`🔄 External orders API request:`, {
      page, pageSize, status, channel, businessUnit, search, dateFrom, dateTo,
      orderNumber, customerName, phoneNumber, email, exceedSLA, location, items, paymentStatus
    })

    // Check if forced to use mock data
    const useMockData = process.env.USE_MOCK_DATA === "true"

    // Check for valid API credentials
    const hasValidCredentials = !!(process.env.API_BASE_URL && process.env.PARTNER_CLIENT_ID && process.env.PARTNER_CLIENT_SECRET)

    /**
     * Fallback to mock data if:
     * 1. USE_MOCK_DATA is explicitly set to true, OR
     * 2. API credentials are missing
     */
    if (useMockData || !hasValidCredentials) {
      console.warn("⚠️ Using mock data - API authentication unavailable")

      // Get mock orders with filters applied
      const mockResult = getMockOrders({
        status: status !== "all-status" ? status : undefined,
        channel: channel !== "all-channels" ? channel : undefined,
        businessUnit: businessUnit && businessUnit !== "ALL" ? businessUnit : undefined,
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page: Number.parseInt(page),
        pageSize: Number.parseInt(pageSize)
      })

      const mockResponse = NextResponse.json({
        success: true,
        data: {
          data: mockResult.data,
          pagination: mockResult.pagination
        },
        mockData: true
      })

      // Add CORS headers
      mockResponse.headers.set('Access-Control-Allow-Origin', '*')
      mockResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      mockResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      return mockResponse
    }

    // Get authentication token
    let token: string
    let isUsingMockAuth = false
    try {
      token = await getAuthToken()
      isUsingMockAuth = token.startsWith("mock-dev-token-")
    } catch (authError) {
      console.warn("⚠️ Authentication failed, falling back to mock data:", authError)

      // Fallback to mock data on authentication failure
      const mockResult = getMockOrders({
        status: status !== "all-status" ? status : undefined,
        channel: channel !== "all-channels" ? channel : undefined,
        businessUnit: businessUnit && businessUnit !== "ALL" ? businessUnit : undefined,
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page: Number.parseInt(page),
        pageSize: Number.parseInt(pageSize)
      })

      const authErrorResponse = NextResponse.json({
        success: true,
        data: {
          data: mockResult.data,
          pagination: mockResult.pagination
        },
        mockData: true
      })

      // Add CORS headers
      authErrorResponse.headers.set('Access-Control-Allow-Origin', '*')
      authErrorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      authErrorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      return authErrorResponse
    }

    // If using mock authentication, return mock data
    if (isUsingMockAuth) {
      console.warn("⚠️ Using mock authentication - returning mock data")

      const mockResult = getMockOrders({
        status: status !== "all-status" ? status : undefined,
        channel: channel !== "all-channels" ? channel : undefined,
        businessUnit: businessUnit && businessUnit !== "ALL" ? businessUnit : undefined,
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page: Number.parseInt(page),
        pageSize: Number.parseInt(pageSize)
      })

      const mockResponse = NextResponse.json({
        success: true,
        data: {
          data: mockResult.data,
          pagination: mockResult.pagination
        },
        mockData: true
      })

      // Add CORS headers
      mockResponse.headers.set('Access-Control-Allow-Origin', '*')
      mockResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      mockResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      return mockResponse
    }

    // Build API URL with pagination
    const apiUrl = new URL(BASE_URL)
    apiUrl.searchParams.set("page", page)
    apiUrl.searchParams.set("pageSize", pageSize)

    // Add filters supported by the external API
    if (status && status !== "all-status") apiUrl.searchParams.set("status", status)
    if (channel && channel !== "all-channels") apiUrl.searchParams.set("channel", channel)
    if (businessUnit && businessUnit !== "ALL") apiUrl.searchParams.set("businessUnit", businessUnit)
    if (search) apiUrl.searchParams.set("search", search)
    
    // NOTE: The following filters are not yet supported by the external API
    // They are passed through for logging but filtering happens client-side
    // TODO: When partner API is updated, add these parameters:
    // - orderNumber, customerName, phoneNumber, email
    // - exceedSLA, location, items, paymentStatus
    
    // Add date filtering (YYYY-MM-DD format) - Required parameters
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)
    
    const defaultDateFrom = sevenDaysAgo.toISOString().split('T')[0]
    const defaultDateTo = today.toISOString().split('T')[0]
    
    apiUrl.searchParams.set("dateFrom", dateFrom || defaultDateFrom)
    apiUrl.searchParams.set("dateTo", dateTo || defaultDateTo)

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

      // If we get 401 Unauthorized, try to refresh the token and retry once
      if (response.status === 401) {
        console.log("🔄 Token may be expired, refreshing and retrying...")

        try {
          // Force new token
          const newToken = await getAuthToken(true)

          // Retry the request with new token
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
            console.log(`✅ API Success (retry): Page ${page}, ${retryData.data?.length || 0} orders`)

            const retrySuccessResponse = NextResponse.json({
              success: true,
              data: retryData,
            })
            
            // Add CORS headers
            retrySuccessResponse.headers.set('Access-Control-Allow-Origin', '*')
            retrySuccessResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            retrySuccessResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            
            return retrySuccessResponse
          }
        } catch (retryError) {
          console.error("❌ Retry failed:", retryError)
        }
      }

      // Fallback to mock data on API error
      console.warn("⚠️ API error, falling back to mock data")
      const mockResult = getMockOrders({
        status: status !== "all-status" ? status : undefined,
        channel: channel !== "all-channels" ? channel : undefined,
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page: Number.parseInt(page),
        pageSize: Number.parseInt(pageSize)
      })

      const errorResponse = NextResponse.json({
        success: true,
        data: {
          data: mockResult.data,
          pagination: mockResult.pagination
        },
        mockData: true
      })

      // Add CORS headers
      errorResponse.headers.set('Access-Control-Allow-Origin', '*')
      errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      return errorResponse
    }

    const data = await response.json()
    console.log(`✅ API Success: Page ${page}, ${data.data?.length || 0} orders`)

    const successResponse = NextResponse.json({
      success: true,
      data: data,
    })
    
    // Add CORS headers
    successResponse.headers.set('Access-Control-Allow-Origin', '*')
    successResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    successResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return successResponse
  } catch (error: any) {
    console.warn("⚠️ Server proxy error, falling back to mock data:", error, "Stack:", error?.stack);

    // Get searchParams safely for fallback response
    const { searchParams: fallbackParams } = new URL(request.url)
    const fallbackPage = fallbackParams.get("page") || "1"
    const fallbackPageSize = fallbackParams.get("pageSize") || "10"
    const fallbackStatus = fallbackParams.get("status") || ""
    const fallbackChannel = fallbackParams.get("channel") || ""
    const fallbackSearch = fallbackParams.get("search") || ""
    const fallbackDateFrom = fallbackParams.get("dateFrom") || ""
    const fallbackDateTo = fallbackParams.get("dateTo") || ""

    // Fallback to mock data on any server error
    const mockResult = getMockOrders({
      status: fallbackStatus !== "all-status" ? fallbackStatus : undefined,
      channel: fallbackChannel !== "all-channels" ? fallbackChannel : undefined,
      search: fallbackSearch || undefined,
      dateFrom: fallbackDateFrom || undefined,
      dateTo: fallbackDateTo || undefined,
      page: Number.parseInt(fallbackPage),
      pageSize: Number.parseInt(fallbackPageSize)
    })

    const fallbackResponse = NextResponse.json({
      success: true,
      data: {
        data: mockResult.data,
        pagination: mockResult.pagination
      },
      mockData: true
    })

    // Add CORS headers
    fallbackResponse.headers.set('Access-Control-Allow-Origin', '*')
    fallbackResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    fallbackResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return fallbackResponse
  }
}
