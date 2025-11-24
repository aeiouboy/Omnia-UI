import { supabase, Order } from "./supabase"

export interface BusinessUnitRevenue {
  business_unit: string
  total_revenue: number
}

export interface ChannelDistribution {
  channel: string
  order_count: number
}

export interface OrderStatusDistribution {
  status: string
  order_count: number
}

export interface TopProduct {
  product: string
  sku: string
  units_sold: number
  revenue: number
  growth: number
}

export interface Product {
  id: string
  name: string
  sku: string
}

export interface OrderItem {
  quantity: number
  unit_price: number
  total_price: number
  product_id: string
  order_id: string
}

export interface DailyTrend {
  date: string
  orders: number
  revenue: number
  sla_compliance: number
}

export interface WeeklyTrend {
  name: string
  Orders: number
  Revenue: number
}

export class DashboardService {
  static async getOrderSummary() {
    try {
      const { data: orders, error } = await supabase.from("orders").select("*") as { data: Order[] | null, error: any }

      if (error || !orders) {
        console.error("Error fetching orders for summary:", error)
        throw error || new Error("No orders data returned")
      }

      // Calculate summary metrics
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, order) => {
        const amount = this.extractNumericValue(order.total)
        return sum + amount
      }, 0)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // SLA metrics
      const slaBreached = orders.filter(
        (order) =>
          (order.sla_status === "BREACH" || order.sla_target_minutes < order.elapsed_minutes) &&
          order.status !== "DELIVERED" &&
          order.status !== "FULFILLED",
      ).length

      const slaNearBreach = orders.filter((order) => {
        const remainingMinutes = order.sla_target_minutes - order.elapsed_minutes
        const criticalThreshold = order.sla_target_minutes * 0.2
        return (
          remainingMinutes <= criticalThreshold &&
          remainingMinutes > 0 &&
          order.sla_status !== "BREACH" &&
          order.status !== "DELIVERED" &&
          order.status !== "FULFILLED"
        )
      }).length

      const slaCompliance =
        orders.length > 0
          ? (orders.filter(
              (order) =>
                order.sla_status === "COMPLIANT" || order.status === "DELIVERED" || order.status === "FULFILLED",
            ).length /
              orders.length) *
            100
          : 100

      // Processing time
      const processingOrders = orders.filter((order) => order.status !== "DELIVERED" && order.status !== "FULFILLED")
      const avgProcessingTime =
        processingOrders.length > 0
          ? processingOrders.reduce((sum, order) => sum + order.elapsed_minutes, 0) / processingOrders.length
          : 0

      // Fulfillment rate
      const fulfillmentRate =
        orders.length > 0
          ? (orders.filter((order) => order.status === "DELIVERED" || order.status === "FULFILLED").length /
              orders.length) *
            100
          : 0

      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        slaBreached,
        slaNearBreach,
        slaCompliance,
        avgProcessingTime,
        fulfillmentRate,
        orders,
      }
    } catch (error) {
      console.error("DashboardService.getOrderSummary error:", error)
      throw error
    }
  }

  static async getBusinessUnitRevenue(): Promise<BusinessUnitRevenue[]> {
    try {
      // ใช้การคำนวณโดยตรงเลย ไม่ต้องพยายามเรียกใช้ RPC
      const { data: orders, error } = await supabase.from("orders").select("business_unit, total") as { data: Pick<Order, 'business_unit' | 'total'>[] | null, error: any }

      if (error || !orders) {
        console.error("Error fetching orders for business unit revenue:", error)
        throw error || new Error("No orders data returned")
      }

      // Group by business unit and sum revenue
      const businessUnitMap = new Map<string, number>()

      orders.forEach((order) => {
        const businessUnit = order.business_unit || "Unknown"
        const revenue = this.extractNumericValue(order.total)

        if (businessUnitMap.has(businessUnit)) {
          businessUnitMap.set(businessUnit, businessUnitMap.get(businessUnit)! + revenue)
        } else {
          businessUnitMap.set(businessUnit, revenue)
        }
      })

      // Convert map to array and sort by revenue (descending)
      return Array.from(businessUnitMap.entries())
        .map(([business_unit, total_revenue]) => ({
          business_unit,
          total_revenue,
        }))
        .sort((a, b) => b.total_revenue - a.total_revenue)
    } catch (error) {
      console.error("DashboardService.getBusinessUnitRevenue error:", error)
      throw error
    }
  }

  static async getChannelDistribution(): Promise<ChannelDistribution[]> {
    try {
      // ใช้การคำนวณโดยตรงแทนการเรียกใช้ RPC
      return this.calculateChannelDistribution()
    } catch (error) {
      console.error("DashboardService.getChannelDistribution error:", error)
      throw error
    }
  }

  static async calculateChannelDistribution(): Promise<ChannelDistribution[]> {
    try {
      const { data: orders, error } = await supabase.from("orders").select("channel") as { data: Pick<Order, 'channel'>[] | null, error: any }

      if (error || !orders) {
        console.error("Error fetching orders for channel distribution:", error)
        throw error || new Error("No orders data returned")
      }

      // Count orders by channel
      const channelMap = new Map<string, number>()

      orders.forEach((order) => {
        const channel = order.channel

        if (channelMap.has(channel)) {
          channelMap.set(channel, channelMap.get(channel)! + 1)
        } else {
          channelMap.set(channel, 1)
        }
      })

      // Convert map to array
      return Array.from(channelMap.entries()).map(([channel, order_count]) => ({
        channel,
        order_count,
      }))
    } catch (error) {
      console.error("DashboardService.calculateChannelDistribution error:", error)
      throw error
    }
  }

  static async getOrderStatusDistribution(): Promise<OrderStatusDistribution[]> {
    try {
      // ใช้การคำนวณโดยตรงแทนการเรียกใช้ RPC
      return this.calculateOrderStatusDistribution()
    } catch (error) {
      console.error("DashboardService.getOrderStatusDistribution error:", error)
      throw error
    }
  }

  static async calculateOrderStatusDistribution(): Promise<OrderStatusDistribution[]> {
    try {
      const { data: orders, error } = await supabase.from("orders").select("status") as { data: Pick<Order, 'status'>[] | null, error: any }

      if (error || !orders) {
        console.error("Error fetching orders for status distribution:", error)
        throw error || new Error("No orders data returned")
      }

      // Count orders by status
      const statusMap = new Map<string, number>()

      orders.forEach((order) => {
        const status = order.status

        if (statusMap.has(status)) {
          statusMap.set(status, statusMap.get(status)! + 1)
        } else {
          statusMap.set(status, 1)
        }
      })

      // Convert map to array
      return Array.from(statusMap.entries()).map(([status, order_count]) => ({
        status,
        order_count,
      }))
    } catch (error) {
      console.error("DashboardService.calculateOrderStatusDistribution error:", error)
      throw error
    }
  }

  static async getTopProducts(limit = 5): Promise<TopProduct[]> {
    try {
      // Check if the order_items table exists
      const { error: tableCheckError } = await supabase.from("order_items").select("id").limit(1).single()

      // If the table doesn't exist, return mock data
      if (tableCheckError && tableCheckError.message.includes("does not exist")) {
        console.log('Table "order_items" does not exist, returning mock data')
        return [
          {
            product: "Premium Jasmine Rice 5kg",
            sku: "PRD-3456",
            units_sold: 1250,
            revenue: 187500,
            growth: 15,
          },
          {
            product: "Organic Bananas",
            sku: "PRD-5678",
            units_sold: 980,
            revenue: 49000,
            growth: 8,
          },
          {
            product: "Men's Cotton T-Shirt",
            sku: "PRD-1234",
            units_sold: 750,
            revenue: 262500,
            growth: 12,
          },
          {
            product: "Smartphone",
            sku: "PRD-8901",
            units_sold: 320,
            revenue: 4800000,
            growth: 20,
          },
          {
            product: "Running Shoes",
            sku: "PRD-4567",
            units_sold: 280,
            revenue: 546000,
            growth: 5,
          },
        ]
      }

      // Continue with the original implementation if the table exists
      // ดึงข้อมูลจาก order_items และ products
      const { data: orderItems, error: orderItemsError } = await supabase
        .from("order_items")
        .select(`
        quantity,
        unit_price,
        total_price,
        product_id,
        order_id
      `)
        .limit(100) as { data: OrderItem[] | null, error: any }

      if (orderItemsError || !orderItems) {
        console.error("Error fetching order items:", orderItemsError)
        throw orderItemsError || new Error("No order items data returned")
      }

      // ถ้าไม่มีข้อมูล order_items ให้ส่งอาร์เรย์ว่างกลับไป
      if (!orderItems || orderItems.length === 0) {
        return []
      }

      // ดึงข้อมูลสินค้า
      const { data: products, error: productsError } = await supabase.from("products").select("id, name, sku") as { data: Product[] | null, error: any }

      if (productsError || !products) {
        console.error("Error fetching products:", productsError)
        throw productsError || new Error("No products data returned")
      }

      // สร้าง Map ของสินค้าเพื่อการค้นหาที่รวดเร็ว
      const productsMap = new Map()
      products?.forEach((product) => {
        productsMap.set(product.id, product)
      })

      // รวมข้อมูลตามสินค้า
      const productMap = new Map<
        string,
        {
          product: string
          sku: string
          units_sold: number
          revenue: number
        }
      >()

      orderItems.forEach((item) => {
        const productId = item.product_id
        const product = productsMap.get(productId)

        if (!product) return // ข้ามรายการที่ไม่มีข้อมูลสินค้า

        const productName = product.name
        const productSku = product.sku
        const quantity = item.quantity || 1
        const revenue = item.total_price || 0

        if (productMap.has(productId)) {
          const existing = productMap.get(productId)!
          existing.units_sold += quantity
          existing.revenue += revenue
        } else {
          productMap.set(productId, {
            product: productName,
            sku: productSku,
            units_sold: quantity,
            revenue: revenue,
          })
        }
      })

      // ดึงข้อมูลการขายในอดีตเพื่อคำนวณการเติบโต
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

      const { data: historicalOrders, error: historicalError } = await supabase
        .from("orders")
        .select("id, created_at")
        .lt("created_at", oneMonthAgo.toISOString())
        .limit(500) as { data: Pick<Order, 'id' | 'created_at'>[] | null, error: any }

      if (historicalError) {
        console.error("Error fetching historical orders:", historicalError)
        // ถ้าไม่สามารถดึงข้อมูลในอดีตได้ ให้ใช้การเติบโตเป็น 0
        return Array.from(productMap.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, limit)
          .map((item) => ({
            ...item,
            growth: 0,
          }))
      }

      // ดึงข้อมูล order_items ของออเดอร์ในอดีต
      const historicalOrderIds = historicalOrders?.map((order) => order.id) || []

      const { data: historicalItems, error: histItemsError } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .in("order_id", historicalOrderIds) as { data: Pick<OrderItem, 'product_id' | 'quantity'>[] | null, error: any }

      if (histItemsError) {
        console.error("Error fetching historical order items:", histItemsError)
        // ถ้าไม่สามารถดึงข้อมูลในอดีตได้ ให้ใช้การเติบโตเป็น 0
        return Array.from(productMap.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, limit)
          .map((item) => ({
            ...item,
            growth: 0,
          }))
      }

      // คำนวณยอดขายในอดีต
      const historicalSales = new Map<string, number>()

      historicalItems?.forEach((item) => {
        const productId = item.product_id
        const quantity = item.quantity || 1

        if (historicalSales.has(productId)) {
          historicalSales.set(productId, historicalSales.get(productId)! + quantity)
        } else {
          historicalSales.set(productId, quantity)
        }
      })

      // แปลงเป็น array และเรียงลำดับตามรายได้
      const result = Array.from(productMap.entries())
        .map(([productId, item]) => {
          const previousSales = historicalSales.get(productId) || 0
          let growth = 0

          if (previousSales > 0) {
            growth = ((item.units_sold - previousSales) / previousSales) * 100
          }

          return {
            ...item,
            growth: Math.round(growth),
          }
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit)

      return result
    } catch (error) {
      console.error("DashboardService.getTopProducts error:", error)
      // Return mock data in case of any error
      return [
        {
          product: "Premium Jasmine Rice 5kg",
          sku: "PRD-3456",
          units_sold: 1250,
          revenue: 187500,
          growth: 15,
        },
        {
          product: "Organic Bananas",
          sku: "PRD-5678",
          units_sold: 980,
          revenue: 49000,
          growth: 8,
        },
        {
          product: "Men's Cotton T-Shirt",
          sku: "PRD-1234",
          units_sold: 750,
          revenue: 262500,
          growth: 12,
        },
        {
          product: "Smartphone",
          sku: "PRD-8901",
          units_sold: 320,
          revenue: 4800000,
          growth: 20,
        },
        {
          product: "Running Shoes",
          sku: "PRD-4567",
          units_sold: 280,
          revenue: 546000,
          growth: 5,
        },
      ]
    }
  }

  static async getDailyTrends(days = 7): Promise<DailyTrend[]> {
    try {
      // คำนวณข้อมูลแนวโน้มรายวันโดยตรงจากตาราง orders
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - days + 1)
      startDate.setHours(0, 0, 0, 0)

      // ดึงข้อมูล orders ในช่วงวันที่ต้องการ
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString()) as { data: Order[] | null, error: any }

      if (error || !orders) {
        console.error("Error fetching orders for daily trends:", error)
        throw error || new Error("No orders data returned")
      }

      // สร้าง Map เพื่อเก็บข้อมูลรายวัน
      const dailyMap = new Map<string, { orders: number; revenue: number; slaCompliant: number; total: number }>()

      // สร้างข้อมูลเริ่มต้นสำหรับทุกวันในช่วงที่ต้องการ
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        const dateKey = date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })
        dailyMap.set(dateKey, { orders: 0, revenue: 0, slaCompliant: 0, total: 0 })
      }

      // จัดกลุ่มข้อมูลตามวัน
      orders.forEach((order) => {
        const orderDate = new Date(order.created_at)
        const dateKey = orderDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })

        if (dailyMap.has(dateKey)) {
          const dailyData = dailyMap.get(dateKey)!
          dailyData.orders += 1
          dailyData.revenue += this.extractNumericValue(order.total)
          dailyData.total += 1

          // ตรวจสอบว่าออเดอร์นี้เป็นไปตาม SLA หรือไม่
          if (
            order.sla_status === "COMPLIANT" ||
            order.status === "DELIVERED" ||
            order.status === "FULFILLED" ||
            order.elapsed_minutes <= order.sla_target_minutes
          ) {
            dailyData.slaCompliant += 1
          }
        }
      })

      // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
      const result = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          orders: data.orders,
          revenue: data.revenue,
          sla_compliance: data.total > 0 ? (data.slaCompliant / data.total) * 100 : 100,
        }))
        .sort((a, b) => {
          const dateA = new Date(a.date)
          const dateB = new Date(b.date)
          return dateA.getTime() - dateB.getTime()
        })

      // ถ้าไม่มีข้อมูล ให้ส่งอาร์เรย์ว่างกลับไป
      if (result.length === 0) {
        return []
      }

      return result
    } catch (error) {
      console.error("DashboardService.getDailyTrends error:", error)
      // ส่งอาร์เรย์ว่างกลับไปในกรณีที่เกิดข้อผิดพลาด
      return []
    }
  }

  static async getFulfillmentPerformance() {
    try {
      const { data: orders, error } = await supabase.from("orders").select("*") as { data: Order[] | null, error: any }

      if (error || !orders) {
        console.error("Error fetching orders for fulfillment performance:", error)
        throw error || new Error("No orders data returned")
      }

      // Calculate fulfillment metrics
      const onTimeFulfillment =
        orders.length > 0
          ? (orders.filter(
              (order) =>
                (order.status === "DELIVERED" || order.status === "FULFILLED") &&
                order.elapsed_minutes <= order.sla_target_minutes,
            ).length /
              orders.length) *
            100
          : 0

      const fulfillmentOrders = orders.filter((order) => order.status === "DELIVERED" || order.status === "FULFILLED")
      const avgFulfillmentTime =
        fulfillmentOrders.length > 0
          ? fulfillmentOrders.reduce((sum, order) => sum + order.elapsed_minutes, 0) / fulfillmentOrders.length
          : 0

      const itemsFulfilled = fulfillmentOrders.reduce((sum, order) => sum + order.items, 0)

      return {
        onTimeFulfillment,
        avgFulfillmentTime,
        itemsFulfilled,
      }
    } catch (error) {
      console.error("DashboardService.getFulfillmentPerformance error:", error)
      throw error
    }
  }

  static async getFulfillmentByBranch() {
    try {
      // ใช้การคำนวณโดยตรงเลย ไม่ต้องพยายามเรียกใช้ RPC
      const { data: orders, error } = await supabase.from("orders").select("store_name, status") as { data: Pick<Order, 'store_name' | 'status'>[] | null, error: any }

      if (error || !orders) {
        console.error("Error fetching orders for branch fulfillment calculation:", error)
        throw error || new Error("No orders data returned")
      }

      // จัดกลุ่มตามสาขา (store_name) และคำนวณอัตราการจัดส่งสำเร็จ
      const branchMap = new Map()

      orders.forEach((order) => {
        // ข้ามรายการที่ไม่มีชื่อสาขา
        if (!order.store_name || order.store_name.trim() === "") return

        const branch = order.store_name
        if (!branchMap.has(branch)) {
          branchMap.set(branch, { total: 0, fulfilled: 0 })
        }

        const stats = branchMap.get(branch)
        stats.total += 1

        if (order.status === "DELIVERED" || order.status === "FULFILLED") {
          stats.fulfilled += 1
        }
      })

      // แปลงข้อมูลเป็นรูปแบบที่ต้องการและเรียงลำดับตามอัตราการจัดส่งสำเร็จ
      const result = Array.from(branchMap.entries())
        .map(([branch, stats]) => ({
          branch,
          fulfillment_rate: stats.total > 0 ? (stats.fulfilled / stats.total) * 100 : 0,
        }))
        .sort((a, b) => b.fulfillment_rate - a.fulfillment_rate)
        .slice(0, 4) // แสดงเฉพาะ 4 อันดับแรก

      return result
    } catch (error) {
      console.error("DashboardService.getFulfillmentByBranch error:", error)
      throw error
    }
  }

  static async getFulfillmentByChannel() {
    try {
      // ใช้การคำนวณโดยตรงเลย ไม่ต้องพยายามเรียกใช้ RPC
      const { data: orders, error } = await supabase.from("orders").select("channel, status") as { data: Pick<Order, 'channel' | 'status'>[] | null, error: any }

      if (error || !orders) {
        console.error("Error fetching orders for channel fulfillment calculation:", error)
        throw error || new Error("No orders data returned")
      }

      // จัดกลุ่มตามช่องทาง (channel) และคำนวณอัตราการจัดส่งสำเร็จ
      const channelMap = new Map()

      orders.forEach((order) => {
        const channel = order.channel
        if (!channelMap.has(channel)) {
          channelMap.set(channel, { total: 0, fulfilled: 0 })
        }

        const stats = channelMap.get(channel)
        stats.total += 1

        if (order.status === "DELIVERED" || order.status === "FULFILLED") {
          stats.fulfilled += 1
        }
      })

      // แปลงข้อมูลเป็นรูปแบบที่ต้องการและเรียงลำดับตามอัตราการจัดส่งสำเร็จ
      const result = Array.from(channelMap.entries())
        .map(([channel, stats]) => ({
          channel,
          fulfillment_rate: stats.total > 0 ? (stats.fulfilled / stats.total) * 100 : 0,
        }))
        .sort((a, b) => b.fulfillment_rate - a.fulfillment_rate)
        .slice(0, 4) // แสดงเฉพาะ 4 อันดับแรก

      return result
    } catch (error) {
      console.error("DashboardService.getFulfillmentByChannel error:", error)
      throw error
    }
  }

  static async getAnalyticsSummary() {
    try {
      const { data: orders, error } = await supabase.from("orders").select("*") as { data: Order[] | null, error: any }

      if (error || !orders) {
        console.error("Error fetching orders for analytics summary:", error)
        throw error || new Error("No orders data returned")
      }

      // Calculate analytics metrics
      const totalRevenue = orders.reduce((sum, order) => {
        const amount = this.extractNumericValue(order.total)
        return sum + amount
      }, 0)

      const totalOrders = orders.length
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      return {
        totalRevenue,
        totalOrders,
        avgOrderValue,
      }
    } catch (error) {
      console.error("DashboardService.getAnalyticsSummary error:", error)
      throw error
    }
  }

  static async getWeeklyPerformanceTrends(): Promise<WeeklyTrend[]> {
    try {
      // คำนวณข้อมูลแนวโน้มรายสัปดาห์โดยตรงจากตาราง orders
      const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      const today = new Date()
      const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

      // สร้างวันที่เริ่มต้นของสัปดาห์ (วันอาทิตย์ที่ผ่านมา)
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - dayOfWeek)
      startOfWeek.setHours(0, 0, 0, 0)

      // ดึงข้อมูล orders ในสัปดาห์นี้
      const { data: weeklyOrders, error } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", startOfWeek.toISOString()) as { data: Order[] | null, error: any }

      if (error || !weeklyOrders) {
        console.error("Error fetching orders for weekly trends:", error)
        throw error || new Error("No orders data returned")
      }

      // สร้าง Map เพื่อเก็บข้อมูลรายวัน
      const dailyMap = new Map<string, { orders: number; revenue: number }>()

      // สร้างข้อมูลเริ่มต้นสำหรับทุกวันในสัปดาห์
      for (let i = 0; i < 7; i++) {
        dailyMap.set(daysOfWeek[i], { orders: 0, revenue: 0 })
      }

      // จัดกลุ่มข้อมูลตามวัน
      weeklyOrders?.forEach((order) => {
        const orderDate = new Date(order.created_at)
        const dayIndex = orderDate.getDay()
        const dayName = daysOfWeek[dayIndex === 0 ? 6 : dayIndex - 1] // ปรับให้ 0 = Sunday เป็น 6 = Sunday

        const dailyData = dailyMap.get(dayName)!
        dailyData.orders += 1
        dailyData.revenue += this.extractNumericValue(order.total)
      })

      // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
      const result: WeeklyTrend[] = Array.from(dailyMap.entries()).map(([name, data]) => ({
        name,
        Orders: data.orders,
        Revenue: data.revenue,
      }))

      // เรียงลำดับตามวันในสัปดาห์
      return result.sort((a, b) => {
        const dayA = daysOfWeek.indexOf(a.name)
        const dayB = daysOfWeek.indexOf(b.name)
        return dayA - dayB
      })
    } catch (error) {
      console.error("DashboardService.getWeeklyPerformanceTrends error:", error)
      // ส่งอาร์เรย์ว่างกลับไปในกรณีที่เกิดข้อผิดพลาด
      return []
    }
  }

  // เพิ่มฟังก์ชันสำหรับดึงข้อมูลสินค้าคงคลังที่ต่ำ
  static async getLowStockItems(): Promise<number> {
    try {
      // ตรวจสอบว่ามีตาราง products หรือไม่
      const { error: checkError } = await supabase.from("products").select("id").limit(1).single()

      // ถ้ามีข้อผิดพลาด (ไม่มีตาราง products) ให้ส่งค่าเริ่มต้นกลับไป
      if (checkError) {
        console.log("Table 'products' not found, using default value for low stock items")
        return 0
      }

      // ถ้ามีตาราง products ให้ดึงข้อมูลสินค้าคงคลังที่ต่ำ
      const { data: products, error } = await supabase
        .from("products")
        .select("id, stock_quantity, reorder_level")
        .lt("stock_quantity", "reorder_level")

      if (error) {
        console.error("Error fetching low stock items:", error)
        return 0
      }

      return products?.length || 0
    } catch (error) {
      console.error("DashboardService.getLowStockItems error:", error)
      return 0
    }
  }

  // เพิ่มฟังก์ชันสำหรับดึงข้อมูล API Latency
  static async getApiLatency(): Promise<number> {
    try {
      const startTime = Date.now()

      // ทำการเรียก API ที่ใช้วัด latency (ในที่นี้ใช้การดึงข้อมูลจำนวนน้อยจาก orders)
      await supabase.from("orders").select("id").limit(1)

      const endTime = Date.now()
      return endTime - startTime
    } catch (error) {
      console.error("DashboardService.getApiLatency error:", error)
      return 0
    }
  }

  // เพิ่มฟังก์ชันสำหรับคำนวณอัตราการเติบโต
  static async calculateGrowthRates() {
    try {
      const today = new Date()

      // คำนวณวันที่เริ่มต้นของช่วงปัจจุบัน (7 วันล่าสุด)
      const currentPeriodStart = new Date(today)
      currentPeriodStart.setDate(today.getDate() - 7)

      // คำนวณวันที่เริ่มต้นของช่วงก่อนหน้า (7 วันก่อนช่วงปัจจุบัน)
      const previousPeriodStart = new Date(currentPeriodStart)
      previousPeriodStart.setDate(currentPeriodStart.getDate() - 7)

      // ดึงข้อมูล orders ในช่วงปัจจุบัน
      const { data: currentOrders, error: currentError } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", currentPeriodStart.toISOString()) as { data: Order[] | null, error: any }

      if (currentError || !currentOrders) {
        console.error("Error fetching current period orders:", currentError)
        throw currentError || new Error("No current orders data returned")
      }

      // ดึงข้อมูล orders ในช่วงก่อนหน้า
      const { data: previousOrders, error: previousError } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", previousPeriodStart.toISOString())
        .lt("created_at", currentPeriodStart.toISOString()) as { data: Order[] | null, error: any }

      if (previousError || !previousOrders) {
        console.error("Error fetching previous period orders:", previousError)
        throw previousError || new Error("No previous orders data returned")
      }

      // คำนวณจำนวน orders ที่กำลังประมวลผล
      const currentProcessing = currentOrders?.filter((o) => o.status === "PROCESSING").length || 0
      const previousProcessing = previousOrders?.filter((o) => o.status === "PROCESSING").length || 0

      // คำนวณจำนวน SLA breaches
      const currentBreaches =
        currentOrders?.filter(
          (o) =>
            (o.sla_status === "BREACH" || o.sla_target_minutes < o.elapsed_minutes) &&
            o.status !== "DELIVERED" &&
            o.status !== "FULFILLED",
        ).length || 0

      const previousBreaches =
        previousOrders?.filter(
          (o) =>
            (o.sla_status === "BREACH" || o.sla_target_minutes < o.elapsed_minutes) &&
            o.status !== "DELIVERED" &&
            o.status !== "FULFILLED",
        ).length || 0

      // คำนวณรายได้
      const currentRevenue = currentOrders?.reduce((sum, o) => sum + this.extractNumericValue(o.total), 0) || 0
      const previousRevenue = previousOrders?.reduce((sum, o) => sum + this.extractNumericValue(o.total), 0) || 0

      // คำนวณเวลาประมวลผลเฉลี่ย
      const currentProcessingOrders =
        currentOrders?.filter((o) => o.status !== "DELIVERED" && o.status !== "FULFILLED") || []
      const previousProcessingOrders =
        previousOrders?.filter((o) => o.status !== "DELIVERED" && o.status !== "FULFILLED") || []

      const currentAvgTime =
        currentProcessingOrders.length > 0
          ? currentProcessingOrders.reduce((sum, o) => sum + o.elapsed_minutes, 0) / currentProcessingOrders.length
          : 0

      const previousAvgTime =
        previousProcessingOrders.length > 0
          ? previousProcessingOrders.reduce((sum, o) => sum + o.elapsed_minutes, 0) / previousProcessingOrders.length
          : 0

      // คำนวณจำนวน orders ทั้งหมด
      const currentTotal = currentOrders?.length || 0
      const previousTotal = previousOrders?.length || 0

      // คำนวณอัตราการจัดส่งสำเร็จ
      const currentFulfilled =
        currentOrders?.filter((o) => o.status === "DELIVERED" || o.status === "FULFILLED").length || 0
      const previousFulfilled =
        previousOrders?.filter((o) => o.status === "DELIVERED" || o.status === "FULFILLED").length || 0

      const currentFulfillmentRate = currentTotal > 0 ? (currentFulfilled / currentTotal) * 100 : 0
      const previousFulfillmentRate = previousTotal > 0 ? (previousFulfilled / previousTotal) * 100 : 0

      // คำนวณอัตราการเติบโต
      const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return ((current - previous) / previous) * 100
      }

      return {
        ordersProcessing: calculateGrowth(currentProcessing, previousProcessing),
        slaBreaches: calculateGrowth(currentBreaches, previousBreaches),
        revenueToday: calculateGrowth(currentRevenue, previousRevenue),
        avgProcessingTime: calculateGrowth(currentAvgTime, previousAvgTime),
        totalOrders: calculateGrowth(currentTotal, previousTotal),
        fulfillmentRate: calculateGrowth(currentFulfillmentRate, previousFulfillmentRate),
      }
    } catch (error) {
      console.error("DashboardService.calculateGrowthRates error:", error)
      // ส่งค่าเริ่มต้นในกรณีที่เกิดข้อผิดพลาด
      return {
        ordersProcessing: 0,
        slaBreaches: 0,
        revenueToday: 0,
        avgProcessingTime: 0,
        totalOrders: 0,
        fulfillmentRate: 0,
      }
    }
  }

  // Helper function to extract numeric value from price string
  private static extractNumericValue(priceString: string): number {
    if (!priceString) return 0

    // Remove currency symbol, commas, and other non-numeric characters except decimal point
    const numericString = priceString.replace(/[^0-9.]/g, "")
    return Number.parseFloat(numericString) || 0
  }
}
