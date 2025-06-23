import { NextResponse } from "next/server"
import { getAuthToken } from "@/lib/auth-client"

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
    // Check for valid API credentials early
    const hasValidCredentials = !!(process.env.API_BASE_URL && process.env.PARTNER_CLIENT_ID && process.env.PARTNER_CLIENT_SECRET)
    if (!hasValidCredentials) {
      console.error("❌ Missing API credentials")
      const credentialsError = NextResponse.json({
        success: false,
        error: "Missing API credentials. Please set API_BASE_URL, PARTNER_CLIENT_ID, and PARTNER_CLIENT_SECRET in environment variables.",
        fallback: true,
        data: {
          data: [],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      }, { status: 500 })
      
      credentialsError.headers.set('Access-Control-Allow-Origin', '*')
      credentialsError.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      credentialsError.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      
      return credentialsError
    }

    const { searchParams } = new URL(request.url)

    // Extract pagination parameters
    const page = searchParams.get("page") || "1"
    const pageSize = searchParams.get("pageSize") || "10"
    const status = searchParams.get("status") || ""
    const channel = searchParams.get("channel") || ""
    const search = searchParams.get("search") || ""
    const dateFrom = searchParams.get("dateFrom") || ""
    const dateTo = searchParams.get("dateTo") || ""

    console.log(`🔄 External orders API request:`, { page, pageSize, status, channel, search, dateFrom, dateTo })

    // Get authentication token
    let token: string
    let isUsingMockAuth = false
    try {
      token = await getAuthToken()
      isUsingMockAuth = token.startsWith("mock-dev-token-")
    } catch (authError) {
      console.error("❌ Authentication failed, returning fallback response:", authError)
      const authErrorResponse = NextResponse.json({
        success: false,
        error: `Authentication failed: ${authError instanceof Error ? authError.message : "Unknown auth error"}`,
        fallback: true,
        data: {
          data: [], // Empty data array
          pagination: {
            page: Number.parseInt(page),
            pageSize: Number.parseInt(pageSize),
            total: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      })
      
      // Add CORS headers
      authErrorResponse.headers.set('Access-Control-Allow-Origin', '*')
      authErrorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      authErrorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      
      return authErrorResponse
    }

    // If using mock authentication, return fallback data immediately
    if (isUsingMockAuth) {
      console.log("🟡 Using mock authentication - returning fallback data")
      const mockResponse = NextResponse.json({
        success: true,
        data: {
          data: [], // Empty data array
          pagination: {
            page: Number.parseInt(page),
            pageSize: Number.parseInt(pageSize),
            total: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
        mockData: true,
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

    // Add optional filters
    if (status && status !== "all-status") apiUrl.searchParams.set("status", status)
    if (channel && channel !== "all-channels") apiUrl.searchParams.set("channel", channel)
    if (search) apiUrl.searchParams.set("search", search)
    
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

      const errorResponse = NextResponse.json({
        success: false,
        error: `API Error: ${response.status} - ${response.statusText}`,
        fallback: true,
        data: {
          data: [], // Empty data array for fallback
          pagination: {
            page: Number.parseInt(page),
            pageSize: Number.parseInt(pageSize),
            total: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
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
    console.error("❌ Server proxy error:", error, "Stack:", error?.stack);

    // Get searchParams safely for fallback response
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
      fallback: true,
      data: {
        data: [], // Empty data array for fallback
        pagination: {
          page: Number.parseInt(fallbackPage),
          pageSize: Number.parseInt(fallbackPageSize),
          total: 0,
          hasNext: false,
          hasPrev: false,
        },
      },
    })
    
    // Add CORS headers
    fallbackResponse.headers.set('Access-Control-Allow-Origin', '*')
    fallbackResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    fallbackResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return fallbackResponse
  }
}
