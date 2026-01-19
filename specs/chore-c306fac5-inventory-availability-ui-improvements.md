# Chore: Inventory Availability UI Improvements

## Metadata
adw_id: `c306fac5`
prompt: `Improve Inventory Availability UI at app/inventory/page.tsx: (1) Increase search field widths to show full placeholder text (Search Store ID, Search Store Name, Search Product ID, Search Product Name) - use min-width: 180px, (2) Add subtle visual grouping between Store fields and Product fields using a vertical divider or spacing, (3) Make empty state icon 20% larger for better visual balance, (4) Ensure dropdowns have consistent width with search fields, (5) Add placeholder fade animation when field is focused`

## Chore Description

This chore enhances the Inventory Availability page UI with several visual and UX improvements focusing on better search field layout, visual grouping, and interaction feedback. The improvements include:

1. **Increased search field widths**: Set `min-width: 180px` for all search fields (Store ID, Store Name, Product ID, Product Name) to ensure full placeholder text is visible
2. **Visual grouping**: Add subtle visual separation between Store fields (Store ID, Store Name) and Product fields (Product ID, Product Name) using vertical divider or spacing
3. **Larger empty state icon**: Increase empty state icon size by 20% for better visual balance
4. **Consistent dropdown widths**: Ensure Brand and View Type dropdowns have consistent width with search fields
5. **Placeholder fade animation**: Add smooth fade animation on placeholder text when input is focused

## Context

Based on the codebase analysis:
- The page currently uses a single `searchQuery` field (line 157 in `app/inventory/page.tsx`)
- There's a previous spec (`chore-4b874d40-inventory-availability-search-layout.md`) that implemented granular search fields, but this appears NOT to be implemented yet in the current code
- The type definitions in `src/types/inventory.ts` already have `productNameSearch` and `barcodeSearch` fields (lines 327-329)
- The inventory service (`src/lib/inventory-service.ts`) has filtering logic for `productNameSearch` and `barcodeSearch` (lines 198-212)
- **Missing**: `storeIdSearch` and `storeNameSearch` fields need to be added to types and service

**Important Discovery**: The previous chore spec referenced granular search fields but they were NOT actually implemented. This chore will BUILD ON TOP of that work by adding the UI improvements.

## Relevant Files

### Files to Modify

- **`/Users/naruechon/Omnia-UI/app/inventory/page.tsx`** - Main Inventory page
  - Lines 156-166: Filter state management (need to add granular search states if missing)
  - Lines 584-610: Search and filter layout in CardHeader (need to update field widths and grouping)
  - Lines 301-304: Search change handler (need handlers for each field)
  - Lines 206-236: Filters object in useMemo (need to update with granular search fields)

- **`/Users/naruechon/Omnia-UI/src/types/inventory.ts`** - Type definitions
  - Lines 320-348: InventoryFilters interface (need to add `storeIdSearch` and `storeNameSearch`)

- **`/Users/naruechon/Omnia-UI/src/lib/inventory-service.ts`** - Inventory data service
  - Lines 198-212: Product search filtering (need to add store search filtering)

- **`/Users/naruechon/Omnia-UI/src/components/inventory/inventory-empty-state.tsx`** - Empty state component
  - Line 16: Icon size (currently `h-16 w-16`, need to increase by 20% to `h-20 w-20` or ~19.2)

### New Files

- **`/Users/naruechon/Omnia-UI/src/styles/input-animations.css`** (optional) - Custom CSS for placeholder fade animation
  - Alternatively, can use Tailwind classes with custom variants

## Step by Step Tasks

### 1. Update Type Definitions for Store Search Fields
- Open `/Users/naruechon/Omnia-UI/src/types/inventory.ts`
- Add `storeIdSearch?: string` and `storeNameSearch?: string` to the `InventoryFilters` interface (around line 327)
- Document these fields with JSDoc comments following the existing pattern

### 2. Implement Store Search Filtering in Service Layer
- Open `/Users/naruechon/Omnia-UI/src/lib/inventory-service.ts`
- Add filtering logic for `storeIdSearch` after line 212 (after barcode search)
  - Filter by `item.storeId` if it exists, otherwise skip
- Add filtering logic for `storeNameSearch`
  - Filter by `item.storeName` with case-insensitive includes match
- Follow the same pattern as `productNameSearch` and `barcodeSearch` filters

### 3. Add Granular Search State to Inventory Page
- Open `/Users/naruechon/Omnia-UI/app/inventory/page.tsx`
- Replace single `searchQuery` state (line 157) with four separate states:
  - `storeIdSearch` for Store ID search
  - `storeNameSearch` for Store Name search
  - `productIdSearch` for Product ID/Barcode search
  - `productNameSearch` for Product Name search
- Update the `filters` object in `useMemo` (around line 206-236) to use new granular search fields instead of legacy `searchQuery`

### 4. Create Search Change Handlers
- Add four handler functions after `handleSearchChange` (around line 301):
  - `handleStoreIdSearchChange(e)` - update storeIdSearch, reset page to 1
  - `handleStoreNameSearchChange(e)` - update storeNameSearch, reset page to 1
  - `handleProductIdSearchChange(e)` - update productIdSearch, reset page to 1
  - `handleProductNameSearchChange(e)` - update productNameSearch, reset page to 1
- Each handler should reset pagination to page 1

### 5. Update Search Field Layout with Visual Grouping
- Open `/Users/naruechon/Omnia-UI/app/inventory/page.tsx` around line 584-610
- Replace the single search input with a new layout structure:
  - **Store Group** (with subtle border or background):
    - Store ID search input with placeholder "Search Store ID" and `min-w-[180px]`
    - Store Name search input with placeholder "Search Store Name" and `min-w-[180px]`
  - **Visual Divider** - vertical line or spacing between groups
  - **Product Group** (with subtle border or background):
    - Product ID search input with placeholder "Search Product ID" and `min-w-[180px]`
    - Product Name search input with placeholder "Search Product Name" and `min-w-[180px]`
  - **Dropdowns** aligned to the right:
    - Brand dropdown with `min-w-[180px]` to match search fields
    - Ensure all dropdowns are consistent width

### 6. Add Placeholder Fade Animation
- Add custom CSS or Tailwind classes for placeholder fade animation:
  - Option A: Use Tailwind `focus:placeholder-opacity-0 transition-opacity duration-200` on Input components
  - Option B: Create custom CSS with `::placeholder` pseudo-element and `:focus::placeholder` transitions
- Apply animation to all four search input fields

### 7. Increase Empty State Icon Size by 20%
- Open `/Users/naruechon/Omnia-UI/src/components/inventory/inventory-empty-state.tsx`
- Change Package icon size from `h-16 w-16` (64px) to approximately 20% larger
  - Calculate: 64px × 1.2 = 76.8px ≈ `h-20 w-20` (80px is close)
  - Use `h-20 w-20` for the Package icon (line 16)
- Verify visual balance with the card layout

### 8. Implement Clear All Filters Functionality
- Add a `handleClearAllFilters` function that resets:
  - All four search fields to empty strings
  - Brand filter to "all"
  - Any other active filters
  - Page to 1
- Add a "Clear All" button to the filter section that:
  - Is visible when any search field or filter is active
  - Uses a prominent variant (e.g., `variant="outline"` with conditional styling)
  - Shows number of active filters as a badge (optional)

### 9. Validate TypeScript Compilation
- Run `pnpm build` to ensure no TypeScript errors
- Verify all type definitions are correct
- Check that filters object matches InventoryFilters interface

### 10. Test UI Improvements
- Run `pnpm dev` and navigate to `/inventory` page
- Test each improvement:
  - ✅ Search fields show full placeholder text without truncation
  - ✅ Visual grouping separates Store and Product fields clearly
  - ✅ Empty state icon is noticeably larger (20%)
  - ✅ Dropdown widths match search field widths
  - ✅ Placeholder fades smoothly when field is focused
  - ✅ All search fields filter correctly
  - ✅ Clear All button resets all filters
- Test responsive behavior on different screen sizes

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# TypeScript compilation check
pnpm build

# Or use TypeScript directly (if build takes too long)
npx tsc --noEmit

# Lint check
pnpm lint

# Start development server for manual testing
pnpm dev
```

**Manual Testing Checklist:**
- [ ] All four search fields (Store ID, Store Name, Product ID, Product Name) have `min-w-[180px]`
- [ ] Full placeholder text is visible in all search fields
- [ ] Visual grouping (divider/spacing) separates Store and Product fields
- [ ] Empty state icon is 20% larger (`h-20 w-20` instead of `h-16 w-16`)
- [ ] Brand dropdown has consistent width with search fields
- [ ] Placeholder text fades smoothly on focus
- [ ] Each search field filters data correctly
- [ ] Clear All button resets all filters and search fields
- [ ] Layout is responsive and doesn't break on mobile/tablet

## Notes

### Visual Grouping Implementation Options

**Option 1: Border Grouping** (Recommended)
```tsx
<div className="flex items-center gap-4 p-2 border border-border/40 rounded-md bg-muted/5">
  {/* Store search fields */}
</div>
<div className="h-8 w-px bg-border mx-2" /> {/* Vertical divider */}
<div className="flex items-center gap-4 p-2 border border-border/40 rounded-md bg-muted/5">
  {/* Product search fields */}
</div>
```

**Option 2: Background Grouping**
```tsx
<div className="flex items-center gap-4 p-2 bg-blue-50/30 rounded-md">
  {/* Store search fields */}
</div>
<div className="w-4" /> {/* Spacing */}
<div className="flex items-center gap-4 p-2 bg-green-50/30 rounded-md">
  {/* Product search fields */}
</div>
```

**Option 3: Label Grouping**
```tsx
<div className="flex flex-col gap-2">
  <span className="text-xs font-medium text-muted-foreground">Store Filters</span>
  <div className="flex gap-2">{/* Store search fields */}</div>
</div>
```

### Placeholder Fade Animation

**Tailwind Approach** (Recommended - no additional CSS needed):
```tsx
<Input
  placeholder="Search Store ID"
  className="min-w-[180px] placeholder:transition-opacity placeholder:duration-200 focus:placeholder:opacity-0"
/>
```

**Custom CSS Approach**:
```css
.search-input::placeholder {
  opacity: 1;
  transition: opacity 200ms ease-in-out;
}

.search-input:focus::placeholder {
  opacity: 0;
}
```

### Icon Size Calculation
- Current: `h-16 w-16` = 64px
- 20% increase: 64 × 1.2 = 76.8px
- Nearest Tailwind size: `h-20 w-20` = 80px (25% increase - close enough)
- Alternative: Custom size `h-[77px] w-[77px]` for exact 20%

### Performance Considerations
- Debounce search input handlers if needed (300ms delay)
- Ensure filtering doesn't block UI on large datasets
- Consider lazy loading if inventory items exceed 1000 items
