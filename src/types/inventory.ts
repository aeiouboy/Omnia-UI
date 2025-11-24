/**
 * TypeScript type definitions for Inventory Management Domain
 *
 * These types define the structure of inventory data used throughout the application.
 * They support both database (Supabase) and mock data sources following the dual data strategy.
 */

/**
 * Status levels for inventory items
 */
export type InventoryStatus = "healthy" | "low" | "critical"

/**
 * Product categories available in the inventory system
 */
export type ProductCategory = "Produce" | "Dairy" | "Bakery" | "Meat" | "Seafood" | "Pantry" | "Frozen" | "Beverages" | "Snacks" | "Household"

/**
 * Tops store locations
 * Must match the official store names from CLAUDE.md
 */
export type TopsStore =
  | "Tops Central Plaza ลาดพร้าว"
  | "Tops Central World"
  | "Tops สุขุมวิท 39"
  | "Tops ทองหล่อ"
  | "Tops สีลม คอมเพล็กซ์"
  | "Tops เอกมัย"
  | "Tops พร้อมพงษ์"
  | "Tops จตุจักร"

/**
 * Main inventory item structure
 */
export interface InventoryItem {
  id: string
  productId: string
  productName: string
  category: ProductCategory
  storeName: TopsStore
  currentStock: number
  minStockLevel: number
  maxStockLevel: number
  unitPrice: number
  lastRestocked: string // ISO 8601 timestamp
  status: InventoryStatus
  supplier: string
  reorderPoint: number
  demandForecast: number
  imageUrl: string // Product image URL
  barcode?: string // Optional barcode
}

/**
 * Store performance metrics
 */
export interface StorePerformance {
  storeName: TopsStore
  totalProducts: number
  lowStockItems: number
  criticalStockItems: number
  totalValue: number
  healthScore: number
}

/**
 * Stock alert information for critical/low stock items
 */
export interface StockAlert {
  id: string
  productId: string
  productName: string
  storeName: TopsStore
  currentStock: number
  reorderPoint: number
  status: InventoryStatus
  severity: "critical" | "warning"
  message: string
  createdAt: string // ISO 8601 timestamp
}

/**
 * Filter parameters for inventory queries
 */
export interface InventoryFilters {
  category?: ProductCategory | "all"
  storeName?: TopsStore | "all"
  status?: InventoryStatus | "all"
  searchQuery?: string
  page?: number
  pageSize?: number
  sortBy?: "productName" | "currentStock" | "status" | "lastRestocked"
  sortOrder?: "asc" | "desc"
}

/**
 * Response structure for paginated inventory data
 */
export interface InventoryDataResponse {
  items: InventoryItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Response structure for store performance data
 */
export interface StorePerformanceResponse {
  stores: StorePerformance[]
  total: number
}

/**
 * Response structure for stock alerts
 */
export interface StockAlertsResponse {
  alerts: StockAlert[]
  total: number
  criticalCount: number
  warningCount: number
}

/**
 * Transaction types for stock movements
 */
export type TransactionType = "stock_in" | "stock_out" | "adjustment" | "spoilage" | "return"

/**
 * Stock transaction record
 */
export interface StockTransaction {
  id: string
  productId: string
  productName: string
  type: TransactionType
  quantity: number
  balanceAfter: number
  timestamp: string // ISO 8601
  user: string
  notes?: string
  referenceId?: string // Order ID or PO ID
}

/**
 * Stock history data point for charts
 */
export interface StockHistoryPoint {
  date: string // ISO 8601 or formatted date
  stock: number
  minLevel: number
  reorderPoint: number
}

/**
 * Database schema for inventory_items table (Supabase)
 *
 * CREATE TABLE inventory_items (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   product_id VARCHAR(50) NOT NULL,
 *   product_name VARCHAR(255) NOT NULL,
 *   category VARCHAR(100),
 *   store_name VARCHAR(255),
 *   current_stock INTEGER,
 *   min_stock_level INTEGER,
 *   max_stock_level INTEGER,
 *   unit_price DECIMAL(10,2),
 *   last_restocked TIMESTAMP,
 *   status VARCHAR(50),
 *   supplier VARCHAR(255),
 *   reorder_point INTEGER,
 *   demand_forecast INTEGER,
 *   image_url VARCHAR(500),
 *   barcode VARCHAR(100),
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   updated_at TIMESTAMP DEFAULT NOW()
 * );
 */
export interface InventoryItemDB {
  id: string
  product_id: string
  product_name: string
  category: string
  store_name: string
  current_stock: number
  min_stock_level: number
  max_stock_level: number
  unit_price: number
  last_restocked: string
  status: string
  supplier: string
  reorder_point: number
  demand_forecast: number
  image_url?: string
  barcode?: string
  created_at?: string
  updated_at?: string
}
