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
  TransactionType
} from "@/types/inventory"

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
 * Mock inventory items (20+ items across different categories and stores)
 */
export const mockInventoryItems: InventoryItem[] = [
  // Produce
  {
    id: "INV-001",
    productId: "PROD-001",
    productName: "Fresh Vegetables Mix",
    category: "Produce",
    storeName: "Tops Central World",
    currentStock: 245,
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
  },
  {
    id: "INV-002",
    productId: "PROD-002",
    productName: "Organic Apples",
    category: "Produce",
    storeName: "Tops สุขุมวิท 39",
    currentStock: 189,
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
  },
  {
    id: "INV-003",
    productId: "PROD-003",
    productName: "Fresh Tomatoes",
    category: "Produce",
    storeName: "Tops ทองหล่อ",
    currentStock: 67,
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
  },

  // Dairy
  {
    id: "INV-004",
    productId: "PROD-004",
    productName: "Organic Milk 1L",
    category: "Dairy",
    storeName: "Tops สีลม คอมเพล็กซ์",
    currentStock: 78,
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
  },
  {
    id: "INV-005",
    productId: "PROD-005",
    productName: "Greek Yogurt 500g",
    category: "Dairy",
    storeName: "Tops เอกมัย",
    currentStock: 145,
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
  },
  {
    id: "INV-006",
    productId: "PROD-006",
    productName: "Cheese Slices 200g",
    category: "Dairy",
    storeName: "Tops พร้อมพงษ์",
    currentStock: 234,
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
  },

  // Bakery
  {
    id: "INV-007",
    productId: "PROD-007",
    productName: "Whole Wheat Bread",
    category: "Bakery",
    storeName: "Tops จตุจักร",
    currentStock: 45,
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
  },
  {
    id: "INV-008",
    productId: "PROD-008",
    productName: "Croissants Pack of 6",
    category: "Bakery",
    storeName: "Tops Central Plaza ลาดพร้าว",
    currentStock: 89,
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
  },

  // Meat
  {
    id: "INV-009",
    productId: "PROD-009",
    productName: "Chicken Breast 500g",
    category: "Meat",
    storeName: "Tops Central World",
    currentStock: 156,
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
  },
  {
    id: "INV-010",
    productId: "PROD-010",
    productName: "Pork Tenderloin 500g",
    category: "Meat",
    storeName: "Tops สุขุมวิท 39",
    currentStock: 92,
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
  },
  {
    id: "INV-011",
    productId: "PROD-011",
    productName: "Beef Sirloin 500g",
    category: "Meat",
    storeName: "Tops ทองหล่อ",
    currentStock: 38,
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
  },

  // Seafood
  {
    id: "INV-012",
    productId: "PROD-012",
    productName: "Fresh Salmon Fillet 500g",
    category: "Seafood",
    storeName: "Tops สีลม คอมเพล็กซ์",
    currentStock: 67,
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
  },
  {
    id: "INV-013",
    productId: "PROD-013",
    productName: "Prawns 500g",
    category: "Seafood",
    storeName: "Tops เอกมัย",
    currentStock: 124,
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
  },

  // Pantry
  {
    id: "INV-014",
    productId: "PROD-014",
    productName: "Pasta Collection",
    category: "Pantry",
    storeName: "Tops พร้อมพงษ์",
    currentStock: 289,
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
  },
  {
    id: "INV-015",
    productId: "PROD-015",
    productName: "Premium Rice 5kg",
    category: "Pantry",
    storeName: "Tops จตุจักร",
    currentStock: 178,
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
  },

  // Frozen
  {
    id: "INV-016",
    productId: "PROD-016",
    productName: "Frozen Pizza",
    category: "Frozen",
    storeName: "Tops Central Plaza ลาดพร้าว",
    currentStock: 95,
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
  },
  {
    id: "INV-017",
    productId: "PROD-017",
    productName: "Ice Cream Variety Pack",
    category: "Frozen",
    storeName: "Tops Central World",
    currentStock: 56,
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
  },

  // Beverages
  {
    id: "INV-018",
    productId: "PROD-018",
    productName: "Orange Juice 1L",
    category: "Beverages",
    storeName: "Tops สุขุมวิท 39",
    currentStock: 167,
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
  },
  {
    id: "INV-019",
    productId: "PROD-019",
    productName: "Mineral Water 24 Pack",
    category: "Beverages",
    storeName: "Tops ทองหล่อ",
    currentStock: 312,
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
  },

  // Snacks
  {
    id: "INV-020",
    productId: "PROD-020",
    productName: "Potato Chips Variety",
    category: "Snacks",
    storeName: "Tops สีลม คอมเพล็กซ์",
    currentStock: 134,
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
  },
  {
    id: "INV-021",
    productId: "PROD-021",
    productName: "Mixed Nuts 500g",
    category: "Snacks",
    storeName: "Tops เอกมัย",
    currentStock: 43,
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
  },

  // Household
  {
    id: "INV-022",
    productId: "PROD-022",
    productName: "Laundry Detergent 2L",
    category: "Household",
    storeName: "Tops พร้อมพงษ์",
    currentStock: 198,
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
  },
  {
    id: "INV-023",
    productId: "PROD-023",
    productName: "Dish Soap 500ml",
    category: "Household",
    storeName: "Tops จตุจักร",
    currentStock: 87,
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
  },
  {
    id: "INV-024",
    productId: "PROD-024",
    productName: "Toilet Paper 12 Pack",
    category: "Household",
    storeName: "Tops Central Plaza ลาดพร้าว",
    currentStock: 62,
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
  },
]

/**
 * Mock store performance data for all 8 Tops stores
 */
export const mockStorePerformance: StorePerformance[] = [
  {
    storeName: "Tops Central World",
    totalProducts: 1245,
    lowStockItems: 12,
    criticalStockItems: 3,
    totalValue: 2847500,
    healthScore: 94.5,
  },
  {
    storeName: "Tops สุขุมวิท 39",
    totalProducts: 987,
    lowStockItems: 18,
    criticalStockItems: 5,
    totalValue: 2156300,
    healthScore: 89.2,
  },
  {
    storeName: "Tops ทองหล่อ",
    totalProducts: 856,
    lowStockItems: 24,
    criticalStockItems: 8,
    totalValue: 1874500,
    healthScore: 85.3,
  },
  {
    storeName: "Tops สีลม คอมเพล็กซ์",
    totalProducts: 743,
    lowStockItems: 15,
    criticalStockItems: 4,
    totalValue: 1642300,
    healthScore: 91.1,
  },
  {
    storeName: "Tops เอกมัย",
    totalProducts: 1089,
    lowStockItems: 14,
    criticalStockItems: 6,
    totalValue: 2534800,
    healthScore: 92.3,
  },
  {
    storeName: "Tops พร้อมพงษ์",
    totalProducts: 678,
    lowStockItems: 21,
    criticalStockItems: 7,
    totalValue: 1487600,
    healthScore: 87.8,
  },
  {
    storeName: "Tops จตุจักร",
    totalProducts: 923,
    lowStockItems: 16,
    criticalStockItems: 5,
    totalValue: 2034700,
    healthScore: 90.5,
  },
  {
    storeName: "Tops Central Plaza ลาดพร้าว",
    totalProducts: 1134,
    lowStockItems: 19,
    criticalStockItems: 4,
    totalValue: 2645900,
    healthScore: 88.9,
  },
]

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
 */
export function generateMockTransactions(productId: string): StockTransaction[] {
  const item = mockInventoryItems.find((i) => i.id === productId || i.productId === productId)
  if (!item) return []

  const transactions: StockTransaction[] = []
  const transactionCount = 10 + Math.floor(Math.random() * 10) // 10-20 transactions
  const today = new Date()

  const transactionTypes: TransactionType[] = ["stock_in", "stock_out", "adjustment", "spoilage", "return"]
  const users = ["John Smith", "Sarah Johnson", "Mike Chen", "Lisa Wong", "David Kim"]

  let currentBalance = item.currentStock

  for (let i = 0; i < transactionCount; i++) {
    const daysAgo = Math.floor(Math.random() * 60) // Last 60 days
    const timestamp = new Date(today)
    timestamp.setDate(timestamp.getDate() - daysAgo)
    timestamp.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))

    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)]
    let quantity: number

    // Determine quantity based on type
    switch (type) {
      case "stock_in":
        quantity = Math.floor(Math.random() * 100) + 50 // 50-150 units
        break
      case "stock_out":
        quantity = -(Math.floor(Math.random() * 50) + 10) // -10 to -60 units
        break
      case "adjustment":
        quantity = Math.floor(Math.random() * 20) - 10 // -10 to +10 units
        break
      case "spoilage":
        quantity = -(Math.floor(Math.random() * 10) + 1) // -1 to -10 units
        break
      case "return":
        quantity = Math.floor(Math.random() * 15) + 5 // 5-20 units
        break
      default:
        quantity = 0
    }

    const user = users[Math.floor(Math.random() * users.length)]

    transactions.push({
      id: `TXN-${item.productId}-${i.toString().padStart(3, '0')}`,
      productId: item.productId,
      productName: item.productName,
      type,
      quantity: Math.abs(quantity),
      balanceAfter: currentBalance,
      timestamp: timestamp.toISOString(),
      user,
      notes: generateTransactionNotes(type),
      referenceId: type === "stock_out" ? `ORD-${Math.floor(Math.random() * 10000)}` : undefined,
    })

    // Update balance for previous transactions (going backwards in time)
    currentBalance -= quantity
  }

  // Sort by timestamp (most recent first)
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
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
    spoilage: [
      "Expired items removed",
      "Quality control rejection",
      "Damaged goods",
      "Best before date passed",
    ],
    return: [
      "Customer return",
      "Supplier return credit",
      "Order cancellation",
      "Defective item return",
    ],
  }

  const typeNotes = notes[type] || ["Transaction processed"]
  return typeNotes[Math.floor(Math.random() * typeNotes.length)]
}
