# Chore: Order Page Filter Validation & Export Date Restriction

## Metadata
adw_id: `2d78f1c4`
prompt: `Implement order page filtering validation and export date restriction with Quick Filters disabled and 6-month backward limit on export date selection`

## Chore Description
This chore involves two main changes to the Order Management Hub:

1. **Disable Quick Filters Section**: Remove the entire Quick Filters section (Urgent Orders, Due Soon, Ready to Process, On Hold buttons) from the order page. Users will rely on standard dropdown filters and advanced filters only.

2. **Export Date Restriction**: Add a 6-month backward limit on the "Order Date From" field specifically for export functionality. This requires creating an export dialog/modal with its own date picker that enforces the 6-month limit, while the main page date filters remain unrestricted.

## Relevant Files
Use these files to complete the chore:

- **`src/components/order-management-hub.tsx`** - Main order management component containing:
  - Quick Filters section (lines 1860-1952) - to be removed
  - Export button and handler (lines 1809-1827, 1638-1660)
  - Current date pickers for filtering (lines 2051-2103)
  - State management for filters and export

- **`src/components/ui/dialog.tsx`** - Dialog component for export modal

- **`src/components/ui/calendar.tsx`** - Calendar component that supports `disabled` prop via react-day-picker for date restriction

- **`src/components/ui/tooltip.tsx`** - Tooltip component for explaining 6-month limitation

- **`src/components/ui/button.tsx`** - Button component used throughout

- **`src/components/ui/label.tsx`** - Label component for form fields

- **`src/components/ui/popover.tsx`** - Popover component for date picker

### New Files
None required - all changes are modifications to existing `order-management-hub.tsx`

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove Quick Filters Section
- Locate the Quick Filters section in `order-management-hub.tsx` (lines 1860-1952)
- Remove the entire `{/* Operations Quick Filters */}` block including:
  - The "Quick Filters" label div
  - All four quick filter buttons (Urgent Orders, Due Soon, Ready to Process, On Hold)
  - The Clear Filters button
- Keep the `quickFilter` state variable but set its default to "all" and don't use it for filtering
- Update `handleResetAllFilters` function to remove references to `quickFilter` if used in other logic
- Remove unused imports related to quick filter icons if any become orphaned (AlertCircle, Clock, Package, PauseCircle may still be used elsewhere)

### 2. Add Export Dialog State Management
- Add new state variables for export dialog:
  ```typescript
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportDateFrom, setExportDateFrom] = useState<Date | undefined>(undefined)
  const [exportDateTo, setExportDateTo] = useState<Date | undefined>(undefined)
  ```
- Add import for Dialog components from `@/components/ui/dialog`
- Add import for Tooltip components from `@/components/ui/tooltip`

### 3. Create 6-Month Date Restriction Logic
- Create a constant for the 6-month limit:
  ```typescript
  const sixMonthsAgo = useMemo(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 6)
    date.setHours(0, 0, 0, 0)
    return date
  }, [])
  ```
- Create a disabled date function for the export calendar:
  ```typescript
  const isDateDisabledForExport = (date: Date) => {
    return date < sixMonthsAgo || date > new Date()
  }
  ```

### 4. Update Export Button to Open Dialog
- Modify the Export button click handler to open the dialog instead of directly exporting:
  ```typescript
  onClick={() => setShowExportDialog(true)}
  ```
- Remove the direct call to `handleExportSearchResults()` from the button

### 5. Create Export Dialog Component
- Add a Dialog component after the main Card component with:
  - Dialog title: "Export Orders"
  - Date Type selector (matching main filters)
  - Date From picker with 6-month restriction using `disabled` prop
  - Date To picker (no restriction, but not future dates)
  - Info text explaining the 6-month limitation
  - Cancel and Export buttons
- The dialog should:
  - Initialize with current page filter dates as defaults (if within 6-month range)
  - Show tooltip/message when hovering over disabled dates
  - Validate that Date From is not empty before allowing export

### 6. Create Export Dialog Handler
- Create new function `handleExportWithDateRange`:
  ```typescript
  const handleExportWithDateRange = async () => {
    if (!exportDateFrom) {
      toast({
        title: "Date Required",
        description: "Please select an Order Date From to export.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    try {
      // Filter orders based on export date range
      const ordersToExport = filteredOrders.filter(order => {
        const orderDate = new Date(order.order_date || order.metadata?.created_at || '')
        if (exportDateFrom && orderDate < exportDateFrom) return false
        if (exportDateTo && orderDate > exportDateTo) return false
        return true
      })

      exportOrdersToCSV(ordersToExport)
      setShowExportDialog(false)

      toast({
        title: "Export Successful",
        description: `Exported ${ordersToExport.length} order(s) to CSV.`,
      })
    } catch (err: any) {
      toast({
        title: "Export Failed",
        description: err.message || "Failed to export orders to CSV.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }
  ```

### 7. Add Info Message for Date Restriction
- Add an informational message in the export dialog:
  ```tsx
  <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
    <AlertCircle className="h-4 w-4" />
    <span>Export date range is limited to the last 6 months from today.</span>
  </div>
  ```

### 8. Update Clear Filters Logic
- Remove `quickFilter` from the Clear Filters button disabled condition (since Quick Filters section is removed)
- Update the `handleResetAllFilters` function if it references `quickFilter`

### 9. Validate All Existing Filters Still Work
- Ensure the Main Filters section remains intact:
  - Search input
  - Status dropdown
  - Store No. dropdown
  - Payment Status dropdown
  - Selling Channel dropdown
  - Date Type selector
  - Date From/To pickers (unrestricted for viewing)
- Ensure Advanced Filters collapsible section remains intact:
  - SKU search
  - Item Name search
  - Customer Name search
  - Email search
  - Phone search
  - Item Status dropdown
  - Payment Method dropdown
  - Order Type dropdown
  - Delivery Type dropdown
  - Request Tax dropdown
  - Settlement Type dropdown
  - Additional date filters

### 10. Validate Implementation
- Run TypeScript compilation to check for errors
- Run the development server
- Test that Quick Filters are removed
- Test that all standard filters work correctly
- Test export dialog opens with date pickers
- Test 6-month restriction is enforced on export Date From
- Test export with valid date range works

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify no TypeScript or build errors
- `pnpm lint` - Verify no ESLint errors
- `pnpm dev` - Start development server and manually test:
  1. Confirm Quick Filters section is completely removed
  2. Confirm Main Filters (Status, Store, Payment, Channel, Date) all work
  3. Confirm Advanced Filters collapsible section works
  4. Click Export button - confirm dialog opens
  5. In export dialog, try to select a date older than 6 months - confirm it's disabled
  6. Select valid date range and export - confirm CSV downloads
  7. Confirm filter persistence works when navigating

## Notes

- The Calendar component from react-day-picker supports a `disabled` prop that can accept a function to disable specific dates
- The existing `filteredOrders` array should be further filtered by the export date range before export
- Quick filter counts from `useOrderCounts` hook can remain as they may be used elsewhere
- The `quickFilter` state can be kept but unused, or removed entirely if no other component references it
- Consider adding the 6-month limit as a constant at the top of the file for easy configuration changes
