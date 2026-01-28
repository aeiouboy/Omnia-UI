# Wireframe: Add Merchant SKU Field to Stock Card By Product Tab

**ADW ID**: merchant-sku-by-product
**Page**: `/inventory-new/stores` → By Product Tab
**Date**: 2026-01-22

## Current State

The By Product tab in Stock Card page displays transaction history with filters for:
- Date Range (From/To)
- Store (Store ID, Store Name)
- Product (Product ID, Product Name)
- Transaction Type dropdown
- Notes search

The Transaction History table shows:
- Date & Time
- Type (Stock In/Stock Out/Adjustment)
- Qty (+/- quantity)
- Balance
- Notes (Person: Note text with order reference)

**Screenshot**: `.playwright-mcp/wf-stock-card-by-product-current.png`

## Requirement

Add **Merchant SKU** field to the By Product tab to help users identify products using their merchant-specific SKU codes.

---

## Version 1: Add Merchant SKU as Filter Input (Minimal Change)

### Description
Add a Merchant SKU search input field alongside existing Product ID and Product Name filters. This allows users to search for products using their merchant-specific SKU.

### UI Changes

**Location**: Product filter group (Row 2 of filters)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Filters Row 2                                                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐                  │
│ │ Product  🔍 Product ID  🔍 Product Name  🔍 Merchant SKU │  [All Types ▼]  │
│ └─────────────────────────────────────────────────────────┘                  │
│                                                                              │
│ 🔍 Notes                              [Refresh] [Clear All] [Export CSV]     │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Implementation Details

1. **New Filter Input**:
   - Add `merchantSkuSearch` state variable
   - Add search input with placeholder "Merchant SKU"
   - Width: `min-w-[140px]` (matching other inputs)
   - Position: After Product Name input, within the Product filter group

2. **Validation**:
   - Merchant SKU search is OPTIONAL (not part of mandatory filters)
   - Minimum 2 characters to trigger search (consistent with other fields)

3. **Data Model Update** (`ProductTransaction` interface):
   ```typescript
   export interface ProductTransaction {
     // ... existing fields
     merchantSku?: string  // New optional field
   }
   ```

4. **Mock Data Update**:
   - Add `merchantSku` to generated transactions
   - Format: `MSKU-{random 6 digits}` (e.g., "MSKU-123456")

### Effort
- **Complexity**: Low
- **Files Changed**: 2 (page.tsx, stock-card-mock-data.ts)
- **Lines Added**: ~25-30

---

## Version 2: Add Merchant SKU Column to Transaction Table

### Description
Add Merchant SKU as a visible column in the Transaction History table, allowing users to see the merchant SKU for each transaction record.

### UI Changes

**Location**: Transaction History table (both desktop and mobile views)

**Desktop Table**:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Transaction History                                          XX transactions │
├─────────────────────────────────────────────────────────────────────────────┤
│ Date & Time    │ Merchant SKU  │ Type      │ Qty    │ Balance │ Notes       │
├─────────────────────────────────────────────────────────────────────────────┤
│ Jan 22, 2026   │ MSKU-123456   │ Stock In  │ +50    │ 1,250   │ Amy: ...    │
│ 10:30 AM       │               │           │        │         │             │
├─────────────────────────────────────────────────────────────────────────────┤
│ Jan 21, 2026   │ MSKU-123456   │ Stock Out │ -25    │ 1,200   │ Lisa: ...   │
│ 03:15 PM       │               │           │        │         │             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Mobile Card View**:
```
┌─────────────────────────────────────────────┐
│ [Stock In]              Jan 22, 2026 10:30 AM│
├─────────────────────────────────────────────┤
│ Merchant SKU: MSKU-123456                    │
├─────────────────────────────────────────────┤
│ Quantity        │ Balance                    │
│ +50             │ 1,250                      │
├─────────────────────────────────────────────┤
│ Notes                                        │
│ Amy: Regular replenishment                   │
└─────────────────────────────────────────────┘
```

### Implementation Details

1. **Table Header Update**:
   - Add "Merchant SKU" column after "Date & Time"
   - Class: `whitespace-nowrap`

2. **Table Row Update**:
   - Display `txn.merchantSku` or "-" if undefined
   - Class: `font-mono text-sm text-muted-foreground`

3. **Mobile Card Update**:
   - Add Merchant SKU row below the badge/timestamp header
   - Format: "Merchant SKU: {value}"

4. **CSV Export Update**:
   - Include Merchant SKU as a column in exported CSV

### Effort
- **Complexity**: Medium
- **Files Changed**: 3 (page.tsx, stock-card-mock-data.ts, stock-card-export.ts)
- **Lines Added**: ~40-50

---

## Version 3: Complete Integration (Filter + Column + Summary)

### Description
Full implementation combining filter input, table column, and a product summary card showing the Merchant SKU prominently. This version provides the most comprehensive user experience.

### UI Changes

**1. Filter Input** (same as Version 1):
```
┌─────────────────────────────────────────────────────────────────────┐
│ Product  🔍 Product ID  🔍 Product Name  🔍 Merchant SKU            │
└─────────────────────────────────────────────────────────────────────┘
```

**2. Product Summary Card** (NEW - appears when filters complete):
```
┌─────────────────────────────────────────────────────────────────────┐
│ 📦 Product Summary                                                  │
├─────────────────────────────────────────────────────────────────────┤
│ Product ID: PROD-001        Merchant SKU: MSKU-123456               │
│ Product Name: Premium Coffee Beans 500g                             │
├─────────────────────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐      │
│ │ Opening      │ Total In     │ Total Out    │ Current      │      │
│ │ Balance      │              │              │ Balance      │      │
│ │ 1,000        │ +500         │ -250         │ 1,250        │      │
│ └──────────────┴──────────────┴──────────────┴──────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

**3. Transaction Table Column** (same as Version 2):
```
│ Date & Time    │ Merchant SKU  │ Type      │ Qty    │ Balance │ Notes │
```

### Implementation Details

1. **Filter Input** (from Version 1):
   - Add `merchantSkuSearch` state
   - Add search input in Product filter group

2. **Product Summary Card** (NEW):
   - Create new card component above Transaction History
   - Shows: Product ID, Product Name, Merchant SKU
   - Shows: Opening Balance, Total In, Total Out, Current Balance
   - Only visible when `hasAllMandatoryFiltersForProduct` is true

3. **Table Column** (from Version 2):
   - Add Merchant SKU column to desktop table
   - Add Merchant SKU row to mobile cards

4. **Data Model Updates**:
   ```typescript
   export interface ProductTransaction {
     // ... existing fields
     merchantSku: string  // Required field (not optional)
   }

   export interface ProductSummary {
     // ... existing fields
     merchantSku: string  // New field
   }
   ```

5. **Mock Data Updates**:
   - Generate consistent `merchantSku` per product
   - Format: `MSKU-{product-id-hash}` for consistency

6. **CSV Export**:
   - Include Merchant SKU column
   - Add Product Summary section at top of export

### Effort
- **Complexity**: High
- **Files Changed**: 4 (page.tsx, stock-card-mock-data.ts, stock-card-export.ts, types)
- **Lines Added**: ~100-120

---

## Comparison Matrix

| Feature                    | Version 1 | Version 2 | Version 3 |
|---------------------------|-----------|-----------|-----------|
| Merchant SKU Filter       | ✅        | ❌        | ✅        |
| Table Column              | ❌        | ✅        | ✅        |
| Mobile Card Display       | ❌        | ✅        | ✅        |
| Product Summary Card      | ❌        | ❌        | ✅        |
| CSV Export Column         | ❌        | ✅        | ✅        |
| Complexity                | Low       | Medium    | High      |
| Estimated Lines           | ~25-30    | ~40-50    | ~100-120  |

---

## Recommendation

**Version 2 (Add Column)** is recommended as the best balance of:
- User value: Shows Merchant SKU in context of each transaction
- Implementation effort: Medium complexity
- Consistency: Follows existing table pattern
- Export support: Includes SKU in CSV downloads

Version 1 alone provides limited value since users can already search by Product ID/Name. Version 3 adds significant value with the summary card but requires more development effort.

---

## Technical Notes

### Files to Modify

| File | Version 1 | Version 2 | Version 3 |
|------|-----------|-----------|-----------|
| `app/inventory-new/stores/page.tsx` | ✅ | ✅ | ✅ |
| `src/lib/stock-card-mock-data.ts` | ✅ | ✅ | ✅ |
| `src/lib/stock-card-export.ts` | ❌ | ✅ | ✅ |
| Type definitions | Optional | ✅ | ✅ |

### Mock Data Format
```typescript
// Merchant SKU generation
const merchantSku = `MSKU-${productId.replace(/\D/g, '').padStart(6, '0')}`

// Example values:
// Product ID "PROD-001" → "MSKU-000001"
// Product ID "SKU12345" → "MSKU-012345"
```
