# Chore: Align Status Display on Stock by Store Table

## Metadata
adw_id: `c71c094f`
prompt: `Align Status display on Stock by Store table (inventory detail page) with inventory management page. Currently Stock by Store shows only a colored dot using StockAvailabilityIndicator, but inventory page shows Status as a badge with text like 'Out of Stock' (red badge) or 'In Stock' (green badge). Update src/components/inventory/stock-by-store-table.tsx to replace the StockAvailabilityIndicator in the Status column with a Badge component that displays 'In Stock' (green) when stockAvailable > 0, 'Low Stock' (amber/yellow) when stockAvailable > 0 but <= safetyStock, and 'Out of Stock' (red) when stockAvailable === 0. Match the styling from app/inventory/page.tsx Status column which uses Badge with variant outline and background colors like bg-green-100 text-green-800 for In Stock and bg-red-100 text-red-800 for Out of Stock.`

## Chore Description
Replace the StockAvailabilityIndicator component in the Stock by Store table's Status column with a Badge component to maintain UI consistency with the main inventory management page. The Badge should display text labels ('In Stock', 'Low Stock', 'Out of Stock') with appropriate color styling matching the inventory page design pattern.

**Current behavior:**
- Stock by Store table (inventory detail page) shows only a colored dot using `StockAvailabilityIndicator` in the Status column

**Expected behavior:**
- Display a Badge component with text labels matching the inventory management page
- Use the same styling pattern: Badge with variant outline and semantic background colors
- Status logic:
  - **In Stock**: `stockAvailable > 0` AND `stockAvailable > safetyStock` → Green badge (bg-green-100 text-green-800)
  - **Low Stock**: `stockAvailable > 0` AND `stockAvailable <= safetyStock` → Amber/yellow badge (bg-yellow-100 text-yellow-800 or bg-amber-100 text-amber-800)
  - **Out of Stock**: `stockAvailable === 0` → Red badge (bg-red-100 text-red-800)

## Relevant Files
Use these files to complete the chore:

- **src/components/inventory/stock-by-store-table.tsx** (lines 278-282) - The target file containing the Status column that needs updating. Currently uses `StockAvailabilityIndicator` component.

- **app/inventory/page.tsx** (lines 720-726) - Reference implementation showing the Badge component pattern used in the inventory management page Status column. This is the styling pattern to replicate.

- **src/components/ui/badge.tsx** - Badge component from the UI library (already imported in stock-by-store-table.tsx at line 12).

- **src/components/inventory/stock-availability-indicator.tsx** - Current component being used (will be removed from this usage, but component file should remain for other uses).

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Review Current Implementation
- Read `src/components/inventory/stock-by-store-table.tsx` lines 234-285 to understand the current data structure and rendering logic
- Note that `location.stockAvailable` and `location.stockSafetyStock` are available in the data
- Verify the Badge component is already imported (line 12)

### 2. Create Status Determination Helper Functions
- Add helper functions similar to the inventory page pattern:
  - `getStatusBadgeVariant(stockAvailable: number, safetyStock: number)` - Returns CSS classes for badge styling
  - `getStatusLabel(stockAvailable: number, safetyStock: number)` - Returns the text label ('In Stock', 'Low Stock', 'Out of Stock')
- Place these functions before the component definition (around line 35) to follow the same pattern as inventory/page.tsx

### 3. Update the Status Column Rendering
- Replace the `<StockAvailabilityIndicator>` component in the TableCell (lines 277-282)
- Implement Badge component with:
  ```tsx
  <Badge
    variant="outline"
    className={getStatusBadgeVariant(location.stockAvailable, location.stockSafetyStock || 0)}
  >
    {getStatusLabel(location.stockAvailable, location.stockSafetyStock || 0)}
  </Badge>
  ```
- Ensure the Badge follows the same styling pattern as inventory/page.tsx lines 721-726

### 4. Remove Unused Import
- Remove the `StockAvailabilityIndicator` import from line 23 since it's no longer used in this file
- Keep all other imports intact

### 5. Validate the Implementation
- Ensure TypeScript compilation succeeds
- Verify the status logic handles edge cases:
  - When `stockSafetyStock` is null or undefined (use default value of 0)
  - When `stockAvailable` is 0 (Out of Stock)
  - When `stockAvailable` is between 1 and `stockSafetyStock` (Low Stock)
  - When `stockAvailable` is greater than `stockSafetyStock` (In Stock)

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server and navigate to an inventory detail page to visually verify the Status column displays Badge components with text labels
- `npm run build` - Ensure TypeScript compilation succeeds with no errors
- Visual inspection: Compare the Status column in Stock by Store table with the Status column in the main inventory management page to confirm styling consistency

## Notes
- The Badge component is already imported in the file, so no new imports are needed besides removing the unused StockAvailabilityIndicator import
- The helper functions should follow the same naming convention and structure as app/inventory/page.tsx for consistency
- Consider using `bg-amber-100 text-amber-800` for Low Stock to match typical warning color patterns (amber is more commonly used than yellow in this design system)
- The `location.stockSafetyStock` field may be null/undefined, so use optional chaining or default to 0 when comparing
