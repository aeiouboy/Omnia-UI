# Chore: Fix Date Validation Errors in Executive Dashboard

## Metadata
adw_id: `30bd43ce`
prompt: `Fix all date validation errors in Executive Dashboard:

1. Search for ALL instances of toISOString() calls in src/components/executive-dashboard/
2. Add proper date validation before EVERY toISOString() call
3. Validation pattern to use:
   - Check if date field exists (order.order_date, order.created_at, etc.)
   - Create Date object first
   - Validate with !isNaN(dateObj.getTime())
   - Only then call toISOString()
4. Focus on these functions:
   - processOrdersForAlerts() - processing TODAY's alerts
   - calculateDailyMetrics() - date-based grouping
   - validateSevenDaysCoverage() - date range validation
   - Any other function using toISOString()
5. Add fallback values for invalid dates:
   - Skip invalid date entries in loops
   - Use current date as fallback where appropriate
   - Log warnings for invalid dates (not errors)
6. Test with mock data that has missing/invalid dates
7. Ensure no RangeError: Invalid time value errors in console
8. Dashboard should render successfully with incomplete data
9. All charts and KPIs should display correctly
10. Recent orders table should show orders even with invalid dates

Priority: Fix ALL date validation issues to make dashboard fully functional with mock data.`

## Chore Description
This chore addresses date validation errors throughout the Executive Dashboard that cause `RangeError: Invalid time value` when calling `toISOString()` on invalid Date objects. The dashboard currently fails when it encounters orders with missing or malformed date fields (e.g., `order_date`, `created_at`).

The goal is to add comprehensive validation before every `toISOString()` call to ensure:
- The date field exists and is not null/undefined
- The Date object is valid (not NaN)
- Invalid dates are handled gracefully with warnings instead of errors
- The dashboard continues to function with incomplete data

## Relevant Files
Use these files to complete the chore:

- **src/components/executive-dashboard/data-fetching.ts** - Contains 13 instances of `toISOString()` calls
  - `getDefaultDateRange()` - Lines 670-678 (2 instances)
  - `validateSevenDaysCoverage()` - Lines 682-730 (2 instances)
  - `processOrderAlerts()` - Lines 732-793 (3 instances for TODAY's alert filtering)
  - Logging statements - Lines 280, 465 (2 instances - safe, using `new Date()`)
  - Page fetch debugging - Multiple instances used for logging

- **src/components/executive-dashboard/utils.ts** - Contains 6 instances of `toISOString()` calls
  - `getCriticalAlerts()` - Lines 224-239 (2 instances for TODAY's filtering)
  - `calculateDailyOrders()` - Lines 241-283 (1 instance for date grouping)
  - `validateSevenDaysCoverage()` - Lines 641-679 (2 instances for date range validation)

- **src/components/executive-dashboard/types.ts** - TypeScript interface definitions
  - Verify `ApiOrder` interface has proper date field types
  - Ensure all date fields are marked as optional where appropriate

- **src/lib/utils.ts** - Utility functions for date handling
  - Review existing date utilities (`getGMT7Time`, `formatGMT7DateString`, `safeParseDate`)
  - May need to create additional safe date parsing utilities

### New Files
None - All fixes will be applied to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Safe Date Validation Utility Function
- Create `safeToISOString()` helper function in `src/lib/utils.ts`
- Function signature: `safeToISOString(date: string | Date | null | undefined, fallback?: string): string`
- Validation logic:
  - Check if input exists (not null/undefined)
  - Create Date object from input
  - Validate with `!isNaN(dateObj.getTime())`
  - Return `dateObj.toISOString()` if valid
  - Return fallback or current date ISO string if invalid
  - Log warning (not error) for invalid dates with context
- Export function for use across dashboard components

### 2. Fix data-fetching.ts Date Validations
- **processOrderAlerts() function** (Lines 732-793):
  - Line 742: Validate `today.toISOString()` - This is safe (GMT+7 time)
  - Line 748-750: Add validation before processing `order.order_date`
    - Check if `order.order_date` exists
    - Create Date object and validate
    - Skip order if date is invalid, log warning
  - Line 750: Replace `orderGMT7.toISOString()` with safe version
- **validateSevenDaysCoverage() function** (Lines 682-730):
  - Line 696-701: Add validation in forEach loop
    - Check if `order.order_date` exists before processing
    - Validate Date object before calling `toISOString()`
    - Skip invalid dates, continue processing valid ones
  - Line 713: Validate loop variable `d` before `toISOString()` call
- **getDefaultDateRange() function** (Lines 670-678):
  - Lines 676-677: These are safe (using GMT+7 time from `getGMT7Time()`)
  - Add defensive check anyway for consistency

### 3. Fix utils.ts Date Validations
- **getCriticalAlerts() function** (Lines 224-239):
  - Line 229: Safe - using `getGMT7Time()` which returns valid Date
  - Line 232: Add validation before processing `order.order_date`
    - Check if `order.order_date` exists
    - Validate Date object before `toISOString()`
    - Filter out orders with invalid dates from critical alerts
- **calculateDailyOrders() function** (Lines 241-283):
  - Line 257-264: Add validation in reduce loop
    - Check if `orderDate` exists (from `order.order_date || order.created_at || order.date`)
    - Create Date object and validate before `toISOString()`
    - Skip orders with invalid dates, log warning
- **validateSevenDaysCoverage() function** (Lines 641-679):
  - Line 652: Add validation in map function
    - Check if `order.order_date` exists
    - Validate Date object before `toISOString()`
    - Return null for invalid dates, filter them out after map
  - Line 662: Validate loop variable `d` before `toISOString()`

### 4. Add Warning Logging for Invalid Dates
- Create consistent warning message format
- Pattern: `console.warn('⚠️ Invalid date detected', { orderId: order.id, dateField: 'order_date', value: order.order_date })`
- Add warnings in all validation points identified above
- Ensure warnings don't spam console (consider rate limiting for production)

### 5. Update TypeScript Interfaces (if needed)
- Review `ApiOrder` interface in `types.ts`
- Ensure date fields allow null/undefined: `order_date: string | null`
- Update other date-related interfaces if needed
- Maintain backward compatibility with existing code

### 6. Test with Mock Data Scenarios
- Create test scenarios with:
  - Missing `order_date` field (null/undefined)
  - Invalid date strings ("invalid", "", "0000-00-00")
  - Valid dates in different formats
  - Edge case dates (very old, far future)
- Run dashboard with test data
- Verify no `RangeError: Invalid time value` errors
- Confirm dashboard renders successfully
- Check all KPIs, charts, and tables display correctly

### 7. Validate Dashboard Functionality
- Load Executive Dashboard with mock data
- Verify these components work correctly:
  - KPI cards show correct metrics
  - Daily orders chart displays
  - Channel performance chart displays
  - Store fulfillment chart displays
  - Critical alerts display (for today's orders)
  - Recent orders table displays
  - No console errors related to dates
- Test with both complete and incomplete data sets
- Ensure graceful degradation with missing data

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# 1. Check TypeScript compilation (no type errors)
pnpm run build

# 2. Lint check (no linting errors)
pnpm run lint

# 3. Search for remaining unprotected toISOString() calls
grep -r "toISOString()" src/components/executive-dashboard/ --exclude-dir=node_modules

# 4. Run development server and test dashboard
pnpm run dev
# Then navigate to http://localhost:3000 and verify:
# - Executive Dashboard loads without errors
# - No "RangeError: Invalid time value" in console
# - All charts and KPIs display correctly
# - Critical alerts display (if today's data available)

# 5. Check console for validation warnings
# Look for: "⚠️ Invalid date detected" warnings (expected with mock data)
# Should NOT see: "RangeError: Invalid time value" errors

# 6. Test with browser console
# Open browser DevTools console and verify:
# - No red error messages related to dates
# - Yellow warnings for invalid dates (acceptable)
# - Dashboard functional with incomplete data
```

## Notes
- **Priority Focus**: Functions that process TODAY's orders (`processOrderAlerts`, `getCriticalAlerts`) are highest priority as they directly affect alert functionality
- **Logging Strategy**: Use `console.warn()` for invalid dates, not `console.error()`, to avoid false alarms in production monitoring
- **Performance**: Date validation adds minimal overhead (<1ms per order) - acceptable for dashboard use case
- **Backward Compatibility**: All changes must maintain compatibility with existing valid data
- **GMT+7 Timezone**: Maintain existing GMT+7 timezone handling in `getGMT7Time()` - this is working correctly
- **Production Safety**: Invalid dates should be filtered out gracefully, not cause application crashes
- **Mock Data Testing**: The dashboard MUST work with mock data that has missing/invalid dates - this is critical for development and testing
