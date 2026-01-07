# Chore: Simplify Store Cards by Removing Health Score and Total Value

## Metadata
adw_id: `ed9f5867`
prompt: `Remove Health Score and Total Value from Stock by Store page:
  1) In app/inventory/stores/page.tsx, remove the Health Score display from store cards (remove the
  healthScore row with TrendingUp icon and percentage badge). 2) Remove the Total Value display from
   store cards (remove the totalValue row showing Thai Baht amount). 3) Remove the sort button for
  "Health Score" from the sort options. 4) Update the SortField type to remove "healthScore" option.
   5) If healthScore is the default sort, change default sort to "criticalStockItems" descending
  (show stores needing attention first). 6) Keep Total Products, Low Stock, and Critical Stock
  metrics on store cards. 7) In src/lib/mock-inventory-data.ts, the
  generateStorePerformanceFromInventory function can optionally keep calculating healthScore and
  totalValue for potential future use, but they should not be displayed. Purpose: Simplify store
  cards to focus on actionable stock metrics only.`

## Chore Description
This chore simplifies the Stock by Store page by removing Health Score and Total Value displays from store cards, focusing only on actionable stock metrics (Total Products, Low Stock, Critical Stock). The Health Score sorting option will be removed, and the default sort will change to Critical Stock Items (descending) to show stores needing immediate attention first.

The data generation functions in mock-inventory-data.ts will continue calculating these values for potential future use, but they won't be displayed in the UI.

## Relevant Files
Use these files to complete the chore:

- **app/inventory/stores/page.tsx** (lines 1-457) - Main page component displaying store cards
  - Lines 26-27: Update `SortField` type to remove "healthScore" option
  - Lines 42-43: Change default sort from "healthScore" to "criticalStockItems" descending
  - Lines 104-120: Update sort logic in `filteredAndSortedStores` to remove healthScore case
  - Lines 160-170: Remove `getHealthScoreColor` and `getHealthScoreBgColor` helper functions (no longer needed)
  - Lines 347-355: Remove Health Score sort button from sort options section
  - Lines 400-412: Remove Health Score display row from store cards in the CardContent section
  - Lines 442-448: Remove Total Value display row from store cards

- **src/lib/mock-inventory-data.ts** (lines 730-782) - Data generation function
  - Lines 730-782: The `generateStorePerformanceFromInventory` function - keep as-is (continues calculating healthScore and totalValue for future use)

- **src/types/inventory.ts** (lines 115-124) - TypeScript type definition
  - Lines 117-124: The `StorePerformance` interface - keep unchanged (healthScore and totalValue remain in the data structure)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update SortField Type and Default Sort
- Open `app/inventory/stores/page.tsx`
- Locate line 26: `type SortField = "storeName" | "healthScore" | "criticalStockItems" | "lowStockItems"`
- Remove `"healthScore"` from the type definition
- Update to: `type SortField = "storeName" | "criticalStockItems" | "lowStockItems"`
- Locate line 42: `const [sortField, setSortField] = useState<SortField>("healthScore")`
- Change default sort to: `const [sortField, setSortField] = useState<SortField>("criticalStockItems")`
- Locate line 43: `const [sortOrder, setSortOrder] = useState<SortOrder>("asc")`
- Change default order to: `const [sortOrder, setSortOrder] = useState<SortOrder>("desc")`

### 2. Remove Health Score Sort Logic
- In `app/inventory/stores/page.tsx`, locate the `filteredAndSortedStores` useMemo hook (around lines 81-135)
- Find the sort switch statement (lines 104-120)
- Remove the "healthScore" case block:
  ```typescript
  case "healthScore":
    aVal = a.healthScore
    bVal = b.healthScore
    break
  ```

### 3. Remove Health Score Helper Functions
- In `app/inventory/stores/page.tsx`, locate lines 160-170
- Remove the `getHealthScoreColor` function (lines 160-164)
- Remove the `getHealthScoreBgColor` function (lines 166-170)

### 4. Remove Health Score Sort Button
- In `app/inventory/stores/page.tsx`, locate the sort options section (lines 335-374)
- Find and remove the Health Score sort button block (lines 347-355):
  ```tsx
  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleSort("healthScore")}
    className="h-8"
  >
    Health Score
    <SortIcon field="healthScore" />
  </Button>
  ```

### 5. Remove Health Score Display from Store Cards
- In `app/inventory/stores/page.tsx`, locate the store cards rendering section (lines 376-454)
- Find the CardContent section with store metrics (lines 399-449)
- Remove the Health Score display block (lines 400-412):
  ```tsx
  {/* Health Score */}
  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">Health Score</span>
    <div className="flex items-center gap-2">
      <TrendingUp className={`h-4 w-4 ${getHealthScoreColor(store.healthScore)}`} />
      <Badge
        variant="outline"
        className={`${getHealthScoreBgColor(store.healthScore)} ${getHealthScoreColor(store.healthScore)} font-semibold`}
      >
        {store.healthScore}%
      </Badge>
    </div>
  </div>
  ```

### 6. Remove Total Value Display from Store Cards
- In the same CardContent section, remove the Total Value display block (lines 442-448):
  ```tsx
  {/* Total Value */}
  <div className="flex items-center justify-between pt-2 border-t">
    <span className="text-sm text-muted-foreground">Total Value</span>
    <span className="font-semibold">
      ฿{(store.totalValue / 1000000).toFixed(1)}M
    </span>
  </div>
  ```

### 7. Remove Unused TrendingUp Import
- At the top of `app/inventory/stores/page.tsx`, locate the imports (lines 10-22)
- Remove `TrendingUp` from the lucide-react import since it's no longer used

### 8. Verify Data Generation Function
- Open `src/lib/mock-inventory-data.ts`
- Locate the `generateStorePerformanceFromInventory` function (lines 730-782)
- Verify it continues to calculate `healthScore` (line 767) and `totalValue` (line 776)
- **No changes needed** - these calculations remain for potential future use

### 9. Test the Changes
- Run the development server: `pnpm dev`
- Navigate to `/inventory/stores` page
- Verify store cards display only: Total Products, Low Stock, Critical Stock
- Verify Health Score and Total Value are not displayed
- Verify default sort is "Critical Items" in descending order (stores with most critical items first)
- Verify Health Score sort option is removed from sort buttons
- Verify no TypeScript errors in the console

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and verify `/inventory/stores` page loads without errors
- Inspect browser console for TypeScript errors (should be none)
- Visual inspection: Store cards should show only Total Products, Low Stock, and Critical Stock metrics
- Visual inspection: Sort options should show "Store Name", "Critical Items", and "Low Stock Items" only
- Visual inspection: Default sort should display stores with highest critical items first

## Notes
- The `StorePerformance` TypeScript interface in `src/types/inventory.ts` remains unchanged - it still includes `healthScore` and `totalValue` properties
- The data generation function `generateStorePerformanceFromInventory` continues to calculate these values for potential future use
- This is a UI-only simplification - the underlying data structure supports re-enabling these metrics in the future if needed
- The focus is on actionable metrics that help store managers identify issues requiring immediate attention
