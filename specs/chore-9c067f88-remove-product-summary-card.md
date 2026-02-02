# Chore: Remove Product Summary Card from Stock Card By Product View

## Metadata
adw_id: `9c067f88`
prompt: `Remove the Product Summary Card section from the Stock Card By Product view in app/inventory-new/stores/page.tsx`

## Chore Description
Remove the Product Summary Card component from the Stock Card "By Product" view. This card currently displays:
- Product ID and Product Name header
- Opening Balance statistic
- Total In statistic (green)
- Total Out statistic (red)
- Current Balance statistic (blue)

The removal should clean up any unused state variables and imports while preserving all other functionality including the tab toggle, filters, transaction history table, pagination, and CSV export.

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/stores/page.tsx** - Main Stock Card page containing the Product Summary Card JSX (lines 1069-1116), the `productSummary` state variable (line 229), and the `getMockProductSummary` function call (line 331)

- **src/lib/stock-card-mock-data.ts** - Contains `getMockProductSummary` function and `ProductSummary` type that may become unused after removal

### New Files
None required.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove productSummary State Variable
- Delete line 229: `const [productSummary, setProductSummary] = useState<ProductSummary | null>(null)`
- Remove `ProductSummary` from the imports at line 71

### 2. Remove getMockProductSummary Function Call
- In the `loadProductTransactions` function (around line 298-337), remove the summary calculation and state update:
  - Delete line 331: `const summary = getMockProductSummary(productId, productName, allTransactions)`
  - Delete line 332: `setProductSummary(summary)`
- Remove `getMockProductSummary` from the imports at line 66

### 3. Remove productSummary Reset in Clear Filters Handler
- In the `handleClearByProductFilters` function (around line 494-502), remove:
  - Delete line 501: `setProductSummary(null)`

### 4. Remove productSummary Reset in loadProductTransactions Early Return
- In the `loadProductTransactions` function, remove the `setProductSummary(null)` call around line 301

### 5. Remove Product Summary Card JSX Block
- Delete the entire Product Summary Card JSX block from lines 1069-1116:
  ```jsx
  {/* Product Summary Card */}
  {hasAllMandatoryFiltersForProduct && productSummary && (
    <Card>
      ...
    </Card>
  )}
  ```

### 6. Verify No Remaining References
- Search for any remaining `productSummary` references in the file
- Search for any remaining `getMockProductSummary` references in the file
- Ensure `ProductSummary` type import is removed

### 7. Validate Build
- Run `pnpm build` to ensure no TypeScript errors
- Run `pnpm dev` and verify:
  - By Store tab works correctly
  - By Product tab loads without errors
  - Filters work correctly
  - Transaction History table displays properly
  - Pagination works
  - Export CSV works

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `grep -n "productSummary" app/inventory-new/stores/page.tsx` - Should return no results (verify all references removed)
- `grep -n "getMockProductSummary" app/inventory-new/stores/page.tsx` - Should return no results (verify import removed)
- `grep -n "ProductSummary" app/inventory-new/stores/page.tsx` - Should return no results (verify type import removed)
- `pnpm dev` - Start development server and manually test By Product view functionality

## Notes
- The `getMockProductSummary` function in `src/lib/stock-card-mock-data.ts` will become unused but should NOT be deleted - it may be needed for future features or other components
- The `ProductSummary` type export in `src/lib/stock-card-mock-data.ts` should also be kept for the same reason
- After this change, the By Product view will show only: filters, empty state (when no filters), and transaction history table with pagination
