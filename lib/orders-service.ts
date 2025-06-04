import { supabase, type Order } from "./supabase"

export class OrdersService {
  static async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching orders:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("OrdersService.getAllOrders error:", error)
      throw error
    }
  }

  static async getOrderById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase.from("orders").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching order:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("OrdersService.getOrderById error:", error)
      throw error
    }
  }

  static async getOrdersByStatus(status: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching orders by status:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("OrdersService.getOrdersByStatus error:", error)
      throw error
    }
  }

  static async getOrdersByChannel(channel: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("channel", channel)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching orders by channel:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("OrdersService.getOrdersByChannel error:", error)
      throw error
    }
  }

  static async getSLABreachedOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("sla_status", "BREACH")
        .not("status", "in", '("DELIVERED","FULFILLED")')
        .order("elapsed_minutes", { ascending: false })

      if (error) {
        console.error("Error fetching SLA breached orders:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("OrdersService.getSLABreachedOrders error:", error)
      throw error
    }
  }

  static async getNearBreachOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .not("status", "in", '("DELIVERED","FULFILLED")')
        .neq("sla_status", "BREACH")
        .order("elapsed_minutes", { ascending: false })

      if (error) {
        console.error("Error fetching near breach orders:", error)
        throw error
      }

      // Filter for orders within 20% of SLA threshold
      const nearBreachOrders = (data || []).filter((order) => {
        const remainingMinutes = order.sla_target_minutes - order.elapsed_minutes
        const criticalThreshold = order.sla_target_minutes * 0.2
        return remainingMinutes <= criticalThreshold && remainingMinutes > 0
      })

      return nearBreachOrders
    } catch (error) {
      console.error("OrdersService.getNearBreachOrders error:", error)
      throw error
    }
  }

  static async updateOrderStatus(id: string, status: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating order status:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("OrdersService.updateOrderStatus error:", error)
      throw error
    }
  }

  static async updateSLAStatus(id: string, elapsedMinutes: number): Promise<Order | null> {
    try {
      const { data: order } = await supabase.from("orders").select("sla_target_minutes").eq("id", id).single()

      if (!order) return null

      const slaStatus = elapsedMinutes > order.sla_target_minutes ? "BREACH" : "COMPLIANT"

      const { data, error } = await supabase
        .from("orders")
        .update({
          elapsed_minutes: elapsedMinutes,
          sla_status: slaStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating SLA status:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("OrdersService.updateSLAStatus error:", error)
      throw error
    }
  }

  static async searchOrders(searchTerm: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .or(
          `order_no.ilike.%${searchTerm}%,customer.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`,
        )
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error searching orders:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("OrdersService.searchOrders error:", error)
      throw error
    }
  }
}
