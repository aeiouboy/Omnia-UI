# Chore: Separate Store and Store ID Fields in Inventory Pages

## Metadata
adw_id: `844a1040`
prompt: `Update inventory pages with three changes:

  **Change 1: Separate Store and Store ID in Stock by Store table**
  - In src/components/inventory/stock-by-store-table.tsx, split the combined 'Store' column into two separate columns:
    - 'Store' column showing only the store name (Tops Central Plaza ลาดพร้าว)
    - 'Store ID' column showing only the store ID (CFR3841)
  - Update table headers to have separate Store and Store ID columns
  - Update table body cells to render store name and store ID in separate cells
  - Update colspan from 5 to 6 in empty state TableRow
  - The final table should have 6 columns: Store, Store ID, Available, Reserved, Safety Stock, Total

  **Change 2: Remove Store field from product detail section**
  - In src/components/inventory-detail-view.tsx, remove the Store field display from the product detail section
  - This is the section showing 'Store: Tops Central Plaza ลาดพร้าว | CFR3841'
  - Remove the entire generic block that displays store information (icon, label, store name, store ID)
  - Keep all other product detail fields (Barcode, Item Type, Supply Type, Stock Config)

  **Change 3: Separate Store and Store ID in Stock Card page table**
  - In app/inventory/stores/page.tsx, find the stores listing table
  - Split the combined Store/Store ID cell into two separate columns:
    - 'Store' column showing only store name
    - 'Store ID' column showing only store ID
  - Update table headers to include separate Store and Store ID columns
  - Update colspan values accordingly
  - The final table should have separate Store and Store ID columns

  Focus files:
  - src/components/inventory/stock-by-store-table.tsx
  - src/components/inventory-detail-view.tsx
  - app/inventory/stores/page.tsx

  Do NOT remove:
  - Store field from Recent Transactions table
  - Store field from Transaction History tables`

## Chore Description

This chore involves three distinct UI changes to inventory pages to separate the store name and store ID into their own columns, and to remove redundant Store information from the product detail view.

### Change 1: Stock by Store Table Column Split
The `StockByStoreTable` component currently displays store name and store ID in a single column with a nested layout. This needs to be split into two separate columns for better data organization and clarity.

### Change 2: Remove Store Field from Product Detail
The `InventoryDetailView` component's product detail section currently shows Store information alongside other product metadata. This field is redundant since stock data is already filtered by store context and should be removed.

### Change 3: Stock Card Page Table Column Split
The Stock Card page table in `app/inventory/stores/page.tsx` currently shows store name and store ID in a single cell with nested layout. This needs to be split into two separate table columns.

## Relevant Files

### Files to Modify

- **src/components/inventory/stock-by-store-table.tsx**
  - The StockByStoreTable component displays stock levels across store locations
  - Currently has combined Store column (lines 155-163 in header, 218-234 in body)
  - Need to add separate Store ID header and cell
  - Need to update colspan from 5 to 6 for empty state (line 205)

- **src/components/inventory-detail-view.tsx**
  - The InventoryDetailView component displays detailed product information
  - Store field is in Product Details Grid at lines 213-223
  - Need to remove the entire Store field div block (including icon, label, store name, store ID)
  - Keep Barcode, Item Type, Supply Type, and Stock Config fields

- **app/inventory/stores/page.tsx**
  - The Stock Card page lists all stores with performance metrics
  - Table header with combined Store cell at lines 522-530
  - Table body with combined Store cell at lines 597-605
  - Need to add separate Store ID column header and cells
  - Need to update colspan from 7 to 8 for empty state (line 586)

### Related Type Definitions

- **src/types/inventory.ts**
  - Contains `StockLocation` and `StorePerformance` types
  - These types already have `storeName` and `storeId` as separate fields
  - No changes needed to types

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Update StockByStoreTable - Add Store ID Column Header
- In `src/components/inventory/stock-by-store-table.tsx`, locate the `<TableHeader>` section (around line 153)
- After the existing "Store" `TableHead` (lines 155-163), add a new `TableHead` for "Store ID"
- The new Store ID header should have:
  - `onClick={() => handleSort("storeId")}` for sorting capability
  - SortIcon component for visual sort indicator
  - Proper cursor styling for hover interaction
- The header section should now have 6 columns instead of 5

### 2. Update StockByStoreTable - Modify Table Body Cells
- In the `<TableBody>` section (around line 202), locate the store display `TableCell` (lines 218-234)
- Split this cell into two separate `TableCell` elements:
  - First cell: Store name only with `MapPin` icon and `storeName` span
  - Second cell: Store ID only with `storeId` span in monospace font
- Move the "Default" badge to remain with the store name cell
- Update the empty state `TableRow` colspan from 5 to 6 (line 205)

### 3. Update StockByStoreTable - Update Sorting Logic
- The sorting logic already handles `storeName` and `storeId` separately (lines 59-64)
- No changes needed to the sorting implementation
- Verify that the new Store ID column properly triggers sorting when clicked

### 4. Remove Store Field from InventoryDetailView Product Detail Section
- In `src/components/inventory-detail-view.tsx`, locate the Product Details Grid (around line 212)
- Remove the Store field div block entirely (lines 213-223)
  - This includes: icon (Store), label ("Store"), store name span, separator, store ID span
- Keep all other fields intact: Barcode, Item Type, Supply Type, Stock Config
- The grid will now have 4 fields instead of 5 in the first row

### 5. Update Stock Card Page Table - Add Store ID Column Header
- In `app/inventory/stores/page.tsx`, locate the `<TableHeader>` section (around line 520)
- After the existing "Store" `TableHead` (lines 522-530), add a new `TableHead` for "Store ID"
- The new Store ID header should have:
  - `onClick={() => handleSort("storeId")}` for sorting capability
  - SortIcon component for visual sort indicator
  - Appropriate width styling (suggested: `w-[150px]`)

### 6. Update Stock Card Page Table - Modify Table Body Cells
- In the `<TableBody>` section (around line 583), locate the store display `TableCell` (lines 597-604)
- Split this cell into two separate `TableCell` elements:
  - First cell: Store name only with `MapPin` icon
  - Second cell: Store ID only in monospace font with muted styling
- Update the empty state `TableRow` colspan from 7 to 8 (line 586)

### 7. Verify and Test All Changes
- Test the Stock by Store table with data to ensure columns align properly
- Test sorting on both Store and Store ID columns
- Verify the product detail section no longer shows Store field
- Test the Stock Card page table with data
- Verify empty states display correctly with updated colspan values
- Check responsive behavior on mobile screens

## Validation Commands

```bash
# Build the project to check for TypeScript errors
pnpm build

# Run linter to check for code style issues
pnpm lint

# Start development server to manually test changes
pnpm dev
# Then navigate to:
# - /inventory/[id] to verify product detail view
# - /inventory/stores to verify Stock Card page table
```

## Notes

### Important Considerations

1. **Existing Sorting Support**: Both files already have sorting logic for `storeId` - the UI components just need to expose this functionality through separate columns

2. **Grid Layout Changes**: Removing the Store field from inventory-detail-view.tsx will leave 4 fields in the product details grid. The current `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` layout should handle this gracefully.

3. **Colspan Updates**: Critical to update empty state colspan values or the "No locations match your search" / "No stores found matching your search" messages will not span the full table width.

4. **Transaction Tables**: Do NOT modify any Store fields in:
   - Recent Transactions table (used in inventory detail view)
   - Transaction History tables (used in transaction history section)
   These tables should continue to show Store information

5. **Component Props**: Both `StockByStoreTable` and the Stock Card page already receive `storeName` and `storeId` as separate props, so no prop changes are needed.

### File Locations Reference

- `src/components/inventory/stock-by-store-table.tsx:153-200` - Table header section
- `src/components/inventory/stock-by-store-table.tsx:202-251` - Table body section
- `src/components/inventory-detail-view.tsx:211-306` - Product details grid section
- `app/inventory/stores/page.tsx:519-581` - Table header section
- `app/inventory/stores/page.tsx:583-663` - Table body section
