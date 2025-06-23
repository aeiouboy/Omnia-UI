import { NextResponse } from "next/server"
import { getAuthToken } from "@/lib/auth-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

// Cache the counts for 5 seconds to avoid excessive API calls
let cachedCounts: any = null
let cacheTimestamp = 0
const CACHE_TTL = 5000 // 5 seconds

export async function GET() {
  try {
    // Check cache
    const now = Date.now()
    if (cachedCounts && (now - cacheTimestamp) < CACHE_TTL) {
      return NextResponse.json({ 
        success: true, 
        data: cachedCounts,
        cached: true
      })
    }

    const { token, error: authError } = await getAuthToken()
    
    if (authError || !token) {
      console.error("Authentication failed:", authError)
      return NextResponse.json(
        { 
          success: false, 
          error: "Authentication failed", 
          data: { breach: 0, nearBreach: 0, submitted: 0, onHold: 0 } 
        },
        { status: 401 }
      )
    }

    const apiUrl = process.env.API_BASE_URL || "https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1"
    
    // Get date range for query (last 7 days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)
    
    const queryParams = new URLSearchParams({
      dateFrom: startDate.toISOString().split('T')[0],
      dateTo: endDate.toISOString().split('T')[0],
      page: "1",
      pageSize: "100" // We'll iterate through pages
    })

    let allOrders: any[] = []
    let currentPage = 1
    let hasMore = true
    
    // Fetch all pages (with a reasonable limit)
    while (hasMore && currentPage <= 50) { // Limit to 50 pages (5000 orders)
      queryParams.set("page", currentPage.toString())
      
      const response = await fetch(`${apiUrl}/merchant/orders?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, try to get a new one
          const { token: newToken, error: newAuthError } = await getAuthToken(true)
          if (newAuthError || !newToken) {
            throw new Error("Re-authentication failed")
          }
          // Retry with new token
          const retryResponse = await fetch(`${apiUrl}/merchant/orders?${queryParams.toString()}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${newToken}`,
              "Content-Type": "application/json",
            },
          })
          
          if (!retryResponse.ok) {
            throw new Error(`API error: ${retryResponse.status}`)
          }
          
          const retryData = await retryResponse.json()
          if (retryData.data?.data) {
            allOrders = [...allOrders, ...retryData.data.data]
          }
          hasMore = retryData.data?.pagination?.hasNext || false
        } else {
          throw new Error(`API error: ${response.status}`)
        }
      } else {
        const data = await response.json()
        if (data.data?.data) {
          allOrders = [...allOrders, ...data.data.data]
        }
        hasMore = data.data?.pagination?.hasNext || false
      }
      
      currentPage++
    }

    // Calculate counts
    const counts = {
      breach: 0,
      nearBreach: 0,
      submitted: 0,
      onHold: 0,
      total: allOrders.length
    }

    allOrders.forEach(order => {
      // Count submitted orders
      if (order.status === "SUBMITTED") {
        counts.submitted++
      }
      
      // Count on-hold orders
      if (order.on_hold) {
        counts.onHold++
      }
      
      // Skip SLA calculation for completed/cancelled/collected orders
      if (["DELIVERED", "FULFILLED", "CANCELLED", "COLLECTED"].includes(order.status)) {
        return
      }
      
      // Calculate SLA breach/near-breach
      if (order.sla_info) {
        const targetSeconds = order.sla_info.target_minutes || 300
        const elapsedSeconds = order.sla_info.elapsed_minutes || 0
        const remainingSeconds = targetSeconds - elapsedSeconds
        const criticalThreshold = targetSeconds * 0.2
        
        if (elapsedSeconds > targetSeconds || order.sla_info.status === "BREACH") {
          counts.breach++
        } else if (remainingSeconds <= criticalThreshold && remainingSeconds > 0) {
          counts.nearBreach++
        }
      }
    })

    // Update cache
    cachedCounts = counts
    cacheTimestamp = now

    return NextResponse.json({ 
      success: true, 
      data: counts,
      cached: false,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Failed to fetch order counts:", error)
    
    // Return zero counts on error
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to fetch counts",
        data: { breach: 0, nearBreach: 0, submitted: 0, onHold: 0 }
      },
      { status: 500 }
    )
  }
}