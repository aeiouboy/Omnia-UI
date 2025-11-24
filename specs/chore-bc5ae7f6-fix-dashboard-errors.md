# Chore: Fix Executive Dashboard Critical Errors

## Metadata
adw_id: `bc5ae7f6`
prompt: `Fix Executive Dashboard critical errors:

1. Investigate all errors on the Executive Dashboard (homepage at /)
2. Check src/components/executive-dashboard.tsx for runtime errors
3. Fix data fetching issues:
   - API calls failing and not falling back to mock data
   - Handle authentication failures gracefully
   - Use mock data when external API is unavailable
4. Fix any React rendering errors:
   - Undefined data causing crashes
   - Missing null checks
   - Async data loading issues
5. Fix dashboard components:
   - KPI cards should show data from mock when API fails
   - Charts should render with fallback data
   - Recent orders table should work with mock data
   - SLA alerts should calculate from available data
6. Ensure proper error boundaries:
   - No white screens of death
   - Show loading states properly
   - Display user-friendly errors
7. Import and use generateRealisticApiData() for fallback
8. Test that dashboard loads without console errors
9. Verify all sections render correctly:
   - KPI summary cards
   - Channel performance charts
   - SLA breach indicators
   - Recent orders
10. Dashboard should work seamlessly even when external API is down

Priority: Make the Executive Dashboard fully functional with mock data fallback.`

## Chore Description

The Executive Dashboard (homepage at `/`) is experiencing critical runtime errors that prevent the page from loading correctly. The primary issues are:

1. **Data Fetching Failures**: The dashboard is not properly falling back to mock data when the external API is unavailable or returns errors
2. **API Authentication Issues**: API calls are failing and not handling authentication failures gracefully
3. **React Rendering Errors**: Components are crashing due to undefined data, missing null checks, and async data loading issues
4. **Missing Error Boundaries**: The dashboard shows white screens when errors occur instead of graceful degradation
5. **Component State Issues**: KPI cards, charts, alerts, and tables are not rendering with fallback data

The solution requires implementing a robust fallback mechanism that uses the existing `generateRealisticApiData()` function from the codebase and ensuring all dashboard components handle loading and error states properly.

## Relevant Files

### Core Files to Modify

- **`src/components/executive-dashboard.tsx`** (Lines 474-1500+) - Main dashboard component with data fetching logic
  - Contains `fetchOrdersFromApi()` function that needs better error handling
  - Contains `loadData()` function that orchestrates all data fetching
  - Has complex fallback logic that needs improvement
  - Line ~596 references `generateRealisticApiData()` but may not be properly implemented

- **`src/lib/mock-data.ts`** - Mock data service providing realistic fallback data
  - Contains `mockApiOrders`, `mockExecutiveKPIs`, `mockOrderMetrics`, `mockPerformanceMetrics`
  - Has `getMockOrders()` helper for filtered mock data
  - Provides all necessary mock data structures matching real API responses

- **`app/api/orders/external/route.ts`** - External API proxy endpoint
  - Needs to ensure proper error responses with fallback data
  - Should return consistent error structures for frontend handling

- **`app/api/orders/route.ts`** (Lines 151-449) - Internal orders API endpoint
  - Already has mock data fallback logic (Lines 182-229)
  - Good reference for implementing proper fallback patterns
  - Uses `getMockOrders()` helper correctly

### Reference Files

- **`CLAUDE.md`** (Lines 71-77) - Documents that `generateRealisticApiData()` is at line ~686 in executive-dashboard.tsx
  - Specifies Tops store names for alerts
  - Contains critical architecture and SLA logic standards

- **`src/lib/utils.ts`** - Utility functions for date/time handling (GMT+7)
  - Contains `formatGMT7TimeString()`, `getGMT7Time()`, `safeParseDate()`
  - Used throughout dashboard for timezone consistency

- **`src/lib/sla-utils.ts`** - SLA calculation utilities
  - Contains `calculateSLAStatus()`, `filterSLABreach()`, `filterApproachingSLA()`
  - Critical for alerts and breach detection

### New Files

None - All fixes will be applied to existing files.

## Step by Step Tasks

### 1. Analyze Current Error State
- Run the development server and access the dashboard at `http://localhost:3000`
- Open browser console and document all errors
- Check network tab for failed API calls
- Identify which components are failing to render
- Document the error stack traces and patterns

### 2. Implement generateRealisticApiData() Function
- Locate or create `generateRealisticApiData()` function in `src/components/executive-dashboard.tsx`
- Ensure it returns properly structured `ApiOrder[]` data
- Use `mockApiOrders` from `src/lib/mock-data.ts` as the data source
- Add proper TypeScript types matching `ApiOrder` interface
- Include all required fields: `id`, `order_no`, `customer`, `items`, `status`, `channel`, `total`, `sla_info`, `store`, etc.
- Ensure Tops store names are used (as per CLAUDE.md requirements)

### 3. Fix fetchOrdersFromApi() Error Handling
- Locate `fetchOrdersFromApi()` function (starts at line 474)
- Wrap all API calls in proper try-catch blocks
- Add fallback to `generateRealisticApiData()` when:
  - API request fails (network error, timeout, etc.)
  - API returns error status (401, 500, etc.)
  - API returns empty data
  - API returns `mockData: true` flag
- Remove or fix the "TEMPORARY DEBUG" bypass logic (lines 512-535)
- Ensure cache validation works with fallback data
- Add console logging for debugging (with proper prefixes: ✅, ⚠️, 🔄, etc.)

### 4. Fix loadData() Function Error Handling
- Locate `loadData()` function (starts at line 1074)
- Ensure it handles errors from all data fetching functions:
  - `fetchOrdersProcessing()`
  - `fetchSlaBreaches()`
  - `fetchRevenueToday()`
  - `fetchChannelPerformance()`
- Add try-catch blocks around each parallel data fetch
- Set proper error states when fetches fail
- Ensure loading states are cleared even on error
- Fallback to mock data for individual sections if they fail

### 5. Add Null Safety to Component Rendering
- Review all dashboard components for potential null/undefined access
- Add null checks before accessing nested properties
- Use optional chaining (`?.`) and nullish coalescing (`??`) operators
- Ensure default values for:
  - KPI metrics (use 0 or meaningful defaults)
  - Chart data (use empty arrays)
  - Recent orders list (use empty array)
  - Alert data (use empty array)
- Add type guards where necessary

### 6. Fix KPI Cards Data Binding
- Locate KPI card rendering section
- Ensure each KPI card has:
  - Proper loading state display (skeleton or spinner)
  - Error state handling (show "--" or "N/A")
  - Fallback values from mock data
  - Null-safe data access
- Verify KPI calculations handle edge cases (division by zero, undefined values)
- Test with mock data to ensure proper display

### 7. Fix Charts Data Binding
- Locate chart components (Channel Performance, SLA Trends, Store Fulfillment)
- Ensure chart data transformations handle:
  - Empty arrays
  - Missing data properties
  - Undefined values
  - Invalid date formats
- Add fallback to mock analytics data from `src/lib/mock-data.ts`
- Ensure Recharts components receive properly formatted data
- Add loading states for charts
- Test charts with mock data

### 8. Fix Critical Alerts Banner
- Locate `CriticalAlertsBanner` component usage
- Ensure alerts calculation handles:
  - Empty orders array
  - Missing SLA info
  - Invalid timestamp formats
- **CRITICAL**: Never use mock data for alerts (per CLAUDE.md rules)
- Return empty alerts array if using mock data
- Add proper error handling for alert generation
- Test alert filtering logic with edge cases

### 9. Fix Recent Orders Table
- Locate recent orders table rendering
- Ensure table handles:
  - Empty orders array (show "No orders found")
  - Missing customer data
  - Invalid SLA info
  - Null/undefined timestamps
- Add proper loading skeleton
- Ensure sorting and filtering work with mock data
- Test pagination with mock data

### 10. Add Error Boundaries
- Consider wrapping major dashboard sections in error boundaries
- For now, ensure each component handles its own errors gracefully
- Add user-friendly error messages
- Ensure no component crash propagates to entire page
- Show partial dashboard even if some sections fail

### 11. Improve Loading States
- Ensure loading states are set at the start of data fetching
- Clear loading states even when errors occur
- Use skeleton components consistently
- Show progressive loading (load critical data first)
- Avoid infinite loading spinners

### 12. Test Dashboard with Mock Data
- Set environment variable `USE_MOCK_DATA=true` or remove Supabase credentials
- Restart development server
- Navigate to homepage (`/`)
- Verify all sections render:
  - KPI summary cards show data
  - Channel performance chart displays
  - Store fulfillment chart displays
  - SLA breach indicators show (if applicable)
  - Recent orders table renders
  - Critical alerts banner shows (should be empty for mock data)
- Check browser console for any errors
- Test responsive design on mobile viewport

### 13. Test Dashboard with API Failures
- Simulate API failures by:
  - Using invalid API credentials
  - Blocking `/api/orders/external` endpoint
  - Introducing artificial errors in API route
- Verify dashboard gracefully falls back to mock data
- Ensure no white screens or crashes
- Verify error messages are user-friendly

### 14. Validate GMT+7 Timezone Handling
- Ensure all timestamps display in GMT+7 (Asia/Bangkok)
- Verify date range filtering works correctly
- Check that "today" calculations use GMT+7
- Test SLA elapsed time calculations with current time

### 15. Final Integration Testing
- Clear browser cache and localStorage
- Restart development server
- Test complete dashboard flow:
  - Initial page load
  - Manual refresh (pull-to-refresh)
  - Real-time updates (if enabled)
  - Tab switching
  - Filter interactions
- Document any remaining issues
- Verify no console errors or warnings

## Validation Commands

Execute these commands to validate the chore is complete:

1. **Build Test** - Ensure no TypeScript errors:
   ```bash
   pnpm run build
   ```
   Expected: Build completes successfully with no errors

2. **Type Check** - Verify TypeScript types:
   ```bash
   pnpm run type-check
   ```
   Expected: No type errors in executive-dashboard.tsx

3. **Lint Check** - Ensure code quality:
   ```bash
   pnpm run lint
   ```
   Expected: No linting errors

4. **Development Server** - Test dashboard rendering:
   ```bash
   pnpm run dev
   ```
   Then open `http://localhost:3000` and verify:
   - Page loads without errors
   - All KPI cards display data
   - All charts render
   - Recent orders table shows data
   - No console errors

5. **Mock Data Test** - Test with mock data fallback:
   ```bash
   # Set environment variable to force mock data
   export USE_MOCK_DATA=true
   pnpm run dev
   ```
   Then verify dashboard works with mock data

6. **Console Error Check** - Manual verification:
   - Open browser DevTools console
   - Reload dashboard page
   - Verify no red error messages
   - Check Network tab for failed requests
   - Verify proper fallback to mock data on API failures

## Notes

### Critical Requirements from CLAUDE.md

1. **Tops Store Names**: Store Fulfillment Performance MUST display only Tops store branches:
   - Tops Central Plaza ลาดพร้าว
   - Tops Central World
   - Tops สุขุมวิท 39
   - Tops ทองหล่อ
   - Tops สีลม คอมเพล็กซ์
   - Tops เอกมัย
   - Tops พร้อมพงษ์
   - Tops จตุจักร

2. **Mock Data Alert Rule**: ABSOLUTELY FORBIDDEN to use mock data for:
   - Critical Alerts (SLA breaches, approaching deadlines)
   - Security alerts or warnings
   - Financial transactions or revenue alerts
   - System status alerts
   - Any alert that could trigger business decisions
   - **Rule**: Always check API status first - if mock data detected, return EMPTY alerts instead

3. **No Filters on Executive Dashboard**: The Executive Dashboard must NOT have any filters (no date range, no search, no status filters). Always shows full 7-day data for complete overview.

4. **SLA Calculations**: Must be consistent across all components:
   ```typescript
   // API returns values in seconds, despite field names suggesting minutes
   const targetSeconds = order.sla_info.target_minutes || 300  // Default 5 minutes
   const elapsedSeconds = order.sla_info.elapsed_minutes || 0

   // Breach condition
   const isBreach = elapsedSeconds > targetSeconds || order.sla_info.status === "BREACH"

   // Near-breach condition (20% threshold)
   const remainingSeconds = targetSeconds - elapsedSeconds
   const criticalThreshold = targetSeconds * 0.2
   const isNearBreach = remainingSeconds <= criticalThreshold && remainingSeconds > 0
   ```

5. **GMT+7 Timezone**: All display times must use `formatGMT7TimeString()` from `lib/utils.ts`

### Mock Data Strategy

The dashboard should use a three-tier fallback approach:

1. **Primary**: External API via `/api/orders/external`
2. **Secondary**: Internal API via `/api/orders` (has built-in mock fallback)
3. **Tertiary**: Direct use of `generateRealisticApiData()` function

### Performance Considerations

- Maximum 50,000 orders (10 pages × 5000 per page)
- 30-second timeout for API requests
- Memory limit: 512MB
- Use field filtering to reduce memory footprint
- Implement deduplication for order IDs

### Testing Checklist

- [ ] Dashboard loads without errors in console
- [ ] All KPI cards display data (real or mock)
- [ ] Channel performance chart renders
- [ ] Store fulfillment chart renders with Tops stores only
- [ ] SLA breach indicators calculate correctly
- [ ] Recent orders table displays data
- [ ] Critical alerts work (empty for mock data)
- [ ] Loading states appear and clear properly
- [ ] Error messages are user-friendly
- [ ] Mock data fallback works seamlessly
- [ ] No white screens of death
- [ ] Responsive design works on mobile
- [ ] GMT+7 timezone applied correctly
- [ ] Build completes without errors
- [ ] No TypeScript type errors
- [ ] No ESLint warnings
