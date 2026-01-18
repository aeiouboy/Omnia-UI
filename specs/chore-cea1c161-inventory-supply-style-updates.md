# Chore: Inventory Supply Page Style Updates

## Metadata
adw_id: `cea1c161`
prompt: `Restyle the Inventory Supply page (app/inventory-new/supply/page.tsx) to align with the established style guide used in other inventory pages (app/inventory/stores/page.tsx).`

## Chore Description
Update the Inventory Supply page to follow the established design patterns from the Stock Card/Stores page. This includes adding navigation header with back/refresh buttons, summary statistics cards, enhanced filter panel, and improved table styling with badges.

## Relevant Files

### Files to Modify
- `app/inventory-new/supply/page.tsx` - Main file to update with new styling

### Reference Files
- `app/inventory/stores/page.tsx` (lines 200-350) - Reference for header structure, stats cards, filter panel, and table layout

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Imports
- Add `CardDescription` to card imports
- Add `ArrowLeft`, `RefreshCw`, `Database`, `Package`, `CheckCircle2`, `Clock` to lucide-react imports
- Add `Badge` component from `@/components/ui/badge` (if not already imported)
- Add `Tabs, TabsList, TabsTrigger` from `@/components/ui/tabs` (if not already imported)
- Add `useRouter` from `next/navigation`

### 2. Add State Management for Refresh
- Add `refreshing` state variable to handle loading state during refresh
- Modify `loadData` function to accept optional `showLoadingState` parameter
- Update loading logic to differentiate between initial load and refresh

### 3. Create Navigation Header
- Add navigation section above page header with:
  - "Back to Inventory" button with `ArrowLeft` icon
  - Router push to `/inventory-new` on click
  - Refresh button with `RefreshCw` icon
  - Refresh button triggers `loadData(false)` with loading state
  - Disable refresh button when `refreshing` is true
  - Add spinning animation to refresh icon when refreshing

### 4. Update Page Header Structure
- Update h1 to use `text-3xl font-bold tracking-tight` (matching stores page)
- Add description paragraph below h1: "View and manage inventory supply levels across all stores and items"
- Use `text-muted-foreground` class for description

### 5. Add Summary Statistics Cards
- Create 4 summary cards using `useMemo` for performance:
  1. **Total Records** - Display `filteredData.length` with `Database` icon
  2. **Total Quantity** - Display sum of `currentStock` with `Package` icon
  3. **Available Quantity** - Display sum of `availableStock` with `CheckCircle2` icon
  4. **Pre-Order Items** - Count of items with `supplyType === "Pre-Order"` with `Clock` icon
- Use grid layout: `grid gap-4 md:grid-cols-2 lg:grid-cols-4`
- Each card should have:
  - `CardHeader` with icon in top-right
  - `CardTitle` with `text-sm font-medium`
  - `CardContent` with `text-2xl font-bold` value
  - Description text with `text-xs text-muted-foreground`

### 6. Enhance Filter Panel
- Add `Filter` icon to filter section header
- Add filter tabs below the search input:
  - "All" tab (default)
  - "On Hand" tab (filters to `supplyType !== "Pre-Order"`)
  - "Pre-Order" tab (filters to `supplyType === "Pre-Order"`)
- Use `Tabs` component with `TabsList` and `TabsTrigger`
- Add active filter state variable

### 7. Update Table Styling
- Add sortable column headers with click handlers
- Add sort icons (↑/↓) to indicate current sort field and direction
- Add health/status badges for:
  - Supply Type: Use yellow badge for "Pre-Order", blue for "On Hand"
  - Available Stock: Use green for positive, red for zero
- Ensure column widths and alignment match stores page style
- Add hover effects on rows

### 8. Add Loading and Error States
- Create loading skeleton matching stores page pattern
- Add error state display with retry button if data fetch fails

### 9. Calculate Summary Statistics
- Add `useMemo` hook to calculate summary stats from `filteredData`:
  ```typescript
  const summary = useMemo(() => {
    return {
      totalRecords: filteredData.length,
      totalQuantity: filteredData.reduce((sum, item) => sum + item.currentStock, 0),
      availableQuantity: filteredData.reduce((sum, item) => sum + item.availableStock, 0),
      preOrderItems: filteredData.filter(item => item.supplyType === "Pre-Order").length,
    }
  }, [filteredData])
  ```

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# Check for TypeScript errors
npm run build

# Run linter
npm run lint

# Start dev server and manually verify
npm run dev
# Then navigate to http://localhost:3000/inventory-new/supply
# Verify:
# - Back button navigates to /inventory-new
# - Refresh button works with loading state
# - All 4 summary cards display correct values
# - Filter tabs work correctly
# - Table styling matches stores page
```

## Notes
- The Inventory Supply page is at `/inventory-new/supply` while the stores page is at `/inventory/stores`
- The back button should navigate to `/inventory-new` (the new inventory section)
- Maintain all existing filter functionality while adding new UI elements
- The page should remain responsive with the new layout
- Summary stats should update dynamically based on filtered data
```
