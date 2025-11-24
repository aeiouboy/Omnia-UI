import {
  filterSLABreach,
  filterApproachingSLA
} from "@/lib/sla-utils"
import { getGMT7Time, safeToISOString } from "@/lib/utils"
import { ApiOrder } from "./types"
import { TOPS_STORES } from "./constants"

// Enhanced channel detection with intelligent fallbacks
function detectOrderChannel(order: any): string {
  // 1. Primary: Check main channel field
  if (order.channel && typeof order.channel === 'string' && order.channel.trim()) {
    return normalizeChannelName(order.channel.trim())
  }
  
  // 2. Fallback: Check metadata
  if (order.metadata?.channel && typeof order.metadata.channel === 'string') {
    return normalizeChannelName(order.metadata.channel.trim())
  }
  
  // 3. Fallback: Check source field
  if (order.source && typeof order.source === 'string' && order.source.trim()) {
    return normalizeChannelName(order.source.trim())
  }
  
  // 4. Intelligent categorization based on order characteristics
  // Check for delivery platform patterns
  if (order.order_no?.toLowerCase().includes('grab')) return 'GrabMart'
  if (order.order_no?.toLowerCase().includes('food')) return 'FoodDelivery'
  if (order.order_no?.toLowerCase().includes('line')) return 'LINE MAN'
  
  // Check payment method patterns
  if (order.payment_method?.toLowerCase().includes('wallet')) return 'Digital Wallet'
  if (order.payment_method?.toLowerCase().includes('card')) return 'Credit Card'
  if (order.payment_method?.toLowerCase().includes('cash')) return 'Cash Payment'
  
  // Check order type patterns
  if (order.order_type?.toLowerCase().includes('delivery')) return 'Delivery Service'
  if (order.order_type?.toLowerCase().includes('pickup')) return 'Store Pickup'
  if (order.order_type?.toLowerCase().includes('dine')) return 'Dine In'
  
  // Check store/location patterns
  if (order.metadata?.store_name || order.location) {
    const storeName = order.metadata?.store_name || order.location || ''
    if (storeName.toLowerCase().includes('tops')) return 'Tops Store'
    if (storeName.toLowerCase().includes('central')) return 'Central Store'
  }
  
  // Last resort: Use order ID patterns
  if (order.id && typeof order.id === 'string') {
    const idPrefix = order.id.substring(0, 3).toUpperCase()
    if (idPrefix.match(/^[A-Z]{2,3}$/)) return `Channel-${idPrefix}`
  }
  
  return 'Unclassified'
}

// Normalize channel names for consistency
function normalizeChannelName(channel: string): string {
  const normalized = channel.toLowerCase()
  
  // Map common variations to standard names
  if (normalized.includes('grab')) return 'GrabMart'
  if (normalized.includes('line') || normalized.includes('man')) return 'LINE MAN'
  if (normalized.includes('food')) return 'FoodDelivery'
  if (normalized.includes('delivery')) return 'Delivery Service'
  if (normalized.includes('pickup')) return 'Store Pickup'
  if (normalized.includes('tops')) return 'Tops Store'
  if (normalized.includes('central')) return 'Central Store'
  if (normalized.includes('online')) return 'Online'
  if (normalized.includes('mobile')) return 'Mobile App'
  if (normalized.includes('web')) return 'Website'
  
  // Return capitalized version if no mapping found
  return channel.charAt(0).toUpperCase() + channel.slice(1).toLowerCase()
}

// Helper calculation functions with validation
export const calculateFulfillmentRate = (orders: any[] = []) => {
  // Validate input
  if (!Array.isArray(orders)) {
    console.warn('calculateFulfillmentRate: Invalid input, expected array')
    return 0
  }
  // ✅ นับทั้ง DELIVERED และ FULFILLED สำหรับ fulfillment rate ที่ถูกต้อง
  const fulfilledOrders = orders.filter(order => 
    ['DELIVERED', 'FULFILLED'].includes(order.status)
  ).length
  
  const rate = orders.length > 0 ? Math.round((fulfilledOrders / orders.length) * 100) : 0
  console.log(`📊 Fulfillment Rate: ${rate}% (${fulfilledOrders}/${orders.length} orders fulfilled)`)
  
  return rate
}

export const calculateChannelVolume = (orders: any[] = []) => {
  // Validate input
  if (!Array.isArray(orders)) {
    console.warn('calculateChannelVolume: Invalid input, expected array')
    return []
  }
  
  console.log('📊 Calculating channel volume from', orders.length, 'orders')
  
  if (orders.length === 0) {
    console.log('⚠️ No orders provided to calculateChannelVolume')
    return []
  }
  
  // Log sample data structure for debugging
  if (orders.length > 0) {
    console.log('🔍 Sample order structure:', {
      id: orders[0].id,
      channel: orders[0].channel,
      metadata: orders[0].metadata,
      source: orders[0].source,
      order_type: orders[0].order_type,
      payment_method: orders[0].payment_method,
      status: orders[0].status,
      order_date: orders[0].order_date,
      total_amount: orders[0].total_amount
    })
    
    // Test our detection function on the first order
    const detectedChannel = detectOrderChannel(orders[0])
    console.log('🔍 Channel detection test:', {
      original_channel: orders[0].channel,
      detected_channel: detectedChannel,
      detection_logic: 'Enhanced fallback applied'
    })
  }
  
  // Track problematic orders for debugging
  let unknownChannelOrders = 0
  
  const channelCounts = orders.reduce((acc, order) => {
    // Enhanced channel detection with multiple fallbacks
    let channel = detectOrderChannel(order)
    
    if (channel === 'Unclassified') {
      unknownChannelOrders++
      if (unknownChannelOrders <= 3) {
        console.log('🔍 Unclassified order sample:', {
          id: order.id,
          original_channel: order.channel,
          detected_channel: channel,
          metadata: order.metadata,
          source: order.source,
          order_type: order.order_type,
          payment_method: order.payment_method,
          location: order.location,
          order_no: order.order_no
        })
      }
    }
    
    // Also log successful detections for first few orders
    if (unknownChannelOrders === 0 && Object.keys(acc).length < 5) {
      console.log('✅ Successfully classified order:', {
        id: order.id,
        original_channel: order.channel,
        detected_channel: channel
      })
    }
    
    acc[channel] = (acc[channel] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  if (unknownChannelOrders > 0) {
    console.warn(`⚠️ Found ${unknownChannelOrders} orders with unclassified channels`)
  }
  
  const result = Object.entries(channelCounts)
    .map(([channel, count]) => ({ channel, count: count as number }))
    .sort((a, b) => b.count - a.count) // Sort by count descending
  
  console.log('📈 Channel volume summary:', channelCounts)
  console.log('📈 Total unique channels:', result.length)
  
  // Return actual data without test data fallback
  return result
}

export const calculateEnhancedChannelData = (orders: any[]) => {
  const channelVolume = calculateChannelVolume(orders)
  console.log('🔍 Channel volume data for Performance Analysis:', channelVolume)
  
  if (!channelVolume || channelVolume.length === 0) {
    console.log('⚠️ No channel volume data available, returning empty array')
    return []
  }
  
  // Calculate revenue by channel
  const channelRevenue: Record<string, number> = {}
  orders.forEach(order => {
    const channel = detectOrderChannel(order)
    const revenue = order.total_amount || 0
    if (!channelRevenue[channel]) {
      channelRevenue[channel] = 0
    }
    channelRevenue[channel] += revenue
  })
  
  // Transform data structure for InteractiveChart compatibility
  const transformedData = channelVolume.map(item => ({
    name: item.channel || 'Unclassified', // Use consistent naming with detectOrderChannel
    orders: item.count || 0,
    revenue: channelRevenue[item.channel || 'Unclassified'] || 0
  }))
  
  console.log('✅ Transformed channel data for Performance Analysis:', transformedData)
  console.log('🎯 Data structure for InteractiveChart - name/orders/revenue format:', transformedData.map(d => `${d.name}: ${d.orders} orders, ฿${d.revenue.toLocaleString('th-TH')}`))
  
  // Ensure we have valid data before returning
  if (transformedData.length === 0) {
    console.log('⚠️ Transformed data is empty, returning fallback')
    return []
  }
  
  return transformedData
}

export const getCriticalAlerts = (orders: any[] = []) => {
  if (!Array.isArray(orders)) return []

  // Filter to TODAY'S ORDERS ONLY for critical alerts (GMT+7 timezone)
  const today = getGMT7Time()
  const todayStr = safeToISOString(today, undefined, 'getCriticalAlerts:today').split('T')[0] // YYYY-MM-DD format

  const todaysOrders = orders.filter(order => {
    // Skip orders with missing or invalid dates
    if (!order.order_date) {
      console.warn(`⚠️ Invalid date detected`, { orderId: order.id, dateField: 'order_date', value: order.order_date })
      return false
    }

    // Validate order date before processing
    const orderDate = new Date(order.order_date)
    if (isNaN(orderDate.getTime())) {
      console.warn(`⚠️ Invalid date detected`, { orderId: order.id, dateField: 'order_date', value: order.order_date })
      return false
    }

    const orderDateStr = safeToISOString(orderDate, undefined, `getCriticalAlerts:orderId=${order.id}`).split('T')[0]
    return orderDateStr === todayStr
  })

  console.log(`🚨 Critical alerts from TODAY's orders: ${todaysOrders.length}/${orders.length} (${todayStr})`)

  return filterSLABreach(todaysOrders).slice(0, 5) // Top 5 critical alerts from today
}

export const calculateDailyOrders = (orders: any[] = []) => {
  // Validate input
  if (!Array.isArray(orders)) {
    console.warn('calculateDailyOrders: Invalid input, expected array')
    return []
  }

  console.log('📅 Calculating daily orders from', orders.length, 'orders')

  if (orders.length === 0) {
    console.log('⚠️ No orders provided to calculateDailyOrders')
    return []
  }

  // Group orders by day - total count only (not by channel)
  const dailyData = orders.reduce((acc, order) => {
    const orderDate = order.order_date || order.created_at || order.date
    if (!orderDate) {
      console.warn('⚠️ Order missing date field:', order.id)
      return acc
    }

    // Validate date before converting to ISO string
    const dateObj = new Date(orderDate)
    if (isNaN(dateObj.getTime())) {
      console.warn(`⚠️ Invalid date detected`, { orderId: order.id, dateField: 'order_date/created_at/date', value: orderDate })
      return acc
    }

    const date = safeToISOString(dateObj, undefined, `calculateDailyOrders:orderId=${order.id}`).split('T')[0]

    if (!acc[date]) {
      acc[date] = {
        date,
        orders: 0,
        revenue: 0
      }
    }

    acc[date].orders += 1
    acc[date].revenue += (order.total_amount || 0)
    return acc
  }, {} as Record<string, any>)

  const result = Object.values(dailyData).sort((a: any, b: any) => a.date.localeCompare(b.date))
  console.log('📈 Daily orders calculated:', result)
  console.log('📊 Sample daily data:', result.slice(0, 2))

  return result
}

export const calculateFulfillmentByBranch = (orders: any[]) => {
  console.log('🏪 Calculating fulfillment by branch from', orders.length, 'orders')
  
  // Create a map for all Tops stores with initial values
  const branchData = TOPS_STORES.reduce((acc, store) => {
    acc[store] = { total: 0, fulfilled: 0 }
    return acc
  }, {} as Record<string, { total: number; fulfilled: number }>)
  
  // Process orders and match to Tops stores
  orders.forEach(order => {
    const storeName = order.metadata?.store_name || order.location || ''
    
    // Find matching Tops store (case-insensitive partial match)
    const matchedStore = TOPS_STORES.find(topsStore => {
      const storeNameLower = storeName.toLowerCase()
      const topsStoreLower = topsStore.toLowerCase()
      return storeNameLower.includes(topsStoreLower) || 
             topsStoreLower.includes(storeNameLower) ||
             storeNameLower.includes('tops') && storeNameLower.includes(topsStoreLower.replace('tops ', ''))
    })
    
    if (matchedStore) {
      branchData[matchedStore].total += 1
      if (order.status === 'DELIVERED' || order.status === 'FULFILLED') {
        branchData[matchedStore].fulfilled += 1
      }
    }
  })
  
  const result = Object.entries(branchData).map(([branch, data]) => ({
    branch,
    total: data.total,
    fulfilled: data.fulfilled,
    rate: data.total > 0 ? Math.round((data.fulfilled / data.total) * 100) : 0
  }))
  
  console.log('🏪 Fulfillment by branch calculated:', result.filter(b => b.total > 0).length, 'stores with orders')
  
  return result
}

export const calculateChannelPerformance = (orders: any[]) => {
  interface ChannelStats {
    orders: number
    revenue: number
    compliant: number
    total: number
  }
  
  const channelData = orders.reduce((acc, order) => {
    const channel = order.channel || 'OTHER'
    if (!acc[channel]) {
      acc[channel] = { orders: 0, revenue: 0, compliant: 0, total: 0 }
    }
    acc[channel].orders += 1
    acc[channel].revenue += order.total_amount || 0
    acc[channel].total += 1
    if (order.sla_info?.status === 'COMPLIANT' || 
        (order.sla_info && order.status === 'DELIVERED')) {
      acc[channel].compliant += 1
    }
    return acc
  }, {} as Record<string, ChannelStats>)
  
  return Object.entries(channelData).map(([channel, data]) => {
    const stats = data as ChannelStats
    return {
      channel,
      orders: stats.orders,
      revenue: stats.revenue,
      sla_rate: stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0
    }
  })
}

export const calculateTopProducts = (orders: any[]) => {
  console.log('📦 Calculating top products from', orders.length, 'orders')

  // Log sample order structure to verify items array
  if (orders.length > 0) {
    const sampleOrder = orders[0]
    console.log('🔍 Sample order for product analysis:', {
      id: sampleOrder.id,
      hasItems: !!sampleOrder.items,
      itemsType: Array.isArray(sampleOrder.items) ? 'array' : typeof sampleOrder.items,
      itemsLength: sampleOrder.items?.length || 0,
      sampleItem: sampleOrder.items?.[0] || null
    })
  }

  let ordersWithItems = 0
  let ordersWithoutItems = 0
  let totalItems = 0

  const productData = orders.reduce((acc, order) => {
    if (order.items && Array.isArray(order.items)) {
      ordersWithItems++
      totalItems += order.items.length

      order.items.forEach((item: any) => {
        const productName = item.product_name || 'Unknown Product'

        // Log first unknown product for debugging
        if (productName === 'Unknown Product' && Object.keys(acc).length === 0) {
          console.warn('⚠️ Found item without product_name:', {
            item,
            availableFields: Object.keys(item)
          })
        }

        if (!acc[productName]) {
          acc[productName] = {
            name: productName,
            sku: item.product_sku || item.product_id || 'N/A',
            units: 0,
            revenue: 0
          }
        }
        acc[productName].units += item.quantity || 0
        acc[productName].revenue += (item.total_price || (item.unit_price * item.quantity)) || 0
      })
    } else {
      ordersWithoutItems++
    }
    return acc
  }, {} as Record<string, any>)

  console.log('📦 Product aggregation summary:', {
    ordersWithItems,
    ordersWithoutItems,
    totalItems,
    uniqueProducts: Object.keys(productData).length,
    avgItemsPerOrder: ordersWithItems > 0 ? (totalItems / ordersWithItems).toFixed(1) : 0
  })

  const result = Object.values(productData)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((product: any, index) => ({
      rank: index + 1,
      ...product
    }))

  console.log('📦 Top products calculated:', result.length, 'products')
  if (result.length > 0) {
    console.log('📦 Top 3 products:', result.slice(0, 3).map(p => `${p.name} (฿${p.revenue})`))
  }

  return result
}

export const calculateRevenueByCategory = (orders: any[]) => {
  console.log('💰 Calculating revenue by category from', orders.length, 'orders')

  // Log sample item structure to verify category path
  if (orders.length > 0 && orders[0].items && orders[0].items.length > 0) {
    const sampleItem = orders[0].items[0]
    console.log('🔍 Sample item for category analysis:', {
      hasProductDetails: !!sampleItem.product_details,
      categoryPath1: sampleItem.product_details?.category,
      categoryPath2: sampleItem.category,
      availableFields: Object.keys(sampleItem)
    })
  }

  let itemsWithCategory = 0
  let itemsWithoutCategory = 0

  const categoryData = orders.reduce((acc, order) => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const category = item.product_details?.category || item.category || 'Other'

        if (category === 'Other') {
          itemsWithoutCategory++
          // Log first item without category for debugging
          if (itemsWithoutCategory === 1) {
            console.warn('⚠️ Found item without category:', {
              item,
              availableFields: Object.keys(item),
              hasProductDetails: !!item.product_details,
              productDetailsFields: item.product_details ? Object.keys(item.product_details) : []
            })
          }
        } else {
          itemsWithCategory++
        }

        if (!acc[category]) {
          acc[category] = 0
        }
        acc[category] += item.total_price || 0
      })
    }
    return acc
  }, {} as Record<string, number>)

  console.log('💰 Category aggregation summary:', {
    itemsWithCategory,
    itemsWithoutCategory,
    uniqueCategories: Object.keys(categoryData).length,
    categories: Object.keys(categoryData)
  })

  const result = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value)

  console.log('💰 Revenue by category calculated:', result.length, 'categories')
  if (result.length > 0) {
    console.log('💰 Top 3 categories:', result.slice(0, 3).map(c => `${c.name} (฿${c.value.toLocaleString()})`))
  }

  return result
}

export const calculateHourlyOrderSummary = (orders: any[]) => {
  console.log('⏰ Calculating hourly order summary from', orders.length, 'orders')
  
  interface HourlyData {
    orders: number
    revenue: number
  }
  
  const hourlyData = orders.reduce((acc, order) => {
    const orderDate = new Date(order.order_date || order.created_at)
    const hour = orderDate.getHours()
    const hourKey = `${hour.toString().padStart(2, '0')}:00`
    
    if (!acc[hourKey]) {
      acc[hourKey] = { orders: 0, revenue: 0 }
    }
    acc[hourKey].orders += 1
    acc[hourKey].revenue += (order.total_amount || 0)
    return acc
  }, {} as Record<string, HourlyData>)
  
  // Fill in missing hours with 0 orders
  for (let i = 0; i < 24; i++) {
    const hourKey = `${i.toString().padStart(2, '0')}:00`
    if (!hourlyData[hourKey]) {
      hourlyData[hourKey] = { orders: 0, revenue: 0 }
    }
  }
  
  const result = Object.entries(hourlyData)
    .map(([hour, data]) => {
      const hourData = data as HourlyData
      return { 
        hour, 
        orders: hourData.orders,
        revenue: hourData.revenue 
      }
    })
    .sort((a, b) => a.hour.localeCompare(b.hour))
  
  console.log('⏰ Hourly summary calculated:', result.length, 'hours')
  console.log('⏰ Peak hour:', result.reduce((max, curr) => curr.orders > max.orders ? curr : max, result[0]))
  
  return result
}

export const calculateProcessingTimes = (orders: any[]) => {
  interface ProcessingData {
    total: number
    count: number
  }
  
  // Group by hour and calculate average processing time
  const hourlyProcessing = orders.reduce((acc, order) => {
    if (order.sla_info?.elapsed_minutes) {
      const orderDate = new Date(order.order_date || order.created_at)
      const hour = orderDate.getHours()
      const hourKey = `${hour.toString().padStart(2, '0')}:00`
      
      if (!acc[hourKey]) {
        acc[hourKey] = { total: 0, count: 0 }
      }
      acc[hourKey].total += order.sla_info.elapsed_minutes / 60 // Convert to minutes
      acc[hourKey].count += 1
    }
    return acc
  }, {} as Record<string, ProcessingData>)
  
  return (Object.entries(hourlyProcessing) as [string, ProcessingData][])
    .map(([time, data]) => ({
      time,
      value: Math.round(data.total / data.count)
    }))
    .sort((a, b) => a.time.localeCompare(b.time))
}

export const calculateSlaCompliance = (orders: any[]) => {
  const slaData = orders.reduce((acc, order) => {
    let status = 'COMPLIANT'
    // Remember: despite field names, values are in SECONDS
    const targetSeconds = order.sla_info?.target_minutes || 300 // Default 5 minutes
    const elapsedSeconds = order.sla_info?.elapsed_minutes || 0
    
    if (order.sla_info?.status === 'BREACH' || elapsedSeconds > targetSeconds) {
      status = 'BREACH'
    } else if (order.sla_info?.status === 'NEAR_BREACH' ||
               (elapsedSeconds > targetSeconds * 0.8 && elapsedSeconds <= targetSeconds)) {
      status = 'NEAR_BREACH'
    }
    
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const total = orders.length
  return Object.entries(slaData).map(([status, count]) => ({
    status,
    count: count as number,
    percentage: total > 0 ? Math.round((count as number / total) * 100) : 0
  }))
}

// Data validation functions
export const validateOrderData = (orders: ApiOrder[]): {
  isValid: boolean
  completeness: number
  issues: Array<{ field: string; issue: string; severity: 'warning' | 'error'; count?: number }>
  summary: {
    totalOrders: number
    validOrders: number
    invalidOrders: number
    missingFields: string[]
  }
} => {
  const issues: Array<{ field: string; issue: string; severity: 'warning' | 'error'; count?: number }> = []
  const missingFields = new Set<string>()
  let validOrders = 0
  let invalidOrders = 0
  
  // Field validation rules
  const requiredFields = ['id', 'order_no', 'status', 'order_date']
  const importantFields = ['channel', 'total_amount', 'customer', 'sla_info']
  
  orders.forEach(order => {
    let isOrderValid = true
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!order[field as keyof ApiOrder]) {
        missingFields.add(field)
        isOrderValid = false
      }
    })
    
    // Check important fields (warnings)
    importantFields.forEach(field => {
      if (!order[field as keyof ApiOrder]) {
        missingFields.add(field)
      }
    })
    
    // Validate data types and ranges
    if (order.total_amount && order.total_amount < 0) {
      issues.push({
        field: 'total_amount',
        issue: 'Negative total amount detected',
        severity: 'error',
        count: 1
      })
      isOrderValid = false
    }
    
    if (order.sla_info) {
      if (order.sla_info.elapsed_minutes < 0) {
        issues.push({
          field: 'sla_info.elapsed_minutes',
          issue: 'Negative elapsed time',
          severity: 'error',
          count: 1
        })
        isOrderValid = false
      }
      
      if (order.sla_info.target_minutes <= 0) {
        issues.push({
          field: 'sla_info.target_minutes',
          issue: 'Invalid SLA target',
          severity: 'error',
          count: 1
        })
        isOrderValid = false
      }
    }
    
    if (isOrderValid) {
      validOrders++
    } else {
      invalidOrders++
    }
  })
  
  // Calculate completeness score
  const totalFields = requiredFields.length + importantFields.length
  const completeFields = totalFields - missingFields.size
  const completeness = Math.round((completeFields / totalFields) * 100)
  
  // Add summary issues
  if (missingFields.size > 0) {
    issues.push({
      field: 'data_completeness',
      issue: `Missing fields: ${Array.from(missingFields).join(', ')}`,
      severity: missingFields.size > requiredFields.length ? 'error' : 'warning',
      count: missingFields.size
    })
  }
  
  if (invalidOrders > 0) {
    issues.push({
      field: 'data_validity',
      issue: `${invalidOrders} orders have validation errors`,
      severity: 'error',
      count: invalidOrders
    })
  }
  
  return {
    isValid: invalidOrders === 0 && issues.filter(i => i.severity === 'error').length === 0,
    completeness,
    issues,
    summary: {
      totalOrders: orders.length,
      validOrders,
      invalidOrders,
      missingFields: Array.from(missingFields)
    }
  }
}

// Seven days coverage validation
export const validateSevenDaysCoverage = (
  orders: ApiOrder[],
  dateFrom: string,
  dateTo: string
): {
  isComplete: boolean
  coverage: number
  missingDays: string[]
  completeDays: number
} => {
  const orderDates = new Set(
    orders
      .filter(order => {
        // Skip orders with missing or invalid dates
        if (!order.order_date) return false
        const dateObj = new Date(order.order_date)
        if (isNaN(dateObj.getTime())) {
          console.warn(`⚠️ Invalid date detected`, { orderId: order.id, dateField: 'order_date', value: order.order_date })
          return false
        }
        return true
      })
      .map(order => {
        const dateObj = new Date(order.order_date)
        return safeToISOString(dateObj, undefined, `validateSevenDaysCoverage:orderId=${order.id}`).split('T')[0]
      })
  )

  const startDate = new Date(dateFrom)
  const endDate = new Date(dateTo)
  const expectedDays: string[] = []
  const missingDays: string[] = []

  // Generate expected days with safe date handling
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Validate date object before converting to ISO string
    if (!isNaN(d.getTime())) {
      const dateStr = safeToISOString(d, undefined, 'validateSevenDaysCoverage:loopDate').split('T')[0]
      expectedDays.push(dateStr)

      if (!orderDates.has(dateStr)) {
        missingDays.push(dateStr)
      }
    }
  }

  const completeDays = expectedDays.length - missingDays.length
  const coverage = expectedDays.length > 0 ? Math.round((completeDays / expectedDays.length) * 100) : 0

  return {
    isComplete: missingDays.length === 0,
    coverage,
    missingDays,
    completeDays
  }
}
