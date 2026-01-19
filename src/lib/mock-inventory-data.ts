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
  AllocateByOrderTransaction,
  AllocateByOrderStatus,
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
 * Available view configurations for inventory items
 */
export const VIEW_OPTIONS = [
  "ECOM-TH-CFR-LOCD-STD",
  "ECOM-TH-DSS-NW-ALL",
  "ECOM-TH-DSS-NW-STD",
  "ECOM-TH-DSS-LOCD-EXP",
  "ECOM-TH-SSP-NW-STD",
  "MKP-TH-SSP-NW-STD",
  "MKP-TH-CFR-LOCD-STD",
  "ECOM-TH-SSP-NW-ALL",
  "MKP-TH-CFR-MANUAL-SYNC",
  "CMG-ECOM-TH-STD",
  "CMG-MKP-SHOPEE-TH-NTW-STD",
  "CMG-MKP-LAZADA-TH-LOC-STD",
  "CMG-MKP-MIRAKL-TH-NTW-STD",
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
    // Department Retail Categories
    Electronics: ["Samsung", "LG", "Sony", "Apple", "Panasonic"],
    Appliances: ["Haier", "Hitachi", "Mitsubishi", "Daikin", "Toshiba"],
    Fashion: ["Uniqlo", "H&M", "Zara", "Nike", "Adidas"],
    HomeLiving: ["IKEA", "Index", "SB Furniture", "Modernform"],
    Beauty: ["L'Oreal", "Maybelline", "MAC", "Shiseido", "Clinique"],
    Sports: ["Nike", "Adidas", "Under Armour", "Puma", "Reebok"],
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
 * Get deterministic view configuration for product
 * Retail categories (Electronics, Appliances, etc.) are assigned to DS view types
 */
function getViewForProduct(productId: string, category: ProductCategory): string {
  const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

  // Map retail categories to DS view types
  const retailCategories: ProductCategory[] = ["Electronics", "Appliances", "Fashion", "HomeLiving", "Beauty", "Sports"]

  if (retailCategories.includes(category)) {
    // High-value items (Electronics, Appliances) get express delivery
    if (category === "Electronics" || category === "Appliances") {
      return "ECOM-TH-DSS-LOCD-EXP"
    }
    // Other retail items get standard delivery
    return "ECOM-TH-DSS-NW-STD"
  }

  // CFR View Options for Grocery items (Produce, Meat, etc.)
  // Explicitly exclude DS view types to prevents weight items from appearing in DS views
  const CFR_VIEW_OPTIONS = [
    "ECOM-TH-CFR-LOCD-STD",
    "ECOM-TH-CFR-LOCD-MKP",
    "MKP-TH-CFR-LOCD-STD",
    "ECOM-TH-SSP-NW-STD",
    "MKP-TH-SSP-NW-STD",
    "ECOM-TH-SSP-NW-ALL",
    "MKP-TH-CFR-MANUAL-SYNC"
  ]

  // Default for grocery items - use ONLY CFR view types
  return CFR_VIEW_OPTIONS[seed % CFR_VIEW_OPTIONS.length]
}

/**
 * Tops store locations (from CLAUDE.md requirements)
 */
export const CDS_STORES: TopsStore[] = [
  "CDS Central World",
  "CDS Chidlom",
  "CDS Ladprao",
  "CDS Bangna",
  "CDS Rama 9"
]

export const TOPS_STORES: TopsStore[] = [
  "Tops Central Plaza ลาดพร้าว",
  "Tops Central World",
  "Tops สุขุมวิท 39",
  "Tops ทองหล่อ",
  "Tops สีลม คอมเพล็กซ์",
  "Tops เอกมัย",
  "Tops พร้อมพงษ์",
  "Tops จตุจักร",
  ...CDS_STORES
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
    const seed = item.productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const warehouseLocations = item.warehouseLocations || generateMockWarehouseLocations(
      item.productId,
      item.availableStock,
      item.reservedStock,
      item.safetyStock
    )

    // Determine view first to conditionally assign store name
    const determinedView = item.view || getViewForProduct(item.productId, item.category)

    let determinedStoreName = item.storeName || "Tops Central World"
    if (determinedView === "ECOM-TH-DSS-NW-STD" || determinedView === "ECOM-TH-DSS-LOCD-EXP") {
      // Override store name for DS views to use CDS stores
      determinedStoreName = CDS_STORES[seed % CDS_STORES.length]
    }

    // Generate deterministic Store ID
    // Logic:
    // 1. If store is CDS (Department Store), use CDSxxxxx format (e.g., CDS10102)
    // 2. If store is Tops (CFR/Grocery), use CFRxxxx format (e.g., CFR432, CFR4048)
    const storeIdSeed = determinedStoreName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

    let storeId: string
    if (determinedStoreName.startsWith("CDS")) {
      storeId = `CDS10${(storeIdSeed % 900) + 100}`
    } else {
      // Generate CFR ID, e.g., CFR432
      storeId = `CFR${(storeIdSeed % 9000) + 100}`
    }

    return {
      ...item,
      warehouseLocations,
      brand: item.brand || getBrandForProduct(item.productId, item.category),
      channels: item.channels || getChannelsForProduct(item.productId, item.category),
      supplyType: item.supplyType || getSupplyTypeForProduct(item.productId, item.status),
      stockConfigStatus: item.stockConfigStatus || getStockConfigStatus(item.productId, warehouseLocations.length > 0),
      businessUnit: item.businessUnit || (seed % 2 === 0 ? "CFR" : "DS"),
      view: determinedView,
      storeName: determinedStoreName,
      storeId: storeId,
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

  // ========== DEPARTMENT RETAIL - DS BUSINESS UNIT ==========
  // Old placeholder items removed to prioritize Central Homepage Bestsellers

  // Central Homepage Bestsellers - Department Store (DS)
  {
    id: "INV-054",
    productId: "CDS-SKII-FTE-230",
    productName: "SK-II Facial Treatment Essence 230ml",
    category: "Beauty",
    storeName: "Tops Central World",
    currentStock: 45,
    availableStock: 40,
    reservedStock: 5,
    safetyStock: 10,
    minStockLevel: 20,
    maxStockLevel: 100,
    unitPrice: 8800.00,
    lastRestocked: "2026-01-14T10:00:00Z",
    status: "healthy",
    supplier: "Procter & Gamble Trading (Thailand)",
    reorderPoint: 30,
    demandForecast: 60,
    imageUrl: "https://placehold.co/400x400/800000/FFFFFF/png?text=SK-II+FTE",
    barcode: "4979006090888",
    itemType: "normal",
    brand: "SK-II",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-055",
    productId: "CDS-CLARINS-DS-50",
    productName: "Clarins Double Serum 50ml",
    category: "Beauty",
    storeName: "Tops Central World",
    currentStock: 32,
    availableStock: 28,
    reservedStock: 4,
    safetyStock: 8,
    minStockLevel: 15,
    maxStockLevel: 80,
    unitPrice: 5000.00,
    lastRestocked: "2026-01-12T14:30:00Z",
    status: "healthy",
    supplier: "Clarins Thailand",
    reorderPoint: 20,
    demandForecast: 50,
    imageUrl: "https://placehold.co/400x400/C41E3A/FFFFFF/png?text=Clarins+Double+Serum",
    barcode: "3380810149080",
    itemType: "normal",
    brand: "Clarins",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-056",
    productId: "CDS-MARSHALL-EMBER-BLK",
    productName: "Marshall Emberton II Portable Gen 2 Black",
    category: "Electronics",
    storeName: "Tops Central World",
    currentStock: 12,
    availableStock: 5,
    reservedStock: 7,
    safetyStock: 5,
    minStockLevel: 8,
    maxStockLevel: 30,
    unitPrice: 7490.00,
    lastRestocked: "2026-01-13T09:00:00Z",
    status: "low",
    supplier: "Ash Asia",
    reorderPoint: 10,
    demandForecast: 25,
    imageUrl: "https://placehold.co/400x400/000000/FFFFFF/png?text=Marshall+Emberton",
    barcode: "7340055391216",
    itemType: "normal",
    brand: "Marshall",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-057",
    productId: "CDS-HATGARI-FAN-16",
    productName: "Hatari Slide Fan 16\" Slide Smart L1",
    category: "Appliances",
    storeName: "Tops Central World",
    currentStock: 25,
    availableStock: 22,
    reservedStock: 3,
    safetyStock: 10,
    minStockLevel: 15,
    maxStockLevel: 50,
    unitPrice: 1188.00,
    lastRestocked: "2026-01-10T08:00:00Z",
    status: "healthy",
    supplier: "Hatari Electric",
    reorderPoint: 20,
    demandForecast: 40,
    imageUrl: "https://placehold.co/400x400/FFFFFF/000000/png?text=Hatari+Fan",
    barcode: "8850918005671",
    itemType: "normal",
    brand: "Hatari",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-058",
    productId: "CDS-NESPRESSO-ESSENZA",
    productName: "Nespresso Essenza Mini C30 Black",
    category: "Appliances",
    storeName: "Tops Central World",
    currentStock: 18,
    availableStock: 14,
    reservedStock: 4,
    safetyStock: 6,
    minStockLevel: 10,
    maxStockLevel: 40,
    unitPrice: 4500.00,
    lastRestocked: "2026-01-11T11:00:00Z",
    status: "healthy",
    supplier: "Nespresso Thailand",
    reorderPoint: 12,
    demandForecast: 30,
    imageUrl: "https://placehold.co/400x400/333333/FFFFFF/png?text=Nespresso+Mini",
    barcode: "7630047606399",
    itemType: "normal",
    brand: "Nespresso",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  // Additional Central Homepage Products - Standard Delivery (ECOM-TH-DSS-NW-STD)
  {
    id: "INV-059",
    productId: "CDS-KIEHLS-DARK-SPOT",
    productName: "Kiehl's Clearly Corrective Dark Spot Solution 50ml",
    category: "Beauty",
    storeName: "Tops Central World",
    currentStock: 55,
    availableStock: 50,
    reservedStock: 5,
    safetyStock: 12,
    minStockLevel: 20,
    maxStockLevel: 100,
    unitPrice: 3550.00,
    lastRestocked: "2026-01-14T09:00:00Z",
    status: "healthy",
    supplier: "L'Oreal Thailand",
    reorderPoint: 25,
    demandForecast: 60,
    imageUrl: "https://placehold.co/400x400/FFFFFF/000000/png?text=Kiehls+Dark+Spot",
    barcode: "3605970363229",
    itemType: "normal",
    brand: "Kiehl's",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-060",
    productId: "CDS-DIOR-SAVAGE",
    productName: "Dior Sauvage Eau de Parfum 100ml",
    category: "Beauty",
    storeName: "Tops Central World",
    currentStock: 28,
    availableStock: 25,
    reservedStock: 3,
    safetyStock: 8,
    minStockLevel: 10,
    maxStockLevel: 60,
    unitPrice: 5700.00,
    lastRestocked: "2026-01-13T11:00:00Z",
    status: "healthy",
    supplier: "Parfums Christian Dior",
    reorderPoint: 15,
    demandForecast: 40,
    imageUrl: "https://placehold.co/400x400/000000/FFFFFF/png?text=Dior+Sauvage",
    barcode: "3348901368247",
    itemType: "normal",
    brand: "Dior",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-061",
    productId: "CDS-LA-MER-CREAM",
    productName: "La Mer Crème de la Mer 60ml",
    category: "Beauty",
    storeName: "Tops Central World",
    currentStock: 18,
    availableStock: 15,
    reservedStock: 3,
    safetyStock: 5,
    minStockLevel: 8,
    maxStockLevel: 40,
    unitPrice: 16100.00,
    lastRestocked: "2026-01-12T13:00:00Z",
    status: "healthy",
    supplier: "ELCA Thailand",
    reorderPoint: 10,
    demandForecast: 20,
    imageUrl: "https://placehold.co/400x400/006400/FFFFFF/png?text=La+Mer",
    barcode: "747930000013",
    itemType: "normal",
    brand: "La Mer",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-062",
    productId: "CDS-LACOSTE-POLO",
    productName: "Lacoste Men's Classic Fit Polo Shirt",
    category: "Fashion",
    storeName: "Tops Central World",
    currentStock: 120,
    availableStock: 110,
    reservedStock: 10,
    safetyStock: 20,
    minStockLevel: 40,
    maxStockLevel: 200,
    unitPrice: 3290.00,
    lastRestocked: "2026-01-10T10:00:00Z",
    status: "healthy",
    supplier: "Lacoste Thailand",
    reorderPoint: 50,
    demandForecast: 100,
    imageUrl: "https://placehold.co/400x400/228B22/FFFFFF/png?text=Lacoste+Polo",
    barcode: "3600000000001",
    itemType: "normal",
    brand: "Lacoste",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-063",
    productId: "CDS-SAMSONITE-LUGGAGE",
    productName: "Samsonite C-Lite Spinner 69/25 FL2",
    category: "Fashion",
    storeName: "Tops Central World",
    currentStock: 10,
    availableStock: 8,
    reservedStock: 2,
    safetyStock: 4,
    minStockLevel: 5,
    maxStockLevel: 20,
    unitPrice: 22900.00,
    lastRestocked: "2026-01-08T14:00:00Z",
    status: "low",
    supplier: "Samsonite Thailand",
    reorderPoint: 6,
    demandForecast: 15,
    imageUrl: "https://placehold.co/400x400/808080/FFFFFF/png?text=Samsonite",
    barcode: "5414847000002",
    itemType: "normal",
    brand: "Samsonite",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },

  // Additional Central Homepage Products - Express Delivery (ECOM-TH-DSS-LOCD-EXP)
  {
    id: "INV-064",
    productId: "CDS-DYSON-V12",
    productName: "Dyson V12 Detect Slim Submarine",
    category: "Appliances",
    storeName: "Tops Central World",
    currentStock: 14,
    availableStock: 10,
    reservedStock: 4,
    safetyStock: 5,
    minStockLevel: 8,
    maxStockLevel: 30,
    unitPrice: 32900.00,
    lastRestocked: "2026-01-13T10:00:00Z",
    status: "healthy",
    supplier: "Dyson Thailand",
    reorderPoint: 10,
    demandForecast: 20,
    imageUrl: "https://placehold.co/400x400/808080/FF0000/png?text=Dyson+V12",
    barcode: "5025155000001",
    itemType: "normal",
    brand: "Dyson",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-065",
    productId: "CDS-PHILIPS-AF",
    productName: "Philips Airfryer XXL Smart Sensing",
    category: "Appliances",
    storeName: "Tops Central World",
    currentStock: 22,
    availableStock: 18,
    reservedStock: 4,
    safetyStock: 6,
    minStockLevel: 10,
    maxStockLevel: 50,
    unitPrice: 13990.00,
    lastRestocked: "2026-01-12T15:00:00Z",
    status: "healthy",
    supplier: "Philips Thailand",
    reorderPoint: 15,
    demandForecast: 30,
    imageUrl: "https://placehold.co/400x400/000000/FFFFFF/png?text=Philips+Airfryer",
    barcode: "8710103000001",
    itemType: "normal",
    brand: "Philips",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-066",
    productId: "CDS-TEFAL-IRON",
    productName: "Tefal Steam Generator Iron Pro Express Vision",
    category: "Appliances",
    storeName: "Tops Central World",
    currentStock: 15,
    availableStock: 12,
    reservedStock: 3,
    safetyStock: 5,
    minStockLevel: 8,
    maxStockLevel: 35,
    unitPrice: 22990.00,
    lastRestocked: "2026-01-11T12:00:00Z",
    status: "healthy",
    supplier: "Groupe SEB Thailand",
    reorderPoint: 10,
    demandForecast: 18,
    imageUrl: "https://placehold.co/400x400/000080/FFFFFF/png?text=Tefal+Iron",
    barcode: "3121040000002",
    itemType: "normal",
    brand: "Tefal",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-067",
    productId: "CDS-GARMIN-VENU3",
    productName: "Garmin Venu 3 GPS Smartwatch",
    category: "Electronics",
    storeName: "Tops Central World",
    currentStock: 25,
    availableStock: 20,
    reservedStock: 5,
    safetyStock: 8,
    minStockLevel: 12,
    maxStockLevel: 60,
    unitPrice: 15990.00,
    lastRestocked: "2026-01-14T11:00:00Z",
    status: "healthy",
    supplier: "GIS Co., Ltd",
    reorderPoint: 15,
    demandForecast: 35,
    imageUrl: "https://placehold.co/400x400/000000/FFFFFF/png?text=Garmin+Venu3",
    barcode: "753759000001",
    itemType: "normal",
    brand: "Garmin",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-068",
    productId: "CDS-JBL-FLIPGE",
    productName: "JBL Flip 6 Portable Waterproof Speaker",
    category: "Electronics",
    storeName: "Tops Central World",
    currentStock: 40,
    availableStock: 32,
    reservedStock: 8,
    safetyStock: 10,
    minStockLevel: 15,
    maxStockLevel: 80,
    unitPrice: 5190.00,
    lastRestocked: "2026-01-13T13:00:00Z",
    status: "healthy",
    supplier: "Mahajak Development",
    reorderPoint: 20,
    demandForecast: 50,
    imageUrl: "https://placehold.co/400x400/FF0000/FFFFFF/png?text=JBL+Flip6",
    barcode: "6925281900001",
    itemType: "normal",
    brand: "JBL",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  // Even More Central Homepage Products - Standard Delivery (ECOM-TH-DSS-NW-STD)
  {
    id: "INV-069",
    productId: "CDS-JOMALONE-PEAR",
    productName: "Jo Malone London English Pear & Freesia Cologne 100ml",
    category: "Beauty",
    storeName: "Tops Central World",
    currentStock: 42,
    availableStock: 38,
    reservedStock: 4,
    safetyStock: 10,
    minStockLevel: 20,
    maxStockLevel: 80,
    unitPrice: 6000.00,
    lastRestocked: "2026-01-14T09:30:00Z",
    status: "healthy",
    supplier: "ELCA Thailand",
    reorderPoint: 25,
    demandForecast: 50,
    imageUrl: "https://placehold.co/400x400/F5DEB3/000000/png?text=Jo+Malone",
    barcode: "6902510190001",
    itemType: "normal",
    brand: "Jo Malone",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-070",
    productId: "CDS-CK-UNDERWEAR",
    productName: "Calvin Klein Men's Cotton Stretch Boxer Briefs 3-Pack",
    category: "Fashion",
    storeName: "Tops Central World",
    currentStock: 85,
    availableStock: 80,
    reservedStock: 5,
    safetyStock: 15,
    minStockLevel: 30,
    maxStockLevel: 150,
    unitPrice: 2190.00,
    lastRestocked: "2026-01-12T11:00:00Z",
    status: "healthy",
    supplier: "CMG",
    reorderPoint: 40,
    demandForecast: 90,
    imageUrl: "https://placehold.co/400x400/000000/FFFFFF/png?text=CK+Underwear",
    barcode: "0088238100001",
    itemType: "pack",
    brand: "Calvin Klein",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-071",
    productId: "CDS-RALPH-CAP",
    productName: "Polo Ralph Lauren Cotton Chino Baseball Cap",
    category: "Fashion",
    storeName: "Tops Central World",
    currentStock: 60,
    availableStock: 55,
    reservedStock: 5,
    safetyStock: 10,
    minStockLevel: 20,
    maxStockLevel: 100,
    unitPrice: 2500.00,
    lastRestocked: "2026-01-11T13:30:00Z",
    status: "healthy",
    supplier: "Ralph Lauren Thailand",
    reorderPoint: 25,
    demandForecast: 60,
    imageUrl: "https://placehold.co/400x400/000080/FFFFFF/png?text=Polo+Cap",
    barcode: "8838381000001",
    itemType: "normal",
    brand: "Ralph Lauren",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-072",
    productId: "CDS-CLINIQUE-MOISTURE",
    productName: "Clinique Moisture Surge 100H Auto-Replenishing Hydrator 50ml",
    category: "Beauty",
    storeName: "Tops Central World",
    currentStock: 50,
    availableStock: 45,
    reservedStock: 5,
    safetyStock: 10,
    minStockLevel: 20,
    maxStockLevel: 80,
    unitPrice: 1950.00,
    lastRestocked: "2026-01-13T10:30:00Z",
    status: "healthy",
    supplier: "ELCA Thailand",
    reorderPoint: 25,
    demandForecast: 55,
    imageUrl: "https://placehold.co/400x400/FFB6C1/000000/png?text=Clinique",
    barcode: "0207149000001",
    itemType: "normal",
    brand: "Clinique",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-073",
    productId: "CDS-BOBBI-BASE",
    productName: "Bobbi Brown Vitamin Enriched Face Base 50ml",
    category: "Beauty",
    storeName: "Tops Central World",
    currentStock: 35,
    availableStock: 30,
    reservedStock: 5,
    safetyStock: 8,
    minStockLevel: 15,
    maxStockLevel: 60,
    unitPrice: 2850.00,
    lastRestocked: "2026-01-14T08:00:00Z",
    status: "healthy",
    supplier: "ELCA Thailand",
    reorderPoint: 20,
    demandForecast: 45,
    imageUrl: "https://placehold.co/400x400/FFFFE0/000000/png?text=Bobbi+Brown",
    barcode: "716170000001",
    itemType: "normal",
    brand: "Bobbi Brown",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-074",
    productId: "CDS-RAYBAN-AVIATOR",
    productName: "Ray-Ban Aviator Classic Stick Gold - Green Classic G-15",
    category: "Fashion",
    storeName: "Tops Central World",
    currentStock: 25,
    availableStock: 22,
    reservedStock: 3,
    safetyStock: 5,
    minStockLevel: 10,
    maxStockLevel: 40,
    unitPrice: 5550.00,
    lastRestocked: "2026-01-09T15:00:00Z",
    status: "healthy",
    supplier: "Luxottica Thailand",
    reorderPoint: 12,
    demandForecast: 30,
    imageUrl: "https://placehold.co/400x400/000000/FFFFFF/png?text=RayBan+Aviator",
    barcode: "805289000001",
    itemType: "normal",
    brand: "Ray-Ban",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },

  // Even More Central Homepage Products - Express Delivery (ECOM-TH-DSS-LOCD-EXP)
  {
    id: "INV-075",
    productId: "CDS-SMEG-KETTLE",
    productName: "Smeg 50's Style Electric Kettle 1.7L Pastel Blue",
    category: "Appliances",
    storeName: "Tops Central World",
    currentStock: 12,
    availableStock: 10,
    reservedStock: 2,
    safetyStock: 4,
    minStockLevel: 6,
    maxStockLevel: 20,
    unitPrice: 9900.00,
    lastRestocked: "2026-01-11T10:00:00Z",
    status: "healthy",
    supplier: "Smeg Thailand",
    reorderPoint: 8,
    demandForecast: 15,
    imageUrl: "https://placehold.co/400x400/ADD8E6/000000/png?text=Smeg+Kettle",
    barcode: "8017709000001",
    itemType: "normal",
    brand: "Smeg",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-076",
    productId: "CDS-KITCHENAID-MIXER",
    productName: "KitchenAid Artisan Stand Mixer 4.8L Empire Red",
    category: "Appliances",
    storeName: "Tops Central World",
    currentStock: 8,
    availableStock: 6,
    reservedStock: 2,
    safetyStock: 3,
    minStockLevel: 5,
    maxStockLevel: 15,
    unitPrice: 26900.00,
    lastRestocked: "2026-01-10T14:30:00Z",
    status: "low",
    supplier: "KitchenAid Thailand",
    reorderPoint: 6,
    demandForecast: 12,
    imageUrl: "https://placehold.co/400x400/8B0000/FFFFFF/png?text=KitchenAid",
    barcode: "883049000001",
    itemType: "normal",
    brand: "KitchenAid",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-077",
    productId: "CDS-GOPRO-HERO12",
    productName: "GoPro HERO12 Black Creator Edition Bundle",
    category: "Electronics",
    storeName: "Tops Central World",
    currentStock: 30,
    availableStock: 25,
    reservedStock: 5,
    safetyStock: 8,
    minStockLevel: 12,
    maxStockLevel: 60,
    unitPrice: 20900.00,
    lastRestocked: "2026-01-13T12:00:00Z",
    status: "healthy",
    supplier: "Mentagram",
    reorderPoint: 15,
    demandForecast: 40,
    imageUrl: "https://placehold.co/400x400/000000/FFFFFF/png?text=GoPro+Bundle",
    barcode: "818279000001",
    itemType: "pack",
    brand: "GoPro",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-078",
    productId: "CDS-SWITCH-OLED",
    productName: "Nintendo Switch OLED Model - Neon Blue/Neon Red",
    category: "Electronics",
    storeName: "Tops Central World",
    currentStock: 20,
    availableStock: 15,
    reservedStock: 5,
    safetyStock: 5,
    minStockLevel: 10,
    maxStockLevel: 50,
    unitPrice: 12990.00,
    lastRestocked: "2026-01-12T10:00:00Z",
    status: "healthy",
    supplier: "Maxsoft",
    reorderPoint: 12,
    demandForecast: 30,
    imageUrl: "https://placehold.co/400x400/FF0000/FFFFFF/png?text=Switch+OLED",
    barcode: "4902370000001",
    itemType: "normal",
    brand: "Nintendo",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-079",
    productId: "CDS-BOSE-QC",
    productName: "Bose QuietComfort Ultra Headphones Black",
    category: "Electronics",
    storeName: "Tops Central World",
    currentStock: 15,
    availableStock: 12,
    reservedStock: 3,
    safetyStock: 4,
    minStockLevel: 8,
    maxStockLevel: 30,
    unitPrice: 15900.00,
    lastRestocked: "2026-01-11T16:00:00Z",
    status: "healthy",
    supplier: "Asavasopon",
    reorderPoint: 10,
    demandForecast: 20,
    imageUrl: "https://placehold.co/400x400/333333/FFFFFF/png?text=Bose+QC",
    barcode: "017817000001",
    itemType: "normal",
    brand: "Bose",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-080",
    productId: "CDS-IPAD-AIR",
    productName: "iPad Air 13-inch (M2) Wi-Fi 128GB - Space Grey",
    category: "Electronics",
    storeName: "Tops Central World",
    currentStock: 10,
    availableStock: 8,
    reservedStock: 2,
    safetyStock: 4,
    minStockLevel: 5,
    maxStockLevel: 25,
    unitPrice: 29900.00,
    lastRestocked: "2026-01-14T09:00:00Z",
    status: "low",
    supplier: "Apple Thailand",
    reorderPoint: 6,
    demandForecast: 15,
    imageUrl: "https://placehold.co/400x400/555555/FFFFFF/png?text=iPad+Air",
    barcode: "194253000001",
    itemType: "normal",
    brand: "Apple",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  // Batch 3: Central Homepage Products - Standard Delivery (ECOM-TH-DSS-NW-STD)
  {
    id: "INV-081",
    productId: "CDS-MAC-FIXPLUS",
    productName: "MAC Prep + Prime Fix+ 100ml (Duo Pack)",
    category: "Beauty",
    storeName: "Tops Central World",
    currentStock: 65,
    availableStock: 60,
    reservedStock: 5,
    safetyStock: 10,
    minStockLevel: 20,
    maxStockLevel: 100,
    unitPrice: 2900.00,
    lastRestocked: "2026-01-13T09:00:00Z",
    status: "healthy",
    supplier: "ELCA Thailand",
    reorderPoint: 25,
    demandForecast: 70,
    imageUrl: "https://placehold.co/400x400/000000/FFFFFF/png?text=MAC+Duo",
    barcode: "773602000001",
    itemType: "pack",
    brand: "MAC Cosmetics",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-082",
    productId: "CDS-CHANEL-COCO",
    productName: "Chanel Coco Mademoiselle Eau de Parfum 50ml",
    category: "Beauty",
    storeName: "Tops Central World",
    currentStock: 30,
    availableStock: 25,
    reservedStock: 5,
    safetyStock: 8,
    minStockLevel: 10,
    maxStockLevel: 50,
    unitPrice: 6200.00,
    lastRestocked: "2026-01-12T14:00:00Z",
    status: "healthy",
    supplier: "Chanel Thailand",
    reorderPoint: 12,
    demandForecast: 30,
    imageUrl: "https://placehold.co/400x400/FFC0CB/000000/png?text=Chanel+Coco",
    barcode: "314589000001",
    itemType: "normal",
    brand: "Chanel",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-083",
    productId: "CDS-YSL-LIBRE",
    productName: "Yves Saint Laurent Libre Eau de Parfum 50ml",
    category: "Beauty",
    storeName: "Tops Central World",
    currentStock: 35,
    availableStock: 30,
    reservedStock: 5,
    safetyStock: 8,
    minStockLevel: 10,
    maxStockLevel: 60,
    unitPrice: 5500.00,
    lastRestocked: "2026-01-14T10:00:00Z",
    status: "healthy",
    supplier: "L'Oreal Thailand",
    reorderPoint: 15,
    demandForecast: 40,
    imageUrl: "https://placehold.co/400x400/D4AF37/000000/png?text=YSL+Libre",
    barcode: "361427000001",
    itemType: "normal",
    brand: "Yves Saint Laurent",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-084",
    productId: "CDS-NARS-ORGASM",
    productName: "NARS Blush - Orgasm",
    category: "Beauty",
    storeName: "Tops Central World",
    currentStock: 48,
    availableStock: 45,
    reservedStock: 3,
    safetyStock: 10,
    minStockLevel: 20,
    maxStockLevel: 80,
    unitPrice: 1500.00,
    lastRestocked: "2026-01-11T12:00:00Z",
    status: "healthy",
    supplier: "Shiseido Thailand",
    reorderPoint: 20,
    demandForecast: 50,
    imageUrl: "https://placehold.co/400x400/FA8072/000000/png?text=NARS+Blush",
    barcode: "607845000001",
    itemType: "normal",
    brand: "NARS",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-085",
    productId: "CDS-ORIGINS-MEGA",
    productName: "Origins Mega-Mushroom Relief & Resilience Treatment Lotion 200ml",
    category: "Beauty",
    storeName: "Tops Central World",
    currentStock: 40,
    availableStock: 35,
    reservedStock: 5,
    safetyStock: 10,
    minStockLevel: 15,
    maxStockLevel: 70,
    unitPrice: 1800.00,
    lastRestocked: "2026-01-10T16:00:00Z",
    status: "healthy",
    supplier: "ELCA Thailand",
    reorderPoint: 20,
    demandForecast: 45,
    imageUrl: "https://placehold.co/400x400/228B22/FFFFFF/png?text=Origins+Mega",
    barcode: "717334000001",
    itemType: "normal",
    brand: "Origins",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-086",
    productId: "CDS-LEVI-501",
    productName: "Levi's 501 Original Fit Jeans",
    category: "Fashion",
    storeName: "Tops Central World",
    currentStock: 150,
    availableStock: 140,
    reservedStock: 10,
    safetyStock: 25,
    minStockLevel: 50,
    maxStockLevel: 300,
    unitPrice: 3290.00,
    lastRestocked: "2026-01-08T10:00:00Z",
    status: "healthy",
    supplier: "DKSH Thailand",
    reorderPoint: 60,
    demandForecast: 150,
    imageUrl: "https://placehold.co/400x400/000080/FFFFFF/png?text=Levis+501",
    barcode: "541501000001",
    itemType: "normal",
    brand: "Levi's",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-087",
    productId: "CDS-GUESS-BAG",
    productName: "Guess Noelle Crossbody Bag - Coal",
    category: "Fashion",
    storeName: "Tops Central World",
    currentStock: 20,
    availableStock: 18,
    reservedStock: 2,
    safetyStock: 5,
    minStockLevel: 8,
    maxStockLevel: 30,
    unitPrice: 4290.00,
    lastRestocked: "2026-01-12T13:00:00Z",
    status: "healthy",
    supplier: "CMG",
    reorderPoint: 8,
    demandForecast: 20,
    imageUrl: "https://placehold.co/400x400/000000/FFFFFF/png?text=Guess+Bag",
    barcode: "190231000001",
    itemType: "normal",
    brand: "Guess",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-088",
    productId: "CDS-CASIO-GSHOCK",
    productName: "Casio G-Shock GA-2100-1A1DR - Black",
    category: "Fashion",
    storeName: "Tops Central World",
    currentStock: 55,
    availableStock: 50,
    reservedStock: 5,
    safetyStock: 10,
    minStockLevel: 20,
    maxStockLevel: 100,
    unitPrice: 4500.00,
    lastRestocked: "2026-01-14T09:00:00Z",
    status: "healthy",
    supplier: "CMG",
    reorderPoint: 25,
    demandForecast: 60,
    imageUrl: "https://placehold.co/400x400/000000/FFFFFF/png?text=G-Shock",
    barcode: "454952600001",
    itemType: "normal",
    brand: "Casio",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-089",
    productId: "CDS-MLB-CAP",
    productName: "MLB NY Yankees Curve Cap - Black",
    category: "Fashion",
    storeName: "Tops Central World",
    currentStock: 80,
    availableStock: 75,
    reservedStock: 5,
    safetyStock: 15,
    minStockLevel: 30,
    maxStockLevel: 120,
    unitPrice: 1590.00,
    lastRestocked: "2026-01-11T15:00:00Z",
    status: "healthy",
    supplier: "CMG",
    reorderPoint: 35,
    demandForecast: 80,
    imageUrl: "https://placehold.co/400x400/000000/FFFFFF/png?text=MLB+Cap",
    barcode: "880949000001",
    itemType: "normal",
    brand: "MLB",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },
  {
    id: "INV-090",
    productId: "CDS-HAVAIANAS-SLIM",
    productName: "Havaianas Slim Flip Flops - Rose Gold",
    category: "Fashion",
    storeName: "Tops Central World",
    currentStock: 100,
    availableStock: 95,
    reservedStock: 5,
    safetyStock: 20,
    minStockLevel: 40,
    maxStockLevel: 200,
    unitPrice: 990.00,
    lastRestocked: "2026-01-09T11:00:00Z",
    status: "healthy",
    supplier: "Havaianas Thailand",
    reorderPoint: 50,
    demandForecast: 120,
    imageUrl: "https://placehold.co/400x400/FFC0CB/000000/png?text=Havaianas",
    barcode: "789126000001",
    itemType: "normal",
    brand: "Havaianas",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-NW-STD",
  },

  // Batch 3: Central Homepage Products - Express Delivery (ECOM-TH-DSS-LOCD-EXP)
  {
    id: "INV-091",
    productId: "CDS-DYSON-AIRWRAP-NI",
    productName: "Dyson Airwrap Multi-styler Complete Long Nickel/Copper",
    category: "Appliances",
    storeName: "Tops Central World",
    currentStock: 10,
    availableStock: 6,
    reservedStock: 4,
    safetyStock: 3,
    minStockLevel: 5,
    maxStockLevel: 25,
    unitPrice: 21900.00,
    lastRestocked: "2026-01-13T10:00:00Z",
    status: "low",
    supplier: "Dyson Thailand",
    reorderPoint: 8,
    demandForecast: 15,
    imageUrl: "https://placehold.co/400x400/B87333/FFFFFF/png?text=Dyson+Airwrap",
    barcode: "502515000002",
    itemType: "normal",
    brand: "Dyson",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-092",
    productId: "CDS-NESCAFE-GENIO",
    productName: "Nescafé Dolce Gusto Genio S Plus - Black",
    category: "Appliances",
    storeName: "Tops Central World",
    currentStock: 25,
    availableStock: 20,
    reservedStock: 5,
    safetyStock: 8,
    minStockLevel: 10,
    maxStockLevel: 50,
    unitPrice: 4990.00,
    lastRestocked: "2026-01-11T13:00:00Z",
    status: "healthy",
    supplier: "Nestle Thailand",
    reorderPoint: 15,
    demandForecast: 30,
    imageUrl: "https://placehold.co/400x400/000000/FFFFFF/png?text=Dolce+Gusto",
    barcode: "761303000001",
    itemType: "normal",
    brand: "Nescafé",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-093",
    productId: "CDS-ELECTROLUX-VAC",
    productName: "Electrolux UltimateHome 900 Cordless Vacuum Cleaner",
    category: "Appliances",
    storeName: "Tops Central World",
    currentStock: 15,
    availableStock: 12,
    reservedStock: 3,
    safetyStock: 4,
    minStockLevel: 6,
    maxStockLevel: 30,
    unitPrice: 19990.00,
    lastRestocked: "2026-01-12T15:00:00Z",
    status: "healthy",
    supplier: "Electrolux Thailand",
    reorderPoint: 8,
    demandForecast: 18,
    imageUrl: "https://placehold.co/400x400/808080/FFFFFF/png?text=Electrolux+Vac",
    barcode: "733254000001",
    itemType: "normal",
    brand: "Electrolux",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-094",
    productId: "CDS-SHARP-PURIFIER",
    productName: "Sharp Air Purifier FP-J30TA-B (23 sqm)",
    category: "Appliances",
    storeName: "Tops Central World",
    currentStock: 30,
    availableStock: 25,
    reservedStock: 5,
    safetyStock: 8,
    minStockLevel: 10,
    maxStockLevel: 60,
    unitPrice: 3990.00,
    lastRestocked: "2026-01-10T11:00:00Z",
    status: "healthy",
    supplier: "Sharp Thai",
    reorderPoint: 15,
    demandForecast: 35,
    imageUrl: "https://placehold.co/400x400/000000/FFFFFF/png?text=Sharp+AirPurifier",
    barcode: "497401000001",
    itemType: "normal",
    brand: "Sharp",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-095",
    productId: "CDS-MITSUBISHI-FAN",
    productName: "Mitsubishi Electric Slide Fan 16\" R16-GA Cy-Red",
    category: "Appliances",
    storeName: "Tops Central World",
    currentStock: 40,
    availableStock: 35,
    reservedStock: 5,
    safetyStock: 10,
    minStockLevel: 20,
    maxStockLevel: 80,
    unitPrice: 1050.00,
    lastRestocked: "2026-01-09T09:00:00Z",
    status: "healthy",
    supplier: "Mitsubishi Electric",
    reorderPoint: 25,
    demandForecast: 50,
    imageUrl: "https://placehold.co/400x400/FF0000/FFFFFF/png?text=Mitsubishi+Fan",
    barcode: "885025000001",
    itemType: "normal",
    brand: "Mitsubishi Electric",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-096",
    productId: "CDS-SONY-PS5",
    productName: "PlayStation 5 Console (Slim Model)",
    category: "Electronics",
    storeName: "Tops Central World",
    currentStock: 18,
    availableStock: 14,
    reservedStock: 4,
    safetyStock: 5,
    minStockLevel: 8,
    maxStockLevel: 40,
    unitPrice: 16990.00,
    lastRestocked: "2026-01-14T09:00:00Z",
    status: "healthy",
    supplier: "Sony Thailand",
    reorderPoint: 10,
    demandForecast: 20,
    imageUrl: "https://placehold.co/400x400/FFFFFF/000000/png?text=PS5+Slim",
    barcode: "494887000001",
    itemType: "normal",
    brand: "Sony",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-097",
    productId: "CDS-FUJI-INSTAX",
    productName: "Fujifilm Instax Mini 12 + Film Value Pack",
    category: "Electronics",
    storeName: "Tops Central World",
    currentStock: 35,
    availableStock: 30,
    reservedStock: 5,
    safetyStock: 10,
    minStockLevel: 15,
    maxStockLevel: 60,
    unitPrice: 3290.00,
    lastRestocked: "2026-01-13T14:00:00Z",
    status: "healthy",
    supplier: "Fujifilm Thailand",
    reorderPoint: 20,
    demandForecast: 40,
    imageUrl: "https://placehold.co/400x400/ADD8E6/000000/png?text=Instax+Set",
    barcode: "454741000001",
    itemType: "pack",
    brand: "Fujifilm",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-098",
    productId: "CDS-LOGITECH-MOUSE",
    productName: "Logitech MX Master 3S Wireless Mouse - Graphite",
    category: "Electronics",
    storeName: "Tops Central World",
    currentStock: 45,
    availableStock: 40,
    reservedStock: 5,
    safetyStock: 10,
    minStockLevel: 20,
    maxStockLevel: 80,
    unitPrice: 3990.00,
    lastRestocked: "2026-01-12T11:00:00Z",
    status: "healthy",
    supplier: "Logitech",
    reorderPoint: 25,
    demandForecast: 50,
    imageUrl: "https://placehold.co/400x400/444444/FFFFFF/png?text=MX+Master+3S",
    barcode: "097855000001",
    itemType: "normal",
    brand: "Logitech",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-099",
    productId: "CDS-XIAOMI-ROBOT",
    productName: "Xiaomi Robot Vacuum S10",
    category: "Electronics",
    storeName: "Tops Central World",
    currentStock: 25,
    availableStock: 20,
    reservedStock: 5,
    safetyStock: 8,
    minStockLevel: 10,
    maxStockLevel: 50,
    unitPrice: 7990.00,
    lastRestocked: "2026-01-11T13:00:00Z",
    status: "healthy",
    supplier: "Xiaomi Thailand",
    reorderPoint: 15,
    demandForecast: 30,
    imageUrl: "https://placehold.co/400x400/FFFFFF/FF6600/png?text=Xiaomi+Robot",
    barcode: "693417000001",
    itemType: "normal",
    brand: "Xiaomi",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  {
    id: "INV-100",
    productId: "CDS-SAMSUNG-T7",
    productName: "Samsung Portable SSD T7 Shield 1TB - Black",
    category: "Electronics",
    storeName: "Tops Central World",
    currentStock: 40,
    availableStock: 35,
    reservedStock: 5,
    safetyStock: 10,
    minStockLevel: 15,
    maxStockLevel: 70,
    unitPrice: 3990.00,
    lastRestocked: "2026-01-14T10:30:00Z",
    status: "healthy",
    supplier: "Samsung Thailand",
    reorderPoint: 20,
    demandForecast: 45,
    imageUrl: "https://placehold.co/400x400/000000/FFFFFF/png?text=Samsung+T7",
    barcode: "880609000001",
    itemType: "normal",
    brand: "Samsung",
    businessUnit: "DS",
    view: "ECOM-TH-DSS-LOCD-EXP",
  },
  // Batch 4: CFR Testing Items - ECOM-TH-CFR-LOCD-STD (TOL Channel)
  {
    id: "INV-101",
    productId: "CFR-TOL-JUICE",
    productName: "Tipco 100% Orange Juice Tangerine 1000ml",
    category: "Beverages",
    storeName: "Tops Central World",
    currentStock: 120,
    availableStock: 110,
    reservedStock: 10,
    safetyStock: 20,
    minStockLevel: 30,
    maxStockLevel: 200,
    unitPrice: 79.00,
    lastRestocked: "2026-01-14T08:00:00Z",
    status: "healthy",
    supplier: "Tipco F&B",
    reorderPoint: 40,
    demandForecast: 100,
    imageUrl: "https://placehold.co/400x400/FFA500/FFFFFF/png?text=Tipco+Orange",
    barcode: "8851011000001",
    itemType: "normal",
    brand: "Tipco",
    businessUnit: "CFR",
    view: "ECOM-TH-CFR-LOCD-STD",
  },
  {
    id: "INV-102",
    productId: "CFR-TOL-SODA-PK",
    productName: "Schwepes Manao Soda 330ml (Pack 6)",
    category: "Beverages",
    storeName: "Tops Central World",
    currentStock: 50,
    availableStock: 45,
    reservedStock: 5,
    safetyStock: 10,
    minStockLevel: 15,
    maxStockLevel: 80,
    unitPrice: 95.00,
    lastRestocked: "2026-01-13T09:00:00Z",
    status: "healthy",
    supplier: "ThaiNamthip",
    reorderPoint: 20,
    demandForecast: 40,
    imageUrl: "https://placehold.co/400x400/00FF00/000000/png?text=Schwepes+Pk6",
    barcode: "8851959000001",
    itemType: "pack",
    brand: "Schweppes",
    businessUnit: "CFR",
    view: "ECOM-TH-CFR-LOCD-STD",
  },
  {
    id: "INV-103",
    productId: "CFR-TOL-BANANA-WT",
    productName: "Cavendish Bananas (Premium Grade)",
    category: "Produce",
    storeName: "Tops Central World",
    currentStock: 25.5,
    availableStock: 20.0,
    reservedStock: 5.5,
    safetyStock: 5.0,
    minStockLevel: 10.0,
    maxStockLevel: 50.0,
    unitPrice: 39.00,
    lastRestocked: "2026-01-15T06:00:00Z",
    status: "healthy",
    supplier: "Local Farm",
    reorderPoint: 10.0,
    demandForecast: 20.0,
    imageUrl: "https://placehold.co/400x400/FFFF00/000000/png?text=Bananas",
    barcode: "2000001000001",
    itemType: "weight",
    brand: "Chiquita",
    businessUnit: "CFR",
    view: "ECOM-TH-CFR-LOCD-STD",
  },
  {
    id: "INV-104",
    productId: "CFR-TOL-CHICKEN-PKWT",
    productName: "Betagro Chicken Breast Skinless (Family Pack)",
    category: "Meat",
    storeName: "Tops Central World",
    currentStock: 15.0,
    availableStock: 12.0,
    reservedStock: 3.0,
    safetyStock: 5.0,
    minStockLevel: 8.0,
    maxStockLevel: 30.0,
    unitPrice: 159.00,
    lastRestocked: "2026-01-15T07:00:00Z",
    status: "healthy",
    supplier: "Betagro",
    reorderPoint: 8.0,
    demandForecast: 10.0,
    imageUrl: "https://placehold.co/400x400/FFC0CB/000000/png?text=Chicken+Pack",
    barcode: "2000001000002",
    itemType: "pack_weight",
    brand: "Betagro",
    businessUnit: "CFR",
    view: "ECOM-TH-CFR-LOCD-STD",
  },

  // Batch 4: CFR Testing Items - MKP-TH-CFR-LOCD-STD (QC Channel)
  {
    id: "INV-105",
    productId: "CFR-QC-SAUCE",
    productName: "Mae Pranom Thai Chili Paste 114g",
    category: "Pantry",
    storeName: "Tops Central World",
    currentStock: 200,
    availableStock: 180,
    reservedStock: 20,
    safetyStock: 30,
    minStockLevel: 50,
    maxStockLevel: 300,
    unitPrice: 55.00,
    lastRestocked: "2026-01-10T11:00:00Z",
    status: "healthy",
    supplier: "Phiboonchai Maepranom",
    reorderPoint: 60,
    demandForecast: 150,
    imageUrl: "https://placehold.co/400x400/FFA500/000000/png?text=Chili+Paste",
    barcode: "8850028000001",
    itemType: "normal",
    brand: "Mae Pranom",
    businessUnit: "CFR",
    view: "MKP-TH-CFR-LOCD-STD",
  },
  {
    id: "INV-106",
    productId: "CFR-QC-GIFT-PK",
    productName: "Brand's Essence of Chicken Gift Basket",
    category: "Pantry",
    storeName: "Tops Central World",
    currentStock: 10,
    availableStock: 8,
    reservedStock: 2,
    safetyStock: 3,
    minStockLevel: 5,
    maxStockLevel: 20,
    unitPrice: 990.00,
    lastRestocked: "2026-01-05T09:00:00Z",
    status: "healthy",
    supplier: "Suntory",
    reorderPoint: 5,
    demandForecast: 8,
    imageUrl: "https://placehold.co/400x400/008000/FFFFFF/png?text=Brands+Gift",
    barcode: "8850388000001",
    itemType: "pack",
    brand: "Brands",
    businessUnit: "CFR",
    view: "MKP-TH-CFR-LOCD-STD",
  },
  {
    id: "INV-107",
    productId: "CFR-QC-CHEESE-WT",
    productName: "Parmigiano Reggiano DOP (Block)",
    category: "Dairy",
    storeName: "Tops Central World",
    currentStock: 8.5,
    availableStock: 7.0,
    reservedStock: 1.5,
    safetyStock: 2.0,
    minStockLevel: 3.0,
    maxStockLevel: 15.0,
    unitPrice: 1290.00,
    lastRestocked: "2026-01-12T08:00:00Z",
    status: "healthy",
    supplier: "Imported Foods",
    reorderPoint: 4.0,
    demandForecast: 5.0,
    imageUrl: "https://placehold.co/400x400/FFFFE0/000000/png?text=Parmigiano",
    barcode: "2000001000003",
    itemType: "weight",
    brand: "Zanetti",
    businessUnit: "CFR",
    view: "MKP-TH-CFR-LOCD-STD",
  },
  {
    id: "INV-108",
    productId: "CFR-QC-SALMON-PKWT",
    productName: "Norwegian Salmon Fillet Pack (Approx. 500g)",
    category: "Seafood",
    storeName: "Tops Central World",
    currentStock: 12.0,
    availableStock: 10.0,
    reservedStock: 2.0,
    safetyStock: 3.0,
    minStockLevel: 5.0,
    maxStockLevel: 25.0,
    unitPrice: 450.00,
    lastRestocked: "2026-01-15T05:00:00Z",
    status: "healthy",
    supplier: "Thammachart Seafood",
    reorderPoint: 6.0,
    demandForecast: 15.0,
    imageUrl: "https://placehold.co/400x400/FF7F50/FFFFFF/png?text=Salmon+Pack",
    barcode: "2000001000004",
    itemType: "pack_weight",
    brand: "Thammachart",
    businessUnit: "CFR",
    view: "MKP-TH-CFR-LOCD-STD",
  },
]

/**
 * Generate additional mock items to ensure sufficient data for pagination testing (30+ items per view).
 */
function generateAdditionalItems(): InventoryItem[] {
  const viewsToEnrich = [
    "ECOM-TH-CFR-LOCD-STD",
    "MKP-TH-CFR-LOCD-STD",
    "ECOM-TH-DSS-NW-STD",
    "ECOM-TH-DSS-LOCD-EXP"
  ];

  const additionalItems: InventoryItem[] = [];

  viewsToEnrich.forEach((view, viewIndex) => {
    // Realistic product names for DS Views
    const dsProducts = [
      { name: "Estée Lauder Advanced Night Repair 50ml", category: "Beauty", price: 4850 },
      { name: "La Mer The Moisturizing Soft Cream 60ml", category: "Beauty", price: 16100 },
      { name: "Dyson Airwrap Multi-styler Complete Long", category: "Appliances", price: 21900 },
      { name: "Nespresso Vertuo Pop Coffee Machine", category: "Appliances", price: 5500 },
      { name: "Samsonite Minter Spinner 69/25 Exp", category: "Fashion", price: 16500 },
      { name: "Calvin Klein Jeans Men's Slim Fit", category: "Fashion", price: 4500 },
      { name: "Swarovski Swan Necklace", category: "Fashion", price: 5200 },
      { name: "Smeg 2-Slice Toaster Cream", category: "Appliances", price: 10900 },
      { name: "Jo Malone London Wood Sage & Sea Salt 100ml", category: "Beauty", price: 6000 },
      { name: "Ralph Lauren Polo Bear Cotton Sweater", category: "Fashion", price: 18500 }
    ];

    // Realistic product names for CFR Views
    const cfrProducts = [
      { name: "My Choice Australian Strawberries 250g", category: "Fresh Food", price: 299 },
      { name: "Betagen Fermented Milk 400ml", category: "Beverages", price: 25 },
      { name: "Lay's Classic Potato Chips 158g", category: "Pantry", price: 42 },
      { name: "Coca-Cola Original Taste 1.5L", category: "Beverages", price: 29 },
      { name: "Royal Umbrella Thai Jasmine Rice 5kg", category: "Pantry", price: 235 },
      { name: "S-Pure Chicken Beast Fillet 400g", category: "Fresh Food", price: 98 },
      { name: "Tipco 100% Tangerine Orange Juice 1L", category: "Beverages", price: 79 },
      { name: "Kikkoman Soy Sauce 600ml", category: "Pantry", price: 135 },
      { name: "Kodomo Baby Bottle Cleanser 600ml", category: "Pantry", price: 95 },
      { name: "Mama Instant Noodles Minced Pork Flavor 60g", category: "Pantry", price: 7 }
    ];

    // Generate 30 items per view by cycling through the product lists
    for (let i = 0; i < 30; i++) {
      const seed = i + (viewIndex * 100);
      let productBase;

      let itemTypes: ItemType[];
      let selectedStore: TopsStore;

      if (view === "ECOM-TH-DSS-NW-STD" || view === "ECOM-TH-DSS-LOCD-EXP") {
        itemTypes = ["normal", "pack"];
        selectedStore = CDS_STORES[seed % CDS_STORES.length];
        productBase = dsProducts[i % dsProducts.length];
      } else {
        itemTypes = ["normal", "pack", "weight", "pack_weight"];
        const topsOnlyStores = TOPS_STORES.filter(s => !s.startsWith("CDS"));
        selectedStore = topsOnlyStores[seed % topsOnlyStores.length];
        productBase = cfrProducts[i % cfrProducts.length];
      }

      const selectedItemType = itemTypes[seed % itemTypes.length];
      // Add variation to ID to allow duplicates of same product check
      const uniqueSuffix = Math.floor(i / 10) + 1;

      additionalItems.push({
        id: `AUTO-${view}-${i}`,
        productId: `PROD-${view.split('-')[2]}-${i}`,
        productName: `${productBase.name}${uniqueSuffix > 1 ? ` (Batch ${uniqueSuffix})` : ''}`,
        category: productBase.category as ProductCategory,
        storeName: selectedStore,
        currentStock: 50 + (i * 2),
        availableStock: 40 + (i * 2),
        reservedStock: 5,
        safetyStock: 10,
        minStockLevel: 20,
        maxStockLevel: 200,
        unitPrice: productBase.price,
        lastRestocked: new Date().toISOString(),
        status: "healthy",
        supplier: "Central Group Supplier",
        reorderPoint: 25,
        demandForecast: 60,
        imageUrl: `https://placehold.co/400x400/F5F5F5/333333/png?text=${encodeURIComponent(productBase.name.substring(0, 15))}`,
        barcode: `885${seed.toString().padStart(9, '0')}`,
        itemType: selectedItemType,
        view: view,
        businessUnit: view.includes("CFR") ? "CFR" : "DS"
      } as InventoryItem);
    }
  });

  return additionalItems;
}

/**
 * Export mock inventory items with warehouse locations and new fields applied
 */
export const mockInventoryItems = ensureWarehouseLocationsAndNewFields([
  ...mockInventoryItemsBase,
  ...generateAdditionalItems()
])

/**
 * Generate store performance metrics dynamically from inventory items
 * This ensures data consistency between store overview and detail views
 * @returns Array of StorePerformance objects for all 8 Tops stores
 */
export function generateStorePerformanceFromInventory(itemsSource?: InventoryItem[]): StorePerformance[] {
  // Group inventory items by store
  const itemsByStore = new Map<TopsStore, InventoryItem[]>()

  // Initialize all 8 stores with empty arrays
  TOPS_STORES.forEach(store => {
    itemsByStore.set(store, [])
  })

  // Group items by their store
  const itemsToProcess = itemsSource || mockInventoryItems
  itemsToProcess.forEach(item => {
    const storeItems = itemsByStore.get(item.storeName) || []
    storeItems.push(item)
    itemsByStore.set(item.storeName, storeItems)
  })

  // Calculate performance metrics for each store
  const storePerformance: StorePerformance[] = []

  // Determine which stores to process
  // If we have filtered items, we should prioritize stores that actually have items
  // This solves the issue where DS views (filtered items) show empty "Tops" stores
  let storesToProcess = TOPS_STORES

  if (itemsSource && itemsSource.length > 0) {
    // If we have specific items, check if they are predominantly DS items
    const isDsView = itemsSource.some(item =>
      item.view === "ECOM-TH-DSS-NW-STD" || item.view === "ECOM-TH-DSS-LOCD-EXP"
    )

    if (isDsView) {
      // Filter to only CDS stores or stores present in the data
      // We'll use the stores actually present in the items + CDS stores to be safe
      const activeStats = new Set(itemsSource.map(i => i.storeName))
      storesToProcess = TOPS_STORES.filter(s => activeStats.has(s) || s.startsWith("CDS"))
    } else {
      // For CFR/Grocery views, we might want to exclude CDS stores or just show Tops
      // If the view is strictly CFR, hide CDS
      const isCfrView = itemsSource.every(item =>
        (item.view || "").includes("CFR") || !(item.view || "").includes("DSS")
      )
      if (isCfrView) {
        storesToProcess = TOPS_STORES.filter(s => !s.startsWith("CDS"))
      }
    }
  }

  storesToProcess.forEach(storeName => {
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

    // Generate deterministic Store ID
    // Logic:
    // 1. If store is CDS (Department Store), use CDSxxxxx format (e.g., CDS10102)
    // 2. If store is Tops (CFR/Grocery), use CFRxxxx format (e.g., CFR432, CFR4048)
    const seed = storeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

    let storeId: string
    if (storeName.startsWith("CDS")) {
      storeId = `CDS10${(seed % 900) + 100}`
    } else {
      // Generate CFR ID, e.g., CFR432, CFR4048
      const idNum = (seed % 9000) + 100
      storeId = `CFR${idNum}`
    }

    storePerformance.push({
      storeName,
      storeId,
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
 *
 * @param productId - Product ID or inventory item ID
 * @param count - Number of transactions to generate (default: 50-100 random)
 */
export function generateMockTransactions(productId: string, count?: number): StockTransaction[] {
  const item = mockInventoryItems.find((i) => i.id === productId || i.productId === productId)
  if (!item) return []

  const transactions: StockTransaction[] = []
  // Generate 50-100 transactions for comprehensive history
  const transactionCount = count ?? (50 + Math.floor(Math.random() * 50))
  const today = new Date()

  const users = ["John Smith", "Sarah Johnson", "Mike Chen", "Lisa Wong", "David Kim", "Amy Wang", "Tom Brown"]

  // Generate timestamps in chronological order (oldest to newest)
  const timestamps: Date[] = []
  for (let i = 0; i < transactionCount; i++) {
    const daysAgo = 90 - Math.floor((90 / transactionCount) * i) // Spread over 90 days, oldest first
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

  // Allocation types for allocation transactions
  const allocationTypes: ("order" | "hold" | "reserve")[] = ["order", "hold", "reserve"]

  for (let i = 0; i < transactionCount; i++) {
    const timestamp = timestamps[i]
    const user = users[Math.floor(Math.random() * users.length)]

    // Pick a random warehouse location from the item's locations
    // This ensures transactions are aligned with the item's actual warehouse locations
    // which are associated with the item's store through the deterministic generation
    const location = item.warehouseLocations && item.warehouseLocations.length > 0
      ? item.warehouseLocations[Math.floor(Math.random() * item.warehouseLocations.length)]
      : undefined

    let type: TransactionType
    let quantity: number
    let balanceChange: number
    let transferFrom: string | undefined
    let transferTo: string | undefined
    let allocationType: "order" | "hold" | "reserve" | undefined

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
        // Low stock: 50% stock_in, 5% stock_out, 15% adjustment, 10% return, 10% transfer, 10% allocation
        typeWeights = [0.50, 0.05, 0.15, 0.10, 0.10, 0.10]
      } else if (balanceRatio > 0.8) {
        // High stock: 5% stock_in, 55% stock_out, 10% adjustment, 10% return, 10% transfer, 10% allocation
        typeWeights = [0.05, 0.55, 0.10, 0.10, 0.10, 0.10]
      } else {
        // Normal: 15% stock_in, 35% stock_out, 15% adjustment, 10% return, 15% transfer, 10% allocation
        typeWeights = [0.15, 0.35, 0.15, 0.10, 0.15, 0.10]
      }

      const rand = Math.random()
      let cumulative = 0
      if (rand < (cumulative += typeWeights[0])) {
        type = "stock_in"
      } else if (rand < (cumulative += typeWeights[1])) {
        type = "stock_out"
      } else if (rand < (cumulative += typeWeights[2])) {
        type = "adjustment"
      } else if (rand < (cumulative += typeWeights[3])) {
        type = "return"
      } else if (rand < (cumulative += typeWeights[4])) {
        type = "transfer"
      } else {
        type = "allocation"
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
          quantity = Math.max(10, Math.floor(Math.random() * Math.max(maxOut, 10)) + 10) // 10 to maxOut units
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
        case "transfer":
          // Transfer out from this location
          const maxTransfer = Math.min(runningBalance - 10, 40) // Keep at least 10 in stock
          quantity = Math.max(5, Math.floor(Math.random() * Math.max(maxTransfer, 5)) + 5) // 5 to maxTransfer units
          balanceChange = -quantity // Transfer reduces local balance
          // Set transfer source and destination
          transferFrom = location?.warehouseCode || WAREHOUSE_CODES[0]
          transferTo = WAREHOUSE_CODES[Math.floor(Math.random() * WAREHOUSE_CODES.length)]
          // Ensure different warehouses
          if (transferTo === transferFrom) {
            transferTo = WAREHOUSE_CODES[(WAREHOUSE_CODES.indexOf(transferFrom) + 1) % WAREHOUSE_CODES.length]
          }
          break
        case "allocation":
          // Allocate stock for order/hold/reserve
          const maxAlloc = Math.min(runningBalance - 10, 30) // Keep at least 10 in stock
          quantity = Math.max(3, Math.floor(Math.random() * Math.max(maxAlloc, 3)) + 3) // 3 to maxAlloc units
          balanceChange = -quantity // Allocation reduces available balance
          allocationType = allocationTypes[Math.floor(Math.random() * allocationTypes.length)]
          break
        default:
          quantity = 0
          balanceChange = 0
      }

      // Apply balance change
      runningBalance = Math.max(0, runningBalance + balanceChange)
    }

    const channel = (type === "stock_out" || type === "return") ? randomChannel() : undefined

    // Generate reference IDs based on transaction type
    let referenceId: string | undefined
    if (type === "stock_out" || type === "return") {
      referenceId = `ORD-${Math.floor(Math.random() * 10000)}`
    } else if (type === "transfer") {
      referenceId = `TRF-${Math.floor(Math.random() * 10000)}`
    } else if (type === "allocation") {
      referenceId = allocationType === "order"
        ? `ORD-${Math.floor(Math.random() * 10000)}`
        : `ALLOC-${Math.floor(Math.random() * 10000)}`
    } else if (type === "stock_in") {
      // 50% chance of having a PO reference
      if (Math.random() > 0.5) {
        referenceId = `PO-${Math.floor(Math.random() * 10000)}`
      }
    }

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
      transferFrom,
      transferTo,
      allocationType,
    })
  }

  // Return in reverse chronological order (most recent first) for display
  return transactions.reverse()
}

/**
 * Get warehouse codes associated with a store
 * Maps store names to the warehouse codes used by items in that store
 * @param storeName - The Tops store name
 * @returns Array of warehouse codes associated with the store, or empty array if store not found
 */
export function getWarehouseCodesForStore(storeName: string): string[] {
  // Find all items for this store
  const storeItems = mockInventoryItems.filter(item => item.storeName === storeName)

  if (storeItems.length === 0) {
    return []
  }

  // Collect all unique warehouse codes from the store's items
  const warehouseCodes = new Set<string>()

  storeItems.forEach(item => {
    if (item.warehouseLocations && item.warehouseLocations.length > 0) {
      item.warehouseLocations.forEach(location => {
        if (location.warehouseCode) {
          warehouseCodes.add(location.warehouseCode)
        }
      })
    }
  })

  return Array.from(warehouseCodes)
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
    transfer: [
      "Inter-warehouse transfer",
      "Store replenishment",
      "Distribution center transfer",
      "Regional rebalancing",
    ],
    allocation: [
      "Order reservation",
      "Customer hold request",
      "Promotional campaign reserve",
      "Pre-order allocation",
    ],
  }

  const typeNotes = notes[type] || ["Transaction processed"]
  return typeNotes[Math.floor(Math.random() * typeNotes.length)]
}

/**
 * Filter mock transactions with pagination, date range, and type filtering
 *
 * @param transactions - Array of all transactions
 * @param filters - Filter parameters
 * @returns Filtered and paginated transactions with metadata
 */
export function filterMockTransactions(
  transactions: StockTransaction[],
  filters: {
    page?: number
    pageSize?: number
    dateFrom?: string
    dateTo?: string
    transactionType?: TransactionType | "all"
  }
): {
  transactions: StockTransaction[]
  total: number
  page: number
  pageSize: number
  totalPages: number
} {
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 25
  let filtered = [...transactions]

  // Apply date range filter
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom)
    fromDate.setHours(0, 0, 0, 0)
    filtered = filtered.filter((t) => new Date(t.timestamp) >= fromDate)
  }

  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo)
    toDate.setHours(23, 59, 59, 999)
    filtered = filtered.filter((t) => new Date(t.timestamp) <= toDate)
  }

  // Apply transaction type filter
  if (filters.transactionType && filters.transactionType !== "all") {
    filtered = filtered.filter((t) => t.type === filters.transactionType)
  }

  // Calculate pagination
  const total = filtered.length
  const totalPages = Math.ceil(total / pageSize)
  const from = (page - 1) * pageSize
  const to = from + pageSize
  const paginatedTransactions = filtered.slice(from, to)

  return {
    transactions: paginatedTransactions,
    total,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * Generate mock allocate-by-order transactions for an inventory item
 *
 * @param productId - Product identifier to generate transactions for
 * @returns Array of AllocateByOrderTransaction objects
 */
export function generateMockAllocateTransactions(productId: string): AllocateByOrderTransaction[] {
  const item = mockInventoryItems.find((i) => i.id === productId || i.productId === productId)
  if (!item) return []

  const transactions: AllocateByOrderTransaction[] = []

  // Use product ID to seed deterministic but varied results
  const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const transactionCount = 5 + (seed % 6) // 5-10 transactions

  const users = [
    { id: "USR-001", name: "John Smith" },
    { id: "USR-002", name: "Sarah Johnson" },
    { id: "USR-003", name: "Mike Chen" },
    { id: "USR-004", name: "Lisa Wong" },
    { id: "USR-005", name: "David Kim" },
  ]

  const statuses: AllocateByOrderStatus[] = ["pending", "confirmed", "cancelled"]
  const statusWeights = [0.25, 0.60, 0.15] // 25% pending, 60% confirmed, 15% cancelled

  const today = new Date()

  for (let i = 0; i < transactionCount; i++) {
    // Generate deterministic but varied order number
    const orderNum = 10000 + ((seed * (i + 1) * 7) % 90000)

    // Generate timestamp (spread over last 30 days)
    const daysAgo = (seed + i * 3) % 30
    const hoursAgo = (seed + i * 5) % 24
    const timestamp = new Date(today)
    timestamp.setDate(timestamp.getDate() - daysAgo)
    timestamp.setHours(timestamp.getHours() - hoursAgo)

    // Pick warehouse from item's locations or use default
    const location = item.warehouseLocations && item.warehouseLocations.length > 0
      ? item.warehouseLocations[(seed + i) % item.warehouseLocations.length]
      : null

    const warehouseId = location?.warehouseCode || WAREHOUSE_CODES[(seed + i) % WAREHOUSE_CODES.length]

    // Map warehouse codes to readable names
    const warehouseNames: Record<string, string> = {
      "CDC-BKK01": "Bangkok Central DC",
      "CDC-BKK02": "Bangkok Central DC 2",
      "CDC-NTH01": "Northern Distribution Center",
      "CDC-STH01": "Southern Distribution Center",
      "RWH-LP": "Lat Phrao Regional Warehouse",
      "RWH-CW": "Central World Regional Warehouse",
      "RWH-SK": "Sukhumvit Regional Warehouse",
      "RWH-SL": "Silom Regional Warehouse",
      "STW-001": "Store Warehouse 001",
      "STW-002": "Store Warehouse 002",
      "STW-003": "Store Warehouse 003",
      "STW-005": "Store Warehouse 005",
      "STW-008": "Store Warehouse 008",
      "STW-010": "Store Warehouse 010",
      "FDC-BKK": "Fresh Food DC Bangkok",
      "FDC-PRV": "Fresh Food DC Provincial",
      "CMG": "Central Mega",
      "TPS-1005": "Tops 1005",
      "TPS-1055": "Tops 1055",
      "TPS-2001": "Tops 2001",
      "TPS-2002": "Tops 2002",
    }
    const warehouseName = warehouseNames[warehouseId] || warehouseId

    // Determine status based on weighted random
    const statusRand = ((seed + i * 11) % 100) / 100
    let status: AllocateByOrderStatus
    if (statusRand < statusWeights[0]) {
      status = "pending"
    } else if (statusRand < statusWeights[0] + statusWeights[1]) {
      status = "confirmed"
    } else {
      status = "cancelled"
    }

    // Pick user
    const user = users[(seed + i) % users.length]

    // Generate quantity (1-20 for unit items, 0.5-10kg for weight items)
    const baseQuantity = 1 + ((seed + i * 13) % 20)
    const quantity = (item.itemType === "weight" || item.itemType === "pack_weight")
      ? parseFloat((baseQuantity * 0.5).toFixed(3))
      : baseQuantity

    transactions.push({
      id: `ALLOC-${productId}-${i.toString().padStart(3, '0')}`,
      order_id: orderNum.toString(),
      order_no: `ORD-${orderNum}`,
      allocated_at: timestamp.toISOString(),
      quantity,
      warehouse_id: warehouseId,
      warehouse_name: warehouseName,
      status,
      allocated_by: user.id,
      allocated_by_name: user.name,
    })
  }

  // Sort by most recent first
  transactions.sort((a, b) => new Date(b.allocated_at).getTime() - new Date(a.allocated_at).getTime())

  return transactions
}
