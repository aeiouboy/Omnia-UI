import { NextResponse } from "next/server"

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Rate limiting: 10 requests per minute per IP
    if (!checkRateLimit(clientIP, 10, 60000)) {
      return NextResponse.json(
        { success: false, message: "Rate limit exceeded. Please try again later." },
        { status: 429 },
      )
    }

    // Validate request body
    const body = await request.json()
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 })
    }

    // Get the webhook URL from environment variables
    const teamsWebhookUrl = process.env.NEXT_PUBLIC_MS_TEAMS_WEBHOOK_URL

    if (!teamsWebhookUrl) {
      console.error("MS Teams webhook URL not configured")
      return NextResponse.json({ success: false, message: "MS Teams webhook URL not configured" }, { status: 500 })
    }

    // Validate webhook URL format
    if (!isValidWebhookUrl(teamsWebhookUrl)) {
      console.error("Invalid MS Teams webhook URL format")
      return NextResponse.json({ success: false, message: "Invalid webhook URL configuration" }, { status: 500 })
    }

    // Log the escalation attempt
    console.log("Sending escalation to MS Teams:", {
      timestamp: new Date().toISOString(),
      clientIP,
      summary: body.summary || "Unknown",
    })

    // Forward the request to MS Teams with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    try {
      const response = await fetch(teamsWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "RIS-OMS/1.0",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Handle MS Teams response
      if (!response.ok) {
        const errorText = await response.text()
        console.error("MS Teams webhook error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        })

        // Return different messages based on status code
        let errorMessage = "Failed to send to MS Teams"
        if (response.status === 400) {
          errorMessage = "Invalid message format for MS Teams"
        } else if (response.status === 404) {
          errorMessage = "MS Teams webhook URL not found"
        } else if (response.status >= 500) {
          errorMessage = "MS Teams service temporarily unavailable"
        }

        return NextResponse.json(
          { success: false, message: errorMessage, status: response.status },
          { status: response.status >= 500 ? 502 : 400 },
        )
      }

      // Success
      console.log("Successfully sent escalation to MS Teams")
      return NextResponse.json({
        success: true,
        message: "Escalation sent successfully",
        timestamp: new Date().toISOString(),
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("MS Teams webhook timeout")
        return NextResponse.json({ success: false, message: "Request to MS Teams timed out" }, { status: 504 })
      }

      throw fetchError
    }
  } catch (error) {
    console.error("Error in teams-webhook API:", error)

    // Return appropriate error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    )
  }
}

function checkRateLimit(clientIP: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const clientData = rateLimitMap.get(clientIP)

  if (!clientData || now > clientData.resetTime) {
    // Reset or initialize rate limit for this client
    rateLimitMap.set(clientIP, {
      count: 1,
      resetTime: now + windowMs,
    })
    return true
  }

  if (clientData.count >= maxRequests) {
    return false
  }

  clientData.count++
  return true
}

function isValidWebhookUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return (
      parsedUrl.protocol === "https:" &&
      parsedUrl.hostname.includes("office.com") &&
      parsedUrl.pathname.includes("/webhookb2/")
    )
  } catch {
    return false
  }
}

// Clean up rate limit map periodically
setInterval(() => {
  const now = Date.now()
  for (const [clientIP, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(clientIP)
    }
  }
}, 60000) // Clean up every minute
