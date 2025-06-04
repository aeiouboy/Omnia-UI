import { supabase } from "@/lib/supabase"

export type Marketplace = {
  id: number
  name: string
  status: "Active" | "Inactive" | "Error"
  integration_date: string
  last_sync: string
  orders_count: number
  revenue: number
  error_count: number
  logo_url?: string
}

export type MarketplacePerformance = {
  marketplace_id: number
  marketplace_name: string
  date: string
  orders: number
  revenue: number
}

export type MarketplaceSummary = {
  total_marketplaces: number
  active_marketplaces: number
  total_orders: number
  total_revenue: number
}

export class MarketplaceService {
  static async getMarketplaces(): Promise<Marketplace[]> {
    const { data, error } = await supabase
      .from("marketplaces")
      .select(`
        *,
        marketplace_stats(orders_count, revenue, error_count)
      `)
      .order("name")

    if (error) {
      console.error("Error fetching marketplaces:", error)
      throw new Error("Failed to fetch marketplaces")
    }

    return (data || []).map((marketplace) => {
      const stats = marketplace.marketplace_stats?.[0] || {
        orders_count: 0,
        revenue: 0,
        error_count: 0,
      }

      return {
        id: marketplace.id,
        name: marketplace.name,
        status: marketplace.status,
        integration_date: marketplace.integration_date,
        last_sync: marketplace.last_sync,
        orders_count: stats.orders_count,
        revenue: stats.revenue,
        error_count: stats.error_count,
        logo_url: marketplace.logo_url,
      }
    })
  }

  static async getMarketplacePerformance(days = 30): Promise<MarketplacePerformance[]> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from("marketplace_daily_performance")
      .select(`
        *,
        marketplaces(name)
      `)
      .gte("date", startDate.toISOString().split("T")[0])
      .lte("date", endDate.toISOString().split("T")[0])
      .order("date")

    if (error) {
      console.error("Error fetching marketplace performance:", error)
      throw new Error("Failed to fetch marketplace performance")
    }

    return (data || []).map((performance) => ({
      marketplace_id: performance.marketplace_id,
      marketplace_name: performance.marketplaces?.name || "Unknown Marketplace",
      date: performance.date,
      orders: performance.orders,
      revenue: performance.revenue,
    }))
  }

  static async getMarketplaceSummary(): Promise<MarketplaceSummary> {
    // Get marketplaces count
    const { data: marketplacesData, error: marketplacesError } = await supabase
      .from("marketplaces")
      .select("id, status")

    if (marketplacesError) {
      console.error("Error fetching marketplaces:", marketplacesError)
      throw new Error("Failed to fetch marketplaces")
    }

    const totalMarketplaces = marketplacesData?.length || 0
    const activeMarketplaces = marketplacesData?.filter((m) => m.status === "Active").length || 0

    // Get marketplace stats
    const { data: statsData, error: statsError } = await supabase
      .from("marketplace_stats")
      .select("orders_count, revenue")

    if (statsError) {
      console.error("Error fetching marketplace stats:", statsError)
      throw new Error("Failed to fetch marketplace stats")
    }

    let totalOrders = 0
    let totalRevenue = 0

    statsData?.forEach((stat) => {
      totalOrders += stat.orders_count || 0
      totalRevenue += stat.revenue || 0
    })

    return {
      total_marketplaces: totalMarketplaces,
      active_marketplaces: activeMarketplaces,
      total_orders: totalOrders,
      total_revenue: totalRevenue,
    }
  }
}
