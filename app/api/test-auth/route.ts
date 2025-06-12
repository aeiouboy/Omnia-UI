import { NextResponse } from "next/server"
import { getAuthToken } from "@/lib/auth-client"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("🧪 Testing authentication...")
    
    // Test authentication
    const token = await getAuthToken(true) // Force refresh
    
    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      tokenPreview: token ? `${token.substring(0, 20)}...` : "No token",
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error("🧪 Auth test failed:", error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      details: "Check server logs for detailed authentication attempt information"
    }, { status: 401 })
  }
}