# Chore: Implement UI Feedback for Inventory Pages

## Metadata
adw_id: `82a6e71d`
prompt: `Implement UI feedback for Inventory pages with the following changes:

**INVENTORY MANAGEMENT PAGE:**
1. Breakdown stock by store (store view): Display stock by store to identify which store needs stock adjustment first
2. Remove Category column from the table
3. Remove Price column from the table
4. Remove Total Inventory Value Box from the KPI cards
5. Disable the Import button
6. Disable the Export button


**INVENTORY DETAIL PAGE:**
1. Remove Supplier field from product info section
2. Remove Unit price field from product info section
3. UOM Display: Add flag for UOM type (weight/pack weight/pack/normal) - Weight UOM should show 3 decimal digits (e.g. xx.xxx kg)
4. Remove Unit Price and Supplier columns from stock table
5. Remove User column - move action owner details to NOTES column (e.g. uploaded file name)
6. Remove tabs/sections for: min/max, reorder point, total value
7. Recent Transaction table changes:
   - Add filtering by action type (e.g. Stock out for online order deductions)
   - Add Channel column (Grab, Lineman, Gokoo) to show source
   - Show transactions for last 7 days
   - Rename Balance after to Available
   - Add source store and order ID fields to identify where stock was deducted
8. Stock breakdown: Adjust formula to Total = Available + Reserve + Safety
9. Disable the Edit stock info button`

## Chore Description
This chore implements comprehensive UI changes to both the Inventory Management List page (`/inventory`) and the Inventory Detail page (`/inventory/[id]`). The changes focus on simplifying the UI by removing unnecessary columns and fields, enhancing the Recent Transactions table with filtering and additional context, and adjusting stock breakdown calculations to use a clearer formula.

### Key Changes Summary:

**Inventory Management Page (`app/inventory/page.tsx`):**
- Add a new "Stock by Store" section showing aggregated stock status per store
- Remove the Category column from the products table
- Remove the Price column from the products table
- Remove the "Total Inventory Value" KPI card
- Disable the "Import" button
- Disable the "Export" button

**Inventory Detail Page (`src/components/inventory-detail-view.tsx`):**
- Remove Supplier and Unit Price from product info section
- Enhance Item Type display with UOM formatting (weight items show 3 decimal places)
- Remove "Min/Max Stock", "Reorder Point", and "Total Value" from Stock Breakdown section
- Update stock formula display: Total = Available + Reserve + Safety
- Disable the "Edit" button

**Recent Transactions Table (`src/components/recent-transactions-table.tsx`):**
- Add filter dropdown for action type (Stock In, Stock Out, Adjustment, etc.)
- Add Channel column (Grab, Lineman, Gokoo, N/A)
- Filter to show only last 7 days of transactions
- Rename "Balance After" to "Available"
- Remove User column, move action owner info to Notes column
- Add Source Store and Order ID display

**Type Updates (`src/types/inventory.ts`):**
- Add `channel` field to StockTransaction type
- Add `sourceStore` field to StockTransaction type

**Mock Data Updates (`src/lib/mock-inventory-data.ts`):**
- Update mock transaction generator to include channel and sourceStore

## Relevant Files
Use these files to complete the chore:

### Files to Modify

- **`app/inventory/page.tsx`** - Main inventory list page
  - Remove Category column from table header and body
  - Remove Price column from table header and body
  - Remove "Total Inventory Value" KPI card
  - Add new "Stock by Store" summary section above the table
  - Update colspan in empty state message

- **`src/components/inventory-detail-view.tsx`** - Product detail view component
  - Remove Supplier field from product details grid
  - Remove Unit Price field from product details grid
  - Enhance Item Type display with UOM formatting (3 decimals for weight)
  - Remove Min/Max Stock, Reorder Point, and Total Value from Stock Breakdown
  - Update stock formula explanation
  - Disable the Edit button

- **`src/components/recent-transactions-table.tsx`** - Transactions table component
  - Add action type filter dropdown (state + UI)
  - Add Channel column to table
  - Rename "Balance After" header to "Available"
  - Remove User column
  - Move user info into Notes column
  - Add Source Store display
  - Filter to last 7 days
  - Improve Order ID visibility in Notes

- **`src/types/inventory.ts`** - TypeScript type definitions
  - Add `channel?: 'Grab' | 'Lineman' | 'Gokoo' | null` to StockTransaction
  - Add `sourceStore?: string` to StockTransaction

- **`src/lib/mock-inventory-data.ts`** - Mock data generation
  - Update `generateMockTransactions()` to include channel for stock_out types
  - Update `generateMockTransactions()` to include sourceStore

### New Files

None required - all changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update TypeScript Types
- Open `src/types/inventory.ts`
- Add `channel?: 'Grab' | 'Lineman' | 'Gokoo' | null` field to `StockTransaction` interface
- Add `sourceStore?: string` field to `StockTransaction` interface
- Ensure proper JSDoc comments for new fields

### 2. Update Mock Data Generator
- Open `src/lib/mock-inventory-data.ts`
- Locate `generateMockTransactions()` function
- Add channel assignment for `stock_out` transactions (randomly select from Grab, Lineman, Gokoo, or null)
- Add sourceStore assignment using random TOPS_STORES selection
- Update transaction notes generation to include user information (for later Notes column consolidation)

### 3. Modify Inventory Management Page - Remove Columns
- Open `app/inventory/page.tsx`
- Remove the Category column:
  - Delete TableHead for Category (lines ~418-425)
  - Delete TableCell for Category (line ~494-496)
  - Remove `category` from SortField type if used
  - Remove handleSort for category if present
- Remove the Price column:
  - Delete TableHead for Price (lines ~445-453)
  - Delete TableCell for Price (lines ~535-537)
  - Remove `unitPrice` from SortField type
  - Remove handleSort for unitPrice if present
- Update colspan in empty state TableCell from 10 to 8

### 4. Modify Inventory Management Page - Remove KPI Card
- In `app/inventory/page.tsx`
- Locate KPI Summary Cards section (lines ~288-337)
- Remove the "Total Inventory Value" Card (4th card)
- Change grid from `lg:grid-cols-4` to `lg:grid-cols-3`

### 5. Add Stock by Store Summary Section
- In `app/inventory/page.tsx`
- Add new state: `const [storeStockSummary, setStoreStockSummary] = useState<Record<string, {total: number, low: number, critical: number}>>({})`
- Calculate store summary from inventory items in loadData function
- Add new Card section after KPI cards showing:
  - Grid of store cards with store name
  - Total products count per store
  - Low stock count (yellow badge)
  - Critical stock count (red badge)
  - Visual indicator (progress bar or color coding)

### 6. Modify Inventory Detail View - Remove Product Info Fields
- Open `src/components/inventory-detail-view.tsx`
- Locate Product Details Grid (lines ~299-354)
- Remove the Supplier field div (lines ~316-322)
- Remove the Unit Price field div (lines ~324-330)
- Adjust grid layout if needed

### 7. Enhance Item Type Display with UOM Formatting
- In `src/components/inventory-detail-view.tsx`
- Locate Item Type display section (lines ~332-353)
- Add UOM formatting helper function:
  ```typescript
  const formatStockWithUOM = (stock: number, itemType: ItemType) => {
    if (itemType === 'weight') {
      return `${stock.toFixed(3)} kg`
    }
    return `${stock} pcs`
  }
  ```
- Update Stock Breakdown cards to use this formatter for stock values
- Add UOM indicator badge showing measurement type

### 8. Modify Stock Breakdown Section
- In `src/components/inventory-detail-view.tsx`
- Locate Stock Breakdown section (lines ~376-560)
- Remove the "Additional Stock Info" section (lines ~541-558):
  - Remove Min/Max Stock display
  - Remove Reorder Point display
  - Remove Total Value display
- Keep only: Available, Reserved, Safety Stock, and Total Stock cards
- Update Total Stock card description to show formula: "Total = Available + Reserve + Safety"
- Update Total Stock calculation: ensure it displays sum of available + reserved + safetyStock

### 9. Disable Edit Button
- In `src/components/inventory-detail-view.tsx`
- Locate Edit button (lines ~236-243)
- Add `disabled` prop to the Button
- Add tooltip explaining why disabled (optional)
- Style the button to appear disabled (opacity, cursor)

### 10. Modify Recent Transactions Table - Add Filter
- Open `src/components/recent-transactions-table.tsx`
- Add state for filter: `const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all')`
- Import Select components from UI library
- Add filter dropdown above table with options:
  - All Types
  - Stock In
  - Stock Out
  - Adjustment
  - Spoilage
  - Return
- Apply filter to displayed transactions

### 11. Modify Recent Transactions Table - Add Channel Column
- In `src/components/recent-transactions-table.tsx`
- Add new TableHead for "Channel" after Type column
- Add new TableCell displaying channel badge:
  - Grab: green badge
  - Lineman: yellow badge
  - Gokoo: blue badge
  - N/A: gray text for non-online transactions

### 12. Modify Recent Transactions Table - Rename and Remove Columns
- In `src/components/recent-transactions-table.tsx`
- Rename "Balance After" TableHead to "Available"
- Remove "User" TableHead
- Remove "User" TableCell
- Update Notes TableCell to include user info: `{transaction.user}: {transaction.notes}`

### 13. Modify Recent Transactions Table - Add Source Store
- In `src/components/recent-transactions-table.tsx`
- Add Source Store display in Notes column for stock_out transactions
- Format: "From: {sourceStore} | Order: {orderId}"
- Show only when sourceStore and referenceId exist

### 14. Modify Recent Transactions Table - Filter to 7 Days
- In `src/components/recent-transactions-table.tsx`
- Add date filtering logic to filter transactions to last 7 days
- Use useMemo for filtered transactions
- Update card description to say "Transactions from last 7 days"

### 15. Update Mock Data for Realistic Testing
- In `src/lib/mock-inventory-data.ts`
- Ensure `generateMockTransactions()` generates transactions:
  - With dates spread across last 7-14 days (some will be filtered out)
  - With channel values for stock_out types
  - With sourceStore values for stock_out types
  - With more descriptive notes including actor information

### 16. Test and Validate All Changes
- Run development server: `pnpm dev`
- Navigate to `/inventory` page:
  - Verify Category column is removed
  - Verify Price column is removed
  - Verify Total Inventory Value card is removed
  - Verify Stock by Store section displays correctly
- Navigate to `/inventory/[id]` page:
  - Verify Supplier field is removed
  - Verify Unit Price field is removed
  - Verify Item Type shows correct UOM formatting
  - Verify Stock Breakdown shows only 4 cards
  - Verify Total formula is displayed correctly
  - Verify Edit button is disabled
  - Verify Recent Transactions table has filter
  - Verify Channel column is present
  - Verify "Available" column replaces "Balance After"
  - Verify User column is removed, info in Notes
  - Verify Source Store shows for stock_out
  - Verify only last 7 days transactions shown

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm lint` - Ensure no linting errors after changes
- `pnpm build` - Verify production build succeeds without errors
- `pnpm dev` - Start development server for manual testing

### Manual Validation Checklist:

**Inventory Management Page (`/inventory`):**
- [ ] Category column is NOT visible in table
- [ ] Price column is NOT visible in table
- [ ] Total Inventory Value KPI card is NOT visible
- [ ] Stock by Store section displays all 8 Tops stores
- [ ] Each store shows total products, low stock, and critical counts

**Inventory Detail Page (`/inventory/[id]`):**
- [ ] Supplier field is NOT visible in product info
- [ ] Unit Price field is NOT visible in product info
- [ ] Weight items show stock as "xx.xxx kg"
- [ ] Unit items show stock as "xx pcs"
- [ ] Min/Max Stock is NOT visible
- [ ] Reorder Point is NOT visible
- [ ] Total Value is NOT visible
- [ ] Total Stock card shows formula text
- [ ] Edit button is disabled (grayed out, not clickable)

**Recent Transactions Table:**
- [ ] Filter dropdown exists and works
- [ ] Channel column displays with colored badges
- [ ] Column header says "Available" not "Balance After"
- [ ] User column is NOT visible
- [ ] Notes column includes user info
- [ ] Source store visible for stock_out transactions
- [ ] Order ID visible for stock_out transactions
- [ ] Only transactions from last 7 days are shown

## Notes

### Design Considerations
- The Stock by Store section should use the same visual style as the existing KPI cards
- Channel badges should be visually distinct: Grab (green), Lineman (yellow), Gokoo (blue)
- The disabled Edit button should still be visible but clearly non-interactive

### UOM Formatting Logic
```typescript
// Weight items (weight, pack weight): 3 decimal places with "kg"
// Unit items (pack, normal): whole numbers with "pcs"

type UOMType = 'weight' | 'pack_weight' | 'pack' | 'normal'

// In the current codebase, ItemType = 'weight' | 'unit'
// 'weight' maps to weight-based UOM (3 decimals)
// 'unit' maps to piece-based UOM (whole numbers)
```

### Stock Formula Change
- Current display shows various statistics
- New display: Total Stock = Available + Reserved + Safety Stock
- This provides a clearer picture of stock allocation

### Transaction Filtering
- Show only transactions from the last 7 days
- Use GMT+7 (Asia/Bangkok) timezone for consistency with rest of app
- Filter is applied client-side on the transactions array

### Backwards Compatibility
- Type changes include optional fields to maintain compatibility
- Mock data updates are additive, not breaking
