/**
 * Mock Inventory Data
 *
 * Provides realistic inventory data for development and testing.
 * Used when Supabase credentials are unavailable or for rapid prototyping.
 */

import type {
  InventoryItem,
  StorePerformance,
  StockAlert,
  TopsStore,
  ProductCategory,
  StockTransaction,
  StockHistoryPoint,
  TransactionType,
  ItemType,
  StockLocation,
  StockLocationBreakdown,
  StockStatus,
  Channel,
  SupplyType,
  StockConfigStatus,
} from "@/types/inventory"

/**
 * Available brands for inventory items
 * Common Thai/international food and household brands
 */
export const BRANDS = [
  "CP",
  "Betagro",
  "Thai Union",
  "Nestle",
  "S&P",
  "Dutch Mill",
  "Tipco",
  "Oishi",
  "Lay's",
  "Meiji",
  "Farm House",
  "HomeMart",
] as const

/**
 * Get a deterministic brand based on product characteristics
 */
function getBrandForProduct(productId: string, category: ProductCategory): string {
  const categoryBrands: Record<ProductCategory, string[]> = {
    Produce: ["CP", "Thai Union", "Farm House"],
    Dairy: ["Dutch Mill", "Meiji", "Nestle"],
    Bakery: ["S&P", "Farm House", "Nestle"],
    Meat: ["CP", "Betagro", "Thai Union"],
    Seafood: ["Thai Union", "CP", "Betagro"],
    Pantry: ["Nestle", "Tipco", "Oishi"],
    Frozen: ["CP", "Betagro", "S&P"],
    Beverages: ["Tipco", "Oishi", "Dutch Mill"],
    Snacks: ["Lay's", "Oishi", "Nestle"],
    Household: ["HomeMart", "Nestle", "S&P"],
  }
  const brands = categoryBrands[category] || BRANDS
  const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return brands[seed % brands.length]
}

/**
 * Get deterministic channels based on product characteristics
 */
function getChannelsForProduct(productId: string, category: ProductCategory): Channel[] {
  const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const allChannels: Channel[] = ["store", "website", "Grab", "LINE MAN", "Gokoo"]

  // Always include store
  const channels: Channel[] = ["store"]

  // Add website for most products
  if (seed % 3 !== 0) {
    channels.push("website")
  }

  // Fresh products (Produce, Dairy, Bakery, Meat, Seafood) available on delivery apps
  const freshCategories: ProductCategory[] = ["Produce", "Dairy", "Bakery", "Meat", "Seafood"]
  if (freshCategories.includes(category)) {
    if (seed % 2 === 0) channels.push("Grab")
    if (seed % 3 === 0) channels.push("LINE MAN")
    if (seed % 5 === 0) channels.push("Gokoo")
  } else {
    // Non-fresh items have different channel distribution
    if (seed % 4 === 0) channels.push("Grab")
    if (seed % 5 === 0) channels.push("LINE MAN")
  }

  return channels
}

/**
 * Get deterministic supply type based on product
 */
function getSupplyTypeForProduct(productId: string, status: string): SupplyType {
  // Products with critical stock often require pre-order
  if (status === "critical") {
    return "Pre-Order"
  }
  // Most products are on-hand available
  const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return seed % 10 === 0 ? "Pre-Order" : "On Hand Available"
}

/**
 * Get deterministic stock config status
 */
function getStockConfigStatus(productId: string, hasWarehouseLocations: boolean): StockConfigStatus {
  if (!hasWarehouseLocations) {
    return "unconfigured"
  }
  const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  // 80% valid, 15% invalid, 5% unconfigured
  if (seed % 20 === 0) return "unconfigured"
  if (seed % 7 === 0) return "invalid"
  return "valid"
}

/**
 * Tops store locations (from CLAUDE.md requirements)
 */
export const TOPS_STORES: TopsStore[] = [
  "Tops Central Plaza ลาดพร้าว",
  "Tops Central World",
  "Tops สุขุมวิท 39",
  "Tops ทองหล่อ",
  "Tops สีลม คอมเพล็กซ์",
  "Tops เอกมัย",
  "Tops พร้อมพงษ์",
  "Tops จตุจักร",
]

/**
 * Warehouse codes used for location tracking
 * Representing different distribution centers, regional hubs, and store warehouses
 */
export const WAREHOUSE_CODES = [
  // Central Distribution Centers
  "CDC-BKK01",  // Bangkok Central DC
  "CDC-BKK02",  // Bangkok Central DC 2
  "CDC-NTH01",  // Northern Distribution Center
  "CDC-STH01",  // Southern Distribution Center

  // Regional Warehouses
  "RWH-LP",     // Lat Phrao Regional Warehouse
  "RWH-CW",     // Central World Regional Warehouse
  "RWH-SK",     // Sukhumvit Regional Warehouse
  "RWH-SL",     // Silom Regional Warehouse

  // Store Warehouses (Tops Locations)
  "STW-001",    // Store Warehouse 001
  "STW-002",    // Store Warehouse 002
  "STW-003",    // Store Warehouse 003
  "STW-005",    // Store Warehouse 005
  "STW-008",    // Store Warehouse 008
  "STW-010",    // Store Warehouse 010

  // Fresh Food Distribution Centers
  "FDC-BKK",    // Fresh Food DC Bangkok
  "FDC-PRV",    // Fresh Food DC Provincial

  // Legacy Codes (for compatibility)
  "CMG",        // Central Mega
  "TPS-1005",   // Tops 1005
  "TPS-1055",   // Tops 1055
  "TPS-2001",   // Tops 2001
  "TPS-2002",   // Tops 2002
]

/**
 * Generate mock warehouse locations for a product
 *
 * This function ensures data consistency between product-level stock values and
 * location-level breakdowns. The stock is distributed proportionally across locations:
 * - sum(location.stockAvailable) = product.availableStock
 * - sum(location.stockInProcess) = product.reservedStock
 * - sum(location.stockSafetyStock) = product.safetyStock
 *
 * @param productId - Product identifier
 * @param availableStock - Product's total available stock (optional, for backwards compatibility)
 * @param reservedStock - Product's total reserved stock (optional, for backwards compatibility)
 * @param safetyStock - Product's total safety stock (optional, for backwards compatibility)
 * @returns Array of stock locations with realistic data
 */
export function generateMockWarehouseLocations(
  productId: string,
  availableStock?: number,
  reservedStock?: number,
  safetyStock?: number
): StockLocation[] {
  // Use product ID to seed deterministic but varied results
  const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const locationCount = (seed % 3) + 1 // 1-3 locations per product

  const locations: StockLocation[] = []

  // Calculate distribution ratios for each location
  // Using a weighted distribution based on seed to make it deterministic but varied
  const weights: number[] = []
  let totalWeight = 0
  for (let i = 0; i < locationCount; i++) {
    const weight = 1 + ((seed + i * 7) % 5) // Weight between 1-5
    weights.push(weight)
    totalWeight += weight
  }

  // Track remaining stock to distribute (to handle rounding)
  let remainingAvailable = availableStock ?? 0
  let remainingReserved = reservedStock ?? 0
  let remainingSafety = safetyStock ?? 0

  for (let i = 0; i < locationCount; i++) {
    const warehouseCode = WAREHOUSE_CODES[(seed + i) % WAREHOUSE_CODES.length]

    // Generate realistic warehouse location codes in format: A##-R##-S##
    // A = Aisle (A01-A99), R = Rack (R01-R20), S = Shelf (S01-S10)
    const aisle = String((seed + i * 7) % 99 + 1).padStart(2, '0')
    const rack = String((seed + i * 3) % 20 + 1).padStart(2, '0')
    const shelf = String((seed + i * 2) % 10 + 1).padStart(2, '0')
    const locationCode = `A${aisle}-R${rack}-S${shelf}`

    // First location is always default
    const isDefaultLocation = i === 0

    // Calculate stock for this location based on weight ratio
    let stockAvailable: number
    let stockInProcess: number
    let stockSafetyStock: number

    if (availableStock !== undefined && reservedStock !== undefined) {
      // Distribute product stock proportionally across locations
      const isLastLocation = i === locationCount - 1

      if (isLastLocation) {
        // Last location gets remaining stock (handles rounding)
        stockAvailable = remainingAvailable
        stockInProcess = remainingReserved
        stockSafetyStock = remainingSafety
      } else {
        // Calculate proportional stock based on weight
        const ratio = weights[i] / totalWeight
        stockAvailable = Math.floor(availableStock * ratio)
        stockInProcess = Math.floor(reservedStock * ratio)
        stockSafetyStock = Math.floor((safetyStock ?? 0) * ratio)

        remainingAvailable -= stockAvailable
        remainingReserved -= stockInProcess
        remainingSafety -= stockSafetyStock
      }
    } else {
      // Fallback to original random generation for backwards compatibility
      const baseStock = 50 + (seed % 150) // 50-200
      stockAvailable = Math.max(0, baseStock + (i * 20) - (seed % 30))
      stockInProcess = (seed % 20) + 10 // 10-30 (used as Reserved)
      stockSafetyStock = 10 + (seed % 30) // 10-40 (Safety threshold for this location)
    }

    // Generate supplementary tracking data (not part of core stock relationship)
    const stockSold = seed % 50 // 0-50
    const stockOnHold = (seed % 15) + 5 // 5-20
    const stockPending = seed % 40 // 0-40
    const stockUnusable = seed % 10 // 0-10

    // Determine location status: approximately 85% Active, 15% Inactive
    const locationStatus: 'Active' | 'Inactive' = (seed + i) % 7 === 0 ? 'Inactive' : 'Active'

    locations.push({
      warehouseCode,
      locationCode,
      isDefaultLocation,
      stockAvailable,
      stockInProcess,
      stockSold,
      stockOnHold,
      stockPending,
      stockUnusable,
      stockSafetyStock,
      locationStatus,
    })
  }

  return locations
}

/**
 * Generate mock stock breakdown for a specific location
 * @param productId - Product identifier
 * @param warehouseCode - Warehouse code
 * @returns Stock breakdown by status
 */
export function generateMockStockBreakdown(productId: string, warehouseCode: string): StockLocationBreakdown {
  const seed = (productId + warehouseCode).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

  const stockStatus: Record<StockStatus, number> = {
    stock: 100 + (seed % 100), // 100-200
    in_process: 10 + (seed % 40), // 10-50
    sold: seed % 100, // 0-100
    on_hold: seed % 30, // 0-30
    pending: seed % 40 // 0-40
  }

  // Generate realistic location code matching the format in generateMockWarehouseLocations
  const aisle = String((seed * 7) % 99 + 1).padStart(2, '0')
  const rack = String((seed * 3) % 20 + 1).padStart(2, '0')
  const shelf = String((seed * 2) % 10 + 1).padStart(2, '0')
  const locationCode = `A${aisle}-R${rack}-S${shelf}`

  return {
    warehouseCode,
    locationCode,
    stockStatus
  }
}

/**
 * Helper function to ensure all mock items have warehouse locations and new fields
 *
 * Passes product-level availableStock, reservedStock, and safetyStock to the location generator
 * to ensure location sums match product totals for data consistency.
 * Also adds brand, channels, supplyType, and stockConfigStatus fields.
 */
function ensureWarehouseLocationsAndNewFields(items: InventoryItem[]): InventoryItem[] {
  return items.map(item => {
    const warehouseLocations = item.warehouseLocations || generateMockWarehouseLocations(
      item.productId,
      item.availableStock,
      item.reservedStock,
      item.safetyStock
    )
    return {
      ...item,
      warehouseLocations,
      brand: item.brand || getBrandForProduct(item.productId, item.category),
      channels: item.channels || getChannelsForProduct(item.productId, item.category),
      supplyType: item.supplyType || getSupplyTypeForProduct(item.productId, item.status),
      stockConfigStatus: item.stockConfigStatus || getStockConfigStatus(item.productId, warehouseLocations.length > 0),
    }
  })
}

/**
 * Mock inventory items (20+ items across different categories and stores)
 */
const mockInventoryItemsBase: InventoryItem[] = [
  // Produce
  {
    id: "INV-001",
    productId: "PROD-001",
    productName: "Fresh Vegetables Mix",
    category: "Produce",
    storeName: "Tops Central World",
    currentStock: 245,
    availableStock: 220,
    reservedStock: 25, // 245 - 220
    safetyStock: 75, // Math.round(500 * 0.15)
    minStockLevel: 100,
    maxStockLevel: 500,
    unitPrice: 89.50,
    lastRestocked: "2025-11-22T14:30:00Z",
    status: "healthy",
    supplier: "Fresh Farm Co.",
    reorderPoint: 150,
    demandForecast: 320,
    imageUrl: "https://placehold.co/400x400/228B22/white/png?text=Fresh+Vegetables",
    barcode: "8850123456789",
    itemType: "weight",
    warehouseLocations: generateMockWarehouseLocations("PROD-001", 220, 25, 75),
  },
  {
    id: "INV-002",
    productId: "PROD-002",
    productName: "Organic Apples",
    category: "Produce",
    storeName: "Tops สุขุมวิท 39",
    currentStock: 189,
    availableStock: 165,
    reservedStock: 24, // 189 - 165
    safetyStock: 45, // Math.round(300 * 0.15)
    minStockLevel: 80,
    maxStockLevel: 300,
    unitPrice: 125.00,
    lastRestocked: "2025-11-23T08:00:00Z",
    status: "healthy",
    supplier: "Fresh Farm Co.",
    reorderPoint: 120,
    demandForecast: 200,
    imageUrl: "https://placehold.co/400x400/32CD32/white/png?text=Organic+Apples",
    barcode: "8850123456790",
    itemType: "weight",
  },
  {
    id: "INV-003",
    productId: "PROD-003",
    productName: "Fresh Tomatoes",
    category: "Produce",
    storeName: "Tops ทองหล่อ",
    currentStock: 33,
    availableStock: 18,
    reservedStock: 15, // 33 - 18
    safetyStock: 35, // Math.round(200 * 0.175)
    minStockLevel: 50,
    maxStockLevel: 200,
    unitPrice: 45.00,
    lastRestocked: "2025-11-21T10:15:00Z",
    status: "low",
    supplier: "Fresh Farm Co.",
    reorderPoint: 80,
    demandForecast: 150,
    imageUrl: "https://placehold.co/400x400/DC143C/white/png?text=Fresh+Tomatoes",
    barcode: "8850123456791",
    itemType: "weight",
  },

  // Dairy
  {
    id: "INV-004",
    productId: "PROD-004",
    productName: "Organic Milk 1L",
    category: "Dairy",
    storeName: "Tops สีลม คอมเพล็กซ์",
    currentStock: 40,
    availableStock: 22,
    reservedStock: 18, // 40 - 22
    safetyStock: 35, // Math.round(200 * 0.175)
    minStockLevel: 50,
    maxStockLevel: 200,
    unitPrice: 65.00,
    lastRestocked: "2025-11-21T09:15:00Z",
    status: "low",
    supplier: "Dairy Farms Ltd",
    reorderPoint: 80,
    demandForecast: 150,
    imageUrl: "https://placehold.co/400x400/4169E1/white/png?text=Organic+Milk",
    barcode: "8850123456792",
    itemType: "normal",
  },
  {
    id: "INV-005",
    productId: "PROD-005",
    productName: "Greek Yogurt 500g",
    category: "Dairy",
    storeName: "Tops เอกมัย",
    currentStock: 145,
    availableStock: 130,
    reservedStock: 15, // 145 - 130
    safetyStock: 38, // Math.round(250 * 0.15)
    minStockLevel: 60,
    maxStockLevel: 250,
    unitPrice: 89.00,
    lastRestocked: "2025-11-22T11:20:00Z",
    status: "healthy",
    supplier: "Dairy Farms Ltd",
    reorderPoint: 90,
    demandForecast: 180,
    imageUrl: "https://placehold.co/400x400/87CEEB/white/png?text=Greek+Yogurt",
    barcode: "8850123456793",
    itemType: "normal",
  },
  {
    id: "INV-006",
    productId: "PROD-006",
    productName: "Cheese Slices 200g",
    category: "Dairy",
    storeName: "Tops พร้อมพงษ์",
    currentStock: 234,
    availableStock: 210,
    reservedStock: 24, // 234 - 210
    safetyStock: 60, // Math.round(400 * 0.15)
    minStockLevel: 100,
    maxStockLevel: 400,
    unitPrice: 125.00,
    lastRestocked: "2025-11-23T07:30:00Z",
    status: "healthy",
    supplier: "Dairy Farms Ltd",
    reorderPoint: 150,
    demandForecast: 280,
    imageUrl: "https://placehold.co/400x400/FFD700/333333/png?text=Cheese+Slices",
    barcode: "8850123456794",
    itemType: "normal",
  },

  // Bakery
  {
    id: "INV-007",
    productId: "PROD-007",
    productName: "Whole Wheat Bread",
    category: "Bakery",
    storeName: "Tops จตุจักร",
    currentStock: 2,
    availableStock: 0,
    reservedStock: 2, // 2 - 0
    safetyStock: 15, // Math.round(100 * 0.15)
    minStockLevel: 30,
    maxStockLevel: 100,
    unitPrice: 55.00,
    lastRestocked: "2025-11-23T06:00:00Z",
    status: "critical",
    supplier: "Artisan Bakery",
    reorderPoint: 40,
    demandForecast: 85,
    imageUrl: "https://placehold.co/400x400/8B4513/white/png?text=Wheat+Bread",
    barcode: "8850123456795",
    itemType: "normal",
  },
  {
    id: "INV-008",
    productId: "PROD-008",
    productName: "Croissants Pack of 6",
    category: "Bakery",
    storeName: "Tops Central Plaza ลาดพร้าว",
    currentStock: 89,
    availableStock: 78,
    reservedStock: 11, // 89 - 78
    safetyStock: 23, // Math.round(150 * 0.15)
    minStockLevel: 40,
    maxStockLevel: 150,
    unitPrice: 95.00,
    lastRestocked: "2025-11-22T05:45:00Z",
    status: "healthy",
    supplier: "Artisan Bakery",
    reorderPoint: 60,
    demandForecast: 120,
    imageUrl: "https://placehold.co/400x400/DAA520/white/png?text=Croissants",
    barcode: "8850123456796",
    itemType: "normal",
  },

  // Meat
  {
    id: "INV-009",
    productId: "PROD-009",
    productName: "Chicken Breast 500g",
    category: "Meat",
    storeName: "Tops Central World",
    currentStock: 156,
    availableStock: 140,
    reservedStock: 16, // 156 - 140
    safetyStock: 45, // Math.round(300 * 0.15)
    minStockLevel: 80,
    maxStockLevel: 300,
    unitPrice: 125.00,
    lastRestocked: "2025-11-22T16:45:00Z",
    status: "healthy",
    supplier: "Premium Meats",
    reorderPoint: 100,
    demandForecast: 200,
    imageUrl: "https://placehold.co/400x400/FF6347/white/png?text=Chicken+Breast",
    barcode: "8850123456797",
    itemType: "weight",
  },
  {
    id: "INV-010",
    productId: "PROD-010",
    productName: "Pork Tenderloin 500g",
    category: "Meat",
    storeName: "Tops สุขุมวิท 39",
    currentStock: 92,
    availableStock: 80,
    reservedStock: 12, // 92 - 80
    safetyStock: 30, // Math.round(200 * 0.15)
    minStockLevel: 60,
    maxStockLevel: 200,
    unitPrice: 165.00,
    lastRestocked: "2025-11-21T15:30:00Z",
    status: "healthy",
    supplier: "Premium Meats",
    reorderPoint: 80,
    demandForecast: 140,
    imageUrl: "https://placehold.co/400x400/CD5C5C/white/png?text=Pork+Tenderloin",
    barcode: "8850123456798",
    itemType: "weight",
  },
  {
    id: "INV-011",
    productId: "PROD-011",
    productName: "Beef Sirloin 500g",
    category: "Meat",
    storeName: "Tops ทองหล่อ",
    currentStock: 3,
    availableStock: 0,
    reservedStock: 3, // 3 - 0
    safetyStock: 23, // Math.round(150 * 0.15)
    minStockLevel: 40,
    maxStockLevel: 150,
    unitPrice: 295.00,
    lastRestocked: "2025-11-20T14:00:00Z",
    status: "critical",
    supplier: "Premium Meats",
    reorderPoint: 50,
    demandForecast: 100,
    imageUrl: "https://placehold.co/400x400/8B0000/white/png?text=Beef+Sirloin",
    barcode: "8850123456799",
    itemType: "weight",
  },

  // Seafood
  {
    id: "INV-012",
    productId: "PROD-012",
    productName: "Fresh Salmon Fillet 500g",
    category: "Seafood",
    storeName: "Tops สีลม คอมเพล็กซ์",
    currentStock: 28,
    availableStock: 15,
    reservedStock: 13, // 28 - 15
    safetyStock: 25, // Math.round(150 * 0.167)
    minStockLevel: 50,
    maxStockLevel: 150,
    unitPrice: 385.00,
    lastRestocked: "2025-11-22T08:00:00Z",
    status: "low",
    supplier: "Ocean Fresh",
    reorderPoint: 60,
    demandForecast: 90,
    imageUrl: "https://placehold.co/400x400/FF8C00/white/png?text=Salmon+Fillet",
    barcode: "8850123456800",
    itemType: "weight",
  },
  {
    id: "INV-013",
    productId: "PROD-013",
    productName: "Prawns 500g",
    category: "Seafood",
    storeName: "Tops เอกมัย",
    currentStock: 124,
    availableStock: 110,
    reservedStock: 14, // 124 - 110
    safetyStock: 30, // Math.round(200 * 0.15)
    minStockLevel: 60,
    maxStockLevel: 200,
    unitPrice: 285.00,
    lastRestocked: "2025-11-23T09:15:00Z",
    status: "healthy",
    supplier: "Ocean Fresh",
    reorderPoint: 80,
    demandForecast: 150,
    imageUrl: "https://placehold.co/400x400/1E90FF/white/png?text=Prawns",
    barcode: "8850123456801",
    itemType: "weight",
  },

  // Pantry
  {
    id: "INV-014",
    productId: "PROD-014",
    productName: "Pasta Collection",
    category: "Pantry",
    storeName: "Tops พร้อมพงษ์",
    currentStock: 289,
    availableStock: 260,
    reservedStock: 29, // 289 - 260
    safetyStock: 60, // Math.round(400 * 0.15)
    minStockLevel: 100,
    maxStockLevel: 400,
    unitPrice: 89.00,
    lastRestocked: "2025-11-20T11:20:00Z",
    status: "healthy",
    supplier: "Italian Foods Co.",
    reorderPoint: 150,
    demandForecast: 250,
    imageUrl: "https://placehold.co/400x400/D2691E/white/png?text=Pasta",
    barcode: "8850123456802",
    itemType: "normal",
  },
  {
    id: "INV-015",
    productId: "PROD-015",
    productName: "Premium Rice 5kg",
    category: "Pantry",
    storeName: "Tops จตุจักร",
    currentStock: 178,
    availableStock: 155,
    reservedStock: 23, // 178 - 155
    safetyStock: 45, // Math.round(300 * 0.15)
    minStockLevel: 80,
    maxStockLevel: 300,
    unitPrice: 245.00,
    lastRestocked: "2025-11-21T13:00:00Z",
    status: "healthy",
    supplier: "Thai Rice Co.",
    reorderPoint: 120,
    demandForecast: 200,
    imageUrl: "https://placehold.co/400x400/F5DEB3/333333/png?text=Premium+Rice",
    barcode: "8850123456803",
    itemType: "normal",
  },

  // Frozen
  {
    id: "INV-016",
    productId: "PROD-016",
    productName: "Frozen Pizza",
    category: "Frozen",
    storeName: "Tops Central Plaza ลาดพร้าว",
    currentStock: 95,
    availableStock: 82,
    reservedStock: 13, // 95 - 82
    safetyStock: 30, // Math.round(200 * 0.15)
    minStockLevel: 50,
    maxStockLevel: 200,
    unitPrice: 149.00,
    lastRestocked: "2025-11-22T10:00:00Z",
    status: "healthy",
    supplier: "Frozen Foods Inc",
    reorderPoint: 70,
    demandForecast: 130,
    imageUrl: "https://placehold.co/400x400/FF4500/white/png?text=Frozen+Pizza",
    barcode: "8850123456804",
    itemType: "normal",
  },
  {
    id: "INV-017",
    productId: "PROD-017",
    productName: "Ice Cream Variety Pack",
    category: "Frozen",
    storeName: "Tops Central World",
    currentStock: 24,
    availableStock: 12,
    reservedStock: 12, // 24 - 12
    safetyStock: 25, // Math.round(150 * 0.167)
    minStockLevel: 40,
    maxStockLevel: 150,
    unitPrice: 195.00,
    lastRestocked: "2025-11-21T12:30:00Z",
    status: "low",
    supplier: "Frozen Foods Inc",
    reorderPoint: 60,
    demandForecast: 110,
    imageUrl: "https://placehold.co/400x400/FFB6C1/333333/png?text=Ice+Cream",
    barcode: "8850123456805",
    itemType: "normal",
  },

  // Beverages
  {
    id: "INV-018",
    productId: "PROD-018",
    productName: "Orange Juice 1L",
    category: "Beverages",
    storeName: "Tops สุขุมวิท 39",
    currentStock: 167,
    availableStock: 150,
    reservedStock: 17, // 167 - 150
    safetyStock: 45, // Math.round(300 * 0.15)
    minStockLevel: 80,
    maxStockLevel: 300,
    unitPrice: 75.00,
    lastRestocked: "2025-11-23T07:45:00Z",
    status: "healthy",
    supplier: "Beverage World",
    reorderPoint: 100,
    demandForecast: 220,
    imageUrl: "https://placehold.co/400x400/FFA500/white/png?text=Orange+Juice",
    barcode: "8850123456806",
    itemType: "normal",
  },
  {
    id: "INV-019",
    productId: "PROD-019",
    productName: "Mineral Water 24 Pack",
    category: "Beverages",
    storeName: "Tops ทองหล่อ",
    currentStock: 312,
    availableStock: 280,
    reservedStock: 32, // 312 - 280
    safetyStock: 75, // Math.round(500 * 0.15)
    minStockLevel: 150,
    maxStockLevel: 500,
    unitPrice: 95.00,
    lastRestocked: "2025-11-22T15:00:00Z",
    status: "healthy",
    supplier: "Beverage World",
    reorderPoint: 200,
    demandForecast: 380,
    imageUrl: "https://placehold.co/400x400/00BFFF/white/png?text=Mineral+Water",
    barcode: "8850123456807",
    itemType: "normal",
  },

  // Snacks
  {
    id: "INV-020",
    productId: "PROD-020",
    productName: "Potato Chips Variety",
    category: "Snacks",
    storeName: "Tops สีลม คอมเพล็กซ์",
    currentStock: 134,
    availableStock: 118,
    reservedStock: 16, // 134 - 118
    safetyStock: 38, // Math.round(250 * 0.15)
    minStockLevel: 60,
    maxStockLevel: 250,
    unitPrice: 65.00,
    lastRestocked: "2025-11-21T16:20:00Z",
    status: "healthy",
    supplier: "Snack Masters",
    reorderPoint: 90,
    demandForecast: 180,
    imageUrl: "https://placehold.co/400x400/FFD700/333333/png?text=Potato+Chips",
    barcode: "8850123456808",
    itemType: "normal",
  },
  {
    id: "INV-021",
    productId: "PROD-021",
    productName: "Mixed Nuts 500g",
    category: "Snacks",
    storeName: "Tops เอกมัย",
    currentStock: 1,
    availableStock: 0,
    reservedStock: 1, // 1 - 0
    safetyStock: 23, // Math.round(150 * 0.15)
    minStockLevel: 40,
    maxStockLevel: 150,
    unitPrice: 185.00,
    lastRestocked: "2025-11-20T09:30:00Z",
    status: "critical",
    supplier: "Snack Masters",
    reorderPoint: 50,
    demandForecast: 95,
    imageUrl: "https://placehold.co/400x400/A0522D/white/png?text=Mixed+Nuts",
    barcode: "8850123456809",
    itemType: "normal",
  },

  // Household
  {
    id: "INV-022",
    productId: "PROD-022",
    productName: "Laundry Detergent 2L",
    category: "Household",
    storeName: "Tops พร้อมพงษ์",
    currentStock: 198,
    availableStock: 175,
    reservedStock: 23, // 198 - 175
    safetyStock: 45, // Math.round(300 * 0.15)
    minStockLevel: 80,
    maxStockLevel: 300,
    unitPrice: 145.00,
    lastRestocked: "2025-11-22T13:15:00Z",
    status: "healthy",
    supplier: "HomeClean Co.",
    reorderPoint: 120,
    demandForecast: 210,
    imageUrl: "https://placehold.co/400x400/4682B4/white/png?text=Detergent",
    barcode: "8850123456810",
    itemType: "normal",
  },
  {
    id: "INV-023",
    productId: "PROD-023",
    productName: "Dish Soap 500ml",
    category: "Household",
    storeName: "Tops จตุจักร",
    currentStock: 87,
    availableStock: 75,
    reservedStock: 12, // 87 - 75
    safetyStock: 30, // Math.round(200 * 0.15)
    minStockLevel: 50,
    maxStockLevel: 200,
    unitPrice: 55.00,
    lastRestocked: "2025-11-21T11:00:00Z",
    status: "healthy",
    supplier: "HomeClean Co.",
    reorderPoint: 70,
    demandForecast: 140,
    imageUrl: "https://placehold.co/400x400/98FB98/333333/png?text=Dish+Soap",
    barcode: "8850123456811",
    itemType: "normal",
  },
  {
    id: "INV-024",
    productId: "PROD-024",
    productName: "Toilet Paper 12 Pack",
    category: "Household",
    storeName: "Tops Central Plaza ลาดพร้าว",
    currentStock: 44,
    availableStock: 30,
    reservedStock: 14, // 44 - 30
    safetyStock: 42, // Math.round(250 * 0.168)
    minStockLevel: 60,
    maxStockLevel: 250,
    unitPrice: 125.00,
    lastRestocked: "2025-11-20T14:45:00Z",
    status: "low",
    supplier: "HomeClean Co.",
    reorderPoint: 80,
    demandForecast: 160,
    imageUrl: "https://placehold.co/400x400/F0F8FF/333333/png?text=Toilet+Paper",
    barcode: "8850123456812",
    itemType: "normal",
  },
]

/**
 * Export mock inventory items with warehouse locations and new fields applied
 */
export const mockInventoryItems = ensureWarehouseLocationsAndNewFields(mockInventoryItemsBase)

/**
 * Generate store performance metrics dynamically from inventory items
 * This ensures data consistency between store overview and detail views
 * @returns Array of StorePerformance objects for all 8 Tops stores
 */
export function generateStorePerformanceFromInventory(): StorePerformance[] {
  // Group inventory items by store
  const itemsByStore = new Map<TopsStore, InventoryItem[]>()

  // Initialize all 8 stores with empty arrays
  TOPS_STORES.forEach(store => {
    itemsByStore.set(store, [])
  })

  // Group items by their store
  mockInventoryItems.forEach(item => {
    const storeItems = itemsByStore.get(item.storeName) || []
    storeItems.push(item)
    itemsByStore.set(item.storeName, storeItems)
  })

  // Calculate performance metrics for each store
  const storePerformance: StorePerformance[] = []

  TOPS_STORES.forEach(storeName => {
    const items = itemsByStore.get(storeName) || []

    // Calculate metrics
    const totalProducts = items.length
    const lowStockItems = items.filter(item => item.status === "low").length
    const criticalStockItems = items.filter(item => item.status === "critical").length
    const healthyItems = items.filter(item => item.status === "healthy").length

    // Calculate total value (sum of currentStock * unitPrice)
    const totalValue = items.reduce((sum, item) => {
      return sum + (item.currentStock * item.unitPrice)
    }, 0)

    // Calculate health score as percentage of healthy items
    // Health score = (healthy items / total items) * 100
    // For stores with 0 products, default to 0
    let healthScore = 0
    if (totalProducts > 0) {
      healthScore = parseFloat(((healthyItems / totalProducts) * 100).toFixed(1))
    }

    // Determine store status - make "Tops จตุจักร" Inactive for testing
    const storeStatus: 'Active' | 'Inactive' = storeName === "Tops จตุจักร" ? 'Inactive' : 'Active'

    storePerformance.push({
      storeName,
      totalProducts,
      lowStockItems,
      criticalStockItems,
      totalValue: Math.round(totalValue), // Round to nearest baht
      healthScore,
      storeStatus,
    })
  })

  return storePerformance
}

/**
 * Mock store performance data for all 8 Tops stores
 * Dynamically generated from mockInventoryItems to ensure data consistency
 */
export const mockStorePerformance: StorePerformance[] = generateStorePerformanceFromInventory()

/**
 * Generate stock alerts from inventory items
 */
export function generateStockAlerts(): StockAlert[] {
  const alerts: StockAlert[] = []

  mockInventoryItems.forEach((item) => {
    if (item.status === "critical" || item.status === "low") {
      alerts.push({
        id: `ALERT-${item.id}`,
        productId: item.productId,
        productName: item.productName,
        storeName: item.storeName,
        currentStock: item.currentStock,
        reorderPoint: item.reorderPoint,
        status: item.status,
        severity: item.status === "critical" ? "critical" : "warning",
        message: item.status === "critical"
          ? `Critical: Only ${item.currentStock} units remaining. Immediate reorder required.`
          : `Low stock: ${item.currentStock} units remaining. Consider reordering soon.`,
        createdAt: new Date().toISOString(),
      })
    }
  })

  return alerts
}

/**
 * Generate mock stock history data for a product (last 30 days)
 */
export function generateMockStockHistory(productId: string): StockHistoryPoint[] {
  const item = mockInventoryItems.find((i) => i.id === productId || i.productId === productId)
  if (!item) return []

  const history: StockHistoryPoint[] = []
  const daysToGenerate = 30
  const today = new Date()

  for (let i = daysToGenerate; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Generate realistic stock fluctuation
    let stockLevel = item.currentStock
    if (i > 0) {
      // Add some realistic variation
      const variance = Math.floor(Math.random() * 40) - 20 // -20 to +20
      stockLevel = Math.max(item.minStockLevel - 10, Math.min(item.maxStockLevel, item.currentStock + variance))
    }

    history.push({
      date: date.toISOString(),
      stock: stockLevel,
      minLevel: item.minStockLevel,
      reorderPoint: item.reorderPoint,
    })
  }

  return history
}

/**
 * Generate mock transaction history for a product
 * Generates transactions in chronological order (oldest first), calculates sequential balances,
 * then returns in reverse chronological order (most recent first) for display
 */
export function generateMockTransactions(productId: string): StockTransaction[] {
  const item = mockInventoryItems.find((i) => i.id === productId || i.productId === productId)
  if (!item) return []

  const transactions: StockTransaction[] = []
  const transactionCount = 10 + Math.floor(Math.random() * 10) // 10-20 transactions
  const today = new Date()

  const users = ["John Smith", "Sarah Johnson", "Mike Chen", "Lisa Wong", "David Kim"]

  // Generate timestamps in chronological order (oldest to newest)
  const timestamps: Date[] = []
  for (let i = 0; i < transactionCount; i++) {
    const daysAgo = 60 - Math.floor((60 / transactionCount) * i) // Spread over 60 days, oldest first
    const timestamp = new Date(today)
    timestamp.setDate(timestamp.getDate() - daysAgo)
    timestamp.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))
    timestamps.push(timestamp)
  }

  // Sort timestamps to ensure chronological order
  timestamps.sort((a, b) => a.getTime() - b.getTime())

  // Start with initial stock from first restocking
  const initialRestockQuantity = Math.floor(Math.random() * 100) + 100 // 100-200 units initial stock
  let runningBalance = initialRestockQuantity

  // Determine channel and referenceId helper
  const channels: ("Grab" | "Lineman" | "Gokoo")[] = ["Grab", "Lineman", "Gokoo"]
  const channelWeights = [0.6, 0.3, 0.1] // 60% Grab, 30% Lineman, 10% Gokoo
  const randomChannel = () => {
    const rand = Math.random()
    if (rand < channelWeights[0]) return channels[0]
    if (rand < channelWeights[0] + channelWeights[1]) return channels[1]
    return channels[2]
  }

  for (let i = 0; i < transactionCount; i++) {
    const timestamp = timestamps[i]
    const user = users[Math.floor(Math.random() * users.length)]

    // Pick a random warehouse location from the item's locations
    const location = item.warehouseLocations && item.warehouseLocations.length > 0
      ? item.warehouseLocations[Math.floor(Math.random() * item.warehouseLocations.length)]
      : undefined

    let type: TransactionType
    let quantity: number
    let balanceChange: number

    if (i === 0) {
      // First transaction is always stock_in (initial restocking)
      type = "stock_in"
      quantity = initialRestockQuantity
      balanceChange = quantity
      runningBalance = quantity // Set initial balance
    } else {
      // Determine transaction type based on current balance
      // If balance is low, more likely to get stock_in
      // If balance is high, more likely to get stock_out
      const balanceRatio = runningBalance / initialRestockQuantity
      let typeWeights: number[]

      if (balanceRatio < 0.3) {
        // Low stock: 60% stock_in, 20% adjustment, 15% return, 5% stock_out
        typeWeights = [0.6, 0.05, 0.2, 0.15]
      } else if (balanceRatio > 0.8) {
        // High stock: 10% stock_in, 70% stock_out, 10% adjustment, 10% return
        typeWeights = [0.1, 0.7, 0.1, 0.1]
      } else {
        // Normal: 25% stock_in, 45% stock_out, 15% adjustment, 15% return
        typeWeights = [0.25, 0.45, 0.15, 0.15]
      }

      const rand = Math.random()
      if (rand < typeWeights[0]) {
        type = "stock_in"
      } else if (rand < typeWeights[0] + typeWeights[1]) {
        type = "stock_out"
      } else if (rand < typeWeights[0] + typeWeights[1] + typeWeights[2]) {
        type = "adjustment"
      } else {
        type = "return"
      }

      // Determine quantity based on type
      switch (type) {
        case "stock_in":
          quantity = Math.floor(Math.random() * 100) + 50 // 50-150 units
          balanceChange = quantity
          break
        case "stock_out":
          // Ensure we don't go negative
          const maxOut = Math.min(runningBalance - 10, 60) // Keep at least 10 in stock
          quantity = Math.max(10, Math.floor(Math.random() * maxOut) + 10) // 10 to maxOut units
          balanceChange = -quantity
          break
        case "adjustment":
          // Can be positive or negative, but don't let balance go below 5
          const maxNegativeAdj = Math.min(runningBalance - 5, 10)
          quantity = Math.floor(Math.random() * 20) - Math.min(10, maxNegativeAdj)
          balanceChange = quantity
          quantity = Math.abs(quantity) // Store absolute value
          break
        case "return":
          quantity = Math.floor(Math.random() * 15) + 5 // 5-20 units
          balanceChange = quantity
          break
        default:
          quantity = 0
          balanceChange = 0
      }

      // Apply balance change
      runningBalance = Math.max(0, runningBalance + balanceChange)
    }

    const channel = (type === "stock_out" || type === "return") ? randomChannel() : undefined
    const referenceId = (type === "stock_out" || type === "return")
      ? `ORD-${Math.floor(Math.random() * 10000)}`
      : undefined

    transactions.push({
      id: `TXN-${item.productId}-${i.toString().padStart(3, '0')}`,
      productId: item.productId,
      productName: item.productName,
      type,
      quantity,
      balanceAfter: runningBalance,
      timestamp: timestamp.toISOString(),
      user,
      notes: generateTransactionNotes(type),
      referenceId,
      warehouseCode: location?.warehouseCode,
      locationCode: location?.locationCode,
      channel,
      itemType: item.itemType,
    })
  }

  // Return in reverse chronological order (most recent first) for display
  return transactions.reverse()
}

/**
 * Generate transaction notes based on type
 */
function generateTransactionNotes(type: TransactionType): string {
  const notes: Record<TransactionType, string[]> = {
    stock_in: [
      "Received from supplier",
      "Weekly restocking",
      "Emergency restock",
      "Scheduled delivery",
    ],
    stock_out: [
      "Order fulfillment",
      "Customer purchase",
      "Store transfer",
      "Promotional sale",
    ],
    adjustment: [
      "Inventory count adjustment",
      "System correction",
      "Physical count discrepancy",
      "Audit adjustment",
    ],
    return: [
      "Order cancellation",
      "Customer return",
      "Product expired",
      "Wrong item received",
    ],
  }

  const typeNotes = notes[type] || ["Transaction processed"]
  return typeNotes[Math.floor(Math.random() * typeNotes.length)]
}
