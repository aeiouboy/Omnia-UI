# Chore: Add Missing FMS Filters to Order Management Hub

## Metadata
adw_id: `17baa611`
prompt: `Add missing FMS filters to Order Management Hub:

  1. Add Delivery Time Slot filter in Advanced Filters section:
     - Filter type: Date picker for slot date
     - Filter by delivery slot date (from deliveryTimeSlot.date field)
     - Options: Date range picker or specific date selector
     - Filter logic: Match orders where deliveryTimeSlot.date falls within selected range

  2. Add Delivered Time filter in Advanced Filters section:
     - Filter type: Date range picker
     - Filter by deliveredTime field
     - Only applicable for orders with status DELIVERED
     - Filter logic: Match orders where deliveredTime falls within selected date range

  3. Verify Settlement Type filter is working (already exists):
     - Options: All Settlement Types, Auto Settle, Manual Settle
     - Filter logic: Match orders by settlementType field

  Implementation notes:
  - Add filter state variables: deliverySlotDateFilter, deliveredTimeFromFilter, deliveredTimeToFilter
  - Add filter UI components in Advanced Filters section (around line 1340-1350)
  - Add filter logic in filteredOrders useMemo
  - Add to generateActiveFilters for filter badge display
  - Add to removeFilter and handleResetAllFilters functions
  - Use existing date picker components from the Date Type filter section as reference`

## Chore Description
This chore adds three missing FMS (Fulfillment Management System) filters to the Order Management Hub component to improve order filtering capabilities. The filters will allow users to:

1. **Delivery Time Slot Date Range Filter**: Filter orders based on their scheduled delivery time slot dates (deliveryTimeSlot.date field)
2. **Delivered Time Date Range Filter**: Filter orders based on when they were actually delivered (deliveredTime field)
3. **Verify Settlement Type Filter**: Confirm that the existing Settlement Type filter is functioning correctly

These filters will be added to the Advanced Filters collapsible section, following the existing filter patterns and architecture used in the component.

## Relevant Files
Use these files to complete the chore:

- **`src/components/order-management-hub.tsx`** (line 1-2500+) - Main component file where all filters are implemented
  - Lines 570-590: Filter state variables section (add new state variables here)
  - Lines 1200-1350: Filter logic in `filteredOrders` useMemo (add new filter logic here)
  - Lines 890-935: `removeFilter` function (add new filter removal cases here)
  - Lines 982-1008: `handleResetAllFilters` function (add new filter resets here)
  - Lines 940-980: `generateActiveFilters` useMemo (add new filter badges here)
  - Lines 2050-2225: Advanced Filters UI section (add new date picker components here)
  - Lines 1700-1730: Table columns displaying FMS data (reference for field structure)

- **`src/lib/utils.ts`** - Utility functions for date/time formatting
  - Contains `formatGMT7DateTime`, `formatGMT7TimeString`, `getGMT7Time` functions
  - Use for consistent timezone handling (GMT+7 Bangkok time)

- **`src/components/ui/calendar.tsx`** - Calendar component from Radix UI (already imported)
  - Used for date picker implementation

- **`src/components/ui/popover.tsx`** - Popover component from Radix UI (already imported)
  - Used for date picker popover implementation

- **`src/types/delivery.ts`** - Type definitions for delivery-related fields
  - Reference for DeliveryTimeSlot interface structure

### New Files
No new files need to be created. All changes will be made to the existing `order-management-hub.tsx` component.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Filter State Variables
- Add three new state variables in the filter state section (around line 588, after `dateTypeFilter`):
  - `deliverySlotDateFromFilter` - Date | undefined (for delivery slot start date)
  - `deliverySlotDateToFilter` - Date | undefined (for delivery slot end date)
  - `deliveredTimeFromFilter` - Date | undefined (for delivered time start date)
  - `deliveredTimeToFilter` - Date | undefined (for delivered time end date)
- Follow the existing pattern used by `dateFromFilter` and `dateToFilter`

### 2. Add Filter Logic to filteredOrders useMemo
- Locate the `filteredOrders` useMemo function (around line 1100-1400)
- Add Delivery Time Slot Date Range filter logic after the Settlement Type filter (around line 1327):
  - Check if `deliverySlotDateFromFilter` or `deliverySlotDateToFilter` are set
  - Extract `order.deliveryTimeSlot?.date` field value
  - If date value exists, parse it and compare with filter range
  - Use `getGMT7Time()` for date parsing to maintain timezone consistency
  - Filter out orders that fall outside the selected date range
  - Skip orders without deliveryTimeSlot data when filters are active
- Add Delivered Time Date Range filter logic immediately after:
  - Check if `deliveredTimeFromFilter` or `deliveredTimeToFilter` are set
  - Extract `order.deliveredTime` field value
  - If date value exists, parse it and compare with filter range
  - Use `getGMT7Time()` for date parsing to maintain timezone consistency
  - Set end date to 23:59:59.999 to include entire day (same as existing dateToFilter logic)
  - Filter out orders that fall outside the selected date range
  - Skip orders without deliveredTime data when filters are active
- Update the useMemo dependency array to include all four new filter state variables

### 3. Add Filter Badges to generateActiveFilters
- Locate the `generateActiveFilters` useMemo function (around line 940-980)
- Add filter badge generation for Delivery Slot Date Range (after Settlement Type filter, around line 961):
  - If `deliverySlotDateFromFilter` is set, add badge: `Delivery Slot From: ${format(deliverySlotDateFromFilter, "dd/MM/yyyy")}`
  - If `deliverySlotDateToFilter` is set, add badge: `Delivery Slot To: ${format(deliverySlotDateToFilter, "dd/MM/yyyy")}`
- Add filter badge generation for Delivered Time Range:
  - If `deliveredTimeFromFilter` is set, add badge: `Delivered From: ${format(deliveredTimeFromFilter, "dd/MM/yyyy")}`
  - If `deliveredTimeToFilter` is set, add badge: `Delivered To: ${format(deliveredTimeToFilter, "dd/MM/yyyy")}`
- Update the useMemo dependency array to include all four new filter state variables

### 4. Add Filter Removal Cases to removeFilter Function
- Locate the `removeFilter` function (around line 891-935)
- Add removal cases for new filters after the Settlement Type case (around line 928):
  - Add case for "Delivery Slot From:" → call `setDeliverySlotDateFromFilter(undefined)`
  - Add case for "Delivery Slot To:" → call `setDeliverySlotDateToFilter(undefined)`
  - Add case for "Delivered From:" → call `setDeliveredTimeFromFilter(undefined)`
  - Add case for "Delivered To:" → call `setDeliveredTimeToFilter(undefined)`
- Follow the existing pattern used for "From:" and "To:" filters

### 5. Add Filter Resets to handleResetAllFilters Function
- Locate the `handleResetAllFilters` function (around line 983-1008)
- Add reset statements for new filters after the FMS extended filters section (around line 1006):
  - `setDeliverySlotDateFromFilter(undefined)`
  - `setDeliverySlotDateToFilter(undefined)`
  - `setDeliveredTimeFromFilter(undefined)`
  - `setDeliveredTimeToFilter(undefined)`

### 6. Add Filter UI Components to Advanced Filters Section
- Locate the Advanced Filters collapsible section (around line 2058-2225)
- Add a new row in the grid layout after the Settlement Type filter (around line 2221):
  - Create a new `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">` container
  - Add Delivery Slot Date From picker:
    - Label: "Delivery Slot Date From"
    - Use Popover + Calendar components (copy pattern from dateFromFilter around line 1992-2013)
    - Button shows: `{deliverySlotDateFromFilter ? format(deliverySlotDateFromFilter, "dd/MM/yyyy") : "Select date"}`
    - Calendar mode: "single", selected: deliverySlotDateFromFilter, onSelect: setDeliverySlotDateFromFilter
  - Add Delivery Slot Date To picker:
    - Label: "Delivery Slot Date To"
    - Same pattern as Date From
    - Use deliverySlotDateToFilter state
  - Add Delivered Time From picker:
    - Label: "Delivered Time From"
    - Same pattern as Date From
    - Use deliveredTimeFromFilter state
  - Add Delivered Time To picker:
    - Label: "Delivered Time To"
    - Same pattern as Date From
    - Use deliveredTimeToFilter state
- Ensure consistent styling with h-11 height and proper spacing

### 7. Verify Settlement Type Filter Implementation
- Review Settlement Type filter state variable (line 587): `settlementTypeFilter`
- Verify filter logic in filteredOrders (lines 1322-1326):
  - Checks if filter is set and not "all-settlement-type"
  - Compares `order.settlementType` with filter value
  - Returns false if no match (filters out order)
- Verify filter UI (lines 2207-2220):
  - Label: "Settlement Type"
  - Options: "All Settlement Types", "Auto Settle", "Manual Settle"
  - Properly bound to `settlementTypeFilter` state
- Verify filter badge generation (line 960): Shows "Settlement Type: {value}"
- Verify filter removal (line 926-927): Resets to "all-settlement-type"
- Verify filter reset (line 1005): Included in handleResetAllFilters
- Document any issues found in console or create bug report if not working

### 8. Test Filter Functionality
- Test each new filter individually:
  - Select delivery slot date range and verify orders are filtered correctly
  - Select delivered time date range and verify only DELIVERED orders in range are shown
  - Test Settlement Type filter with all three options
- Test filter combinations:
  - Combine delivery slot date with other filters (status, channel, etc.)
  - Combine delivered time date with delivery slot date
  - Verify filter badges display correctly for all active filters
- Test filter removal:
  - Click X on each filter badge to verify it removes correctly
  - Use "Reset All Filters" button to verify all new filters clear
- Test edge cases:
  - Orders without deliveryTimeSlot data (should be filtered out when slot filter active)
  - Orders without deliveredTime data (should be filtered out when delivered filter active)
  - Date range spanning multiple months
  - Same date for From and To (should include all orders on that date)

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server and test filters in the UI
  - Navigate to Order Management Hub
  - Open Advanced Filters section
  - Test all three filters (Delivery Slot, Delivered Time, Settlement Type)
  - Verify filter badges appear when filters are active
  - Verify filter removal works correctly
  - Verify "Reset All Filters" clears all new filters

- `npm run build` - Build for production to check for TypeScript errors
  - Ensure no type errors related to new filter state variables
  - Ensure no type errors related to date handling functions
  - Verify build completes successfully without warnings

- **Manual Testing Checklist**:
  1. ✅ New filter state variables added without TypeScript errors
  2. ✅ Filter logic correctly filters orders based on deliveryTimeSlot.date
  3. ✅ Filter logic correctly filters orders based on deliveredTime
  4. ✅ Filter badges display correctly with formatted dates
  5. ✅ Individual filter badges can be removed by clicking X
  6. ✅ "Reset All Filters" button clears all new filters
  7. ✅ Date pickers render correctly with calendar UI
  8. ✅ Timezone handling uses GMT+7 consistently
  9. ✅ Settlement Type filter works correctly with all options
  10. ✅ No console errors or warnings

## Notes

### Architecture Patterns to Follow
- **Filter State Pattern**: All filters use useState hooks with descriptive names ending in "Filter"
- **Date Handling**: Always use `getGMT7Time()` from `lib/utils.ts` for timezone consistency
- **Filter Logic Pattern**: Check if filter is set → extract field value → compare → return false if no match
- **UI Pattern**: Use Popover + Calendar components from Radix UI for date pickers
- **Styling**: All filter inputs use `h-11` height class for consistency
- **Filter Removal**: Use `filter.startsWith("Label:")` pattern in removeFilter function

### FMS Extended Fields Context
The FMS (Fulfillment Management System) extended fields were added to support additional order fulfillment scenarios:
- `deliveryTimeSlot`: Contains date, from, and to time for scheduled delivery windows
- `deliveredTime`: Actual timestamp when order was delivered (ISO 8601 format)
- `settlementType`: Payment settlement method (Auto Settle or Manual Settle)
- These fields are optional and may not be present on all orders

### Date Format Standards
- **Display Format**: dd/MM/yyyy (Thai standard, e.g., "25/12/2024")
- **Storage Format**: ISO 8601 string (e.g., "2024-12-25T14:30:00+07:00")
- **Timezone**: GMT+7 (Asia/Bangkok) for all date operations
- **Date Range Logic**: "To" date includes entire day (23:59:59.999)

### Filter Dependencies
The filteredOrders useMemo has many dependencies. When adding new filters:
1. Add the filter logic inside the useMemo callback
2. Update the dependency array at the end of useMemo
3. Failing to add dependencies will cause stale filter behavior

### Existing Date Filter System
The component already has a sophisticated date filter system with `dateTypeFilter` that switches between:
- Order Date (order_date field)
- Payment Date (paymentDate field)
- Delivery Date (deliveryDate field)
- Shipping Slot (deliveryTimeSlot.date field)

The new filters are ADDITIONAL to this system and allow users to filter on multiple date fields simultaneously.
