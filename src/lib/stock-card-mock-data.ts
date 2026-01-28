/**
 * Mock Data Generator for Stock Card By Product View
 *
 * Generates realistic transaction history for product-level stock tracking.
 */

/**
 * Product transaction types for stock card view
 */
export type ProductTransactionType =
  | "RECEIPT_IN"
  | "ISSUE_OUT"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "ADJUSTMENT_PLUS"
  | "ADJUSTMENT_MINUS"
  | "RETURN"

/**
 * Product transaction record
 */
export interface ProductTransaction {
  id: string
  productId: string
  productName: string
  type: ProductTransactionType
  quantity: number
  balance: number
  timestamp: string
  referenceNo: string
  notes: string
  storeName: string
  storeId: string
  personName: string
  merchantSku: string
}

/**
 * Product summary statistics
 */
export interface ProductSummary {
  productId: string
  productName: string
  openingBalance: number
  totalIn: number
  totalOut: number
  currentBalance: number
}

/**
 * Store stock overview for By Store view
 */
export interface StoreStockOverview {
  storeId: string
  storeName: string
  totalProducts: number
  lowStock: number
  outOfStock: number
}

// Transaction type reference number prefixes
const REFERENCE_PREFIXES: Record<ProductTransactionType, string> = {
  RECEIPT_IN: "PO-",
  ISSUE_OUT: "SO-",
  TRANSFER_IN: "TRF-",
  TRANSFER_OUT: "TRF-",
  ADJUSTMENT_PLUS: "ADJ-",
  ADJUSTMENT_MINUS: "ADJ-",
  RETURN: "RET-",
}

// Store data for transaction records (using Thai names as per wireframe spec)
const STORE_DATA: { storeName: string; storeId: string }[] = [
  { storeName: "Tops Central World", storeId: "ST001" },
  { storeName: "Tops Central Plaza ลาดพร้าว", storeId: "ST002" },
  { storeName: "Tops สุขุมวิท 39", storeId: "ST003" },
  { storeName: "Tops ทองหล่อ", storeId: "ST004" },
  { storeName: "Tops สีลม คอมเพล็กซ์", storeId: "ST005" },
  { storeName: "Tops เอกมัย", storeId: "ST006" },
  { storeName: "Tops พร้อมพงษ์", storeId: "ST007" },
  { storeName: "Tops จตุจักร", storeId: "ST008" },
]

// Export store data for use in overview
export { STORE_DATA }

// Person names for transaction records
const PERSON_NAMES: string[] = [
  "Amy Wang",
  "Lisa Wong",
  "Sarah Johnson",
  "John Chen",
  "Mike Davis",
  "Emily Zhang",
  "David Lee",
  "Anna Kim",
]

// Order references for linking in notes
const ORDER_REFERENCES: string[] = [
  "ORD-4343",
  "ORD-3779",
  "ORD-5521",
  "ORD-6812",
  "ORD-2987",
  "ORD-7145",
  "ORD-8234",
  "ORD-9056",
]

// Realistic notes for each transaction type
const NOTES_BY_TYPE: Record<ProductTransactionType, string[]> = {
  RECEIPT_IN: [
    "Regular replenishment",
    "Supplier delivery",
    "Weekly stock order",
    "Bulk purchase order",
    "Emergency restock",
    "Seasonal inventory prep",
  ],
  ISSUE_OUT: [
    "Grab order fulfillment",
    "LINE MAN order",
    "Gokoo delivery",
    "Walk-in customer sale",
    "Corporate order",
    "Bulk sale",
  ],
  TRANSFER_IN: [
    "From WH-01",
    "From WH-02",
    "From Central DC",
    "Inter-store transfer",
    "Redistribution",
    "Overflow transfer",
  ],
  TRANSFER_OUT: [
    "To WH-01",
    "To WH-02",
    "To Central DC",
    "Inter-store transfer",
    "Stock balancing",
    "Urgent redistribution",
  ],
  ADJUSTMENT_PLUS: [
    "Stock count correction",
    "Found misplaced stock",
    "Data entry correction",
    "Inventory reconciliation",
    "System adjustment",
  ],
  ADJUSTMENT_MINUS: [
    "Stock count correction",
    "Damaged goods",
    "Expired products",
    "Theft/shrinkage",
    "Quality rejection",
    "Data entry correction",
  ],
  RETURN: [
    "Customer return - quality issue",
    "Customer return - wrong item",
    "Supplier return credit",
    "Damaged goods returned",
    "Exchange replacement",
    "Warranty return",
  ],
}

/**
 * Generate a random number within range (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate a random element from an array
 */
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Generate a random timestamp within the given date range
 */
function randomTimestamp(dateFrom: Date, dateTo: Date): string {
  const fromTime = dateFrom.getTime()
  const toTime = dateTo.getTime()
  const randomTime = fromTime + Math.random() * (toTime - fromTime)
  return new Date(randomTime).toISOString()
}

/**
 * Generate a reference number for a transaction
 */
function generateReferenceNo(type: ProductTransactionType): string {
  const prefix = REFERENCE_PREFIXES[type]
  const number = randomInt(10000, 99999)
  return `${prefix}${number}`
}

/**
 * Get a random note for a transaction type
 */
function getRandomNote(type: ProductTransactionType): string {
  return randomElement(NOTES_BY_TYPE[type])
}

/**
 * Determine if a transaction type is inbound (increases stock)
 */
function isInboundType(type: ProductTransactionType): boolean {
  return ["RECEIPT_IN", "TRANSFER_IN", "ADJUSTMENT_PLUS", "RETURN"].includes(type)
}

/**
 * Generate mock product transactions for a specific product and date range
 */
export function generateMockProductTransactions(
  productId: string,
  productName: string,
  dateFrom: Date,
  dateTo: Date
): ProductTransaction[] {
  // Generate between 50-200 transactions
  const transactionCount = randomInt(50, 200)

  // Start with a reasonable opening balance
  const openingBalance = randomInt(500, 2000)

  // Generate consistent Merchant SKU for this product
  const merchantSku = 'MSKU-' + productId.replace(/\D/g, '').padStart(6, '0').slice(-6)

  // Transaction type weights (to make some types more common)
  const typeWeights: [ProductTransactionType, number][] = [
    ["RECEIPT_IN", 20],
    ["ISSUE_OUT", 35],
    ["TRANSFER_IN", 10],
    ["TRANSFER_OUT", 10],
    ["ADJUSTMENT_PLUS", 5],
    ["ADJUSTMENT_MINUS", 5],
    ["RETURN", 15],
  ]

  // Calculate cumulative weights for weighted random selection
  const totalWeight = typeWeights.reduce((sum, [, weight]) => sum + weight, 0)
  const cumulativeWeights: [ProductTransactionType, number][] = []
  let cumulative = 0
  for (const [type, weight] of typeWeights) {
    cumulative += weight
    cumulativeWeights.push([type, cumulative])
  }

  // Select a random transaction type based on weights
  const selectRandomType = (): ProductTransactionType => {
    const rand = Math.random() * totalWeight
    for (const [type, cumWeight] of cumulativeWeights) {
      if (rand <= cumWeight) return type
    }
    return "ISSUE_OUT" // fallback
  }

  // Generate transactions
  const transactions: ProductTransaction[] = []
  let currentBalance = openingBalance

  for (let i = 0; i < transactionCount; i++) {
    const type = selectRandomType()
    const isInbound = isInboundType(type)

    // Determine quantity based on transaction type
    let quantity: number
    if (isInbound) {
      quantity = randomInt(10, 200)
    } else {
      // For outbound, don't go below 50 units (prevent negative balance)
      const maxOut = Math.max(10, currentBalance - 50)
      quantity = randomInt(5, Math.min(maxOut, 150))
    }

    // Update balance
    if (isInbound) {
      currentBalance += quantity
    } else {
      currentBalance = Math.max(0, currentBalance - quantity)
    }

    // Get random store, person, and optionally an order reference
    const store = randomElement(STORE_DATA)
    const personName = randomElement(PERSON_NAMES)
    const baseNote = getRandomNote(type)

    // For ISSUE_OUT transactions, sometimes include an order reference in notes
    const shouldIncludeOrderRef = type === "ISSUE_OUT" && Math.random() > 0.3
    const orderRef = shouldIncludeOrderRef ? randomElement(ORDER_REFERENCES) : null
    const notes = orderRef ? `${baseNote} (${orderRef})` : baseNote

    const transaction: ProductTransaction = {
      id: `txn-${productId}-${i + 1}`,
      productId,
      productName,
      type,
      quantity,
      balance: currentBalance,
      timestamp: randomTimestamp(dateFrom, dateTo),
      referenceNo: generateReferenceNo(type),
      notes,
      storeName: store.storeName,
      storeId: store.storeId,
      personName,
      merchantSku,
    }

    transactions.push(transaction)
  }

  // Sort by timestamp (newest first)
  transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Recalculate balances based on sorted order (from oldest to newest)
  const sortedOldestFirst = [...transactions].reverse()
  let runningBalance = openingBalance
  for (const txn of sortedOldestFirst) {
    const isInbound = isInboundType(txn.type)
    if (isInbound) {
      runningBalance += txn.quantity
    } else {
      runningBalance = Math.max(0, runningBalance - txn.quantity)
    }
    txn.balance = runningBalance
  }

  return transactions
}

/**
 * Calculate product summary from transactions
 */
export function getMockProductSummary(
  productId: string,
  productName: string,
  transactions: ProductTransaction[]
): ProductSummary {
  if (transactions.length === 0) {
    return {
      productId,
      productName,
      openingBalance: 0,
      totalIn: 0,
      totalOut: 0,
      currentBalance: 0,
    }
  }

  // Sort by timestamp (oldest first) to calculate opening balance
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  // Get the oldest transaction to calculate opening balance
  const oldestTxn = sorted[0]
  const isOldestInbound = isInboundType(oldestTxn.type)
  const openingBalance = isOldestInbound
    ? oldestTxn.balance - oldestTxn.quantity
    : oldestTxn.balance + oldestTxn.quantity

  // Calculate totals
  let totalIn = 0
  let totalOut = 0

  for (const txn of transactions) {
    if (isInboundType(txn.type)) {
      totalIn += txn.quantity
    } else {
      totalOut += txn.quantity
    }
  }

  // Get current balance from newest transaction
  const newestTxn = sorted[sorted.length - 1]
  const currentBalance = newestTxn.balance

  return {
    productId,
    productName,
    openingBalance: Math.max(0, openingBalance),
    totalIn,
    totalOut,
    currentBalance,
  }
}

/**
 * Filter transactions by type
 */
export function filterTransactionsByType(
  transactions: ProductTransaction[],
  type: ProductTransactionType | "all"
): ProductTransaction[] {
  if (type === "all") return transactions
  return transactions.filter((t) => t.type === type)
}

/**
 * Filter transactions by notes search
 */
export function filterTransactionsByNotes(
  transactions: ProductTransaction[],
  searchText: string
): ProductTransaction[] {
  if (!searchText.trim()) return transactions
  const search = searchText.toLowerCase()
  return transactions.filter(
    (t) =>
      t.notes.toLowerCase().includes(search) ||
      t.referenceNo.toLowerCase().includes(search)
  )
}

/**
 * Filter transactions by merchant SKU search
 */
export function filterTransactionsByMerchantSku(
  transactions: ProductTransaction[],
  searchText: string
): ProductTransaction[] {
  if (!searchText.trim()) return transactions
  const search = searchText.toLowerCase()
  return transactions.filter((t) => t.merchantSku.toLowerCase().includes(search))
}

/**
 * Generate mock store stock overview data for By Store view
 * Returns aggregate stock metrics for all Tops store locations
 */
export function generateMockStoreOverview(): StoreStockOverview[] {
  return STORE_DATA.map((store) => ({
    storeId: store.storeId,
    storeName: store.storeName,
    totalProducts: randomInt(600, 1300),
    lowStock: randomInt(20, 55),
    outOfStock: randomInt(3, 15),
  }))
}
