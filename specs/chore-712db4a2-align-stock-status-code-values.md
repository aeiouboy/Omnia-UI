# Chore: Align Stock Status Internal Code Values with Display Labels

## Metadata
adw_id: `712db4a2`
prompt: `Align stock status internal code values with display labels. In inventory types and services, rename 'critical' status to 'outOfStock', rename 'healthy' status to 'inStock'. Update all files that reference these status values: src/types/inventory.ts, src/lib/inventory-service.ts, app/inventory-new/page.tsx, and related components.`

## Chore Description
Refactor internal stock status codes to use more semantic names that align with their user-facing display labels. Currently, the inventory system uses `"healthy"` and `"critical"` as internal status codes, which are then mapped to display labels like "In Stock" and "Out of Stock". This chore will rename:

- `"healthy"` → `"inStock"` (displayed as "In Stock")
- `"critical"` → `"outOfStock"` (displayed as "Out of Stock")
- `"low"` → remains `"low"` (displayed as "Low Stock")

This refactoring improves code readability by making the internal status values self-documenting and consistent with their display meanings. The change affects type definitions, service layer logic, UI components, and mock data generation.

## Relevant Files
Use these files to complete the chore:

- **src/types/inventory.ts** (lines 36-50) - Primary type definition for `InventoryStatus`. Update the type union and JSDoc comments to reflect the new status names.

- **src/lib/inventory-service.ts** (lines 172-182, 554-556) - Service layer filtering logic. Update status comparison logic in `applyFilters()` and `fetchInventorySummary()` functions.

- **src/lib/mock-inventory-data.ts** (lines 126-135, 2515, 2560, and all hardcoded status values) - Mock data generation. Update:
  - `getSupplyTypeForProduct()` function (line 128) that checks for "critical" status
  - Status calculation logic in multi-store item generation (lines 2515, 2560)
  - All hardcoded status values in the static mock items array

- **app/inventory-new/page.tsx** (lines 68-92, 281-284) - Main inventory page. Update:
  - `getStatusBadgeVariant()` function
  - `getStatusLabel()` function (display labels remain unchanged)
  - Status filtering logic in summary calculations (lines 281-284)

- **src/components/inventory-detail-view.tsx** (lines 74-97) - Inventory detail view component. Update:
  - `getStatusBadgeVariant()` helper function
  - `getStatusLabel()` helper function

- **app/inventory/page.tsx** (legacy inventory page) - Update status handling if still in use

- **app/inventory-new/stores/page.tsx** - Stock card page, may reference status values

### New Files
No new files required. This is a pure refactoring chore.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Type Definitions
- Open `src/types/inventory.ts`
- Update `InventoryStatus` type definition from `"healthy" | "low" | "critical"` to `"inStock" | "low" | "outOfStock"` (line 50)
- Update JSDoc comments for `InventoryStatus` to reflect the new status names:
  - Change `"healthy"` references to `"inStock"`
  - Change `"critical"` references to `"outOfStock"`
  - Update the user-facing label descriptions accordingly (lines 40-48)

### 2. Update Service Layer Logic
- Open `src/lib/inventory-service.ts`
- Update `applyFilters()` function:
  - Change status comparison from `item.status === "low"` to `item.status === "low"` (unchanged)
  - Change status comparison from `item.status === "critical"` to `item.status === "outOfStock"` (line 181)
- Update `fetchInventorySummary()` function:
  - Change `healthyItems` filter from `item.status === "healthy"` to `item.status === "inStock"` (line 554)
  - Change `criticalStockItems` filter from `item.status === "critical"` to `item.status === "outOfStock"` (line 556)

### 3. Update Mock Data Generation
- Open `src/lib/mock-inventory-data.ts`
- Update `getSupplyTypeForProduct()` function:
  - Change condition from `status === "critical"` to `status === "outOfStock"` (line 129)
- Update multi-store item generation logic:
  - Find status calculation at line 2515: change `"healthy"` to `"inStock"` and `"critical"` to `"outOfStock"`
  - Find status calculation at line 2560: change `"healthy"` to `"inStock"` and `"critical"` to `"outOfStock"`
- Update all hardcoded static mock inventory items:
  - Replace all instances of `status: "healthy"` with `status: "inStock"`
  - Replace all instances of `status: "critical"` with `status: "outOfStock"`
  - Use find-and-replace with care to avoid changing string literals in other contexts

### 4. Update UI Components - Main Inventory Page
- Open `app/inventory-new/page.tsx`
- Update `getStatusBadgeVariant()` function (lines 68-79):
  - Change case `"healthy":` to case `"inStock":`
  - Change case `"critical":` to case `"outOfStock":`
  - Keep the return values and styling unchanged
- Update `getStatusLabel()` function (lines 81-92):
  - Change case `"healthy":` to case `"inStock":`
  - Change case `"critical":` to case `"outOfStock":`
  - Keep the display labels unchanged: "In Stock" and "Out of Stock"
- Update status filtering in summary calculations (lines 281-284):
  - Change `item.status === "healthy"` to `item.status === "inStock"`
  - Change `item.status === "critical"` to `item.status === "outOfStock"`

### 5. Update UI Components - Inventory Detail View
- Open `src/components/inventory-detail-view.tsx`
- Update `getStatusBadgeVariant()` function (lines 74-84):
  - Change case `"healthy":` to case `"inStock":`
  - Change case `"critical":` to case `"outOfStock":`
- Update `getStatusLabel()` function (lines 87-97):
  - Change case `"healthy":` to case `"inStock":`
  - Change case `"critical":` to case `"outOfStock":`
  - Keep display labels unchanged

### 6. Update Other Affected Components
- Search for any other files that reference `"healthy"` or `"critical"` status values:
  - Check `app/inventory/page.tsx` (legacy page)
  - Check `app/inventory-new/stores/page.tsx` (stock card page)
  - Check `src/components/inventory/stock-availability-indicator.tsx`
  - Update status comparisons and switch cases as needed

### 7. Validate TypeScript Compilation
- Run `pnpm build` to ensure no TypeScript errors
- Verify that all status comparisons use the new values
- Check that the build completes successfully with no type errors

### 8. Verify UI Display
- Run `pnpm dev` to start the development server
- Navigate to inventory pages and verify:
  - Status badges display correctly ("In Stock", "Low Stock", "Out of Stock")
  - Status badges have correct colors (green, yellow, red)
  - Filtering by status works correctly
  - Summary statistics calculate correctly
  - Detail views display status correctly
- Verify that changing internal codes did not affect user-facing labels

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `grep -r '"healthy"' src/types/inventory.ts src/lib/inventory-service.ts src/lib/mock-inventory-data.ts app/inventory-new/page.tsx src/components/inventory-detail-view.tsx` - Should return NO matches (all replaced)
- `grep -r '"critical"' src/types/inventory.ts src/lib/inventory-service.ts src/lib/mock-inventory-data.ts app/inventory-new/page.tsx src/components/inventory-detail-view.tsx` - Should return NO matches in status contexts (all replaced)
- `grep -r '"inStock"' src/types/inventory.ts src/lib/inventory-service.ts app/inventory-new/page.tsx` - Should return matches for the new status value
- `grep -r '"outOfStock"' src/types/inventory.ts src/lib/inventory-service.ts app/inventory-new/page.tsx` - Should return matches for the new status value
- `pnpm dev` - Start development server and manually verify inventory pages display correctly

## Notes
- This is a refactoring chore with NO changes to user-facing labels or UI behavior
- The display labels ("In Stock", "Low Stock", "Out of Stock") remain exactly the same
- Internal code values are changing for better semantic clarity and self-documentation
- Badge colors and styling remain unchanged (green, yellow, red)
- All status filtering, calculation, and display logic should work identically after the refactoring
- The change affects both static mock data and dynamic status calculation logic
- Be careful with find-and-replace to avoid changing unrelated string literals (e.g., JSDoc comments should be updated, but not strings like "healthy food")
