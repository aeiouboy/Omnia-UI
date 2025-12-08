# Chore: Implement Inventory Detail Page Location Filtering

## Metadata
adw_id: `88dcf787`
prompt: `Implement inventory detail page to display stock by location with filtering capabilities. Requirements:

1. Create/enhance inventory detail page at app/inventory/[id]/page.tsx that shows:
   - Product header with name, SKU, category, and main image
   - Stock summary cards showing Total Stock, Available, Reserved, Safety Stock
   - Stock by Location section displaying all warehouse locations with:
     * Warehouse code and location code (e.g., CDC-BKK01/A01-R02-S03)
     * Default location indicator (dl badge)
     * Stock status breakdown per location (Stock, In Process, Sold, On-hold, Pending, Unusable)
     * Color-coded status indicators
     * Availability indicator dots (green for available, red for out of stock)

2. Add location filter functionality:
   - Dropdown/select to filter by warehouse code
   - Search input to filter locations by warehouse or location code
   - Clear filters button
   - Show filtered results count (e.g., 'Showing 3 of 8 locations')

3. Add sorting options for locations:
   - Sort by warehouse code (A-Z, Z-A)
   - Sort by available stock (high to low, low to high)
   - Sort by location code

4. Use existing components and patterns:
   - Reference StockLocationPopover (src/components/inventory/stock-location-popover.tsx) for stock breakdown display
   - Reference WarehouseLocationCell for location display format
   - Use existing types from src/types/inventory.ts (StockLocation, WarehouseLocation)
   - Follow existing mobile-first responsive design patterns

5. Additional features:
   - Recent transactions section filtered for this product
   - Stock history chart showing stock levels over time
   - Back button to return to inventory list
   - Breadcrumb navigation

Reference files:
- src/types/inventory.ts for StockLocation and related types
- src/components/inventory/stock-location-popover.tsx for stock breakdown display
- src/lib/inventory-service.ts for data fetching functions
- src/lib/mock-inventory-data.ts for mock data structure`

## Chore Description
Enhance the existing inventory detail page (`src/components/inventory-detail-view.tsx`) to display comprehensive stock location information with filtering, sorting, and search capabilities. The page currently shows product information, stock breakdown, history charts, and recent transactions. This chore adds a new "Stock by Location" section that displays all warehouse locations with detailed stock status breakdowns and provides filtering/sorting functionality for easier location management.

The enhancement includes:
1. A new "Stock by Location" section after the Stock Breakdown section
2. Filter controls (warehouse code dropdown, search input, clear filters)
3. Sorting options (warehouse code, location code, available stock)
4. Location cards displaying warehouse code, location code, default location indicator, and stock status breakdown
5. Color-coded status indicators matching existing StockLocationPopover component
6. Availability indicator dots (green for available, red for out of stock)
7. Filtered results count display
8. Mobile-first responsive design following existing patterns

## Relevant Files
Use these files to complete the chore:

**Existing Files to Modify:**
- `src/components/inventory-detail-view.tsx` - Main component to enhance with Stock by Location section and filtering logic
- `app/inventory/[id]/page.tsx` - Already correctly fetches item data including warehouseLocations

**Reference Files (Read-only):**
- `src/types/inventory.ts` - Contains StockLocation, StockStatus types and WarehouseLocation interface
- `src/components/inventory/stock-location-popover.tsx` - Reference for stock status display format and color coding
- `src/components/inventory/warehouse-location-cell.tsx` - Reference for warehouse/location code formatting
- `src/lib/warehouse-utils.ts` - Utility functions for warehouse code formatting, stock status colors, and calculations
- `src/lib/inventory-service.ts` - Data fetching functions (already used in page.tsx)
- `src/lib/mock-inventory-data.ts` - Mock data structure for testing

**Component Dependencies:**
- `src/components/ui/card.tsx` - For location cards
- `src/components/ui/badge.tsx` - For warehouse code, default location, and status badges
- `src/components/ui/input.tsx` - For search input
- `src/components/ui/select.tsx` - For warehouse filter dropdown
- `src/components/ui/button.tsx` - For clear filters button
- `src/components/inventory/stock-availability-indicator.tsx` - For availability dots

### New Files
None required - all enhancements are to existing components

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Import Required Dependencies and Types
- Add necessary imports to `src/components/inventory-detail-view.tsx`:
  - Import `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/ui/select`
  - Import `Input` from `@/components/ui/input`
  - Import `Search`, `X`, `MapPin`, `ArrowUpDown` from `lucide-react`
  - Import `StockAvailabilityIndicator` from `./inventory/stock-availability-indicator`
  - Import warehouse utilities from `@/lib/warehouse-utils`:
    - `formatWarehouseCode`
    - `getStockStatusColor`
    - `getStockStatusLabel`
    - `getTotalStockForLocation`
    - `hasAvailableStock`
  - Ensure `StockLocation` type is imported from `@/types/inventory`

### 2. Add State Management for Filters and Sorting
- Add state hooks in `InventoryDetailView` component:
  - `const [warehouseFilter, setWarehouseFilter] = useState<string>("all")` - Selected warehouse code filter
  - `const [searchQuery, setSearchQuery] = useState<string>("")` - Search input value
  - `const [sortBy, setSortBy] = useState<"warehouse" | "location" | "stock">("warehouse")` - Current sort field
  - `const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")` - Current sort direction

### 3. Implement Filter and Sort Logic
- Create `useMemo` hook for unique warehouse codes:
  - Extract unique warehouse codes from `item.warehouseLocations`
  - Sort alphabetically
  - Return array of unique warehouse codes
- Create `useMemo` hook for filtered and sorted locations:
  - Start with `item.warehouseLocations || []`
  - Apply warehouse filter: if `warehouseFilter !== "all"`, filter by warehouse code
  - Apply search filter: filter by warehouse code or location code containing search query (case-insensitive)
  - Apply sorting based on `sortBy` and `sortOrder`:
    - "warehouse": Sort by `warehouseCode`
    - "location": Sort by `locationCode`
    - "stock": Sort by `stockAvailable`
  - Return filtered and sorted array
- Calculate filtered results count: `filteredLocations.length` vs `totalLocations.length`

### 4. Create Filter Controls UI Component
- Add new section after Stock Breakdown Card (before Stock History Chart)
- Create Card with title "Stock by Location"
- Add filter controls row with:
  - Warehouse dropdown:
    - Label: "Warehouse"
    - Options: "All Warehouses" (value: "all") + list of unique warehouse codes
    - Value: `warehouseFilter`
    - OnChange: `setWarehouseFilter`
  - Search input:
    - Placeholder: "Search warehouse or location..."
    - Left icon: `<Search />`
    - Right icon: `<X />` button (visible only when `searchQuery.length > 0`)
    - Value: `searchQuery`
    - OnChange: `setSearchQuery`
    - Clear button onClick: `setSearchQuery("")`
  - Sort dropdown:
    - Label: "Sort by"
    - Options: "Warehouse Code", "Location Code", "Available Stock"
    - Display current sort order indicator (arrow up/down)
    - Toggle sort order on select
- Add filtered results count display:
  - Show "Showing X of Y locations" when filters are active
  - Show "All X locations" when no filters active
- Add Clear Filters button (visible only when filters are active):
  - Reset `warehouseFilter` to "all"
  - Reset `searchQuery` to ""
  - Reset `sortBy` to "warehouse"
  - Reset `sortOrder` to "asc"

### 5. Create Location Cards Display Component
- Below filter controls, add location cards grid:
  - Use responsive grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
  - Map over `filteredLocations` array
  - For each location, render a Card with:
    - **Header section:**
      - Warehouse code badge with `MapPin` icon (format: `CDC-BKK01`)
      - Location code in monospace font (format: `A01-R02-S03`)
      - Default location "dl" badge (green) if `location.isDefaultLocation === true`
      - Availability indicator dot (use `StockAvailabilityIndicator` component)
    - **Stock status breakdown section:**
      - Grid of status badges (2 columns on mobile, 3 columns on larger screens)
      - Each badge shows:
        - Status label (use `getStockStatusLabel(status)`)
        - Stock count for that status
        - Color coding (use `getStockStatusColor(status)`)
      - Status badges for: Stock, In Process, Sold, On-hold, Pending
      - Unusable badge (gray) if `location.stockUnusable > 0`
    - **Footer section:**
      - Total stock for location (use `getTotalStockForLocation(location)`)
      - Display as "Total: XXX units"

### 6. Handle Empty States and Edge Cases
- Add empty state when no locations exist:
  - Show message: "No warehouse location data available"
  - Display info icon with explanation
- Add empty state when filters return no results:
  - Show message: "No locations match your filters"
  - Display "Clear Filters" button
- Add loading state handling (if needed in future):
  - Placeholder for skeleton loading state
- Handle missing or undefined warehouse codes:
  - Use "N/A" placeholder
  - Display warning badge

### 7. Apply Mobile-First Responsive Design
- Ensure filter controls stack vertically on mobile, horizontally on larger screens:
  - Use `flex flex-col sm:flex-row` pattern
  - Add appropriate gaps between controls
- Location cards grid:
  - 1 column on mobile (`grid-cols-1`)
  - 2 columns on small screens (`sm:grid-cols-2`)
  - 3 columns on large screens (`lg:grid-cols-3`)
- Stock status badges within location cards:
  - 2 columns on mobile (`grid-cols-2`)
  - 3 columns on larger screens (`sm:grid-cols-3`)
- Ensure touch-friendly target sizes (minimum 44px)
- Test responsiveness at breakpoints: 320px, 640px, 1024px, 1280px

### 8. Integrate with Existing Component Structure
- Ensure Stock by Location section is positioned after Stock Breakdown Card
- Ensure Stock by Location section is before Stock History Chart
- Maintain consistent spacing using `space-y-6` pattern
- Use existing color scheme and design tokens from the project
- Follow existing Card, Badge, and Button styling patterns
- Ensure accessibility:
  - Add aria-labels to filter controls
  - Add aria-live region for filtered results count
  - Ensure keyboard navigation works for all interactive elements

### 9. Test Functionality with Mock Data
- Verify component renders correctly with existing mock data from `lib/mock-inventory-data.ts`
- Test filtering by warehouse code:
  - Select different warehouse codes from dropdown
  - Verify only matching locations are displayed
- Test search functionality:
  - Search by warehouse code (e.g., "CDC-BKK01")
  - Search by location code (e.g., "A01")
  - Verify case-insensitive matching
- Test sorting:
  - Sort by warehouse code (A-Z, Z-A)
  - Sort by location code (A-Z, Z-A)
  - Sort by available stock (high to low, low to high)
- Test combined filters:
  - Apply warehouse filter + search query
  - Verify results count updates correctly
- Test clear filters button:
  - Apply multiple filters
  - Click clear filters
  - Verify all filters reset to default state

### 10. Validate Against Requirements
- Verify all requirements from the prompt are met:
  - ✓ Product header with name, SKU, category, and main image (already exists)
  - ✓ Stock summary cards (already exists)
  - ✓ Stock by Location section with warehouse/location codes
  - ✓ Default location indicator (dl badge)
  - ✓ Stock status breakdown per location
  - ✓ Color-coded status indicators
  - ✓ Availability indicator dots
  - ✓ Warehouse code filter dropdown
  - ✓ Search input for location filtering
  - ✓ Clear filters button
  - ✓ Filtered results count display
  - ✓ Sorting options (warehouse, location, stock)
  - ✓ Uses existing components and patterns
  - ✓ Mobile-first responsive design
  - ✓ Recent transactions section (already exists)
  - ✓ Stock history chart (already exists)
  - ✓ Back button (already exists)

## Validation Commands
Execute these commands to validate the chore is complete:

**1. Type Check:**
```bash
npx tsc --noEmit
```
- Verify no TypeScript errors in modified files
- Confirm all imported types are correctly used

**2. Build Test:**
```bash
pnpm build
```
- Verify the application builds successfully without errors
- Confirm no missing dependencies or import issues

**3. Development Server Test:**
```bash
pnpm dev
```
- Navigate to `http://localhost:3000/inventory`
- Click on any inventory item to view detail page
- Verify Stock by Location section is visible
- Test all filter controls:
  - Warehouse dropdown filtering
  - Search input filtering
  - Sorting options (warehouse, location, stock)
  - Clear filters button
- Verify filtered results count updates correctly
- Test on different screen sizes (mobile, tablet, desktop)
- Verify all location cards display correctly with stock status breakdowns

**4. Component Accessibility Test:**
```bash
# Use browser developer tools to verify:
# - Tab navigation works through all filter controls
# - ARIA labels are present on interactive elements
# - Screen reader can announce filtered results count
```

**5. Manual Validation Checklist:**
- [ ] Stock by Location section renders after Stock Breakdown section
- [ ] Warehouse dropdown lists all unique warehouse codes
- [ ] Search input filters locations by warehouse or location code
- [ ] Clear filters button resets all filters
- [ ] Filtered results count displays correctly
- [ ] Sort options work for warehouse code, location code, and available stock
- [ ] Location cards show warehouse code, location code, and default location badge
- [ ] Stock status breakdown displays all statuses with correct colors
- [ ] Availability indicator shows green dot for available, red dot for out of stock
- [ ] Empty states display when no locations or no filtered results
- [ ] Mobile responsive design works at all breakpoints
- [ ] Component integrates seamlessly with existing page layout

## Notes

**Design Consistency:**
- Follow existing color scheme from StockLocationPopover component for status badges
- Use existing Badge, Card, and Input components from the UI library
- Match spacing and typography with existing Stock Breakdown section

**Performance Considerations:**
- Use `useMemo` for filtered and sorted locations to avoid unnecessary recalculations
- Debounce search input if performance issues arise with large location datasets

**Future Enhancements:**
- Consider adding export functionality for location data
- Add ability to edit stock levels per location
- Add location history tracking
- Integrate with warehouse management system APIs

**Data Flow:**
- The page already fetches item data including `warehouseLocations` via `fetchInventoryItemById(id)` in `app/inventory/[id]/page.tsx`
- Mock data automatically generates 1-3 warehouse locations per product via `generateMockWarehouseLocations()` in `lib/mock-inventory-data.ts`
- No additional API calls or data fetching required for this enhancement

**Mobile-First Priority:**
- Ensure all filter controls are easily tappable on mobile devices
- Location cards should be readable and not cramped on small screens
- Consider collapsible filter section on mobile if space is limited
