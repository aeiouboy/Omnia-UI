# Chore: Fix Low Stock Items KPI Inconsistency on Stock by Store Page

## Metadata
adw_id: `fd1a75b1`
prompt: `Fix Low Stock Items KPI inconsistency on Stock by Store page: The KPI shows total count of low stock items (5), but the Low Stock filter shows stores with low stock (4 stores). This is confusing. Fix by: 1) Change the Low Stock Items KPI card to show number of STORES with low stock items, not total item count. Label should be "Stores with Low Stock" and description "Stores needing attention". 2) Similarly change Critical Stock Items KPI to show number of STORES with critical items, not total item count. Label should be "Stores with Critical Stock" and description "Stores needing immediate attention". 3) Update the summary calculation in app/inventory/stores/page.tsx to count stores with lowStockItems > 0 and stores with criticalStockItems > 0 instead of summing the item counts. Purpose: Make KPI numbers match the filtered store card counts for clear user experience.`

## Chore Description
The Stock by Store page (app/inventory/stores/page.tsx) currently displays KPI cards at the top that show the total COUNT of items in low/critical stock across all stores. However, when users click the "Low Stock" or "Critical Stock" filter buttons, they see the number of STORES that have low/critical stock items, not the number of items.

This creates confusion because:
- Low Stock Items KPI shows "5" (total items across all stores)
- Low Stock filter button shows 4 store cards (4 stores with low stock items)
- The numbers don't match, making users confused about what the KPI represents

The fix aligns the KPI cards to show STORE counts instead of ITEM counts, making the dashboard more intuitive:
- "Stores with Low Stock" (count of stores with lowStockItems > 0)
- "Stores with Critical Stock" (count of stores with criticalStockItems > 0)

This way, when users see "4" in the KPI and click the filter, they'll see exactly 4 store cards, creating a consistent user experience.

## Relevant Files
Use these files to complete the chore:

- **app/inventory/stores/page.tsx** (lines 69-77, 232-280)
  - Contains the summary calculation logic (lines 69-77) that currently sums item counts
  - Contains the KPI card UI (lines 232-280) with labels and descriptions to update
  - This is the PRIMARY file to modify

- **src/types/inventory.ts** (lines 116-124)
  - Defines the StorePerformance interface for reference
  - No changes needed, but useful to understand data structure

- **src/lib/mock-inventory-data.ts** (lines 730-782)
  - Contains generateStorePerformanceFromInventory() function for reference
  - Shows how lowStockItems and criticalStockItems are calculated per store
  - No changes needed, just for understanding the data source

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Summary Calculation Logic
- Open `app/inventory/stores/page.tsx`
- Locate the `summary` useMemo block (lines 69-77)
- Change `totalLowStock` calculation from summing item counts to counting stores
  - Replace: `totalLowStock: storeData.reduce((sum, store) => sum + store.lowStockItems, 0),`
  - With: `totalLowStock: storeData.filter((store) => store.lowStockItems > 0).length,`
- Change `totalCriticalStock` calculation from summing item counts to counting stores
  - Replace: `totalCriticalStock: storeData.reduce((sum, store) => sum + store.criticalStockItems, 0),`
  - With: `totalCriticalStock: storeData.filter((store) => store.criticalStockItems > 0).length,`

### 2. Update Low Stock Items KPI Card
- Locate the Low Stock Items card (lines 255-266)
- Update the CardTitle text:
  - Replace: `"Low Stock Items"`
  - With: `"Stores with Low Stock"`
- Update the description text:
  - Replace: `"Needs attention"`
  - With: `"Stores needing attention"`

### 3. Update Critical Stock Items KPI Card
- Locate the Critical Stock Items card (lines 268-279)
- Update the CardTitle text:
  - Replace: `"Critical Stock Items"`
  - With: `"Stores with Critical Stock"`
- Update the description text:
  - Replace: `"Immediate attention"`
  - With: `"Stores needing immediate attention"`

### 4. Validate Changes in Browser
- Start the development server: `pnpm dev`
- Navigate to http://localhost:3000/inventory/stores
- Verify the KPI cards show:
  - "Stores with Low Stock" label with description "Stores needing attention"
  - "Stores with Critical Stock" label with description "Stores needing immediate attention"
- Click the "Low Stock" filter button and count the displayed store cards
- Verify the number matches the "Stores with Low Stock" KPI value
- Click the "Critical Stock" filter button and count the displayed store cards
- Verify the number matches the "Stores with Critical Stock" KPI value
- Click "All Stores" to reset and verify all KPIs are accurate

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# Check TypeScript compilation
pnpm build

# Start development server for manual testing
pnpm dev
# Then navigate to http://localhost:3000/inventory/stores
# Verify KPI cards show store counts that match filter results
```

## Notes
- The change is purely presentational - no data model changes required
- The StorePerformance interface already contains lowStockItems and criticalStockItems per store
- This fix improves UX by making KPI values match filtered results
- No database changes needed - works with both mock data and Supabase
- After this fix, users will see consistent numbers between KPIs and filtered store cards
