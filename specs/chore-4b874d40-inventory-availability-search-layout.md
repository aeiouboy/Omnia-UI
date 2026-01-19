# Chore: Inventory Availability Search Field Layout Improvements

## Metadata
adw_id: `4b874d40`
prompt: `Improve Inventory Availability search field layout at app/inventory/page.tsx: 1. Make all search input fields (Store ID, Store Name, Product ID, Product Name) equal width 2. Fix truncated placeholder text - show full text Search Product Name instead of Search Product Na... 3. Align the Supply Type and View Type dropdowns with search fields 4. Add subtle visual grouping - Store fields together, Product fields together 5. Make Clear All button more prominent when filters are active`

## Chore Description

This chore improves the search field layout on the Inventory Management page (referred to as "Inventory Availability" in the chore description). The current implementation has a single search field that searches across all products. The improvements include:

1. **Equal-width search fields**: Ensure all search input fields have consistent width for better visual alignment
2. **Full placeholder text**: Fix truncated placeholder text so full text is visible
3. **Aligned dropdowns**: Ensure Supply Type and View Type dropdowns align properly with search fields
4. **Visual grouping**: Add subtle visual separation between Store-related fields and Product-related fields
5. **Prominent Clear All button**: Make the Clear All button more visible when filters are active

## Relevant Files

### Main File to Modify
- `/Users/naruechon/Omnia-UI/app/inventory/page.tsx` - Main Inventory Management page with search and filter functionality
  - Lines 584-610: Current search and filter layout in CardHeader
  - Lines 156-157: Current search state management (single searchQuery)
  - Lines 301-304: Search change handler

### Related Files for Context
- `/Users/naruechon/Omnia-UI/app/inventory-new/page.tsx` - New Inventory page with separate Product Name and Barcode search fields (lines 156-157, 306-314, 600-620) - reference for multi-field search implementation
- `/Users/naruechon/Omnia-UI/src/types/inventory.ts` - Inventory type definitions
- `/Users/naruechon/Omnia-UI/src/lib/inventory-service.ts` - Inventory data fetching service
- `/Users/naruechon/Omnia-UI/src/components/ui/input.tsx` - Input component (may need adjustment for full placeholder text)

## Step by Step Tasks

### 1. Analyze Current Search Implementation
- Review current single search field implementation at `app/inventory/page.tsx` lines 584-610
- Identify the specific fields needed: Store ID, Store Name, Product ID (Barcode), Product Name
- Review how `app/inventory-new/page.tsx` implements separate search fields for reference
- Determine if separate state variables are needed for each search field

### 2. Update State Management for Separate Search Fields
- Add separate state variables for each search field:
  - `storeIdSearch` - for Store ID search
  - `storeNameSearch` - for Store Name search
  - `productIdSearch` (or `barcodeSearch`) - for Product ID/Barcode search
  - `productNameSearch` - for Product Name search
- Update the `filters` object in `useMemo` (around line 206-236) to include new search fields
- Modify `fetchInventoryData` in `lib/inventory-service.ts` to handle the separate search fields

### 3. Update Filter Layout with Visual Grouping
- Restructure the filter layout section (lines 584-610) to include:
  - **Store Fields Group**: Store ID and Store Name search inputs with visual grouping
  - **Product Fields Group**: Product ID and Product Name search inputs with visual grouping
  - **Dropdown Filters**: Supply Type and View Type dropdowns aligned with search fields
- Use equal width classes for all search inputs (e.g., `w-[180px]` or `w-[200px]`)
- Add visual grouping with:
  - Subtle border or background separation between groups
  - Small gap between groups
  - Optional group labels (Store Filters, Product Filters)

### 4. Fix Placeholder Text Truncation
- Ensure all input fields have full placeholder text visible:
  - "Search Store ID" instead of truncated version
  - "Search Store Name" instead of truncated version
  - "Search Product ID" or "Search Barcode" instead of truncated version
  - "Search Product Name" instead of truncated version
- Adjust input width if needed to accommodate full placeholder text
- Verify text doesn't overflow on standard screen sizes

### 5. Add/Enhance Clear All Button
- Add logic to detect when any filters are active (search fields, dropdowns)
- Create or enhance "Clear All" button that:
  - Is more prominent when filters are active (e.g., different variant, color, or styling)
  - Resets all search fields to empty
  - Resets all dropdown filters to default values
  - Resets pagination to page 1
- Position Clear All button prominently in the filter section
- Consider using a badge or indicator showing number of active filters

### 6. Add Search Handlers for New Fields
- Create handler functions for each new search field:
  - `handleStoreIdSearchChange`
  - `handleStoreNameSearchChange`
  - `handleProductIdSearchChange` (or `handleBarcodeSearchChange`)
  - `handleProductNameSearchChange`
- Each handler should:
  - Update the respective state variable
  - Reset pagination to page 1
  - Trigger data fetch

### 7. Update Data Fetching Logic
- Modify `fetchInventoryData` in `lib/inventory-service.ts` to:
  - Accept separate search field parameters
  - Apply appropriate filtering logic for each field
  - Combine filters with AND logic (all filters apply together)
- Ensure the API or data service can handle the new filter parameters
- Update the `InventoryFilters` type in `types/inventory.ts` if needed

### 8. Validate and Test Changes
- Run TypeScript check: `pnpm build` or `npx tsc --noEmit`
- Run development server: `pnpm dev`
- Test each search field individually:
  - Store ID search returns matching stores
  - Store Name search returns matching stores
  - Product ID search returns matching products
  - Product Name search returns matching products
- Test combined search (multiple fields active)
- Test Clear All button resets all filters
- Test dropdown filters still work correctly
- Verify visual layout and grouping looks correct
- Verify placeholder text is fully visible
- Test responsive behavior on mobile/tablet/desktop

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# TypeScript compilation check
pnpm build

# Or use TypeScript directly
npx tsc --noEmit

# Lint check
pnpm lint

# Start development server for manual testing
pnpm dev
```

Manual testing checklist:
- [ ] All four search fields are equal width
- [ ] Placeholder text is fully visible (no truncation)
- [ ] Supply Type and View Type dropdowns align with search fields
- [ ] Visual grouping separates Store fields from Product fields
- [ ] Clear All button is prominent when filters are active
- [ ] Each search field works independently
- [ ] Combined search with multiple fields works correctly
- [ ] Clear All button resets all filters
- [ ] Layout is responsive on mobile, tablet, and desktop

## Notes

### Current Implementation Context
The main Inventory page (`app/inventory/page.tsx`) currently uses a single `searchQuery` field that searches across products. The chore requests adding separate fields for Store ID, Store Name, Product ID, and Product Name. This is a more granular search approach similar to what's implemented in `app/inventory-new/page.tsx` which has separate Product Name and Barcode searches.

### Visual Grouping Approach
Consider using one of these approaches for visual grouping:
- **Background grouping**: Different subtle background colors for each group
- **Border grouping**: Thin borders around each group
- **Spacing grouping**: Larger gaps between groups with smaller gaps within groups
- **Label grouping**: Small text labels above each group (e.g., "Store Filters", "Product Filters")

### Search Field Implementation
The search fields should filter the displayed results. Since this is an Inventory Management page showing products across stores:
- **Store ID/Name search**: Filter products shown to only those in matching stores
- **Product ID/Name search**: Filter products shown to only those matching the criteria

### Backend Considerations
Verify that `fetchInventoryData` in `lib/inventory-service.ts` can handle the new search parameters. If the API doesn't support these filters directly, client-side filtering may be needed as a fallback.

### Clear All Button Design
Consider these options for making the Clear All button more prominent:
- Use a different variant (e.g., `destructive` or `secondary`) when filters are active
- Add a badge showing count of active filters
- Add a subtle animation when filters become active
- Position it prominently at the start or end of the filter bar
