# Inventory Terminology Standards

## Introduction

This document establishes standardized terminology for all inventory-related components in the Omnia UI application. Consistent terminology ensures a better user experience, reduces confusion, and maintains clarity across the entire inventory management system.

**Purpose**: Provide a single source of truth for inventory terminology used across all UI components, documentation, and communication with stakeholders.

**Scope**: All inventory-related pages, components, labels, tooltips, and documentation.

**Last Updated**: 2026-01-07
**Version**: 1.0

---

## Section 1: Terminology Audit Results

### 1.1 User-Facing Labels (UI Components)

#### Inventory List Page (`app/inventory/page.tsx`)

| Current Term | Standard Term | Status | Notes |
|-------------|---------------|--------|-------|
| "Total Products" | ✅ Standard | ✅ Correct | Clear and universally understood |
| "Low Stock Items" | ✅ Standard | ✅ Correct | Industry-standard threshold terminology |
| "Out of Stock Items" | ✅ Standard | ✅ Correct | Preferred over "Critical Stock" for clarity |
| "Stock Available / Total" | ✅ Standard | ✅ Correct | Clear column header showing ratio |
| "In Stock" (status) | ✅ Standard | ✅ Correct | Maps to "healthy" status |
| "Low Stock" (status) | ✅ Standard | ✅ Correct | Maps to "low" status |
| "Out of Stock" (status) | ✅ Standard | ✅ Correct | Maps to "critical" status |
| "Barcode" | ⚠️ vs "SKU" | ⚠️ Consider | See Section 2.3 for analysis |
| "Stock by Store" | ✅ Standard | ✅ Correct | Clear navigation label |
| "Warehouse & Location" | ✅ Standard | ✅ Correct | Hierarchical location terminology |

#### Store Overview Page (`app/inventory/stores/page.tsx`)

| Current Term | Standard Term | Status | Notes |
|-------------|---------------|--------|-------|
| "Stock by Store" | ✅ Standard | ✅ Correct | Descriptive page title |
| "Total Stores" | ✅ Standard | ✅ Correct | Clear KPI label |
| "Total Products" | ✅ Standard | ✅ Correct | Consistent with list page |
| "Stores with Low Stock" | ✅ Standard | ✅ Correct | Aggregate metric label |
| "Stores with Critical Stock" | ⚠️ vs "Out of Stock" | ⚠️ Inconsistent | See inconsistency note below |
| "Critical Stock" (card label) | ⚠️ vs "Out of Stock" | ⚠️ Inconsistent | Should align with list page |

**Inconsistency Note**: Store page uses "Critical Stock" while inventory list uses "Out of Stock" for the same status. Recommend standardizing on "Out of Stock" for user-facing labels.

#### Detail View (`src/components/inventory-detail-view.tsx`)

| Current Term | Standard Term | Status | Notes |
|-------------|---------------|--------|-------|
| "Available Stock" | ✅ Standard | ✅ Correct | Stock currently available for sale |
| "Reserved Stock" | ✅ Standard | ✅ Correct | Also known as "Allocated Stock" |
| "Safety Stock" | ✅ Standard | ✅ Correct | Minimum buffer to prevent stockouts |
| "Total Stock" | ✅ Standard | ✅ Correct | Also known as "Stock on Hand" |
| "Stock Breakdown" | ✅ Standard | ✅ Correct | Clear section header |
| "Stock by Location" | ✅ Standard | ✅ Correct | Warehouse-level breakdown |
| "Item Type" | ✅ Standard | ✅ Correct | Product classification |
| "Weight Item (kg)" | ✅ Standard | ✅ Correct | Clear measurement type |
| "Unit Item (pieces)" | ✅ Standard | ✅ Correct | Clear measurement type |

**Tooltip Descriptions (Detail View)**:
- ✅ "Stock currently available for sale to customers" - Clear and accurate
- ✅ "Stock allocated to pending orders and not available for sale" - Clear and accurate
- ✅ "Minimum buffer quantity to prevent stockouts and ensure continuity" - Excellent explanation
- ✅ "Total physical stock on hand (Available + Reserved)" - Accurate formula

#### Transaction Table (`src/components/recent-transactions-table.tsx`)

The Transaction Table displays historical stock movements with clear operation types. The "Transaction Type" column header distinguishes transaction operations (Stock In, Stock Out, Adjustment, Return) from the "Item Type" column used in the main inventory table (which shows product classifications: weight, pack, normal).

| Current Term | Standard Term | Status | Notes |
|-------------|---------------|--------|-------|
| "Recent Transactions" | ✅ Standard | ✅ Correct | Common inventory terminology |
| "Transaction Type" | ✅ Standard | ✅ Correct | Distinguishes transaction operations from Item Type in main inventory table |
| "Stock In" | ✅ Standard | ✅ Correct | Inbound stock movement |
| "Stock Out" | ✅ Standard | ✅ Correct | Outbound stock movement |
| "Adjustment" | ✅ Standard | ✅ Correct | Inventory correction |
| "Return" | ✅ Standard | ✅ Correct | Customer/supplier returns |
| "Date & Time" | ✅ Standard | ✅ Correct | Clear column header |
| "Channel" | ✅ Standard | ✅ Correct | Sales channel identifier |
| "Available" | ✅ Standard | ✅ Correct | Balance after transaction |
| "Location" | ✅ Standard | ✅ Correct | Warehouse location |

### 1.2 Type Definitions (`src/types/inventory.ts`)

#### Field Names Analysis

| Field Name | Industry Term | Status | Recommendation |
|-----------|---------------|--------|----------------|
| `productId` | SKU / Product Code | ✅ Acceptable | Consider adding JSDoc: "Also known as SKU" |
| `currentStock` | Stock on Hand / Total Stock | ✅ Acceptable | Clear in context |
| `availableStock` | Available Stock | ✅ Correct | Industry standard |
| `reservedStock` | Reserved / Allocated Stock | ✅ Correct | Industry standard |
| `safetyStock` | Safety Stock | ✅ Correct | Industry standard |
| `reorderPoint` | Reorder Point / ROP | ✅ Correct | Industry standard |
| `minStockLevel` | Minimum Stock Level | ✅ Correct | Clear terminology |
| `maxStockLevel` | Maximum Stock Level | ✅ Correct | Clear terminology |
| `warehouseCode` | Warehouse Code | ✅ Correct | Standard identifier |
| `locationCode` | Location Code / Bin Location | ✅ Correct | Standard identifier |

#### Stock Status Types

| Type Value | Industry Term | Status | JSDoc Quality |
|-----------|---------------|--------|---------------|
| `stock` | Available | ✅ Correct | ⚠️ Needs enhancement |
| `in_process` | In Picking / Allocated | ✅ Acceptable | ⚠️ Needs clarification |
| `sold` | Shipped / Fulfilled | ⚠️ Misleading | ⚠️ Should clarify "sold but not shipped" |
| `on_hold` | On Hold / Reserved | ✅ Correct | ⚠️ Needs use case examples |
| `pending` | Incoming / In Transit | ✅ Correct | ⚠️ Needs clarification |

**Note**: These internal status types are NOT exposed directly in the UI, which is correct. The UI uses clearer labels like "Available Stock" and "Reserved Stock".

---

## Section 2: Industry Standard Comparison

### 2.1 Core Inventory Terminology Alignment

| Standard Term | Application Usage | Alignment | Notes |
|--------------|-------------------|-----------|-------|
| **SKU (Stock Keeping Unit)** | `productId` + `barcode` | ✅ Partial | See Section 2.3 |
| **Available Stock** | ✅ `availableStock` | ✅ Perfect | Correctly implemented |
| **Reserved Stock** | ✅ `reservedStock` | ✅ Perfect | Also known as "Allocated" |
| **Allocated Stock** | Same as Reserved | ✅ Perfect | Terminology alternative |
| **Safety Stock** | ✅ `safetyStock` | ✅ Perfect | Minimum buffer level |
| **Reorder Point (ROP)** | ✅ `reorderPoint` | ✅ Perfect | Trigger for replenishment |
| **Stock on Hand** | `currentStock` | ✅ Acceptable | Total physical stock |
| **Lead Time** | ❌ Not present | ⚠️ Gap | Not currently tracked |
| **In Transit** | ❌ Not present | ⚠️ Gap | Not currently tracked |
| **Back Order** | ❌ Not present | ⚠️ Gap | Not applicable to retail context |
| **Economic Order Quantity (EOQ)** | ❌ Not present | ℹ️ Advanced | Not needed for current scope |

### 2.2 Transaction Terminology Alignment

| Standard Term | Application Usage | Status |
|--------------|-------------------|--------|
| **Goods Receipt** | "Stock In" | ✅ Simplified but clear |
| **Goods Issue** | "Stock Out" | ✅ Simplified but clear |
| **Stock Adjustment** | "Adjustment" | ✅ Perfect match |
| **Return** | "Return" | ✅ Perfect match |
| **Transfer** | ⚠️ Not explicit | Could be covered by Adjustment |

### 2.3 Barcode vs SKU Analysis

**Current Implementation**:
- Field name: `barcode` (optional)
- UI label: "Barcode"
- Displayed as: Barcode value or fallback to `productId`

**Industry Standard Context**:
- **SKU**: Internal product identifier (assigned by retailer)
- **Barcode**: Physical barcode on product (e.g., EAN-13, UPC)
- **Product Code**: Generic term for any product identifier

**Recommendation**: ✅ **Current implementation is CORRECT**
- The application correctly distinguishes between `productId` (internal SKU) and `barcode` (physical barcode)
- UI shows "Barcode" which is what users scan
- Fallback to `productId` when barcode not available is appropriate
- **No change needed**

---

## Section 3: Identified Issues and Inconsistencies

### 3.1 Critical Issues
**None identified** - No critical terminology issues found.

### 3.2 High Priority Issues

#### Issue H1: Status Label Inconsistency Across Pages
**Severity**: High
**Impact**: User confusion across different views

| Page | Status Label | Internal Value |
|------|-------------|----------------|
| Inventory List | "Out of Stock" | `critical` |
| Store Overview | "Critical Stock" | Same status |
| KPI Cards | "Out of Stock Items" | Same status |

**Recommendation**: Standardize on **"Out of Stock"** everywhere for user-facing labels.

**Affected Files**:
- `app/inventory/stores/page.tsx` (lines 229, 231, 236, 320)
- Maintain "Out of Stock" in `app/inventory/page.tsx` (already correct)

**Rationale**:
- "Out of Stock" is more user-friendly and universally understood
- "Critical Stock" sounds like an internal metric rather than a status
- Consistency improves user experience

### 3.3 Medium Priority Issues

#### Issue M1: JSDoc Comments Insufficient
**Severity**: Medium
**Impact**: Developer understanding and maintenance

**Current State**: Type definitions have basic JSDoc but lack:
- Industry-standard term mappings
- Calculation formulas
- Relationship explanations
- Use case examples

**Example - Current**:
```typescript
export type StockStatus = "stock" | "in_process" | "sold" | "on_hold" | "pending"
```

**Example - Enhanced**:
```typescript
/**
 * Stock status types for warehouse location tracking
 *
 * @remarks
 * These are internal statuses used for warehouse management and should NOT be
 * exposed directly in user-facing UI. Instead, use aggregate terms like
 * "Available Stock" and "Reserved Stock".
 *
 * @see {@link StockLocation} for how these statuses are aggregated
 *
 * Status Definitions:
 * - "stock" - Available for immediate sale (shown as "Available Stock" in UI)
 * - "in_process" - Currently being picked/packed for orders (part of "Reserved Stock")
 * - "sold" - Sold but not yet shipped (part of "Reserved Stock")
 * - "on_hold" - Reserved for future orders or pending quality checks
 * - "pending" - Incoming stock or pending restocking
 */
export type StockStatus = "stock" | "in_process" | "sold" | "on_hold" | "pending"
```

**Recommendation**: Enhance JSDoc comments throughout `src/types/inventory.ts` (see Section 6).

#### Issue M2: "Total Stock" vs "Stock on Hand" Clarity
**Severity**: Medium
**Impact**: Potential confusion for new users

**Current Usage**: "Total Stock" in UI
**Industry Alternative**: "Stock on Hand"

**Analysis**:
- Both terms are industry-standard and interchangeable
- "Total Stock" is simpler and more accessible
- "Stock on Hand" is more technical but precise

**Recommendation**: ✅ **Keep "Total Stock"** - it's clearer for general users and already well-implemented with good tooltip.

### 3.4 Low Priority Issues

#### Issue L1: Missing Advanced Inventory Concepts
**Severity**: Low
**Impact**: Functionality gaps for advanced inventory management

**Currently Missing**:
1. **Lead Time** - Time from order to delivery
2. **In Transit** - Stock en route to warehouse
3. **Back Order** - Customer orders pending stock availability

**Recommendation**:
- ℹ️ These are **NOT needed for current retail use case**
- Lead Time and In Transit are more relevant for manufacturing/wholesale
- Back Order is less relevant for retail grocery (items either available or not)
- Consider adding only if future requirements demand it

---

## Section 4: Terminology Standards and Guidelines

### 4.1 Standard Term Definitions

#### Primary Stock Terms

**Available Stock**
- **Definition**: Stock currently available for sale to customers
- **Calculation**: `currentStock - reservedStock`
- **UI Label**: "Available Stock"
- **Field Name**: `availableStock`
- **When to Use**: When showing stock that can be sold immediately

**Reserved Stock**
- **Definition**: Stock allocated to pending orders and not available for new sales
- **Also Known As**: Allocated Stock, Committed Stock
- **Calculation**: `currentStock - availableStock`
- **UI Label**: "Reserved Stock"
- **Field Name**: `reservedStock`
- **When to Use**: When showing stock tied to existing orders

**Safety Stock**
- **Definition**: Minimum buffer quantity to prevent stockouts and ensure continuity
- **Purpose**: Absorb demand variability and supply delays
- **Typical Value**: 10-20% of maximum stock level
- **UI Label**: "Safety Stock"
- **Field Name**: `safetyStock`
- **When to Use**: In stock planning and reorder calculations

**Total Stock**
- **Definition**: Total physical stock on hand (Available + Reserved)
- **Also Known As**: Stock on Hand, Physical Inventory
- **Calculation**: `availableStock + reservedStock`
- **UI Label**: "Total Stock"
- **Field Name**: `currentStock`
- **When to Use**: When showing total inventory value or physical count

**Reorder Point**
- **Definition**: Stock level that triggers replenishment order
- **Formula**: `(Average Daily Usage × Lead Time) + Safety Stock`
- **UI Label**: "Reorder Point"
- **Field Name**: `reorderPoint`
- **When to Use**: In automated reordering and stock alerts

#### Stock Status Terms

**In Stock**
- **Definition**: Product is available with healthy stock levels
- **Condition**: `availableStock > safetyStock`
- **UI Label**: "In Stock"
- **Badge Color**: Green
- **Internal Value**: `status: "healthy"`

**Low Stock**
- **Definition**: Stock below safety threshold but not out
- **Condition**: `0 < availableStock <= safetyStock`
- **UI Label**: "Low Stock"
- **Badge Color**: Yellow/Warning
- **Internal Value**: `status: "low"`

**Out of Stock**
- **Definition**: No available stock for sale
- **Condition**: `availableStock === 0`
- **UI Label**: "Out of Stock" (NOT "Critical Stock")
- **Badge Color**: Red
- **Internal Value**: `status: "critical"`

#### Transaction Terms

**Stock In**
- **Definition**: Inbound stock movement (receiving)
- **Also Known As**: Goods Receipt, Receipt
- **UI Label**: "Stock In"
- **Icon**: Arrow Up (↑)
- **Type Value**: `type: "stock_in"`

**Stock Out**
- **Definition**: Outbound stock movement (sale/shipment)
- **Also Known As**: Goods Issue, Shipment
- **UI Label**: "Stock Out"
- **Icon**: Arrow Down (↓)
- **Type Value**: `type: "stock_out"`

**Adjustment**
- **Definition**: Inventory correction (recount, damage, expiry)
- **Also Known As**: Stock Adjustment, Inventory Adjustment
- **UI Label**: "Adjustment"
- **Icon**: Refresh (↻)
- **Type Value**: `type: "adjustment"`

**Return**
- **Definition**: Customer or supplier return
- **UI Label**: "Return"
- **Icon**: Rotate Counter-Clockwise (↶)
- **Type Value**: `type: "return"`

#### Location Terms

**Warehouse**
- **Definition**: Physical storage facility
- **UI Label**: "Warehouse"
- **Field Name**: `warehouseCode`
- **Format**: Alphanumeric code (e.g., "WH01", "DC-BKK")

**Location**
- **Definition**: Specific storage position within warehouse
- **Also Known As**: Bin Location, Storage Location
- **UI Label**: "Location"
- **Field Name**: `locationCode`
- **Format**: Alphanumeric code (e.g., "A-01-05", "SHELF-12-B")

### 4.2 When to Use Technical vs User-Friendly Terms

#### ✅ Always Use User-Friendly Terms In:
- Page titles and headers
- Button labels
- KPI card titles
- Table column headers
- Form field labels
- Error messages
- Success messages
- Tooltips
- Help text

**Examples**:
- ✅ "Available Stock" not "Stock Available Status"
- ✅ "Out of Stock" not "Critical Inventory Status"
- ✅ "Stock In" not "Goods Receipt Transaction"

#### ⚠️ Technical Terms Acceptable In:
- API documentation
- Database schema
- Type definitions
- Internal comments
- Developer logs
- Technical documentation

**Examples**:
- ✅ `stockStatus: "in_process"` (internal)
- ✅ Display as: "Reserved Stock" (UI)

### 4.3 Consistency Guidelines

#### Rule 1: One Term, One Meaning
**Never use multiple terms for the same concept in user-facing UI**

❌ **Inconsistent**:
- KPI Card: "Out of Stock Items"
- Filter Tab: "Critical Stock"
- Status Badge: "No Stock"

✅ **Consistent**:
- KPI Card: "Out of Stock Items"
- Filter Tab: "Out of Stock"
- Status Badge: "Out of Stock"

#### Rule 2: Field Names Must Match UI Labels
**TypeScript field names should reflect the user-facing terminology**

✅ **Good Alignment**:
```typescript
// Type definition
interface InventoryItem {
  availableStock: number  // Matches UI label "Available Stock"
  reservedStock: number   // Matches UI label "Reserved Stock"
  safetyStock: number     // Matches UI label "Safety Stock"
}

// UI display
<span>Available Stock: {item.availableStock}</span>
```

❌ **Poor Alignment**:
```typescript
// Type definition
interface InventoryItem {
  qty_avail: number  // Technical abbreviation
  stock_rsv: number  // Unclear abbreviation
}

// UI display
<span>Available Stock: {item.qty_avail}</span>  // Disconnect
```

#### Rule 3: Tooltip Descriptions Must Define Terms Clearly
**Every technical term should have a plain-language explanation**

✅ **Good Tooltip**:
```tsx
<Tooltip>
  <TooltipTrigger>Safety Stock</TooltipTrigger>
  <TooltipContent>
    Minimum buffer quantity to prevent stockouts and ensure continuity
  </TooltipContent>
</Tooltip>
```

❌ **Poor Tooltip**:
```tsx
<Tooltip>
  <TooltipTrigger>Safety Stock</TooltipTrigger>
  <TooltipContent>
    Safety level for stock
  </TooltipContent>
</Tooltip>
```

#### Rule 4: Status Labels Must Be Consistent Across All Views
**Users should see the same status label regardless of where they are in the app**

✅ **Consistent Status Labels**:
- Inventory List: Badge shows "Low Stock"
- Store Overview: Card shows "Low Stock: 5"
- Detail View: Status badge shows "Low Stock"
- Alert System: Alert says "Low Stock Warning"

### 4.4 Localization Readiness

**Current State**: All terminology is in English

**Future Localization Considerations**:
1. Avoid jargon-heavy terms that don't translate well
2. Use simple, direct language
3. Keep abbreviations to minimum
4. Use full words instead of acronyms where possible

**Examples**:
- ✅ "Available Stock" - translates clearly
- ✅ "Out of Stock" - universally understood
- ⚠️ "ROI" - acronym may not translate
- ⚠️ "EOQ" - technical acronym

---

## Section 5: Recommended Changes

### 5.1 High Priority Changes

#### Change HP-1: Standardize "Out of Stock" Label
**Priority**: High
**Effort**: Low (< 1 hour)
**Files to Update**: 1 file

**Current State**:
```tsx
// app/inventory/stores/page.tsx - Lines 229, 231, 236, 320
<CardTitle>Stores with Critical Stock</CardTitle>
<span>Critical Stock</span>
```

**Recommended Change**:
```tsx
// app/inventory/stores/page.tsx
<CardTitle>Stores with Out of Stock Items</CardTitle>
<span>Out of Stock</span>
```

**Impact**: Improves consistency across all pages

---

### 5.2 Medium Priority Changes

#### Change MP-1: Enhance Type Definition JSDoc
**Priority**: Medium
**Effort**: Medium (2-3 hours)
**Files to Update**: `src/types/inventory.ts`

**See Section 6 for detailed JSDoc enhancements**

---

### 5.3 Low Priority Enhancements

#### Enhancement LP-1: Add Industry Term Cross-References
**Priority**: Low
**Effort**: Low (documentation only)

**Recommendation**: Add comments mapping internal terms to industry alternatives

**Example**:
```typescript
/**
 * Stock allocated to pending orders (not available for sale)
 *
 * @remarks
 * Industry synonyms: Allocated Stock, Committed Stock, Assigned Stock
 * Calculation: currentStock - availableStock
 *
 * @see {@link availableStock} - Stock available for new sales
 */
reservedStock: number
```

---

## Section 6: Enhanced Type Definitions

### 6.1 Recommended JSDoc Enhancements for `src/types/inventory.ts`

```typescript
/**
 * TypeScript type definitions for Inventory Management Domain
 *
 * These types define the structure of inventory data used throughout the application.
 * They support both database (Supabase) and mock data sources following the dual data strategy.
 *
 * @remarks
 * Terminology follows industry-standard inventory management conventions.
 * Field names are chosen to be self-documenting and align with user-facing labels.
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
 * Item type indicating how items are measured and sold
 *
 * @remarks
 * Affects quantity display formatting and unit labels:
 * - "weight": Items sold by weight (kg) - displayed with 3 decimals (e.g., 1.250 kg)
 * - "pack_weight": Pre-packed items sold by weight - displayed with 3 decimals (e.g., 0.500 kg)
 * - "pack": Pre-packed items sold by unit - displayed as integers (e.g., 24 packs)
 * - "normal": Standard items sold by piece - displayed as integers (e.g., 100 units)
 *
 * Examples:
 * - weight: Loose produce (bananas, apples), bulk goods
 * - pack_weight: Pre-packed meat, cheese, deli items
 * - pack: Boxes, cartons, multi-packs
 * - normal: Bottles, cans, individual items
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
}

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
 */
export type TransactionType = "stock_in" | "stock_out" | "adjustment" | "return"

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
 *
 * Reference IDs:
 * - For stock_out with referenceId: Links to order (e.g., "ORD-12345")
 * - For return with referenceId: Links to original order
 * - For stock_in with referenceId: Links to PO or supplier invoice
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
}
```

---

## Section 7: Glossary of Inventory Management Terms

### Core Inventory Terms

**Available Stock**
Stock currently available for sale to customers. Not reserved or allocated to existing orders.
*Also known as*: Free Stock, Unallocated Stock

**Reserved Stock**
Stock allocated to pending orders and not available for new sales.
*Also known as*: Allocated Stock, Committed Stock, Assigned Stock

**Safety Stock**
Minimum buffer quantity maintained to prevent stockouts during demand variability or supply delays.
*Formula*: Typically 10-20% of maximum stock level
*Purpose*: Absorb unexpected demand spikes and supplier delays

**Total Stock**
Total physical stock on hand (Available + Reserved).
*Also known as*: Stock on Hand, Physical Inventory, Current Stock

**Reorder Point (ROP)**
Stock level that triggers replenishment order placement.
*Formula*: (Average Daily Usage × Lead Time) + Safety Stock
*Purpose*: Automate reordering to maintain optimal stock levels

**Stock Keeping Unit (SKU)**
Unique identifier assigned to each distinct product for inventory tracking.
*Format*: Alphanumeric code (e.g., "PROD-12345", "BAN-ORG-001")
*Note*: Different from barcode (which is a physical identifier)

**Lead Time**
Time from placing a replenishment order to receiving stock.
*Measurement*: Days or weeks
*Use*: Critical for calculating reorder points

**Economic Order Quantity (EOQ)**
Optimal order quantity that minimizes total inventory costs (ordering + holding).
*Formula*: √(2DS/H) where D=demand, S=order cost, H=holding cost
*Use*: Advanced inventory optimization

### Stock Status Terms

**In Stock**
Product available with healthy stock levels above safety threshold.
*Condition*: Available Stock > Safety Stock

**Low Stock**
Stock below safety threshold but not out entirely.
*Condition*: 0 < Available Stock ≤ Safety Stock
*Action Required*: Monitor closely, consider reordering

**Out of Stock**
No available stock for sale (stockout situation).
*Condition*: Available Stock = 0
*Action Required*: Immediate reordering, customer communication

**Overstocked**
Stock level exceeds maximum capacity or demand forecast.
*Risk*: Tied-up capital, increased holding costs, potential expiry

### Transaction Terms

**Stock In (Goods Receipt)**
Inbound stock movement from suppliers or transfers.
*Examples*: Purchase order deliveries, internal transfers in, returns from customers

**Stock Out (Goods Issue)**
Outbound stock movement for sales or transfers.
*Examples*: Customer orders, internal transfers out, waste disposal

**Stock Adjustment**
Inventory correction transaction to align physical count with system records.
*Reasons*: Cycle count corrections, damage, expiry, theft, data errors

**Stock Transfer**
Movement of stock between warehouses or locations without sale.
*Process*: Creates Stock Out at source + Stock In at destination

### Location Terms

**Warehouse**
Physical storage facility for inventory.
*Examples*: Distribution center, store backroom, regional depot

**Location / Bin Location**
Specific storage position within a warehouse.
*Format*: Hierarchical codes (e.g., "A-01-05" = Aisle A, Rack 01, Shelf 05)
*Purpose*: Optimize picking efficiency and stock organization

**Default Location**
Primary picking location for a product within a warehouse.
*Purpose*: Optimize pick routes, speed up order fulfillment

**Zone**
Logical grouping of warehouse locations by product type or characteristics.
*Examples*: Frozen zone, ambient zone, high-velocity zone

### Advanced Concepts

**Back Order**
Customer order accepted but cannot be fulfilled immediately due to stockout.
*Process*: Order held until stock available, then fulfilled
*Note*: Less common in retail grocery

**In Transit**
Stock currently being transported (supplier to warehouse, or between warehouses).
*Status*: Owned but not yet available for sale
*Tracking*: Important for supply chain visibility

**Cycle Count**
Regular physical counting of subset of inventory to verify accuracy.
*Frequency*: Daily, weekly, or monthly depending on product importance
*Purpose*: Maintain inventory accuracy without full physical inventory

**Dead Stock**
Products with no sales activity for extended period.
*Risk*: Tied-up capital, obsolescence
*Action*: Clearance sales, donations, write-offs

---

## Section 8: Implementation Guidelines

### 8.1 For Developers

#### When Adding New Inventory Features
1. ✅ Review this terminology document first
2. ✅ Use established field names from `src/types/inventory.ts`
3. ✅ Match UI labels to field names (e.g., `availableStock` → "Available Stock")
4. ✅ Add tooltips for technical terms using definitions from Section 4.1
5. ✅ Ensure status labels match existing conventions (Section 4.1)
6. ✅ Add JSDoc comments with industry term cross-references

#### When Modifying Type Definitions
1. ⚠️ Do NOT change field names without updating all UI references
2. ⚠️ Do NOT expose internal `StockStatus` types directly in UI
3. ✅ Add JSDoc explaining the term's industry context
4. ✅ Document calculation formulas where applicable
5. ✅ Link related types using `@see` tags

#### Code Review Checklist
- [ ] Field names align with user-facing labels
- [ ] Status labels are consistent across all views
- [ ] Tooltips provide clear, plain-language definitions
- [ ] JSDoc comments reference industry-standard terms
- [ ] No technical jargon exposed to end users
- [ ] Calculation formulas are documented

### 8.2 For Designers

#### UI Text Guidelines
1. ✅ Use terms from Section 4.1 "Standard Term Definitions"
2. ✅ Maintain consistency - same term everywhere (see Rule 1 in Section 4.3)
3. ✅ Add tooltips for terms that might be unclear
4. ✅ Use "Out of Stock" not "Critical Stock" for zero-stock status
5. ✅ Prefer full words over abbreviations (e.g., "Available Stock" not "Avail.")

#### Badge and Status Colors
- **Green**: In Stock (healthy status)
- **Yellow**: Low Stock (warning status)
- **Red**: Out of Stock (critical status)
- **Blue**: Informational (e.g., Safety Stock, Reorder Point)
- **Orange**: Reserved/Allocated Stock
- **Gray**: Total Stock, neutral information

### 8.3 For Product Managers

#### When Writing Requirements
1. ✅ Use terminology from this document
2. ✅ Reference section numbers for clarity (e.g., "Use 'Available Stock' as defined in Section 4.1")
3. ✅ Specify exact labels for UI elements
4. ✅ Consider tooltip text for new technical terms

#### User Story Examples

**Good User Story**:
> As a store manager, I want to see "Low Stock" items (where Available Stock ≤ Safety Stock)
> so that I can prioritize reordering before stockouts occur.

**Better User Story with Terminology**:
> As a store manager, I want to filter the inventory list to show only items with status "Low Stock"
> (defined as 0 < availableStock ≤ safetyStock per Section 4.1) displayed with a yellow badge,
> so that I can prioritize reordering before reaching "Out of Stock" status.

---

## Section 9: Testing and Validation

### 9.1 Terminology Consistency Tests

#### Manual Testing Checklist
Test that the same concept uses consistent terminology across:

- [ ] Inventory List page
- [ ] Store Overview page
- [ ] Detail View page
- [ ] Transaction table
- [ ] KPI cards
- [ ] Filter buttons
- [ ] Status badges
- [ ] Tooltips
- [ ] Error messages

#### Specific Test Cases

**Test Case 1: "Out of Stock" Consistency**
1. Navigate to Inventory List
2. Verify KPI card shows "Out of Stock Items"
3. Verify filter tab shows "Out of Stock"
4. Verify status badge shows "Out of Stock" (not "Critical Stock")
5. Navigate to Store Overview
6. Verify card shows "Out of Stock" (not "Critical Stock") ⚠️ **Currently fails - needs fix**

**Test Case 2: Stock Status Badge Colors**
1. Find product with status "healthy" → Verify green badge with "In Stock" label
2. Find product with status "low" → Verify yellow badge with "Low Stock" label
3. Find product with status "critical" → Verify red badge with "Out of Stock" label

**Test Case 3: Detail View Terminology**
1. Open any product detail
2. Verify cards show: "Available Stock", "Reserved Stock", "Safety Stock", "Total Stock"
3. Hover over each card → Verify tooltip text matches definitions in Section 4.1
4. Verify "Stock by Location" section header (not "Stock by Warehouse")

### 9.2 Validation Commands

```bash
# Search for inconsistent "Critical Stock" usage (should be "Out of Stock")
grep -r "Critical Stock" app/ src/components/

# Verify "Out of Stock" is used consistently
grep -r "Out of Stock" app/ src/components/

# Check for any non-standard status labels
grep -r "No Stock\|Zero Stock\|Empty Stock" app/ src/components/

# Verify transaction terminology
grep -r "Stock In\|Stock Out\|Adjustment\|Return" src/components/recent-transactions-table.tsx

# Check tooltip text for standard definitions
grep -A 2 "TooltipContent" src/components/inventory-detail-view.tsx
```

---

## Section 10: Appendix

### 10.1 Summary of Recommendations

| ID | Priority | Change | Effort | Impact |
|----|----------|--------|--------|--------|
| HP-1 | High | Standardize "Out of Stock" label across all pages | Low (< 1hr) | High - Improves consistency |
| MP-1 | Medium | Enhance JSDoc in type definitions | Medium (2-3hr) | Medium - Improves maintainability |
| LP-1 | Low | Add industry term cross-references | Low (documentation) | Low - Developer reference |

### 10.2 Files Requiring Updates

#### High Priority
- `app/inventory/stores/page.tsx` - Change "Critical Stock" to "Out of Stock" (4 locations)

#### Medium Priority
- `src/types/inventory.ts` - Enhance JSDoc comments (multiple types)

#### No Changes Required
- ✅ `app/inventory/page.tsx` - Already correct
- ✅ `src/components/inventory-detail-view.tsx` - Already excellent
- ✅ `src/components/recent-transactions-table.tsx` - Already correct
- ✅ `src/components/side-nav.tsx` - Already correct

### 10.3 Migration Plan

**Phase 1: Critical Fixes** (Week 1)
- [ ] Update "Critical Stock" to "Out of Stock" in store overview page
- [ ] Test across all views for consistency
- [ ] Update any related test files

**Phase 2: Documentation Enhancement** (Week 2)
- [ ] Enhance JSDoc in `src/types/inventory.ts`
- [ ] Add industry term cross-references
- [ ] Update developer documentation

**Phase 3: Validation** (Week 3)
- [ ] Run terminology consistency tests (Section 9.1)
- [ ] Verify no regressions
- [ ] Update test cases if needed

### 10.4 References and Resources

#### Industry Standards
- APICS Dictionary (Association for Supply Chain Management)
- ISO 9001 Quality Management Standards
- Retail Industry Leaders Association (RILA) Guidelines

#### Internal References
- CLAUDE.md - Project architecture and conventions
- src/types/inventory.ts - Type definitions
- src/lib/warehouse-utils.ts - Utility functions for stock calculations

---

## Document Maintenance

**Review Frequency**: Quarterly
**Next Review Date**: 2026-04-07
**Owner**: Product Team + Engineering Team
**Approvers**: Product Manager, Lead Developer, UX Designer

**Change Log**:
- 2026-01-07 v1.0 - Initial document creation (Terminology Audit)

---

**End of Document**
