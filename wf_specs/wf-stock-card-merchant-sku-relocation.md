# Stock Card - Ref ID Relocation & UI Cleanup

**ADW ID:** stock-card-ref-id-relocation
**Created:** 2026-01-31
**Status:** Draft
**Priority:** Medium

## Overview

Improve the Stock Card page (By Product view) by relocating the Ref ID field (previously "Merchant SKU") from the filter row to the Product Info Card near the Barcode position, removing the toggle filter control, and simplifying the UI by removing the "View Full Details" button.

## Current State Analysis

### Current Filter Row (By Product View)
```
[Date Range] [Store ID] [Store Name] [Product ID] [Product Name] [View Type] [Notes] [Show Merchant SKU Toggle]
```

### Current Product Info Card
- Product Image (left)
- Product Name, Category
- Barcode, Item Type, Supply Type (3-column grid)
- Stock Config Status
- Last Restocked
- **View Full Details** button

### Current Transaction Table Columns
When "Show Merchant SKU" toggle is ON:
- Date & Time
- Type
- Qty
- Balance
- Notes
- **Merchant SKU** (conditional column)

## User Requirements

1. **Remove "Show Merchant SKU" toggle filter** from filter row
2. **Change field name from "Merchant SKU" to "Ref ID"**
3. **Move Ref ID to Product Info Card** section near Barcode position
4. **Remove "View Full Details" button** from Product Info Card

---

## Version 1: Minimal Layout (Single Row Addition)

### Design Philosophy
- Simplest implementation with minimal layout changes
- Add Ref ID as a new row directly below Barcode field
- Keep existing 3-column grid intact
- Position Ref ID near Barcode for logical grouping of identifiers
- Remove toggle filter and View Full Details button

### Filter Row Changes
```diff
- [Date Range] [Store ID] [Store Name] [Product ID] [Product Name] [View Type] [Notes] [Show Merchant SKU Toggle]
+ [Date Range] [Store ID] [Store Name] [Product ID] [Product Name] [View Type] [Notes]
```

### Product Info Card Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ [Product Image]    Product Name                              [X]│
│  200x200          Category                                      │
│                   ─────────────────────────────────────────────  │
│                   ┌──────────────┬──────────────┬──────────────┐│
│                   │🔲 Barcode    │📦 Item Type  │📦 Supply Type││
│                   │BarcodValue   │[Badge]       │[Badge]       ││
│                   └──────────────┴──────────────┴──────────────┘│
│                                                                  │
│                   🏷️ Ref ID                                      │
│                   REF-12345-ABC                                 │
│                                                                  │
│                   ⭕ Stock Config                                │
│                   ✓ Configured                                  │
│                                                                  │
│                   🕐 Last Restocked                              │
│                   January 6, 2026 at 11:29 AM                   │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Details

**File:** `src/components/inventory/product-info-card.tsx`

**Add Ref ID Prop:**
```typescript
interface ProductInfoCardProps {
  product: InventoryItem
  onClose: () => void
  onViewDetails: () => void // Will be removed
  refId?: string // NEW: Optional Ref ID (formerly merchantSku)
}
```

**Add Ref ID Field (after 3-column grid, before Stock Config):**
```tsx
{/* Three-column grid: Barcode, Item Type, Supply Type */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
  {/* ... existing grid content ... */}
</div>

{/* Ref ID - NEW - Positioned near Barcode */}
{refId && (
  <div className="mb-4">
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
      <Tag className="h-4 w-4" />
      <span>Ref ID</span>
    </div>
    <span className="font-mono text-sm text-foreground">{refId}</span>
  </div>
)}

{/* Stock Config Status */}
<div className="mb-4">
  {/* ... existing stock config ... */}
</div>

{/* REMOVED: View Full Details Button */}
```

**File:** `app/inventory-new/stores/page.tsx`

**Remove State:**
```diff
- const [showMerchantSku, setShowMerchantSku] = useState(false)
```

**Remove Toggle Filter:**
```diff
- {/* Show Merchant SKU toggle - Desktop */}
- <div className="hidden lg:flex items-center gap-2 px-3 py-2 border rounded-md bg-background">
-   <Switch
-     id="merchant-sku-toggle"
-     checked={showMerchantSku}
-     onCheckedChange={setShowMerchantSku}
-   />
-   <label htmlFor="merchant-sku-toggle" className="text-sm cursor-pointer">
-     Show Merchant SKU
-   </label>
- </div>
```

**Update ProductInfoCard Usage:**
```diff
<ProductInfoCard
  product={mockProduct}
  onClose={() => setShowProductCard(false)}
- onViewDetails={() => router.push(`/inventory/${mockProduct.productId}`)}
+ refId="REF-12345-ABC" // Pass from transaction data (formerly merchantSku)
/>
```

**Remove Conditional Table Column:**
```diff
<TableHead className="text-center min-w-[100px]">Notes</TableHead>
- {showMerchantSku && (
-   <TableHead className="hidden lg:table-cell text-left min-w-[140px]">Merchant SKU</TableHead>
- )}
```

```diff
<TableCell className="text-sm text-muted-foreground">{transaction.notes}</TableCell>
- {showMerchantSku && (
-   <TableCell className="hidden lg:table-cell">
-     <span className="font-mono text-sm">{transaction.merchantSku || "—"}</span>
-   </TableCell>
- )}
```

### Pros & Cons

**Pros:**
- ✅ Simplest implementation
- ✅ Minimal code changes
- ✅ Clear visual hierarchy
- ✅ Ref ID positioned near Barcode (logical identifier grouping)
- ✅ Ref ID always visible when card is shown
- ✅ Consistent with existing field layout pattern
- ✅ Full-width display suitable for longer reference IDs

**Cons:**
- ❌ Adds some vertical height to card
- ❌ Ref ID not in same grid as Barcode (separate row)
- ❌ Doesn't utilize horizontal space as efficiently as grid options

---

## Version 2: Four-Column Grid (Balanced Layout) ⭐ RECOMMENDED

### Design Philosophy
- Expand 3-column grid to 4 columns
- Place Ref ID immediately after Barcode (2nd position) for identifier grouping
- Better horizontal space utilization
- Maintains visual balance with related fields grouped together

### Filter Row Changes
```diff
- [Date Range] [Store ID] [Store Name] [Product ID] [Product Name] [View Type] [Notes] [Show Merchant SKU Toggle]
+ [Date Range] [Store ID] [Store Name] [Product ID] [Product Name] [View Type] [Notes]
```

### Product Info Card Layout
```
┌──────────────────────────────────────────────────────────────────────┐
│ [Product Image]    Product Name                                   [X]│
│  200x200          Category                                           │
│                   ──────────────────────────────────────────────────  │
│                   ┌─────────┬─────────────┬─────────┬─────────────┐  │
│                   │🔲Barcode│🏷️ Ref ID    │📦 Item  │📦 Supply    │  │
│                   │Value    │REF-12345-ABC│[Badge]  │[Badge]      │  │
│                   └─────────┴─────────────┴─────────┴─────────────┘  │
│                                                                       │
│                   ⭕ Stock Config                                     │
│                   ✓ Configured                                       │
│                                                                       │
│                   🕐 Last Restocked                                   │
│                   January 6, 2026 at 11:29 AM                        │
└──────────────────────────────────────────────────────────────────────┘
```

### Implementation Details

**File:** `src/components/inventory/product-info-card.tsx`

**Update Grid from 3 to 4 columns:**
```diff
- <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
+ <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
```

**Update Grid Column Order (Barcode, Ref ID, Item Type, Supply Type):**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
  {/* Barcode - Column 1 */}
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Barcode className="h-4 w-4" />
      <span>Barcode</span>
    </div>
    <span className="font-mono text-sm">{displayBarcode}</span>
  </div>

  {/* Ref ID - Column 2 (NEW - positioned near Barcode) */}
  {refId && (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Tag className="h-4 w-4" />
        <span>Ref ID</span>
      </div>
      <span className="font-mono text-sm text-foreground break-all">{refId}</span>
    </div>
  )}

  {/* Item Type - Column 3 */}
  <div className="flex flex-col gap-1">
    {/* ... existing Item Type code ... */}
  </div>

  {/* Supply Type - Column 4 */}
  <div className="flex flex-col gap-1">
    {/* ... existing Supply Type code ... */}
  </div>
</div>
```

**Remove View Full Details Button:**
```diff
- <Button onClick={onViewDetails} variant="outline">
-   <ExternalLink className="h-4 w-4 mr-2" />
-   View Full Details
- </Button>
```

### Responsive Behavior

**Mobile (< 640px):** 1 column (stacked)
```
┌─────────────────┐
│🔲 Barcode       │
│ Value           │
├─────────────────┤
│🏷️ Ref ID        │
│ REF-12345-ABC   │
├─────────────────┤
│📦 Item Type     │
│ [Badge]         │
├─────────────────┤
│📦 Supply Type   │
│ [Badge]         │
└─────────────────┘
```

**Tablet (640px - 1023px):** 2 columns
```
┌─────────────────┬─────────────────┐
│🔲 Barcode       │🏷️ Ref ID        │
│ Value           │ REF-12345-ABC   │
├─────────────────┼─────────────────┤
│📦 Item Type     │📦 Supply Type   │
│ [Badge]         │ [Badge]         │
└─────────────────┴─────────────────┘
```

**Desktop (≥ 1024px):** 4 columns
```
┌────────┬─────────────┬─────────┬─────────┐
│Barcode │Ref ID       │Item Type│Supply   │
└────────┴─────────────┴─────────┴─────────┘
```

### Pros & Cons

**Pros:**
- ✅ Best horizontal space utilization
- ✅ Ref ID positioned immediately after Barcode (logical identifier grouping)
- ✅ No additional vertical height
- ✅ Maintains visual balance across grid
- ✅ Responsive design adapts well
- ✅ Both identifiers (Barcode + Ref ID) in first two columns
- ✅ Clear visual hierarchy with identifiers on left, attributes on right

**Cons:**
- ❌ 4-column grid may feel cramped on smaller screens
- ❌ Longer Ref ID values might cause text wrapping issues
- ❌ More complex responsive behavior than Version 1

---

## Version 3: Dual-Row Grid (Information Hierarchy)

### Design Philosophy
- First row: 2-column grid for identifiers (Barcode, Ref ID)
- Second row: 2-column grid for attributes (Item Type, Supply Type)
- Third section: Stock Config and Last Restocked
- Groups related fields together (identifiers separate from attributes)
- Clear information hierarchy with visual separation

### Filter Row Changes
```diff
- [Date Range] [Store ID] [Store Name] [Product ID] [Product Name] [View Type] [Notes] [Show Merchant SKU Toggle]
+ [Date Range] [Store ID] [Store Name] [Product ID] [Product Name] [View Type] [Notes]
```

### Product Info Card Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ [Product Image]    Product Name                              [X]│
│  200x200          Category                                      │
│                   ─────────────────────────────────────────────  │
│                   Identifiers                                    │
│                   ┌────────────────────┬───────────────────────┐│
│                   │🔲 Barcode          │🏷️ Ref ID              ││
│                   │BarcodValue         │REF-12345-ABC          ││
│                   └────────────────────┴───────────────────────┘│
│                                                                  │
│                   Attributes                                     │
│                   ┌────────────────────┬───────────────────────┐│
│                   │📦 Item Type        │📦 Supply Type         ││
│                   │[Badge]             │[Badge]                ││
│                   └────────────────────┴───────────────────────┘│
│                                                                  │
│                   ⭕ Stock Config                                │
│                   ✓ Configured                                  │
│                                                                  │
│                   🕐 Last Restocked: January 6, 2026 11:29 AM   │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Details

**File:** `src/components/inventory/product-info-card.tsx`

**First Row: Identifiers (Barcode, Ref ID):**
```tsx
{/* Identifiers - Two-column grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
  {/* Barcode */}
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Barcode className="h-4 w-4" />
      <span>Barcode</span>
    </div>
    <span className="font-mono text-sm">{displayBarcode}</span>
  </div>

  {/* Ref ID - NEW */}
  {refId && (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Tag className="h-4 w-4" />
        <span>Ref ID</span>
      </div>
      <span className="font-mono text-sm text-foreground">{refId}</span>
    </div>
  )}
</div>
```

**Second Row: Attributes (Item Type, Supply Type):**
```tsx
{/* Attributes - Two-column grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
  {/* Item Type */}
  <div className="flex flex-col gap-1">
    {/* ... existing Item Type code ... */}
  </div>

  {/* Supply Type */}
  <div className="flex flex-col gap-1">
    {/* ... existing Supply Type code ... */}
  </div>
</div>
```

**Stock Config (existing format):**
```tsx
{/* Stock Config Status */}
<div className="mb-4">
  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
    <Circle className="h-4 w-4" />
    <span>Stock Config</span>
  </div>
  <div className="flex items-center gap-1.5">
    {/* ... existing stock config logic ... */}
  </div>
</div>
```

**Convert Last Restocked to Inline Format:**
```tsx
{/* Last Restocked - Inline format */}
<div className="flex items-center gap-2 text-sm mb-4">
  <Clock className="h-4 w-4 text-muted-foreground" />
  <span className="text-muted-foreground">Last Restocked:</span>
  <span className="text-foreground font-medium">
    {formatLastRestocked(product.lastRestocked)}
  </span>
</div>
```

**Remove View Full Details Button:**
```diff
- <Button onClick={onViewDetails} variant="outline">
-   <ExternalLink className="h-4 w-4 mr-2" />
-   View Full Details
- </Button>
```

### Visual Hierarchy

1. **Identifiers** (2-column grid)
   - Barcode (product identifier)
   - Ref ID (reference identifier) - positioned near Barcode

2. **Attributes** (2-column grid)
   - Item Type (classification)
   - Supply Type (availability)

3. **Status & Metadata** (traditional format)
   - Stock Config (configuration status)
   - Last Restocked (timestamp)

### Pros & Cons

**Pros:**
- ✅ Strongest information hierarchy (identifiers grouped separately)
- ✅ Balanced layout with good spacing
- ✅ Ref ID positioned directly next to Barcode (clear identifier grouping)
- ✅ Logical field grouping (identifiers vs attributes)
- ✅ Last Restocked inline saves vertical space
- ✅ Responsive design works well
- ✅ Easy to scan: identifiers at top, attributes below

**Cons:**
- ❌ More vertical height than Version 2
- ❌ More complex layout structure than Version 1
- ❌ Two separate 2-column grids may feel repetitive

---

## Recommendations

### Recommended Version: **Version 2 (Four-Column Grid)**

**Rationale:**
1. **Best Space Utilization:** No additional vertical height, uses horizontal space efficiently
2. **Visual Balance:** All key fields at same hierarchy level
3. **User Experience:** Ref ID immediately visible next to Barcode (identifier grouping)
4. **Responsive Design:** Clean breakpoints (1→2→4 columns)
5. **Implementation Simplicity:** Straightforward grid expansion from 3 to 4 columns
6. **Consistency:** Maintains existing design patterns
7. **Logical Grouping:** Identifiers (Barcode + Ref ID) in first two columns

### Alternative Scenarios

**Choose Version 1 if:**
- Minimizing code changes is priority
- Ref ID is less critical than other fields
- Vertical scrolling is not a concern
- You want simplest implementation path

**Choose Version 3 if:**
- Strongest information hierarchy is critical
- You want identifiers completely separated from attributes
- Visual grouping by field type is important
- Extra vertical space is acceptable

### Transaction Table Column Widths

**Recommended:** **Option A (Expand Notes Column)**

**Rationale:**
- Notes contain most variable/important contextual information
- Utilizes space freed by removing Merchant SKU column
- Better readability for delivery info, order references, customer names
- Maintains compact widths for numeric columns (Qty, Balance)

---

## Common Changes (All Versions)

### 1. Remove Show Merchant SKU Toggle Filter (Rename to Ref ID)

**File:** `app/inventory-new/stores/page.tsx`

**Remove State Variable:**
```typescript
const [showMerchantSku, setShowMerchantSku] = useState(false)
```

**Remove Toggle Control from Filter Row:**
Located in the "By Product View Filters" section around line 800-900.

### 2. Remove Conditional Table Column

**Remove Table Header:**
```diff
<TableHead className="text-center min-w-[100px]">Notes</TableHead>
- {showMerchantSku && (
-   <TableHead className="hidden lg:table-cell text-left min-w-[140px]">Merchant SKU</TableHead>
- )}
```

**Remove Table Cell:**
```diff
<TableCell className="text-sm text-muted-foreground">{transaction.notes}</TableCell>
- {showMerchantSku && (
-   <TableCell className="hidden lg:table-cell">
-     <span className="font-mono text-sm">{transaction.merchantSku || "—"}</span>
-   </TableCell>
- )}
```

### 3. Remove View Full Details Button

**File:** `src/components/inventory/product-info-card.tsx`

**Remove Button:**
```diff
- <Button onClick={onViewDetails} variant="outline">
-   <ExternalLink className="h-4 w-4 mr-2" />
-   View Full Details
- </Button>
```

**Update Interface (make onViewDetails optional or remove):**
```diff
interface ProductInfoCardProps {
  product: InventoryItem
  onClose: () => void
- onViewDetails: () => void
+ refId?: string
}
```

### 4. Add Ref ID to ProductInfoCard

**Import Tag Icon:**
```diff
import {
  X,
  Barcode,
  Package,
  Scale,
  Check,
  XCircle,
  Circle,
  Clock,
- ExternalLink,
+ Tag,
  Info,
} from "lucide-react"
```

### 5. Update ProductInfoCard Usage

**File:** `app/inventory-new/stores/page.tsx`

**Pass merchantSku prop:**
```diff
<ProductInfoCard
  product={mockProduct}
  onClose={() => setShowProductCard(false)}
- onViewDetails={() => router.push(`/inventory/${mockProduct.productId}`)}
+ merchantSku={selectedTransaction?.merchantSku}
/>
```

---

## Data Flow

### Current Flow
1. User toggles "Show Merchant SKU" switch
2. State updates `showMerchantSku`
3. Table conditionally renders Merchant SKU column
4. Each transaction row shows `transaction.merchantSku`

### New Flow (All Versions)
1. User searches for product and selects transaction
2. Transaction data includes `merchantSku` field (renamed to "Ref ID" in UI)
3. Product Info Card displays with `refId` prop
4. Ref ID shown in card near Barcode position (exact position varies by version)
5. Toggle filter removed entirely
6. Transaction table no longer shows conditional column

---

## Transaction History Table Column Width Adjustments

### Current Issue
With the removal of the conditional "Merchant SKU" column, the transaction history table needs column width optimization to better utilize the available space and improve readability.

### Current Column Configuration
```tsx
<TableHead className="text-left min-w-[140px]">Date & Time</TableHead>
<TableHead className="text-left min-w-[140px]">Type</TableHead>
<TableHead className="text-center min-w-[80px]">Qty</TableHead>
<TableHead className="text-center min-w-[100px]">Balance</TableHead>
<TableHead className="text-center min-w-[100px]">Notes</TableHead>
{/* REMOVED: Conditional Merchant SKU column */}
```

### Recommended Column Widths

**Option A: Expand Notes Column (Recommended)**
- Notes column often contains longer text (delivery info, order references)
- Utilize space previously occupied by Merchant SKU column
- Better readability for transaction context

```tsx
<TableHead className="text-left min-w-[160px]">Date & Time</TableHead>
<TableHead className="text-left w-[180px]">Type</TableHead>
<TableHead className="text-center w-[100px]">Qty</TableHead>
<TableHead className="text-center w-[120px]">Balance</TableHead>
<TableHead className="text-left min-w-[300px]">Notes</TableHead> {/* Expanded */}
```

**Width Rationale:**
- **Date & Time:** `min-w-[160px]` - Accommodates "Jan 06, 2026, 11:29 AM" format
- **Type:** `w-[180px]` - Fixed width for badge display (prevents layout shift)
- **Qty:** `w-[100px]` - Centered numeric values with +/- signs
- **Balance:** `w-[120px]` - Centered numeric values (up to 5 digits)
- **Notes:** `min-w-[300px]` - Flexible, uses remaining space for longer text

**Option B: Balanced Width Distribution**
- Distribute space evenly across all columns
- Consistent column proportions

```tsx
<TableHead className="text-left w-[180px]">Date & Time</TableHead>
<TableHead className="text-left w-[200px]">Type</TableHead>
<TableHead className="text-center w-[120px]">Qty</TableHead>
<TableHead className="text-center w-[140px]">Balance</TableHead>
<TableHead className="text-left min-w-[280px]">Notes</TableHead>
```

**Option C: Compact Layout**
- Minimize column widths for more table rows visible
- Best for high-density data viewing

```tsx
<TableHead className="text-left w-[140px]">Date & Time</TableHead>
<TableHead className="text-left w-[160px]">Type</TableHead>
<TableHead className="text-center w-[80px]">Qty</TableHead>
<TableHead className="text-center w-[100px]">Balance</TableHead>
<TableHead className="text-left min-w-[320px]">Notes</TableHead>
```

### Implementation

**File:** `app/inventory-new/stores/page.tsx`

**Update Table Headers:**
```tsx
<TableHeader>
  <TableRow>
    <TableHead className="text-left min-w-[160px]">Date & Time</TableHead>
    <TableHead className="text-left w-[180px]">Type</TableHead>
    <TableHead className="text-center w-[100px]">Qty</TableHead>
    <TableHead className="text-center w-[120px]">Balance</TableHead>
    <TableHead className="text-left min-w-[300px]">Notes</TableHead>
  </TableRow>
</TableHeader>
```

**Update Table Cells (maintain alignment):**
```tsx
<TableRow>
  <TableCell className="text-sm">{formatTransactionDateTime(transaction.timestamp)}</TableCell>
  <TableCell>
    <Badge className={/* type badge classes */}>
      {/* type display */}
    </Badge>
  </TableCell>
  <TableCell className="text-center font-mono text-sm">
    {getQuantitySign(simplifiedType)}{Math.abs(transaction.quantity)}
  </TableCell>
  <TableCell className="text-center font-mono text-sm font-semibold">
    {transaction.balance.toLocaleString()}
  </TableCell>
  <TableCell className="text-sm text-muted-foreground">
    {transaction.notes}
  </TableCell>
</TableRow>
```

### Responsive Behavior

**Desktop (≥ 1024px):**
- All columns visible with recommended widths
- Notes column expands to utilize available space

**Tablet (768px - 1023px):**
- Consider hiding Balance column or making it toggle-able
- Notes column becomes primary focus

**Mobile (< 768px):**
- Stack transaction cards vertically instead of table
- Show all fields in card format for better mobile readability

### Visual Improvements

**Add Column Sorting (Optional Enhancement):**
```tsx
<TableHead className="text-left min-w-[160px] cursor-pointer hover:bg-muted/50">
  <div className="flex items-center gap-1">
    Date & Time
    <ArrowUpDown className="h-3.5 w-3.5" />
  </div>
</TableHead>
```

**Add Alternating Row Colors:**
```tsx
<TableRow className="hover:bg-muted/50 data-[index]:bg-muted/20">
  {/* cells */}
</TableRow>
```

**Add Sticky Header:**
```tsx
<TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
  {/* headers */}
</TableHeader>
```

---

## Implementation Checklist

### Phase 1: Remove Toggle Filter
- [ ] Remove `showMerchantSku` state variable
- [ ] Remove toggle switch UI component
- [ ] Remove conditional table column header
- [ ] Remove conditional table cell rendering
- [ ] Test table rendering without Merchant SKU column

### Phase 2: Update Product Info Card
- [ ] Add `refId` prop to interface (rename from `merchantSku`)
- [ ] Remove `onViewDetails` prop from interface
- [ ] Import `Tag` icon from lucide-react
- [ ] Remove `ExternalLink` icon import
- [ ] Implement Ref ID field with label "Ref ID" (per chosen version)
- [ ] Remove "View Full Details" button

### Phase 3: Update Parent Component
- [ ] Update `ProductInfoCard` usage to pass `refId` prop
- [ ] Remove `onViewDetails` callback
- [ ] Extract `merchantSku` from transaction data (display as "Ref ID")

### Phase 4: Adjust Transaction Table Columns
- [ ] Update column width for Date & Time to `min-w-[160px]`
- [ ] Update column width for Type to `w-[180px]`
- [ ] Update column width for Qty to `w-[100px]`
- [ ] Update column width for Balance to `w-[120px]`
- [ ] Update column width for Notes to `min-w-[300px]` (expanded)
- [ ] Verify column alignment in table cells matches headers
- [ ] Test horizontal scrolling behavior on smaller screens

### Phase 5: Testing
- [ ] Test Product Info Card with Ref ID value (displays "Ref ID" label)
- [ ] Test Product Info Card without Ref ID (undefined - field hidden)
- [ ] Test responsive behavior (mobile/tablet/desktop)
- [ ] Verify toggle filter removed from all screen sizes
- [ ] Verify "View Full Details" button removed
- [ ] Test card close functionality
- [ ] Verify Ref ID positioned near Barcode (per chosen version)
- [ ] Test transaction table column widths on various screen sizes
- [ ] Verify Notes column text doesn't wrap excessively
- [ ] Verify table horizontal scroll works on narrow viewports

---

## Notes

### Ref ID Data Source
The `merchantSku` field (displayed as "Ref ID" in UI) comes from the transaction data in `stock-card-mock-data.ts`:

```typescript
{
  timestamp: "2026-01-06T11:29:00+07:00",
  type: "RECEIPT_IN",
  quantity: 101,
  balance: 2090,
  notes: "Amy Wang: Gokoo delivery (ORD-8234)",
  merchantSku: "MSKU-FRESH-001", // This value displayed as "Ref ID"
}
```

**Note:** The data field remains `merchantSku` in the code for backward compatibility, but the UI label is changed to "Ref ID". Consider renaming the data field to `refId` in a future data model update.

### Visual Consistency
All versions maintain:
- Same card header (close button, product name, category)
- Same product image display (200x200)
- Same separator line
- Same field label pattern (icon + text)
- Same spacing and padding

### Accessibility
- All icon labels remain accessible via text labels
- Font-mono for SKU maintains readability
- Color contrast maintained for all text
- Touch targets remain 44px minimum (mobile)

---

## Conclusion

This specification provides three distinct approaches to relocating Ref ID (formerly "Merchant SKU") from the filter toggle to the Product Info Card near the Barcode position, while removing the "View Full Details" button and optimizing transaction table column widths.

### Summary of Changes

1. **Field Rename:** "Merchant SKU" → "Ref ID" throughout UI
2. **Position:** Ref ID placed near Barcode in Product Info Card (identifier grouping)
3. **Remove Toggle:** "Show Merchant SKU" filter removed
4. **Remove Button:** "View Full Details" button removed
5. **Table Optimization:** Transaction history column widths adjusted for better readability

### Recommended Approach

**Version 2 (Four-Column Grid)** is recommended for most use cases due to:
- Balanced space efficiency
- Clear visual hierarchy with identifiers (Barcode + Ref ID) in first two columns
- Implementation simplicity
- No additional vertical height

**Transaction Table:** Option A (Expand Notes Column) recommended to utilize freed space.

Choose the version that best fits your design philosophy and user needs.
