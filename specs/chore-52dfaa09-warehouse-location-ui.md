# Chore: Update Inventory Page UI with Warehouse Location Information

## Metadata
adw_id: `52dfaa09`
prompt: `Update inventory page UI to include store location information. The UI should display:
1. Warehouse & Stock Location column showing warehouse codes (e.g., CMG/1005/1055)
2. Location indicator badges (dl for default_location)
3. Expandable tooltips/popovers showing detailed stock breakdown by location with:
   - Warehouse code and location
   - Stock status with counts (Stock, In Process, Sold, On-hold, Pending)
   - Color-coded indicators (green for Stock, orange for In Process, etc.)
4. Stock availability indicator dots (green for available, red for out of stock)
5. Maintain existing columns: ISKU, Product Name, Last Updated, Total Stock, Available to Purchase, On Hold, Pending Stock, Sold Stock, Unusable Stock
6. Ensure mobile-responsive design following the existing mobile-first approach
Reference the screenshot provided which shows warehouse location tooltips with stock breakdowns.`

## Chore Description

The inventory page UI needs to be enhanced to display comprehensive warehouse location information with stock breakdowns. The implementation is already in progress with several components created. This chore involves completing the implementation by ensuring all components are properly integrated and the UI displays correctly across all screen sizes.

The system already has:
- **Component Infrastructure**: Three new UI components have been created:
  - `WarehouseLocationCell`: Displays warehouse codes, location badges, and popover trigger
  - `StockLocationPopover`: Shows detailed stock breakdown in an expandable popover
  - `StockAvailabilityIndicator`: Visual indicator (colored dots) for stock availability
- **Utility Functions**: `warehouse-utils.ts` provides formatting and color coding functions
- **Data Layer**: `mock-inventory-data.ts` generates warehouse locations with stock breakdowns
- **Type Definitions**: `inventory.ts` includes all necessary types for warehouse locations

The inventory page (`app/inventory/page.tsx`) has already been updated to include the warehouse location column and integrate the new components. This chore will validate the implementation and ensure it meets all requirements.

## Relevant Files

### Existing Component Files (Already Created)
- **`src/components/inventory/warehouse-location-cell.tsx`** - Main table cell component that displays warehouse codes, default location badges, and provides access to the popover
- **`src/components/inventory/stock-location-popover.tsx`** - Popover component showing detailed stock breakdown by location with color-coded status indicators
- **`src/components/inventory/stock-availability-indicator.tsx`** - Visual indicator component showing stock availability with colored dots (green/red)
- **`src/lib/warehouse-utils.ts`** - Utility functions for formatting warehouse codes, color coding stock statuses, and location management
- **`src/lib/mock-inventory-data.ts`** - Updated to include `generateMockWarehouseLocations()` function that creates realistic stock location data
- **`src/types/inventory.ts`** - Type definitions including `StockLocation`, `StockStatus`, `WarehouseLocation` interfaces

### Modified Files
- **`app/inventory/page.tsx`** (lines 40, 391-396, 485-487) - Inventory page updated with warehouse location column and component integration

### Files for Validation
- **`src/lib/inventory-service.ts`** - Service layer that fetches and processes inventory data (should already provide warehouse locations)
- **`src/components/ui/popover.tsx`** - Radix UI popover component (dependency)
- **`src/components/ui/badge.tsx`** - Badge component used for indicators (dependency)
- **`package.json`** - Verify all required dependencies are installed

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Review Current Implementation
- Read the inventory page implementation to verify warehouse location column is properly integrated
- Check that `WarehouseLocationCell` is correctly imported and used in the table
- Verify `StockAvailabilityIndicator` is integrated in the stock column
- Confirm the table header includes the warehouse location column with proper icon

### 2. Validate Component Integration
- Test the `WarehouseLocationCell` component displays:
  - Formatted warehouse codes (e.g., CMG/1005/1055)
  - Default location badge ("dl") for default locations
  - Multiple locations indicator (+N badge) when applicable
  - Popover trigger button with "View Locations" text
- Verify the popover opens on click and displays full stock breakdown
- Check that all stock statuses have correct color coding:
  - Stock: green (bg-green-50 text-green-500)
  - In Process: orange (bg-orange-50 text-orange-500)
  - Sold: gray (bg-gray-50 text-gray-500)
  - On Hold: blue (bg-blue-50 text-blue-500)
  - Pending: yellow (bg-yellow-50 text-yellow-500)

### 3. Test Mobile Responsiveness
- Verify warehouse location column is hidden on mobile with `hidden lg:table-cell` class
- Check that the table remains usable on small screens
- Test popover positioning on mobile devices (should use `side="right"` and adjust if needed)
- Verify all touch targets are at least 44px for mobile accessibility
- Test that the popover content scrolls properly on small screens with `max-h-80 overflow-y-auto`

### 4. Validate Stock Availability Indicators
- Check that the availability indicator displays correctly in the stock column
- Verify green dot (CircleDot) shows for available stock (stockCount > 0)
- Verify red dot (Circle) shows for out of stock (stockCount === 0)
- Test that the indicator includes tooltip with stock count information
- Ensure the indicator is positioned inline with stock counts

### 5. Verify Data Flow
- Confirm `generateMockWarehouseLocations()` is called for all inventory items
- Check that warehouse locations are properly typed as `StockLocation[]`
- Verify stock breakdown totals match the product's total stock
- Test that the default location is correctly identified and marked
- Ensure all stock status fields (stockAvailable, stockInProcess, etc.) have valid values

### 6. Test Popover Functionality
- Click popover trigger and verify it opens without errors
- Check that popover displays all locations with correct formatting
- Verify total stock count in footer matches sum of all statuses
- Test that popover closes when clicking outside
- Verify popover positioning adapts to viewport boundaries
- Test keyboard navigation and accessibility (Esc to close, focus management)

### 7. Validate Column Layout
- Verify the table maintains proper column structure with warehouse location column
- Check that column widths are appropriate (warehouse column should use `min-w-[180px]`)
- Test horizontal scrolling on smaller screens
- Ensure all existing columns remain functional and properly aligned
- Verify sorting functionality still works on sortable columns

### 8. Check Visual Design Consistency
- Verify all components use consistent spacing and padding
- Check that badge styles match the design system
- Verify color coding is consistent with other parts of the application
- Test that icons (MapPin, Info) are properly sized and aligned
- Ensure font sizes and weights are appropriate (text-xs for badges, font-mono for codes)

### 9. Test Edge Cases
- Test products with no warehouse locations (should show "No location data")
- Test products with single location (should not show +N badge)
- Test products with multiple locations (verify all are listed in popover)
- Test products with zero stock across all statuses
- Test extremely long warehouse codes (should truncate or wrap properly)

### 10. Validate Performance
- Check that the page loads without lag with 25+ inventory items
- Verify popover rendering doesn't cause performance issues
- Test that table sorting/filtering still performs well with new column
- Ensure no memory leaks when opening/closing popovers multiple times
- Verify no console errors or warnings in browser dev tools

## Validation Commands
Execute these commands to validate the chore is complete:

### 1. Type Check
```bash
npm run type-check
# OR if using pnpm
pnpm run type-check
```
Should complete with no TypeScript errors in any inventory-related files.

### 2. Build Check
```bash
npm run build
# OR
pnpm build
```
Should build successfully without errors, verifying all components are properly integrated.

### 3. Lint Check
```bash
npm run lint
# OR
pnpm lint
```
Should pass without errors in the inventory components and page.

### 4. Development Server Test
```bash
npm run dev
# OR
pnpm dev
```
Then navigate to `http://localhost:3000/inventory` and verify:
- Warehouse location column appears on desktop (lg breakpoint)
- Warehouse location column is hidden on mobile
- Popover opens and displays stock breakdown correctly
- Stock availability indicators show green/red dots appropriately
- No console errors in browser developer tools
- All interactive elements work (sorting, pagination, search)

### 5. Visual Regression Check
Manually verify in browser at these breakpoints:
- **Mobile (375px)**: Warehouse column hidden, table scrollable
- **Tablet (768px)**: Warehouse column hidden, other columns visible
- **Desktop (1024px)**: Warehouse column visible with all features
- **Large Desktop (1440px)**: All columns properly spaced and aligned

### 6. Component Rendering Test
In browser dev tools console, verify:
```javascript
// Check if components are imported correctly
document.querySelector('[data-component="warehouse-location-cell"]') !== null
// Should return true or verify elements exist in the table
```

### 7. Accessibility Test
Use browser dev tools or axe DevTools to verify:
- All interactive elements have proper ARIA labels
- Popover has correct ARIA attributes (aria-haspopup, aria-expanded)
- Keyboard navigation works (Tab, Enter, Escape)
- Focus management is correct when opening/closing popover
- Color contrast meets WCAG AA standards (especially for badges)

## Notes

### Implementation Status
The implementation is **already in progress** with the following completed:
- ✅ Three UI components created and implemented
- ✅ Utility functions for warehouse location management
- ✅ Type definitions updated
- ✅ Mock data generator for warehouse locations
- ✅ Inventory page updated with warehouse location column

### Key Implementation Details
1. **Warehouse Code Format**: The format "CMG/1005/1055" represents warehouse_code/location_code, parsed by `formatWarehouseCode()` utility
2. **Default Location**: The first location in the array is always marked as default with `isDefaultLocation: true`
3. **Stock Status Colors**: Follows a consistent color scheme across the application for different stock statuses
4. **Mobile-First**: Column visibility uses `hidden lg:table-cell` to ensure mobile usability
5. **Touch Targets**: All interactive elements maintain 44px minimum height for mobile accessibility

### Design System Integration
- Uses existing Radix UI components (Popover, Badge)
- Follows Tailwind CSS conventions for spacing and colors
- Maintains consistency with other table components in the application
- Icons from Lucide React library (MapPin, Info, Circle, CircleDot)

### Future Enhancements (Not in Scope)
- Real-time stock updates via WebSocket
- Warehouse location editing interface
- Stock transfer between locations
- Detailed warehouse location history
- Advanced filtering by warehouse location
- Barcode scanning for location verification
