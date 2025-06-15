import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Authentication credentials
const PARTNER_CLIENT_ID = process.env.PARTNER_CLIENT_ID || "testpocorderlist"
const PARTNER_CLIENT_SECRET = process.env.PARTNER_CLIENT_SECRET || "xitgmLwmp"
const BASE_URL = process.env.API_BASE_URL || "https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    
    // Check if this is a manual token injection
    if (body.manualToken) {
      console.log("🔧 Manual Bearer Token injection received")
      return NextResponse.json({
        success: true,
        message: "Manual token accepted - use setManualAuthToken() in client",
        data: {
          token: body.manualToken,
          expires_in: body.expiresIn || 3600,
          token_type: "Bearer",
          authenticated_at: new Date().toISOString(),
          method: "manual_injection"
        },
      })
    }

    console.log("🔐 External authentication request received")
    console.log(`🔗 Auth URL: ${BASE_URL}/auth/login`)
    console.log(`🔑 Client ID: ${PARTNER_CLIENT_ID}`)

    const authController = new AbortController()
    const authTimeoutId = setTimeout(() => authController.abort(), 15000)

    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
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

      return NextResponse.json(
        {
          success: false,
          error: `Authentication failed: ${loginResponse.status} - ${loginResponse.statusText}`,
          details: errorText,
        },
        { status: loginResponse.status },
      )
    }

    const authData = await loginResponse.json()
    console.log("✅ Authentication successful")

    // Extract token from response
    const token = authData.token || authData.access_token || authData.accessToken

    if (!token) {
      console.error("❌ No token received from authentication response")
      return NextResponse.json(
        {
          success: false,
          error: "No token received from authentication response",
          data: authData,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      data: {
        token,
        expires_in: authData.expires_in || 3600,
        token_type: authData.token_type || "Bearer",
        authenticated_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("❌ Authentication error:", error)

    let errorMessage = "Unknown authentication error"
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "Authentication request timeout"
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// GET method to check authentication status
export async function GET() {
  return NextResponse.json({
    message: "External authentication endpoint",
    endpoint: "/api/auth/external",
    method: "POST",
    description: "Authenticate with external partner API",
    required_env_vars: ["PARTNER_CLIENT_ID", "PARTNER_CLIENT_SECRET", "API_BASE_URL"],
    current_config: {
      client_id: PARTNER_CLIENT_ID,
      base_url: BASE_URL,
      has_secret: !!PARTNER_CLIENT_SECRET,
    },
  })
}
