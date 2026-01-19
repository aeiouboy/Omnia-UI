# Chore: Inventory Module UI/UX Improvements and Data Validation

## Metadata
adw_id: `5e43d710`
prompt: `Inventory Module UI/UX Improvements and Data Validation - Config value display, field renaming, status alignment, mock data validation, store-specific filtering`

## Chore Description
This chore implements comprehensive UI/UX improvements and data validation for the Inventory module. The changes include:

1. **Config Value Display**: Change config value separator to use '/' and 'x' icon formatting
2. **Field Renaming**: Multiple field renames across Stock by Store and Recent Transactions sections
3. **Status Alignment**: Ensure Status field consistency between Inventory Management page and detail views
4. **Field Removal**: Remove 'Store Status' field from Stock by Store section
5. **Mock Data Validation**: Validate and fix sequential balance calculation logic in mock transactions
6. **Page/Button Renaming**: Rename 'Stock by Store' to 'Stock Card' throughout
7. **Store Context Filtering**: Implement proper data filtering when viewing inventory from store-specific context

## Relevant Files
Use these files to complete the chore:

### Core Component Files
- **`src/components/inventory-detail-view.tsx`** (lines 467-483): Contains the Stock by Store section that needs field renaming and conditional hiding based on store context
- **`src/components/inventory/stock-by-store-table.tsx`** (lines 163-238): Table component with column headers that need renaming ('Store/Warehouse' -> 'Store', 'Location Code' -> 'Store ID', remove 'Store Status' column)
- **`src/components/recent-transactions-table.tsx`** (lines 214-226): Table headers that need renaming ('Available' -> 'Balance', 'Location' -> 'Store')

### Mock Data Files
- **`src/lib/mock-inventory-data.ts`** (lines 1038-1123): `generateMockTransactions()` function that needs logic fix for sequential balance calculation starting from restocking

### Page Files
- **`app/inventory/page.tsx`** (lines 397-401): Button text and navigation that needs 'Stock by Store' -> 'Stock Card' rename
- **`app/inventory/[id]/page.tsx`**: May need store context parameter handling for conditional section display
- **`app/inventory/stores/page.tsx`** (line 253): Page title and header that needs 'Stock by Store' -> 'Stock Card' rename

### Type Definitions
- **`src/types/inventory.ts`**: Reference for data structures (no changes needed, but important for understanding StockTransaction, StockLocation types)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Rename Stock by Store Table Headers
- In `src/components/inventory/stock-by-store-table.tsx`:
  - Line 171: Change "Store/Warehouse" to "Store"
  - Line 180: Change "Location Code" to "Store ID"
  - Remove the "Store Status" column entirely (lines 229-237 header, lines 297-313 cell)
  - Update sortField type to remove "locationStatus" option if no longer needed
  - Update colSpan in empty state row from 8 to 7

### 2. Remove Store Status Column from Stock by Store Table
- In `src/components/inventory/stock-by-store-table.tsx`:
  - Remove the TableHead for "Store Status" (lines 229-237)
  - Remove the TableCell that displays store status badge (lines 297-313)
  - Update the SortField type to remove "locationStatus" if present
  - Update the sorting logic in filteredLocations useMemo to remove locationStatus case

### 3. Align Status Field Display
- In `src/components/inventory/stock-by-store-table.tsx`:
  - Verify the "Status" column shows the same values as Inventory Management page
  - The Status should display based on stock availability using `StockAvailabilityIndicator` component
  - Current implementation uses isAvailable (stockAvailable > 0) which matches main page logic

### 4. Rename Recent Transactions Table Headers
- In `src/components/recent-transactions-table.tsx`:
  - Line 221: Change "Available" header to "Balance"
  - Line 222: Change "Location" header to "Store"

### 5. Fix Mock Data Transaction Balance Calculation
- In `src/lib/mock-inventory-data.ts`, modify `generateMockTransactions()` function:
  - Refactor to generate transactions in chronological order (oldest to newest)
  - Start with initial balance and first transaction should be "stock_in" (Restocking)
  - Calculate sequential balance changes:
    - stock_in: balance += quantity (Restocking adds stock)
    - stock_out: balance -= quantity (Sales reduces stock)
    - return: balance += quantity (Returns add back stock)
    - adjustment: balance += quantity (can be positive or negative)
  - Set `balanceAfter` for each transaction based on running balance
  - Sort final array from most recent to oldest for display (reverse chronological)

### 6. Rename Stock by Store Button to Stock Card
- In `app/inventory/page.tsx`:
  - Line 400: Change button text from "Stock by Store" to "Stock Card"

### 7. Rename Stock by Store Page Title to Stock Card
- In `app/inventory/stores/page.tsx`:
  - Line 253: Change page title from "Stock by Store" to "Stock Card"
  - Update any other references to "Stock by Store" in the page (descriptions, button texts)

### 8. Rename Store Name Field to Store
- In `app/inventory/stores/page.tsx`:
  - Review table headers and card labels for "Store Name" and change to "Store"
  - Line 475: Change header "Store Name" to "Store" in table view

### 9. Implement Store-Specific Data Filtering Logic
- In `app/inventory/[id]/page.tsx`:
  - Accept and pass `storeId` or `storeName` query parameter to detail view
  - Pass store context to `InventoryDetailView` component

- In `src/components/inventory-detail-view.tsx`:
  - Add optional `storeContext` prop to interface
  - Conditionally hide "Stock by Store" section when viewing from store-filtered context (single store view)
  - Filter transactions to show only transactions from selected store when in store context

### 10. Update InventoryDetailView Props and Logic
- In `src/components/inventory-detail-view.tsx`:
  - Add `storeContext?: string` to `InventoryDetailViewProps` interface
  - Wrap Stock by Store section with conditional: `{!storeContext && item.warehouseLocations && ...}`
  - Filter transactions by `warehouseCode` matching store context when provided:
  ```typescript
  const filteredTransactions = storeContext
    ? transactions.filter(t => t.warehouseCode === storeContext)
    : transactions
  ```

### 11. Validate and Test All Changes
- Run development server: `pnpm dev`
- Verify all field renames appear correctly in:
  - Inventory Management page (Stock Card button)
  - Stock Card page (title, Store column)
  - Inventory Detail page (Stock by Store section headers)
  - Recent Transactions table (Balance, Store columns)
- Test store-specific filtering:
  - Navigate to store from Stock Card page
  - Click on a product
  - Verify Stock by Store section is hidden
  - Verify transactions show only from selected store
- Test mock data balance calculation:
  - View Recent Transactions for any product
  - Verify balance changes logically follow transaction types

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript or build errors
- `pnpm lint` - Verify no linting issues introduced
- `pnpm dev` - Start development server and manually test:
  1. Navigate to `/inventory` - verify "Stock Card" button
  2. Click "Stock Card" button - verify page title shows "Stock Card"
  3. Click any store card - verify inventory filtered by store
  4. Click a product - verify "Stock by Store" section is hidden (single store context)
  5. Navigate to `/inventory` without store filter
  6. Click a product - verify "Stock by Store" section shows with renamed headers (Store, Store ID, no Store Status)
  7. Check Recent Transactions table - verify "Balance" and "Store" headers
  8. Verify transaction Balance values make logical sense (increases on stock_in, decreases on stock_out)

## Notes
- The Status field in Stock by Store section currently uses `StockAvailabilityIndicator` which should already match the Inventory Management page - verify this is consistent
- When implementing store context filtering, consider that the URL parameter is `store` (e.g., `/inventory?store=Tops%20Central%20World`)
- The mock data transaction fix is important for realistic test data - ensure the first transaction in chronological order is always a "stock_in" to establish initial balance
- Config value separator formatting using '/' and 'x' icon was mentioned but needs clarification on exact location - may refer to stock config display in detail view
