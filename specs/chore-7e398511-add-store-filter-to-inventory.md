# Chore: Add Store Filter Functionality to Inventory Page

## Metadata
adw_id: `7e398511`
prompt: `Add store filter functionality to inventory page for Stock by Store drill-down: 1) In app/inventory/page.tsx, read store query parameter from URL using useSearchParams from next/navigation. 2) Add storeName to the InventoryFilters being used - apply the store filter from URL query param to show only products from that store. 3) When store filter is active from URL: show store name in page header as "Inventory - {StoreName}", add a breadcrumb or Back button linking to /inventory/stores, show store badge indicator in header. 4) Add store name column to the inventory table (hidden on mobile, shown on md+ screens) using item.storeName field. 5) Keep existing functionality - store filter should work alongside existing status tabs, search, sorting, and pagination. 6) Clear store filter when user clicks "Clear filter" or navigates away. Purpose: Enable drill-down from Stock by Store page to view all products sold at each Tops store location with proper navigation back to store overview.`

## Chore Description
Add comprehensive store filter functionality to the inventory page to enable drill-down navigation from the Stock by Store page. When users click on a store in `/inventory/stores`, they should be navigated to `/inventory?store={StoreName}` with filtered results showing only products from that specific Tops store location. The implementation must maintain all existing filtering, sorting, and pagination functionality while adding clear visual indicators and navigation controls when a store filter is active.

## Relevant Files
Use these files to complete the chore:

- **app/inventory/page.tsx** (lines 1-528) - Main inventory page component that needs store filter integration
  - Currently uses `InventoryFilters` interface without `storeName` parameter
  - Builds filters in `useMemo` hook at lines 110-117
  - Header section at lines 252-269 needs breadcrumb/back button when store is filtered
  - Table header at lines 358-407 needs new store name column
  - Table body at lines 417-488 needs to display store name data

- **src/types/inventory.ts** (lines 145-154) - `InventoryFilters` interface definition
  - Already includes `storeName?: TopsStore | "all"` field (line 147)
  - No changes needed - interface already supports store filtering

- **src/lib/inventory-service.ts** (lines 83-171) - Service layer with filter application logic
  - `applyFilters()` function already handles `storeName` filtering (lines 96-99)
  - Database query in `fetchInventoryData()` already applies store filter (lines 213-216)
  - No changes needed - backend filtering already implemented

- **app/inventory/stores/page.tsx** (lines 155-158) - Stock by Store page navigation
  - `handleStoreClick()` already navigates to `/inventory?store={storeName}` (line 157)
  - Navigation pattern is already established
  - No changes needed - navigation source is already correct

### New Files
No new files needed for this implementation.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add URL Parameter Reading and State Management
- Import `useSearchParams` from `next/navigation` at the top of `app/inventory/page.tsx`
- Add state variable to track the active store filter: `const [activeStoreFilter, setActiveStoreFilter] = useState<TopsStore | null>(null)`
- Read the `store` query parameter from URL using `useSearchParams()`
- Update `activeStoreFilter` state when URL parameter changes using `useEffect`
- Handle URL encoding/decoding for store names with Thai characters

### 2. Integrate Store Filter with Existing Filter System
- Update the `filters` useMemo hook (lines 110-117) to include `storeName` from `activeStoreFilter`
- Ensure store filter works alongside existing `activeTab`, `searchQuery`, and sorting parameters
- Add type assertion for `TopsStore` type when setting storeName in filters
- Verify that changing tabs, search, or sort doesn't clear the store filter

### 3. Update Page Header with Store-Specific UI
- Add conditional rendering in header section (lines 252-269) based on `activeStoreFilter` state
- When store filter is active:
  - Change page title from "Inventory Management" to "Inventory - {StoreName}"
  - Add a "Back to Store Overview" button with left arrow icon linking to `/inventory/stores`
  - Add a store badge indicator showing the active store name
  - Position back button to the left of the title, badge near the title
- When no store filter is active, render the existing header unchanged

### 4. Add Store Name Column to Inventory Table
- Insert new TableHead in table header (lines 358-407) after the Image column and before the Warehouse & Location column
- Add column title "Store" with MapPin or Store icon
- Make column responsive: `className="hidden md:table-cell"` to hide on mobile, show on medium+ screens
- Column should not be sortable (no onClick handler) since it's filtered, not sorted
- Insert corresponding TableCell in table body (lines 417-488) to display `item.storeName`
- Use text truncation if store name is long: `className="hidden md:table-cell text-sm truncate max-w-[150px]"`

### 5. Add Clear Filter Functionality
- Add a "Clear Filter" button in the header when `activeStoreFilter` is active
- Button should navigate to `/inventory` (without query parameters) using `router.push()`
- Position button near the search bar or as part of the store badge
- Use X icon or "Clear" text label for clarity
- Alternative: Make the store badge itself clickable to clear the filter

### 6. Test Filter Interaction with Existing Features
- Verify store filter persists when:
  - Changing between "All Products", "Low Stock", "Critical Stock" tabs
  - Using search functionality
  - Changing sort order or sort field
  - Navigating between pages in pagination
- Verify store filter is cleared when:
  - Clicking "Clear Filter" button
  - Manually navigating to `/inventory` without query parameters
  - Clicking back button to return to `/inventory/stores`
- Test with Thai character store names (URL encoding/decoding)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and verify no TypeScript errors
- Navigate to `http://localhost:3000/inventory/stores` - Verify Stock by Store page loads
- Click on any store card - Verify navigation to `/inventory?store={EncodedStoreName}`
- Verify inventory page shows:
  - Updated header with store name in title
  - Back button linking to `/inventory/stores`
  - Store badge indicator
  - Store name column in table (visible on desktop, hidden on mobile)
  - Filtered products from only that store
- Test filter persistence:
  - Change tabs while store filter is active - store filter should remain
  - Use search while store filter is active - store filter should remain
  - Change sorting while store filter is active - store filter should remain
  - Navigate pagination while store filter is active - store filter should remain
- Test filter clearing:
  - Click "Clear Filter" or back button - should return to unfiltered inventory
  - Navigate to `/inventory` directly - should show all products
- Test responsive behavior:
  - Resize browser to mobile width - store column should be hidden
  - Resize to desktop width - store column should be visible
- `pnpm build` - Verify production build completes without errors

## Notes

### Design Considerations
- **URL-Based Filtering**: Using URL query parameters enables shareable links and browser back/forward navigation
- **Filter Persistence**: Store filter should work alongside all other filters, not replace them
- **Responsive Design**: Store column hidden on mobile to preserve table readability on small screens
- **Thai Character Support**: Store names contain Thai characters - ensure proper URL encoding/decoding

### Implementation Pattern
This follows the existing filter pattern used for `activeTab` and `searchQuery`:
1. URL parameter → State → Filters object → Service layer → Filtered results
2. Clear separation between URL state (query params) and component state (React state)
3. Back button navigation pattern already established in Stock by Store page

### Edge Cases to Handle
- Store name not found in URL → Show all products (graceful degradation)
- Invalid store name in URL → Show all products with optional warning
- Multiple filters active → All filters should work together (AND logic)
- Browser back button → Should properly restore previous filter state

### Future Enhancements (Out of Scope)
- Store filter dropdown in header for quick switching between stores
- Breadcrumb trail showing navigation path (Home > Inventory > Store Name)
- Store-specific KPI summary cards when filtered
- "Compare Stores" feature to view multiple stores side-by-side
