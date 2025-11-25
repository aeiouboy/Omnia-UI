# Chore: Update Inventory Stock Column Format

## Metadata
adw_id: `8db0d163`
prompt: `Update the inventory page to change the stock column to show 'available/quantity' format. Find the inventory page component (likely in app/inventory or components), locate the stock column definition, and change it to display two separate columns or a combined column showing 'available/quantity' (e.g., '50/100' meaning 50 available out of 100 total quantity). Update the column header text, the data display format, and ensure proper alignment. If there's mock data, update it to include both available and quantity fields.`

## Chore Description
This chore updates the inventory page table to change how stock information is displayed. Currently, the stock column shows `currentStock / minStockLevel` (e.g., "245 / 100"). The requirement is to change this to show `available/quantity` format instead. This requires:

1. Understanding what "available" and "quantity" mean in the inventory context
2. Updating the TypeScript type definitions to include both fields
3. Updating the mock data to include both `available` and `quantity` fields
4. Updating the inventory page table display to show the new format
5. Ensuring proper alignment and formatting

**Current Implementation Analysis:**
- Stock column is at `/app/inventory/page.tsx:481-483`
- Currently displays: `{item.currentStock} / {item.minStockLevel}`
- Type definitions in: `/src/types/inventory.ts`
- Mock data in: `/src/lib/mock-inventory-data.ts`
- Inventory detail view also shows stock info in: `/src/components/inventory-detail-view.tsx`

**Interpretation:**
- "available" = stock available for sale (not reserved/allocated)
- "quantity" = total current stock (including reserved/allocated)
- This means: `available ≤ quantity ≤ maxStockLevel`

## Relevant Files
Use these files to complete the chore:

- `/src/types/inventory.ts` - Update the `InventoryItem` interface to add `availableStock` field (rename `currentStock` might break other components, so add new field)
- `/src/lib/mock-inventory-data.ts` - Update mock inventory items to include `availableStock` field with realistic values (should be ≤ currentStock)
- `/app/inventory/page.tsx` - Update the stock column display to show `available/quantity` format (line 481-483), update column header text (line 418-422)
- `/src/components/inventory-detail-view.tsx` - Update the detail view to show the new available/quantity format in the Current Stock card (line 252-268) and other relevant locations
- `/src/lib/inventory-service.ts` - Update database conversion function `convertDBItemToInventoryItem` to handle the new field (line 49-68)

### New Files
No new files needed - only updating existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update TypeScript Type Definitions
- Add `availableStock: number` field to the `InventoryItem` interface in `/src/types/inventory.ts`
- Add corresponding `available_stock: number` field to the `InventoryItemDB` database interface
- Add JSDoc comment explaining: "Stock available for sale (not reserved/allocated). Must be ≤ currentStock"

### 2. Update Mock Inventory Data
- In `/src/lib/mock-inventory-data.ts`, add `availableStock` field to all mock inventory items
- Calculate realistic values: `availableStock = currentStock - (random reserved amount between 0-20% of currentStock)`
- Ensure `availableStock ≤ currentStock` for all items
- For items with low/critical status, make the available stock even lower to emphasize the issue

### 3. Update Database Conversion Function
- In `/src/lib/inventory-service.ts`, update `convertDBItemToInventoryItem` function (line 49-68)
- Add mapping for `availableStock: dbItem.available_stock` with fallback to `currentStock` if not present
- This ensures backward compatibility if the database doesn't have the field yet

### 4. Update Inventory Page Table Display
- In `/app/inventory/page.tsx`, locate the stock column header (lines 414-422)
- Change header text from "Stock" to "Available / Total"
- Update the table cell display (lines 481-483) to show: `{item.availableStock} / {item.currentStock}`
- Ensure proper text alignment (center-aligned)
- Keep the existing sortable functionality on the column

### 5. Update Inventory Detail View
- In `/src/components/inventory-detail-view.tsx`, locate the "Current Stock" card (lines 252-268)
- Update the display to show "Available: X / Total: Y" format
- Update the card title to "Available / Total Stock"
- Update the subtitle text to clarify the meaning: "available / total units in stock"
- Update any other locations in the detail view that display stock information

### 6. Test the Changes
- Run the development server: `pnpm dev`
- Navigate to `/inventory` page and verify:
  - Column header shows "Available / Total"
  - Each row shows the format "X / Y" where X ≤ Y
  - Sorting by stock column still works correctly
  - Values are center-aligned and easy to read
- Click on an inventory item to view details and verify:
  - Detail page shows the new format correctly
  - All stock-related displays use consistent terminology

### 7. Validate Type Safety
- Run TypeScript compiler check: `pnpm build`
- Ensure no TypeScript errors related to the new field
- Verify all components using `InventoryItem` type still compile correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript compilation errors
- `pnpm dev` - Start development server and manually test inventory page
- Navigate to `http://localhost:3000/inventory` - Verify table displays "Available / Total" format
- Click on any inventory item - Verify detail page shows correct format
- Test sorting on stock column - Ensure sorting still works correctly

## Notes

**Design Considerations:**
- Keep the format compact to fit mobile screens: "50/100" not "50 / 100"
- Use center alignment for better readability of numeric data
- Maintain existing color coding and status badges

**Data Integrity:**
- Always ensure: `0 ≤ availableStock ≤ currentStock ≤ maxStockLevel`
- For mock data, simulate realistic scenarios (10-20% reserved/allocated stock)

**Backward Compatibility:**
- If database doesn't have `available_stock` field, fallback to using `currentStock` for both values
- This prevents breaking existing deployments during migration

**Future Enhancements (not in scope):**
- Add "Reserved" or "Allocated" column to show the difference
- Add tooltip to explain what "available" vs "total" means
- Add filtering by availability status
