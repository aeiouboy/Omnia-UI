# Chore: Replace New Order Button with Export Search Results

## Metadata
adw_id: `5e38f1b0`
prompt: `Remove the 'New Order' button from the Order Management page header and replace it with an 'Export Search Results' button. The export button should export filtered orders to CSV format, respect all active filters, and provide user feedback during export.`

## Chore Description
This chore involves modifying the Order Management page (`app/orders/page.tsx`) to:
1. Remove the existing "New Order" button from the page header
2. Add a new "Export Search Results" button that exports the currently filtered orders to CSV format
3. The export must respect ALL active filters (both Main Filters and Advanced Filters)
4. Provide proper user feedback with loading states and toast notifications

The export functionality will be implemented directly in the `OrderManagementHub` component since that's where all filter states and the `filteredOrders` array reside.

## Relevant Files
Use these files to complete the chore:

- **`app/orders/page.tsx`** - The Order Management page that contains the "New Order" button in the header. This button needs to be removed, and the page structure simplified to just show title/description.

- **`src/components/order-management-hub.tsx`** - The main component containing:
  - All filter states (searchTerm, skuSearchTerm, statusFilter, channelFilter, storeNoFilter, paymentStatusFilter, dateFromFilter, dateToFilter, itemNameFilter, customerNameFilter, emailFilter, phoneFilter, itemStatusFilter, paymentMethodFilter, orderTypeFilter, quickFilter, activeSlaFilter)
  - The `filteredOrders` array (line 990-1238) which applies all filters
  - Button component imports and existing button patterns (line 8)
  - Loader2 spinner already imported (line 19)
  - Toast hook already imported (line 24)
  - formatGMT7DateTime utility already imported (line 4)
  - Download icon already imported (line 19)

- **`src/lib/utils.ts`** - Contains `formatGMT7DateTime` function (line 63) for date formatting. However, this function uses current time instead of the provided date's time. We need to create a proper date-only formatter or use the existing `formatGMT7DateString` (line 54).

- **`src/components/ui/button.tsx`** - Button component with variants for consistent styling

- **`src/hooks/use-toast.ts`** - Toast hook for success notifications (already imported in order-management-hub.tsx)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove New Order Button from Page Header
- Edit `app/orders/page.tsx`
- Remove the Button import and PlusCircle icon import
- Remove the Button component from inside DashboardHeader
- Keep just the DashboardHeader with heading and text props

### 2. Add Export State to OrderManagementHub
- Edit `src/components/order-management-hub.tsx`
- Add a new state variable `isExporting` (useState<boolean>(false)) near other loading states around line 605-607

### 3. Create CSV Export Helper Function
- Add `exportOrdersToCSV` function in `src/components/order-management-hub.tsx`
- Function should:
  - Take `filteredOrders` array as input
  - Convert orders to CSV format with proper escaping
  - CSV columns: Order ID, Order No, Customer Name, Email, Phone, Status, Channel, Store No, Order Date, Total Amount, Payment Status, Payment Method, Order Type, SLA Status, Items Count
  - Escape special characters (commas, quotes, newlines) in data fields
  - Format dates using GMT+7 timezone
  - Format currency amounts with 2 decimal places
  - Include header row
  - Trigger browser download with filename `orders-export-{YYYY-MM-DD-HHmmss}.csv`

### 4. Create Export Handler Function
- Add `handleExportSearchResults` async function
- Function should:
  - Set `isExporting` to true
  - Call `exportOrdersToCSV(filteredOrders)`
  - Show success toast with count of exported orders
  - Set `isExporting` to false
  - Handle errors with try/catch and show error toast

### 5. Add Export Button to UI
- Add the Export Search Results button in the CardHeader section
- Place it in the top-right area near the Refresh button (line 1351-1361)
- Use Download icon from lucide-react (already imported)
- Button should:
  - Be disabled when `filteredOrders.length === 0`
  - Be disabled when `isExporting === true`
  - Show "Exporting..." text with Loader2 spinner when exporting
  - Show "Export Search Results" with Download icon when not exporting
  - Use outline variant to match refresh button style

### 6. Update Imports if Needed
- Verify all required imports are present in order-management-hub.tsx
- Download and Loader2 icons are already imported (line 19)
- toast hook is already imported (line 24)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `pnpm dev` - Start development server and manually test:
  1. Navigate to /orders page
  2. Verify "New Order" button is removed from page header
  3. Verify "Export Search Results" button appears in Order Management Hub
  4. Apply various filters (search term, status, channel, etc.)
  5. Click export button and verify CSV download
  6. Open CSV and verify:
     - Header row is present
     - Data matches filtered orders
     - Dates are formatted correctly
     - Special characters are properly escaped
  7. Verify button is disabled when no orders match filters
  8. Verify loading state shows "Exporting..." with spinner

## Notes
- The `formatGMT7DateTime` function in utils.ts uses current time for the time portion. For the CSV export, we should format the order date properly using the order's actual date value, not the current time.
- CSV escaping must handle: commas (wrap in quotes), quotes (escape with double quotes), newlines (wrap in quotes)
- The filename should use the format `orders-export-2024-01-15-143052.csv` for clear identification
- SLA Status in CSV should show the human-readable status: "Breach", "Near Breach", "On Track", or "N/A"
- Items Count should be the number of items in the order's items array
