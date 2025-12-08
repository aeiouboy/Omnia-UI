# Chore: Update Inventory Page UI with Store Location Information

## Metadata
adw_id: `0985655d`
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

This chore enhances the Inventory Management page (`/app/inventory/page.tsx`) to display comprehensive warehouse location information and stock breakdowns across multiple locations. The current implementation shows basic product inventory data, but lacks detailed warehouse location tracking and per-location stock status visibility.

The enhancement will add:
- **Warehouse & Stock Location Column**: Display warehouse codes (e.g., CMG/1005/1055) to show where items are stored
- **Location Badges**: Visual indicators for default locations (dl badge)
- **Interactive Tooltips/Popovers**: Expandable views showing detailed stock breakdown by location including:
  - Warehouse code and specific location within warehouse
  - Stock status categories: Stock (available), In Process, Sold, On-hold, Pending
  - Color-coded visual indicators for quick status recognition
- **Stock Availability Dots**: Visual indicators (green = available, red = out of stock) for at-a-glance status
- **Enhanced Table Columns**: Add new columns while maintaining existing ones (ISKU, Product Name, Last Updated, Total Stock, Available to Purchase, On Hold, Pending Stock, Sold Stock, Unusable Stock)

The implementation must follow the existing mobile-first responsive design patterns used throughout the application.

## Relevant Files

### Existing Files to Modify

- **`app/inventory/page.tsx`** (Lines 1-563)
  - Main inventory page component that needs table column additions and tooltip/popover implementation
  - Currently displays: Image, Product Name, Barcode, Category, Type, Available/Total, Status, Price
  - Needs to add: Warehouse & Stock Location column, location badges, stock availability indicators

- **`src/types/inventory.ts`** (Lines 1-223)
  - TypeScript type definitions for inventory domain
  - Needs new types for: WarehouseLocation, StockLocationBreakdown, LocationStockStatus
  - Define interfaces for warehouse codes, location indicators, and stock status by location

- **`src/lib/inventory-service.ts`** (Lines 1-520)
  - Service layer for fetching inventory data from Supabase or mock data
  - Needs functions to fetch warehouse location data and stock breakdowns by location
  - Add: `fetchWarehouseLocations()`, `fetchStockBreakdownByLocation(productId: string)`

- **`src/lib/mock-inventory-data.ts`** (Lines 1-100+)
  - Mock data generator for development/testing
  - Needs to generate realistic warehouse location data with multiple locations per product
  - Add mock warehouse codes (CMG, 1005, 1055, etc.) and stock status breakdowns

- **`src/components/ui/popover.tsx`** or **`src/components/ui/tooltip.tsx`**
  - Existing Radix UI components for interactive tooltips/popovers
  - May need customization for stock breakdown display with color-coded indicators

### New Files to Create

#### New Component Files

- **`src/components/inventory/warehouse-location-cell.tsx`**
  - Reusable table cell component displaying warehouse codes and location badges
  - Props: `warehouseCode: string`, `isDefaultLocation: boolean`, `stockLocations: StockLocation[]`
  - Renders: Warehouse code display + "dl" badge for default locations + popover trigger

- **`src/components/inventory/stock-location-popover.tsx`**
  - Popover content component showing detailed stock breakdown by location
  - Props: `locations: StockLocationBreakdown[]`
  - Renders: Warehouse code, location, stock status counts with color-coded indicators
  - Color scheme: green (Stock), orange (In Process), blue (On-hold), yellow (Pending), gray (Sold)

- **`src/components/inventory/stock-availability-indicator.tsx`**
  - Simple dot indicator component for at-a-glance stock availability
  - Props: `isAvailable: boolean`, `stockCount: number`
  - Renders: Green dot (available, stock > 0) or Red dot (out of stock, stock = 0)

#### New Utility Files

- **`src/lib/warehouse-utils.ts`**
  - Utility functions for warehouse location formatting and parsing
  - Functions: `formatWarehouseCode(code: string)`, `parseLocationCode(code: string)`, `getDefaultLocation(locations: StockLocation[])`

## Step by Step Tasks

### 1. Define TypeScript Types for Warehouse Locations

- Open `src/types/inventory.ts`
- Add new type `StockStatus = "stock" | "in_process" | "sold" | "on_hold" | "pending"`
- Add interface `WarehouseLocation` with fields: `warehouseCode: string`, `locationCode: string`, `isDefaultLocation: boolean`
- Add interface `StockLocationBreakdown` with fields: `warehouseCode: string`, `locationCode: string`, `stockStatus: Record<StockStatus, number>`
- Add interface `StockLocation` combining `WarehouseLocation` and stock counts
- Update `InventoryItem` interface to include optional `warehouseLocations?: StockLocation[]` field
- Update `InventoryItemDB` interface to match database schema for warehouse location fields

### 2. Create Mock Warehouse Location Data

- Open `src/lib/mock-inventory-data.ts`
- Add array `WAREHOUSE_CODES` with realistic codes: `["CMG", "1005", "1055", "2001", "2002"]`
- Create function `generateMockWarehouseLocations(productId: string): StockLocation[]`
  - Generate 1-3 warehouse locations per product
  - Randomly assign warehouse codes from `WAREHOUSE_CODES`
  - Mark first location as default location (`isDefaultLocation: true`)
  - Generate realistic stock breakdown: Stock (50-200), In Process (10-50), Sold (0-100), On-hold (0-30), Pending (0-40)
- Update `mockInventoryItems` array to include `warehouseLocations` field for each item using the generator function
- Create function `generateMockStockBreakdown(productId: string, warehouseCode: string): StockLocationBreakdown`

### 3. Update Inventory Service Layer

- Open `src/lib/inventory-service.ts`
- Add function `fetchWarehouseLocations(productId: string): Promise<StockLocation[]>`
  - Check if Supabase is available using `isSupabaseAvailable()`
  - If available, query `warehouse_locations` table joined with `warehouse_stock_status` table
  - If unavailable or error, fallback to `generateMockWarehouseLocations(productId)`
- Add function `fetchStockBreakdownByLocation(productId: string, warehouseCode: string): Promise<StockLocationBreakdown>`
  - Similar pattern: Supabase query with fallback to mock data
- Update `convertDBItemToInventoryItem()` function to include warehouse location data conversion
- Ensure warehouse location data is included when fetching inventory items in `fetchInventoryData()`

### 4. Create Stock Availability Indicator Component

- Create file `src/components/inventory/stock-availability-indicator.tsx`
- Import required dependencies: React, Lucide icons (Circle, CircleDot)
- Define props interface: `StockAvailabilityIndicatorProps { isAvailable: boolean; stockCount: number; showCount?: boolean }`
- Implement component:
  - Render green dot (CircleDot) when `isAvailable = true` and `stockCount > 0`
  - Render red dot (Circle) when `isAvailable = false` or `stockCount = 0`
  - Use Tailwind classes: `text-green-500` for available, `text-red-500` for out of stock
  - Optionally display stock count next to indicator if `showCount = true`
  - Add tooltip showing "In Stock (X units)" or "Out of Stock"
- Export component as default

### 5. Create Stock Location Popover Component

- Create file `src/components/inventory/stock-location-popover.tsx`
- Import Popover components from `@/components/ui/popover`
- Import Badge, Card components for layout
- Define props interface: `StockLocationPopoverProps { locations: StockLocationBreakdown[] }`
- Implement component:
  - Use Radix Popover for expandable content
  - PopoverTrigger: Info icon or "View Locations" button
  - PopoverContent: Card with detailed stock breakdown
  - For each location in `locations`:
    - Display warehouse code and location code as header
    - Show stock status breakdown in grid layout
    - Color-coded badges: Stock (green), In Process (orange), Sold (gray), On-hold (blue), Pending (yellow)
    - Display counts for each status: "Stock: 150", "In Process: 25", etc.
  - Responsive design: Stack vertically on mobile, grid on desktop
  - Add "Total Stock" summary at bottom
- Export component as default

### 6. Create Warehouse Location Cell Component

- Create file `src/components/inventory/warehouse-location-cell.tsx`
- Import StockLocationPopover and Badge components
- Define props interface: `WarehouseLocationCellProps { warehouseCode: string; locationCode: string; isDefaultLocation: boolean; stockLocations: StockLocation[] }`
- Implement component:
  - Display warehouse code in monospace font (e.g., "CMG/1005/1055")
  - Show "dl" badge if `isDefaultLocation = true` using Badge component with green background
  - Add StockLocationPopover as expandable detail view
  - Use flex layout: warehouse code on left, badges on right
  - Mobile responsive: stack vertically on small screens
  - Hover effect: subtle background color change
- Export component as default

### 7. Create Warehouse Utility Functions

- Create file `src/lib/warehouse-utils.ts`
- Implement `formatWarehouseCode(warehouseCode: string, locationCode: string): string`
  - Returns formatted string: "CMG/1005/1055" or "WAREHOUSE/LOCATION"
  - Handle missing values gracefully
- Implement `parseLocationCode(fullCode: string): { warehouseCode: string; locationCode: string }`
  - Split formatted code back into components
  - Return object with warehouseCode and locationCode
- Implement `getDefaultLocation(locations: StockLocation[]): StockLocation | null`
  - Find and return location where `isDefaultLocation = true`
  - Return null if no default location found
- Implement `getStockStatusColor(status: StockStatus): string`
  - Return Tailwind color class based on status
  - Mapping: stock → green-500, in_process → orange-500, sold → gray-500, on_hold → blue-500, pending → yellow-500
- Add JSDoc comments for all functions
- Export all functions

### 8. Update Inventory Page Table Structure

- Open `app/inventory/page.tsx`
- Import new components: `WarehouseLocationCell`, `StockAvailabilityIndicator`
- Import warehouse utilities: `formatWarehouseCode`, `getDefaultLocation`
- Locate TableHeader section (Lines ~385-446)
- Add new TableHead column after "Image" column:
  - Label: "Warehouse & Location"
  - No sorting (complex nested data)
  - Mobile: Hidden on small screens using `hidden sm:table-cell`
- Update existing "Available / Total" column:
  - Add StockAvailabilityIndicator before the stock count
  - Show green/red dot based on `item.availableStock > 0`
- Locate TableBody section (Lines ~448-524)
- Add new TableCell for warehouse location:
  - Render WarehouseLocationCell component
  - Pass `warehouseLocations` from item data
  - Show first/default location in table, others in popover
  - Mobile: Hidden on small screens (matching header)
- Update TableCell for stock count to include StockAvailabilityIndicator

### 9. Add Column Toggle for Desktop/Mobile Views

- In `app/inventory/page.tsx`, add state: `const [showWarehouseColumn, setShowWarehouseColumn] = useState(true)`
- Add toggle button in header section (after Refresh button):
  - Label: "Show Warehouse Locations"
  - Icon: MapPin from lucide-react
  - Only visible on desktop (hidden on mobile)
  - Toggles `showWarehouseColumn` state
- Conditionally render warehouse location column based on `showWarehouseColumn`
- Ensure mobile view always hides warehouse column regardless of toggle (use `hidden sm:table-cell` and `showWarehouseColumn` together)

### 10. Maintain Existing Columns and Enhance Display

- Verify all existing columns remain functional:
  - ISKU (Barcode/Product ID) - Line ~400-405
  - Product Name - Line ~388-396
  - Last Updated - Add if missing (from `item.lastRestocked` field)
  - Total Stock - Already shown in "Available / Total" column - Line ~504-506
  - Available to Purchase - Same column - Line ~504-506
  - On Hold - Add new column showing `item.reservedStock`
  - Pending Stock - Add new column (if field exists in data)
  - Sold Stock - Show in warehouse location popover
  - Unusable Stock - Add new column or show in popover
- For new columns (On Hold, Pending, Unusable):
  - Add TableHead entries with sorting support
  - Add TableCell entries with proper formatting
  - Show values from `item.reservedStock`, `item.pendingStock`, `item.unusableStock`
  - Mobile: Hide these columns on small screens, show in detail view

### 11. Add Responsive Mobile Design

- Review existing mobile-first classes in table:
  - Current: `hidden md:table-cell` on Type column (Line ~415-417)
- Apply consistent mobile visibility strategy:
  - Always visible on mobile: Image, Product Name, Status, Price, Actions
  - Hidden on mobile (sm and below): Warehouse Location, Category, Type, On Hold, Pending, Unusable
  - Show hidden columns in expandable row detail or detail page
- Consider adding mobile-specific view:
  - Card-based layout instead of table for screens < 640px
  - Use CSS media query: `@media (max-width: 640px)`
  - Alternative: Show simplified table on mobile, full table on desktop
- Test touch interactions for popovers/tooltips:
  - Ensure tap to open works on mobile devices
  - Add proper touch event handlers
  - Prevent double-tap zoom issues

### 12. Style Color-Coded Stock Status Indicators

- Create or update `app/globals.css` with custom color scheme for stock statuses
- Define CSS variables for consistency:
  - `--stock-available: #22c55e` (green-500)
  - `--stock-in-process: #f97316` (orange-500)
  - `--stock-sold: #6b7280` (gray-500)
  - `--stock-on-hold: #3b82f6` (blue-500)
  - `--stock-pending: #eab308` (yellow-500)
  - `--stock-out: #ef4444` (red-500)
- Update Badge component styles to use these colors
- Ensure sufficient color contrast for accessibility (WCAG AA)
- Add hover effects for interactive elements (popover triggers, badges)

### 13. Implement Warehouse Location Popover Interactions

- In `stock-location-popover.tsx`, ensure Radix Popover is properly configured:
  - Use controlled state if needed for complex interactions
  - Set `side="right"` for desktop, `side="bottom"` for mobile
  - Add `align="start"` for proper alignment
  - Set `sideOffset={8}` for spacing
- Add keyboard navigation support:
  - ESC key closes popover
  - Tab key navigates through popover content
  - Enter/Space opens popover from trigger
- Add loading states for asynchronous warehouse data fetching:
  - Show skeleton loader in popover if data is loading
  - Handle error states with error message in popover
- Add animation for smooth open/close:
  - Use Radix's built-in animations
  - Or add custom CSS transitions

### 14. Update Mock Data with Comprehensive Test Cases

- In `src/lib/mock-inventory-data.ts`, ensure diverse test scenarios:
  - Products with single warehouse location (default location)
  - Products with multiple warehouse locations (2-3 locations)
  - Products with stock in multiple locations but out of stock overall
  - Products with all stock in "In Process" status
  - Products with high "On-hold" stock
  - Products with no warehouse locations (legacy data)
- Update at least 10 items in `mockInventoryItems` array with warehouse location data
- Ensure data consistency:
  - Total stock across locations matches `item.currentStock`
  - Available stock matches sum of "Stock" status across locations
  - Reserved stock matches sum of "On-hold" and "In Process" statuses

### 15. Add Database Schema (Documentation Only)

- Create or update `/docs/database-schema.md` with new warehouse location tables:
  - Table: `warehouse_locations`
    - Columns: `id`, `warehouse_code`, `location_code`, `warehouse_name`, `address`, `is_active`
  - Table: `inventory_warehouse_locations` (junction table)
    - Columns: `id`, `inventory_item_id`, `warehouse_location_id`, `is_default_location`, `created_at`, `updated_at`
  - Table: `warehouse_stock_status`
    - Columns: `id`, `inventory_item_id`, `warehouse_location_id`, `stock_available`, `stock_in_process`, `stock_sold`, `stock_on_hold`, `stock_pending`, `stock_unusable`, `updated_at`
- Add SQL migration script template in `/supabase/migrations/` (if Supabase is used)
- Document relationships between tables
- Note: This step is documentation only, actual database changes are out of scope

### 16. Test and Validate Inventory Page

- Run development server: `pnpm dev`
- Navigate to `/inventory` page
- Verify all new columns are visible on desktop view
- Verify warehouse location cell displays correctly:
  - Warehouse code format: "CMG/1005/1055"
  - "dl" badge shows for default locations
  - Popover trigger is visible and clickable
- Test popover functionality:
  - Click/tap warehouse location cell to open popover
  - Verify stock breakdown displays with correct colors
  - Verify all stock statuses show correct counts
  - Close popover by clicking outside or ESC key
- Test stock availability indicators:
  - Green dot shows for items with `availableStock > 0`
  - Red dot shows for items with `availableStock = 0`
- Test mobile responsive design:
  - Resize browser to mobile width (< 640px)
  - Verify warehouse column is hidden
  - Verify other hidden columns (On Hold, Pending, etc.) are hidden
  - Verify essential columns remain visible
  - Test popover on mobile (touch interaction)
- Test sorting and filtering:
  - Verify existing sort functionality still works
  - Verify search still works
  - Verify tab switching (All Products, Low Stock, Out of Stock) works
- Test pagination with new columns
- Check console for errors or warnings

### 17. Accessibility and Performance Checks

- Run Lighthouse audit in Chrome DevTools:
  - Target scores: Performance > 90, Accessibility > 95
  - Address any accessibility issues reported
- Test keyboard navigation:
  - Tab through all interactive elements (sort headers, search, popover triggers)
  - Verify focus indicators are visible
  - Test popover keyboard controls (ESC to close, Tab to navigate)
- Test screen reader compatibility:
  - Use VoiceOver (Mac) or NVDA (Windows)
  - Verify table structure is announced correctly
  - Verify popover content is accessible
  - Add `aria-label` attributes where needed
- Check color contrast ratios:
  - Use browser DevTools contrast checker
  - Ensure all text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Performance optimization:
  - Memoize expensive calculations using `useMemo`
  - Lazy load popover content if data fetching is slow
  - Optimize re-renders using `React.memo` for cell components

## Validation Commands

Execute these commands to validate the chore is complete:

### 1. Type Check
```bash
pnpm tsc --noEmit
```
- Ensures all TypeScript types are correct and no type errors exist
- Should complete with "0 errors"

### 2. Lint Check
```bash
pnpm lint
```
- Verifies code follows ESLint rules
- Should show no errors (warnings acceptable if minor)

### 3. Build Production
```bash
pnpm build
```
- Tests that the production build completes successfully
- Verifies no runtime errors during build
- Should complete with "Compiled successfully"

### 4. Run Development Server
```bash
pnpm dev
```
- Start development server and navigate to `http://localhost:3000/inventory`
- Manually verify:
  - Warehouse Location column is visible on desktop
  - Stock availability indicators (green/red dots) display correctly
  - Warehouse location popover opens and shows stock breakdown
  - Color-coded stock status badges display correctly
  - All existing columns remain functional
  - Mobile view hides appropriate columns
  - No console errors appear

### 5. Test Component Rendering
```bash
# If testing framework is set up (e.g., Jest, React Testing Library)
pnpm test src/components/inventory/
```
- Run unit tests for new components
- Verify components render without crashing
- Test component props and interactions

### 6. Accessibility Audit
- Open Chrome DevTools
- Navigate to Lighthouse tab
- Run audit for Accessibility category
- Score should be > 95
- Address any reported issues

### 7. Manual Mobile Testing
- Open browser DevTools
- Toggle device toolbar (mobile view)
- Test on iPhone SE, iPhone 12 Pro, iPad Pro viewports
- Verify:
  - Table is responsive
  - Warehouse column is hidden on mobile
  - Popover works with touch interactions
  - No horizontal scroll issues

## Notes

### Design Considerations

1. **Warehouse Code Format**: The format "CMG/1005/1055" suggests a hierarchical structure (Warehouse/Zone/Location). Ensure this format is flexible enough to accommodate different warehouse naming conventions.

2. **Default Location Badge**: The "dl" badge indicates default location. Consider if this should be configurable (e.g., "primary", "default", "main") or if "dl" is a standard abbreviation in the domain.

3. **Stock Status Categories**: The five categories (Stock, In Process, Sold, On-hold, Pending) should align with business logic:
   - **Stock**: Available for immediate sale
   - **In Process**: Currently being picked/packed for orders
   - **Sold**: Already sold but not yet shipped
   - **On-hold**: Reserved for future orders or pending quality checks
   - **Pending**: Incoming stock or pending restocking

4. **Color Accessibility**: Ensure color-coded indicators are not the only way to distinguish stock statuses. Add text labels or icons for users with color blindness.

### Technical Considerations

1. **Data Fetching Strategy**: Warehouse location data should be fetched alongside inventory data to minimize API calls. Consider:
   - Include warehouse locations in initial inventory query (JOIN operation)
   - Or fetch warehouse locations separately and cache in client state
   - Use SWR or React Query for client-side caching if needed

2. **Performance**: Table rendering with nested popover components may impact performance for large datasets (>100 items). Consider:
   - Virtual scrolling if dataset exceeds 200 items (use `@tanstack/react-virtual`)
   - Lazy load popover content (fetch on open, not on page load)
   - Memoize cell components to prevent unnecessary re-renders

3. **Mobile UX**: On mobile devices, table columns are limited. Consider alternative presentations:
   - Card-based layout for mobile instead of table
   - Expandable rows showing hidden columns
   - Separate "Details" button leading to detail page with all information

4. **Tooltip vs Popover**: The requirements mention "tooltips/popovers". Clarify the difference in this context:
   - **Tooltip**: Hover-triggered, read-only, small amount of info
   - **Popover**: Click-triggered, can be interactive, larger amount of info
   - Recommendation: Use Popover for stock breakdown (richer content, interactive)

### Future Enhancements

1. **Warehouse Management Actions**: In future iterations, consider adding:
   - "Transfer Stock" button to move inventory between warehouses
   - "Allocate Stock" functionality to reserve stock at specific locations
   - Warehouse-level stock alerts and reorder points

2. **Stock History by Location**: Track historical stock levels per warehouse location for analytics and forecasting.

3. **Location-based Filtering**: Add filter dropdown to show inventory by specific warehouse or location.

4. **Bulk Operations**: Allow bulk updates to warehouse allocations (e.g., move all low-stock items to main warehouse).

5. **Real-time Updates**: Implement WebSocket or polling for real-time stock status updates across locations.

### Dependencies

- Existing Radix UI components (Popover, Tooltip, Badge)
- Lucide React icons (Circle, CircleDot, MapPin, Info)
- Tailwind CSS for styling
- TypeScript for type safety
- No new npm packages required

### Screenshots Reference

The chore references a screenshot showing warehouse location tooltips. Key observations from typical warehouse management UI patterns:
- Warehouse codes are typically displayed in monospace font for readability
- Default location badges are often green/blue with "dl" or "primary" label
- Stock breakdown tables use color-coded rows or badges
- Availability indicators are simple dots (green/red/yellow) for quick scanning
- Popovers have subtle shadows and borders for elevation

Ensure the implementation matches these UI patterns for consistency with industry standards.
