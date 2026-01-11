import { NextResponse } from "next/server"
import { getAuthToken } from "@/lib/auth-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

// Cache the counts for 5 seconds to avoid excessive API calls
let cachedCounts: any = null
let cacheTimestamp = 0
const CACHE_TTL = 5000 // 5 seconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const businessUnit = searchParams.get("businessUnit") || ""

    // Create cache key based on businessUnit filter
    const cacheKey = businessUnit || "ALL"

    // Check cache
    const now = Date.now()
    if (cachedCounts?.[cacheKey] && (now - cacheTimestamp) < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: cachedCounts[cacheKey],
        cached: true
      })
    }

    let token: string
    try {
      token = await getAuthToken()
    } catch (authError) {
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

    // Add businessUnit filter if provided and not "ALL"
    if (businessUnit && businessUnit !== "ALL") {
      queryParams.set("businessUnit", businessUnit)
    }

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
          let newToken: string
          try {
            newToken = await getAuthToken(true)
          } catch (reAuthError) {
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

    // Debug: Check SLA data distribution
    const slaDistribution = {
      hasSlInfo: 0,
      zeroElapsed: 0,
      nonZeroElapsed: 0,
      breachStatus: 0,
      nearBreachStatus: 0
    }

    // TEMPORARY: For demonstration in development, simulate varied elapsed times
    if (process.env.NODE_ENV === 'development') {
      allOrders = allOrders.map((order, index) => {
        if (order.sla_info) {
          const patterns = [
            { elapsed: 0, status: "ON_TRACK" },    // Normal
            { elapsed: 120, status: "ON_TRACK" },  // Normal
            { elapsed: 180, status: "ON_TRACK" },  // Approaching
            { elapsed: 250, status: "NEAR_BREACH" }, // Near breach
            { elapsed: 350, status: "BREACH" },     // Breach
          ]
          const pattern = patterns[index % patterns.length]
          return {
            ...order,
            sla_info: {
              ...order.sla_info,
              elapsed_minutes: pattern.elapsed,
              status: pattern.status
            }
          }
        }
        return order
      })
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
        slaDistribution.hasSlInfo++
        
        const targetSeconds = order.sla_info.target_minutes || 300
        const elapsedSeconds = order.sla_info.elapsed_minutes || 0
        
        // Debug tracking
        if (elapsedSeconds === 0) {
          slaDistribution.zeroElapsed++
        } else {
          slaDistribution.nonZeroElapsed++
        }
        
        if (order.sla_info.status === "BREACH") {
          slaDistribution.breachStatus++
        } else if (order.sla_info.status === "NEAR_BREACH") {
          slaDistribution.nearBreachStatus++
        }
        
        const remainingSeconds = targetSeconds - elapsedSeconds
        const criticalThreshold = targetSeconds * 0.2
        
        if (elapsedSeconds > targetSeconds || order.sla_info.status === "BREACH") {
          counts.breach++
        } else if (remainingSeconds <= criticalThreshold && remainingSeconds > 0) {
          counts.nearBreach++
        }
      }
    })
    
    console.log("SLA Distribution Analysis:", slaDistribution)

    // Update cache
    if (!cachedCounts) {
      cachedCounts = {}
    }
    cachedCounts[cacheKey] = counts
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