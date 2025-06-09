import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

// Authentication credentials (with environment variable fallbacks)
const PARTNER_CLIENT_ID = process.env.PARTNER_CLIENT_ID || "testpocorderlist"
const PARTNER_CLIENT_SECRET = process.env.PARTNER_CLIENT_SECRET || "xitgmLwmp"
const BASE_URL = process.env.API_BASE_URL || "https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1"

// Cache for authentication token
let authToken: string | null = null
let tokenExpiry: number = 0

async function getAuthToken(): Promise<string> {
  // Check if we have a valid cached token
  if (authToken && Date.now() < tokenExpiry) {
    return authToken
  }

  console.log("🔐 Authenticating with external API...")
  console.log(`🔗 Auth URL: ${BASE_URL}/auth/poc-orderlist/login`)
  console.log(`🔑 Client ID: ${PARTNER_CLIENT_ID}`)
  
  const authController = new AbortController()
  const authTimeoutId = setTimeout(() => authController.abort(), 15000)

  try {
    const loginResponse = await fetch(`${BASE_URL}/auth/poc-orderlist/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        partnerClientId: PARTNER_CLIENT_ID,
        partnerClientSecret: PARTNER_CLIENT_SECRET,
      }),
      signal: authController.signal,
    })

    clearTimeout(authTimeoutId)

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text()
      console.error(`❌ Auth Error: ${loginResponse.status} - ${loginResponse.statusText}`)
      console.error(`❌ Auth Response: ${errorText}`)
      throw new Error(`Authentication failed: ${loginResponse.status} - ${loginResponse.statusText}`)
    }

    const authData = await loginResponse.json()
    console.log("✅ Authentication successful")

    // Cache the token (assuming it expires in 1 hour if not specified)
    authToken = authData.token || authData.access_token || authData.accessToken
    tokenExpiry = Date.now() + (authData.expires_in ? authData.expires_in * 1000 : 3600000) // 1 hour default

    if (!authToken) {
      throw new Error("No token received from authentication response")
    }

    return authToken
  } catch (error) {
    clearTimeout(authTimeoutId)
    console.error("❌ Authentication error:", error)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract pagination parameters
    const page = searchParams.get("page") || "1"
    const pageSize = searchParams.get("pageSize") || "10"

    // Get authentication token with fallback
    let token: string
    try {
      token = await getAuthToken()
    } catch (authError) {
      console.error("❌ Authentication failed, returning fallback response:", authError)
      return NextResponse.json({
        success: false,
        error: `Authentication failed: ${authError instanceof Error ? authError.message : 'Unknown auth error'}`,
        fallback: true,
        data: {
          data: [], // Empty data array
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            total: 0,
            hasNext: false,
            hasPrev: false
          }
        }
      })
    }

    // Build API URL with pagination
    const apiUrl = new URL(`${BASE_URL}/merchant/orders`)
    apiUrl.searchParams.set("page", page)
    apiUrl.searchParams.set("pageSize", pageSize)

    // Add any other query parameters
    for (const [key, value] of searchParams.entries()) {
      if (key !== "page" && key !== "pageSize") {
        apiUrl.searchParams.set(key, value)
      }
    }

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
        authToken = null // Clear cached token
        tokenExpiry = 0
        
        try {
          const newToken = await getAuthToken()
          
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
            
            return NextResponse.json({
              success: true,
              data: retryData,
            })
          }
        } catch (retryError) {
          console.error("❌ Retry failed:", retryError)
        }
      }
      
      return NextResponse.json({
        success: false,
        error: `API Error: ${response.status} - ${response.statusText}`,
        fallback: true,
      })
    }

    const data = await response.json()
    console.log(`✅ API Success: Page ${page}, ${data.data?.length || 0} orders`)

    return NextResponse.json({
      success: true,
      data: data,
    })
  } catch (error) {
    console.error("❌ Server proxy error:", error)

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

    return NextResponse.json({
      success: false,
      error: errorMessage,
      fallback: true,
      data: {
        data: [], // Empty data array for fallback
        pagination: {
          page: parseInt(fallbackPage),
          pageSize: parseInt(fallbackPageSize),
          total: 0,
          hasNext: false,
          hasPrev: false
        }
      }
    })
  }
}
