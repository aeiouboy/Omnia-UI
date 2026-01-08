# Chore: Fix Supply Type Tab Filtering on Stock Configuration Page

## Metadata
adw_id: `1550d577`
prompt: `Fix Supply Type tab filtering on Stock Configuration page (app/stock-config/page.tsx). The OnHand tab shows 0 results even though there are configurations with supplyTypeId 'On Hand Available'. The issue is that the tab filter is likely comparing against 'OnHand' but the data has 'On Hand Available' as the supplyTypeId value. Fix the comparison logic in the filteredStockConfigs useMemo to match 'On Hand Available' when the OnHand tab is selected, and 'PreOrder' when PreOrder tab is selected. Ensure the tab filtering works correctly with the existing frequency filter and search filter.`

## Chore Description
The Stock Configuration page has three tabs: "All Configs", "PreOrder", and "OnHand". The OnHand tab currently shows 0 results even though the database contains stock configurations with `supplyTypeId: "On Hand Available"`.

The root cause is a mismatch between the tab values and the actual data values:
- **Tab value**: `"OnHand"` (compact, no spaces)
- **Data value**: `"On Hand Available"` (with spaces, as per business spec)
- **Tab value**: `"PreOrder"` (capital O)
- **Data value**: `"PreOrder"` (matches)

The current implementation at line 114-122 uses a `filters` object that passes the tab value directly:
```typescript
const filters: StockConfigFilters = useMemo(() => ({
  supplyType: activeTab === "all" ? "all" : activeTab,
  frequency: frequencyFilter === "all" ? "all" : frequencyFilter,
  searchQuery,
  page,
  pageSize,
  sortBy: sortField,
  sortOrder,
}), [activeTab, frequencyFilter, searchQuery, page, pageSize, sortField, sortOrder])
```

When `activeTab = "OnHand"`, it passes `supplyType: "OnHand"` to the service, but the service filters against actual data which has `supplyTypeId: "On Hand Available"`, resulting in 0 matches.

## Relevant Files

- **app/stock-config/page.tsx:58** - Type definition for `SupplyTab` that defines tab values as "all" | "PreOrder" | "OnHand"
- **app/stock-config/page.tsx:114-122** - The `filters` useMemo that needs to map tab values to actual data values
- **src/types/stock-config.ts:15** - The `SupplyTypeID` type definition showing the valid values: "PreOrder" | "On Hand Available" | "Preorder" | "OnHand" (for backward compatibility)
- **src/lib/stock-config-service.ts:36-101** - Mock data showing actual supplyTypeId values in use ("PreOrder" and "On Hand Available")
- **src/lib/stock-config-service.ts:491-492** - The filter logic that compares against the actual supplyTypeId values

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Filter Mapping Logic
- Read the current `filters` useMemo (lines 114-122 in app/stock-config/page.tsx)
- Replace the direct assignment `supplyType: activeTab === "all" ? "all" : activeTab` with a mapping function
- Create a mapping that converts:
  - `"OnHand"` tab → `"On Hand Available"` filter value
  - `"PreOrder"` tab → `"PreOrder"` filter value (unchanged)
  - `"all"` tab → `"all"` filter value (unchanged)
- Ensure the mapping preserves the existing frequency filter and search filter functionality

### 2. Verify Backwards Compatibility
- Check that the solution handles both new format ("On Hand Available") and legacy format ("OnHand") values
- The service layer already supports both formats per the SupplyTypeID type definition
- No changes needed to the service layer - the fix is isolated to the page component

### 3. Test the Filter Logic
- Verify that the OnHand tab now correctly filters to show configurations with `supplyTypeId: "On Hand Available"`
- Verify that the PreOrder tab correctly shows configurations with `supplyTypeId: "PreOrder"`
- Verify that the All Configs tab shows all configurations regardless of supply type
- Test that frequency filter and search filter continue to work correctly with the tab filter

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and verify the application compiles without errors
- Navigate to http://localhost:3000/stock-config in browser
- Click the **OnHand** tab and verify it shows configurations (should show at least SC002 and SC004 from mock data)
- Click the **PreOrder** tab and verify it shows configurations (should show SC001, SC003, SC005 from mock data)
- Click the **All Configs** tab and verify it shows all configurations
- Test the **Frequency** dropdown filter with each tab to ensure filters combine correctly
- Test the **Search** input with each tab to ensure filters combine correctly
- `pnpm build` - Verify production build succeeds with no TypeScript errors

## Notes
- The fix should be minimal and focused on the filter mapping logic only
- No changes needed to the service layer or type definitions - they already support both formats
- The solution should maintain compatibility with legacy "OnHand" and "Preorder" values in case they exist in real data
- Consider using a helper function or inline mapping to keep the code clean and maintainable
