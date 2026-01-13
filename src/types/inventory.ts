/**
 * TypeScript type definitions for Inventory Management Domain
 *
 * These types define the structure of inventory data used throughout the application.
 * They support both database (Supabase) and mock data sources following the dual data strategy.
 *
 * @remarks
 * Terminology follows industry-standard inventory management conventions.
 * Field names are chosen to be self-documenting and align with user-facing labels.
 * For detailed terminology guidelines, see docs/inventory-terminology-standards.md
 */

/**
 * Status levels for inventory items based on available stock vs safety stock
 *
 * @remarks
 * Status is determined by comparing availableStock to safetyStock and zero:
 * - "healthy": availableStock > safetyStock (stock is above safety buffer)
 * - "low": 0 < availableStock <= safetyStock (stock below safety threshold)
 * - "critical": availableStock === 0 (out of stock)
 *
 * User-facing labels:
 * - healthy → "In Stock" (green badge)
 * - low → "Low Stock" (yellow badge)
 * - critical → "Out of Stock" (red badge)
 */
export type InventoryStatus = "healthy" | "low" | "critical"

/**
 * Product categories available in the inventory system
 */
export type ProductCategory = "Produce" | "Dairy" | "Bakery" | "Meat" | "Seafood" | "Pantry" | "Frozen" | "Beverages" | "Snacks" | "Household"

/**
 * Sales channels where products can be sold
 */
export type Channel = "store" | "website" | "Grab" | "LINE MAN" | "Gokoo"

/**
 * Supply type indicating product availability method
 * - "On Hand Available": Product is available from current inventory
 * - "Pre-Order": Product requires pre-ordering before availability
 */
export type SupplyType = "On Hand Available" | "Pre-Order"

/**
 * Stock configuration status
 * - "valid": Stock configuration is correct and complete
 * - "invalid": Stock configuration has errors
 * - "unconfigured": Stock has not been configured yet
 */
export type StockConfigStatus = "valid" | "invalid" | "unconfigured"

/**
 * Inventory view types for mandatory view filtering
 * User must select a view before inventory data is displayed
 */
export type InventoryViewType =
  | "all-inventory"
  | "available-stock"
  | "low-stock"
  | "out-of-stock"
  | "reserved-stock"
  | "damaged-quarantine"
  | "by-warehouse"
  | "by-channel"

/**
 * Item type indicating how items are measured and sold
 * - "weight": Items sold by weight (kg) - displayed with 3 decimals (e.g., loose produce, bulk goods)
 * - "pack_weight": Pre-packed items sold by weight (kg) - displayed with 3 decimals (e.g., pre-packed meat, cheese)
 * - "pack": Pre-packed items sold by unit - displayed as integers (e.g., boxes, cartons)
 * - "normal": Standard items sold by piece/unit - displayed as integers (e.g., bottles, cans)
 */
export type ItemType = "weight" | "pack_weight" | "pack" | "normal"

/**
 * Stock status types for warehouse location tracking
 *
 * @remarks
 * These are INTERNAL statuses for granular warehouse management and should NOT be
 * exposed directly in user-facing UI. Instead, aggregate these into user-friendly terms:
 * - User-facing "Available Stock" = stock
 * - User-facing "Reserved Stock" = in_process + sold + on_hold
 *
 * Status Details:
 * - "stock": Available for immediate sale (ready to pick)
 * - "in_process": Currently being picked/packed for orders (allocated but not shipped)
 * - "sold": Sold but not yet shipped (order confirmed, awaiting pickup/delivery)
 * - "on_hold": Reserved for future orders or pending quality checks
 * - "pending": Incoming stock or pending restocking (not yet available)
 *
 * @see {@link StockLocation} for how these statuses are used in warehouse locations
 */
export type StockStatus = "stock" | "in_process" | "sold" | "on_hold" | "pending"

/**
 * Warehouse location information
 */
export interface WarehouseLocation {
  warehouseCode: string
  locationCode: string
  isDefaultLocation: boolean
}

/**
 * Stock breakdown by status for a specific warehouse location
 */
export interface StockLocationBreakdown {
  warehouseCode: string
  locationCode: string
  stockStatus: Record<StockStatus, number>
}

/**
 * Stock location combining warehouse info and stock counts by status
 *
 * @remarks
 * Represents stock breakdown for a specific warehouse location (e.g., WH01-A-05-12).
 *
 * Stock Calculation Rules:
 * - Total Stock at Location = stockAvailable + stockInProcess + stockSold + stockOnHold + stockPending
 * - Active Stock (for picking) = stockAvailable only
 * - Reserved Stock = stockInProcess + stockSold + stockOnHold
 *
 * Default Location:
 * - isDefaultLocation=true indicates the primary picking location for this product
 * - Used for optimizing pick routes and stock allocation
 */
export interface StockLocation extends WarehouseLocation {
  /** Stock available for immediate sale - maps to "Available Stock" in UI */
  stockAvailable: number
  /** Stock currently being picked/packed - part of "Reserved Stock" */
  stockInProcess: number
  /** Stock sold but not yet shipped - part of "Reserved Stock" */
  stockSold: number
  /** Stock reserved for future orders - part of "Reserved Stock" */
  stockOnHold: number
  /** Incoming stock not yet available - shown separately */
  stockPending: number
  /** Damaged/expired stock - not available for sale */
  stockUnusable?: number
  /** Safety stock threshold for this location - minimum buffer level */
  stockSafetyStock?: number
  /** Location operational status - indicates if the location is currently active */
  locationStatus?: 'Active' | 'Inactive'
}

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
 *
 * @remarks
 * Core inventory object representing a product at a specific store location.
 *
 * Key Field Relationships:
 * - currentStock = availableStock + reservedStock (total physical stock)
 * - reservedStock = currentStock - availableStock (calculated field)
 * - status is determined by comparing availableStock to safetyStock
 * - reorderPoint triggers replenishment when currentStock falls below it
 *
 * Stock Level Thresholds:
 * - maxStockLevel: Maximum capacity (e.g., shelf space limit)
 * - reorderPoint: Trigger for reordering (typically safetyStock + lead time demand)
 * - safetyStock: Minimum buffer (typically 10-20% of maxStockLevel)
 * - minStockLevel: Absolute minimum before critical alerts
 */
export interface InventoryItem {
  id: string
  /** Internal product identifier (also known as SKU - Stock Keeping Unit) */
  productId: string
  productName: string
  category: ProductCategory
  storeName: TopsStore

  /** Total physical stock on hand (Available + Reserved). Also known as "Stock on Hand" */
  currentStock: number

  /** Stock available for sale (not reserved/allocated). Must be ≤ currentStock.
   * Displayed in UI as "Available Stock" with green indicator. */
  availableStock: number

  /** Stock allocated to pending orders (calculated as currentStock - availableStock).
   * Also known as "Allocated Stock" or "Committed Stock".
   * Displayed in UI as "Reserved Stock" with orange indicator. */
  reservedStock: number

  /** Minimum buffer quantity to prevent stockouts (typically 10-20% of max stock level).
   * Triggers "Low Stock" status when availableStock falls below this threshold.
   * Displayed in UI as "Safety Stock" with blue indicator. */
  safetyStock: number

  /** Absolute minimum stock level before critical alerts */
  minStockLevel: number

  /** Maximum stock capacity (shelf space, storage limit) */
  maxStockLevel: number

  unitPrice: number
  lastRestocked: string // ISO 8601 timestamp

  /** Inventory status based on available stock vs safety threshold
   * @see {@link InventoryStatus} for status determination rules */
  status: InventoryStatus

  supplier: string

  /** Stock level that triggers replenishment order
   * Formula: (Average Daily Usage × Lead Time) + Safety Stock
   * Also known as "ROP" (Reorder Point) */
  reorderPoint: number

  demandForecast: number

  /** Product image URL */
  imageUrl: string

  /** Physical barcode on product (EAN-13, UPC, etc.). Optional - falls back to productId */
  barcode?: string

  /** Item type indicating measurement method (weight or unit)
   * @see {@link ItemType} for formatting rules */
  itemType: ItemType

  /** Warehouse locations with detailed stock breakdown by status
   * @see {@link StockLocation} for location-level stock details */
  warehouseLocations?: StockLocation[]

  /** Product brand (e.g., "CP", "Betagro", "Thai Union") */
  brand?: string

  /** Sales channels where product is available */
  channels?: Channel[]

  /** Supply type indicating availability method */
  supplyType?: SupplyType

  /** Stock configuration status */
  stockConfigStatus?: StockConfigStatus

  /** Business unit / organization (e.g., "CRC", "CFR", "CFM", "DS") */
  businessUnit?: string

  /** View configuration (e.g., ECOM-TH-CFR-LOCD-STD, MKP-TH-SSP-NW-STD) */
  view?: string
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
  /** Store operational status - indicates if the store is currently active */
  storeStatus?: 'Active' | 'Inactive'
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
  warehouseCode?: string | "all"
  itemType?: "weight" | "unit" | "all"
  status?: InventoryStatus | "all"
  searchQuery?: string
  page?: number
  pageSize?: number
  sortBy?: "productName" | "brand" | "currentStock" | "status" | "lastRestocked"
  sortOrder?: "asc" | "desc"
  /** Filter by brand */
  brand?: string | "all"
  /** Filter by sales channels */
  channels?: Channel[]
  /** Filter by business unit / organization */
  businessUnit?: string
  /** Filter by view configuration */
  view?: string | "all"
  /** Mandatory inventory view selection */
  inventoryView?: InventoryViewType
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
 *
 * @remarks
 * Standard inventory transaction types following industry conventions:
 *
 * - "stock_in": Inbound stock (receiving, restocking). Also known as "Goods Receipt"
 * - "stock_out": Outbound stock (sales, shipments). Also known as "Goods Issue"
 * - "adjustment": Inventory corrections (recount, damage, expiry, theft)
 * - "return": Customer or supplier returns (reverse transaction)
 * - "transfer": Stock movement between warehouses/locations
 * - "allocation": Stock reserved/allocated for specific orders or purposes
 */
export type TransactionType = "stock_in" | "stock_out" | "adjustment" | "return" | "transfer" | "allocation"

/**
 * Stock transaction record
 *
 * @remarks
 * Represents a single stock movement with full audit trail.
 *
 * Transaction Impact:
 * - stock_in: Increases availableStock by quantity
 * - stock_out: Decreases availableStock by quantity
 * - adjustment: Can increase or decrease (quantity can be negative)
 * - return: Increases availableStock (reverses previous stock_out)
 * - transfer: Decreases at source, increases at destination
 * - allocation: Reserves stock for specific purpose (decreases available)
 *
 * Reference IDs:
 * - For stock_out with referenceId: Links to order (e.g., "ORD-12345")
 * - For return with referenceId: Links to original order
 * - For stock_in with referenceId: Links to PO or supplier invoice
 * - For transfer with referenceId: Links to transfer document (e.g., "TRF-12345")
 * - For allocation with referenceId: Links to order or allocation request
 */
export interface StockTransaction {
  id: string
  productId: string
  productName: string

  /** Transaction type - determines stock impact direction */
  type: TransactionType

  /** Quantity moved (always positive; direction determined by type) */
  quantity: number

  /** Available stock balance after this transaction */
  balanceAfter: number

  /** Transaction timestamp in ISO 8601 format */
  timestamp: string

  /** User who performed the transaction */
  user: string

  /** Optional transaction notes or reason */
  notes?: string

  /** Reference to related order, PO, or document */
  referenceId?: string

  /** Warehouse location code where transaction occurred */
  warehouseCode?: string

  /** Specific location within warehouse (bin location) */
  locationCode?: string

  /** Sales channel for stock_out transactions (Grab, Lineman, Gokoo) */
  channel?: "Grab" | "Lineman" | "Gokoo"

  /** Item type for proper quantity formatting in UI */
  itemType?: ItemType

  /** Source warehouse for transfer transactions */
  transferFrom?: string

  /** Destination warehouse for transfer transactions */
  transferTo?: string

  /** Type of allocation for allocation transactions */
  allocationType?: "order" | "hold" | "reserve"
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
 *   available_stock INTEGER,
 *   reserved_stock INTEGER,
 *   safety_stock INTEGER,
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
 *   item_type VARCHAR(50) CHECK (item_type IN ('weight', 'unit')),
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
  available_stock: number
  reserved_stock?: number
  safety_stock?: number
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
  item_type?: string
  created_at?: string
  updated_at?: string
}

/**
 * Status types for allocate-by-order transactions
 */
export type AllocateByOrderStatus = "pending" | "confirmed" | "cancelled"

/**
 * Allocate by Order Transaction record
 *
 * @remarks
 * Represents a stock allocation tied to a specific order.
 * These transactions track how inventory is allocated to fulfill customer orders.
 *
 * Workflow:
 * - pending: Allocation created, awaiting confirmation
 * - confirmed: Allocation confirmed and stock reserved
 * - cancelled: Allocation cancelled, stock returned to available
 */
export interface AllocateByOrderTransaction {
  /** Unique transaction identifier */
  id: string
  /** Order ID for linking to order details */
  order_id: string
  /** Human-readable order number (e.g., "ORD-12345") */
  order_no: string
  /** Timestamp when allocation was made (ISO 8601 format) */
  allocated_at: string
  /** Quantity of items allocated */
  quantity: number
  /** Warehouse ID where stock is allocated from */
  warehouse_id: string
  /** Human-readable warehouse name */
  warehouse_name: string
  /** Current status of the allocation */
  status: AllocateByOrderStatus
  /** User ID who performed the allocation */
  allocated_by: string
  /** Human-readable name of user who performed the allocation */
  allocated_by_name: string
}

/**
 * Filter parameters for transaction history queries
 */
export interface TransactionHistoryFilters {
  /** Page number (1-indexed) */
  page?: number
  /** Number of items per page */
  pageSize?: number
  /** Start date for filtering (ISO 8601 format) */
  dateFrom?: string
  /** End date for filtering (ISO 8601 format) */
  dateTo?: string
  /** Filter by transaction type */
  transactionType?: TransactionType | "all"
}

/**
 * Response structure for paginated transaction history
 */
export interface TransactionHistoryResponse {
  /** Array of transactions */
  transactions: StockTransaction[]
  /** Total number of transactions matching filters */
  total: number
  /** Current page number */
  page: number
  /** Number of items per page */
  pageSize: number
  /** Total number of pages */
  totalPages: number
}
