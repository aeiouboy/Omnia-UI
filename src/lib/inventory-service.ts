/**
 * Inventory Service Layer
 *
 * Provides data fetching functions for inventory management.
 * Supports dual data strategy: Supabase database (primary) with fallback to mock data.
 * Follows the same pattern as escalation-service.ts.
 */

import { supabase } from "./supabase"
import {
  mockInventoryItems,
  mockStorePerformance,
  generateStockAlerts,
  generateMockStockHistory,
  generateMockTransactions,
  generateStorePerformanceFromInventory,
  BRANDS,
} from "./mock-inventory-data"
import type {
  InventoryItem,
  StorePerformance,
  StockAlert,
  InventoryFilters,
  InventoryDataResponse,
  StorePerformanceResponse,
  StockAlertsResponse,
  InventoryItemDB,
  StockTransaction,
  StockHistoryPoint,
} from "@/types/inventory"

/**
 * Check if Supabase is available and properly configured
 */
function isSupabaseAvailable(): boolean {
  // Check if we have valid Supabase credentials (not mock client)
  return (
    supabase !== null &&
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "" &&
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0 &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== ""
  )
}

/**
 * Convert database inventory item to application format
 */
function convertDBItemToInventoryItem(dbItem: InventoryItemDB): InventoryItem {
  const currentStock = dbItem.current_stock
  const availableStock = dbItem.available_stock ?? currentStock
  const maxStockLevel = dbItem.max_stock_level

  return {
    id: dbItem.id,
    productId: dbItem.product_id,
    productName: dbItem.product_name,
    category: dbItem.category as InventoryItem["category"],
    storeName: dbItem.store_name as InventoryItem["storeName"],
    currentStock,
    availableStock, // Fallback to currentStock if not present
    // Calculate reserved stock if not present: currentStock - availableStock
    reservedStock: dbItem.reserved_stock ?? (currentStock - availableStock),
    // Calculate safety stock if not present: 15% of max stock level
    safetyStock: dbItem.safety_stock ?? Math.round(maxStockLevel * 0.15),
    minStockLevel: dbItem.min_stock_level,
    maxStockLevel,
    unitPrice: dbItem.unit_price,
    lastRestocked: dbItem.last_restocked,
    status: dbItem.status as InventoryItem["status"],
    supplier: dbItem.supplier,
    reorderPoint: dbItem.reorder_point,
    demandForecast: dbItem.demand_forecast,
    imageUrl: dbItem.image_url || "/images/placeholder-product.svg",
    barcode: dbItem.barcode,
    itemType: (dbItem.item_type as InventoryItem["itemType"]) || "unit", // Default to "unit" if not specified
  }
}

/**
 * Apply filters to inventory items (for mock data)
 */
function applyFilters(
  items: InventoryItem[],
  filters?: InventoryFilters
): InventoryItem[] {
  let filtered = [...items]

  if (!filters) return filtered

  // Filter by category
  if (filters.category && filters.category !== "all") {
    filtered = filtered.filter((item) => item.category === filters.category)
  }

  // Filter by store
  if (filters.storeName && filters.storeName !== "all") {
    filtered = filtered.filter((item) => item.storeName === filters.storeName)
  }

  // Filter by warehouse code
  if (filters.warehouseCode && filters.warehouseCode !== "all") {
    filtered = filtered.filter((item) =>
      item.warehouseLocations?.some(
        (loc) => loc.warehouseCode === filters.warehouseCode
      )
    )
  }

  // Filter by item type
  if (filters.itemType && filters.itemType !== "all") {
    if (filters.itemType === "weight") {
      filtered = filtered.filter((item) =>
        item.itemType === "weight" || item.itemType === "pack_weight"
      )
    } else {
      filtered = filtered.filter((item) =>
        item.itemType === "pack" || item.itemType === "normal"
      )
    }
  }

  // Filter by status
  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter((item) => item.status === filters.status)
  }

  // Filter by brand
  if (filters.brand && filters.brand !== "all") {
    filtered = filtered.filter((item) => item.brand === filters.brand)
  }

  // Filter by view
  if (filters.view && filters.view !== "all") {
    filtered = filtered.filter((item) => item.view === filters.view)
  }

  // Filter by business unit
  if (filters.businessUnit) {
    filtered = filtered.filter((item) => item.businessUnit === filters.businessUnit)
  }

  // Filter by channels
  if (filters.channels && filters.channels.length > 0) {
    filtered = filtered.filter((item) =>
      filters.channels!.some((channel) => item.channels?.includes(channel))
    )
  }

  // Filter by search query
  if (filters.searchQuery && filters.searchQuery.trim() !== "") {
    const query = filters.searchQuery.toLowerCase()
    filtered = filtered.filter(
      (item) => {
        // Search in product name, ID, supplier, brand
        const basicMatch =
          item.productName.toLowerCase().includes(query) ||
          item.productId.toLowerCase().includes(query) ||
          item.supplier.toLowerCase().includes(query) ||
          (item.barcode && item.barcode.toLowerCase().includes(query)) ||
          item.category.toLowerCase().includes(query) ||
          (item.brand && item.brand.toLowerCase().includes(query))

        // Also search in warehouse locations
        const warehouseMatch = item.warehouseLocations?.some(
          (location) =>
            location.warehouseCode.toLowerCase().includes(query) ||
            location.locationCode.toLowerCase().includes(query)
        )

        return basicMatch || warehouseMatch
      }
    )
  }

  // Apply sorting
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let aVal: string | number = ""
      let bVal: string | number = ""

      switch (filters.sortBy) {
        case "productName":
          aVal = a.productName
          bVal = b.productName
          break
        case "brand":
          aVal = a.brand || ""
          bVal = b.brand || ""
          break
        case "currentStock":
          aVal = a.currentStock
          bVal = b.currentStock
          break
        case "status":
          aVal = a.status
          bVal = b.status
          break
        case "lastRestocked":
          aVal = a.lastRestocked
          bVal = b.lastRestocked
          break
        default:
          return 0
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return filters.sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return filters.sortOrder === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })
  }

  return filtered
}

/**
 * Fetch inventory data with pagination and filtering
 *
 * @param filters - Optional filter parameters
 * @returns Promise<InventoryDataResponse>
 */
export async function fetchInventoryData(
  filters?: InventoryFilters
): Promise<InventoryDataResponse> {
  const page = filters?.page || 1
  const pageSize = filters?.pageSize || 25

  // Check if Supabase is configured before attempting query
  if (!isSupabaseAvailable()) {
    console.info("Using mock inventory data (Supabase not configured)")
    // Use mock data directly
    const filtered = applyFilters(mockInventoryItems, filters)
    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize)
    const from = (page - 1) * pageSize
    const to = from + pageSize
    const items = filtered.slice(from, to)

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    }
  }

  try {
    // Try to fetch from Supabase database
    let query = supabase!.from("inventory_items").select("*", { count: "exact" })

    // Apply filters to query
    if (filters?.category && filters.category !== "all") {
      query = query.eq("category", filters.category)
    }
    if (filters?.storeName && filters.storeName !== "all") {
      query = query.eq("store_name", filters.storeName)
    }
    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }
    if (filters?.businessUnit) {
      query = query.eq("business_unit", filters.businessUnit)
    }
    if (filters?.searchQuery) {
      query = query.or(
        `product_name.ilike.%${filters.searchQuery}%,product_id.ilike.%${filters.searchQuery}%,supplier.ilike.%${filters.searchQuery}%`
      )
    }

    // Apply sorting
    if (filters?.sortBy) {
      let column: string = filters.sortBy
      if (filters.sortBy === "productName") column = "product_name"
      else if (filters.sortBy === "brand") column = "brand"
      else if (filters.sortBy === "currentStock") column = "current_stock"
      query = query.order(column, { ascending: filters.sortOrder === "asc" })
    }

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.warn("Database query error, falling back to mock data:", error.message)
      throw error
    }

    const items = (data || []).map(convertDBItemToInventoryItem)
    const total = count || 0
    const totalPages = Math.ceil(total / pageSize)

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    }
  } catch (error) {
    console.warn("Failed to fetch from database, falling back to mock data:", error)
  }

  // Fallback to mock data
  const filtered = applyFilters(mockInventoryItems, filters)
  const total = filtered.length
  const totalPages = Math.ceil(total / pageSize)
  const from = (page - 1) * pageSize
  const to = from + pageSize
  const items = filtered.slice(from, to)

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * Fetch store performance metrics
 *
 * @returns Promise<StorePerformanceResponse>
 */
export async function fetchStorePerformance(): Promise<StorePerformanceResponse> {
  try {
    if (isSupabaseAvailable()) {
      // Try to fetch aggregated store performance from database
      // This would require a custom SQL function or aggregation query
      // For now, we'll use mock data even when Supabase is available
      // until the database schema and aggregation functions are implemented
      console.info("Using mock store performance data (database aggregation not yet implemented)")
    }
  } catch (error) {
    console.warn("Failed to fetch store performance from database:", error)
  }

  // Generate store performance dynamically from inventory items
  // This ensures data consistency between store overview and detail views
  const stores = generateStorePerformanceFromInventory()

  return {
    stores,
    total: stores.length,
  }
}

/**
 * Fetch stock alerts (critical and low stock items)
 *
 * @param severity - Optional filter by severity ("critical" | "warning" | "all")
 * @returns Promise<StockAlertsResponse>
 */
export async function fetchStockAlerts(
  severity?: "critical" | "warning" | "all"
): Promise<StockAlertsResponse> {
  // Check if Supabase is configured before attempting query
  if (!isSupabaseAvailable()) {
    console.info("Using mock stock alerts (Supabase not configured)")
    // Use mock data directly
    const alerts = generateStockAlerts()
    let filtered = alerts

    if (severity && severity !== "all") {
      filtered = alerts.filter((alert) => alert.severity === severity)
    }

    return {
      alerts: filtered,
      total: filtered.length,
      criticalCount: alerts.filter((a) => a.severity === "critical").length,
      warningCount: alerts.filter((a) => a.severity === "warning").length,
    }
  }

  try {
    // Fetch items with low or critical status from database
    let query = supabase!
      .from("inventory_items")
      .select("*")
      .in("status", ["low", "critical"])

    const { data, error } = await query

    if (error) {
      console.warn("Database query error, falling back to mock data:", error.message)
      throw error
    }

    const items = (data || []).map(convertDBItemToInventoryItem)

    // Convert to alerts
    const alerts: StockAlert[] = items.map((item) => ({
      id: `ALERT-${item.id}`,
      productId: item.productId,
      productName: item.productName,
      storeName: item.storeName,
      currentStock: item.currentStock,
      reorderPoint: item.reorderPoint,
      status: item.status,
      severity: item.status === "critical" ? "critical" : "warning",
      message:
        item.status === "critical"
          ? `Critical: Only ${item.currentStock} units remaining. Immediate reorder required.`
          : `Low stock: ${item.currentStock} units remaining. Consider reordering soon.`,
      createdAt: new Date().toISOString(),
    }))

    // Filter by severity if specified
    let filtered = alerts
    if (severity && severity !== "all") {
      filtered = alerts.filter((alert) => alert.severity === severity)
    }

    return {
      alerts: filtered,
      total: filtered.length,
      criticalCount: alerts.filter((a) => a.severity === "critical").length,
      warningCount: alerts.filter((a) => a.severity === "warning").length,
    }
  } catch (error) {
    console.warn("Failed to fetch stock alerts from database, falling back to mock data:", error)
  }

  // Fallback to mock data
  const alerts = generateStockAlerts()
  let filtered = alerts

  if (severity && severity !== "all") {
    filtered = alerts.filter((alert) => alert.severity === severity)
  }

  return {
    alerts: filtered,
    total: filtered.length,
    criticalCount: alerts.filter((a) => a.severity === "critical").length,
    warningCount: alerts.filter((a) => a.severity === "warning").length,
  }
}

/**
 * Get inventory summary statistics
 *
 * This function calculates summary KPIs across ALL inventory items, not just
 * a single page. For mock data, we use mockInventoryItems directly for efficiency.
 * For Supabase, we fetch all items by setting a large pageSize.
 */
export async function fetchInventorySummary() {
  try {
    // For efficiency, use mockInventoryItems directly when Supabase is not available
    // This ensures we count ALL items, not just the first page (default pageSize: 25)
    if (!isSupabaseAvailable()) {
      const items = mockInventoryItems

      return {
        totalProducts: items.length,
        healthyItems: items.filter((item) => item.status === "healthy").length,
        lowStockItems: items.filter((item) => item.status === "low").length,
        criticalStockItems: items.filter((item) => item.status === "critical").length,
        totalInventoryValue: items.reduce(
          (sum, item) => sum + item.currentStock * item.unitPrice,
          0
        ),
      }
    }

    // For Supabase, fetch all items by setting a large pageSize
    const data = await fetchInventoryData({ pageSize: 1000 })
    const items = data.items

    // Handle empty data gracefully
    if (!items || items.length === 0) {
      return {
        totalProducts: 0,
        healthyItems: 0,
        lowStockItems: 0,
        criticalStockItems: 0,
        totalInventoryValue: 0,
      }
    }

    return {
      totalProducts: items.length,
      healthyItems: items.filter((item) => item.status === "healthy").length,
      lowStockItems: items.filter((item) => item.status === "low").length,
      criticalStockItems: items.filter((item) => item.status === "critical").length,
      totalInventoryValue: items.reduce(
        (sum, item) => sum + item.currentStock * item.unitPrice,
        0
      ),
    }
  } catch (error) {
    console.warn("Failed to fetch inventory summary:", error)
    // Return sensible defaults if summary calculation fails
    return {
      totalProducts: 0,
      healthyItems: 0,
      lowStockItems: 0,
      criticalStockItems: 0,
      totalInventoryValue: 0,
    }
  }
}

/**
 * Fetch a single inventory item by ID
 *
 * @param id - Inventory item ID or product ID
 * @returns Promise<InventoryItem | null>
 */
export async function fetchInventoryItemById(id: string): Promise<InventoryItem | null> {
  // Check if Supabase is configured before attempting query
  if (!isSupabaseAvailable()) {
    console.info("Using mock inventory data (Supabase not configured)")
    const item = mockInventoryItems.find((i) => i.id === id || i.productId === id)
    return item || null
  }

  try {
    // Try to fetch from Supabase database
    const { data, error } = await supabase!
      .from("inventory_items")
      .select("*")
      .or(`id.eq.${id},product_id.eq.${id}`)
      .single()

    if (error) {
      // PGRST116 is "not found" error - this is expected, not a failure
      if (error.code === "PGRST116") {
        console.info(`Inventory item '${id}' not found in database, checking mock data`)
        const item = mockInventoryItems.find((i) => i.id === id || i.productId === id)
        return item || null
      }

      // Other errors should be logged as warnings and fall back to mock data
      console.warn("Database query error, falling back to mock data:", error.message)
      throw error
    }

    if (data) {
      return convertDBItemToInventoryItem(data)
    }

    // No data returned - fall back to mock
    console.info(`No data returned for '${id}', falling back to mock data`)
    const item = mockInventoryItems.find((i) => i.id === id || i.productId === id)
    return item || null
  } catch (error) {
    console.warn("Failed to fetch item from database, falling back to mock data:", error)
    // Fallback to mock data
    const item = mockInventoryItems.find((i) => i.id === id || i.productId === id)
    return item || null
  }
}

/**
 * Fetch stock history for a product (last 30 days)
 *
 * @param productId - Product ID
 * @returns Promise<StockHistoryPoint[]>
 */
export async function fetchStockHistory(productId: string): Promise<StockHistoryPoint[]> {
  try {
    if (isSupabaseAvailable()) {
      // TODO: Implement database query for stock history
      // This would require a stock_history table or transaction log
      // For now, fall through to mock data
      console.info("Stock history from database not yet implemented, using mock data")
    }
  } catch (error) {
    console.warn("Failed to fetch stock history from database:", error)
  }

  // Use mock data generator
  return generateMockStockHistory(productId)
}

/**
 * Fetch recent transactions for a product
 *
 * @param productId - Product ID
 * @param limit - Maximum number of transactions to return (default: 10)
 * @returns Promise<StockTransaction[]>
 */
export async function fetchRecentTransactions(
  productId: string,
  limit: number = 10
): Promise<StockTransaction[]> {
  try {
    if (isSupabaseAvailable()) {
      // TODO: Implement database query for transactions
      // This would require a stock_transactions table
      // For now, fall through to mock data
      console.info("Transaction history from database not yet implemented, using mock data")
    }
  } catch (error) {
    console.warn("Failed to fetch transactions from database:", error)
  }

  // Use mock data generator
  const allTransactions = generateMockTransactions(productId)
  return allTransactions.slice(0, limit)
}

/**
 * Get unique brands from inventory data
 * Used for brand filter dropdown
 *
 * @returns Promise<string[]> - Array of unique brand names
 */
export async function getUniqueBrands(): Promise<string[]> {
  try {
    if (isSupabaseAvailable()) {
      // TODO: Implement database query for unique brands
      // For now, fall through to mock data
      console.info("Brand list from database not yet implemented, using mock data")
    }
  } catch (error) {
    console.warn("Failed to fetch brands from database:", error)
  }

  // Extract unique brands from mock inventory items
  const brands = new Set<string>()
  mockInventoryItems.forEach((item) => {
    if (item.brand) {
      brands.add(item.brand)
    }
  })

  return Array.from(brands).sort()
}
