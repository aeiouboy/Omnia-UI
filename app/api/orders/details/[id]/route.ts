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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    console.log(`🔄 Order details API request for ID: ${orderId}`)

    // Get authentication token
    let token: string
    try {
      token = await getAuthToken()
    } catch (authError) {
      console.error("❌ Authentication failed:", authError)
      const authErrorResponse = NextResponse.json({
        success: false,
        error: `Authentication failed: ${authError instanceof Error ? authError.message : "Unknown auth error"}`,
        data: null,
      })
      
      authErrorResponse.headers.set('Access-Control-Allow-Origin', '*')
      authErrorResponse.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
      authErrorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      
      return authErrorResponse
    }

    // Fetch single order details - we'll need to search by ID since API doesn't have direct endpoint
    const apiUrl = new URL(`${BASE_URL}/merchant/orders`)
    apiUrl.searchParams.set("page", "1")
    apiUrl.searchParams.set("pageSize", "1000") // Large enough to find the order
    apiUrl.searchParams.set("search", orderId) // Search by order ID

    console.log(`🔄 Fetching order details from API: ${apiUrl.toString()}`)

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
            const orderDetail = findOrderById(retryData, orderId)
            console.log(`✅ Order details API Success (retry): ${orderDetail ? 'Found' : 'Not found'}`)

            const retrySuccessResponse = NextResponse.json({
              success: true,
              data: orderDetail,
            })
            
            retrySuccessResponse.headers.set('Access-Control-Allow-Origin', '*')
            retrySuccessResponse.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
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
        data: null,
      })
      
      errorResponse.headers.set('Access-Control-Allow-Origin', '*')
      errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
      errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      
      return errorResponse
    }

    const data = await response.json()
    const orderDetail = findOrderById(data, orderId)
    console.log(`✅ Order details API Success: ${orderDetail ? 'Found' : 'Not found'}`)

    const successResponse = NextResponse.json({
      success: true,
      data: orderDetail,
    })
    
    successResponse.headers.set('Access-Control-Allow-Origin', '*')
    successResponse.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    successResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return successResponse
  } catch (error: any) {
    console.error("❌ Server proxy error:", error)

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
      data: null,
    })
    
    fallbackResponse.headers.set('Access-Control-Allow-Origin', '*')
    fallbackResponse.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    fallbackResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return fallbackResponse
  }
}

// Find specific order by ID in the response
function findOrderById(apiResponse: any, orderId: string) {
  if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
    return null
  }

  // Find order by exact ID match
  const order = apiResponse.data.find((order: any) => 
    order.id === orderId || order.order_no === orderId
  )

  return order || null
}
