# Chore: Fix Dashboard Alerts and Analytics Display Issues

## Metadata
adw_id: `aafce869`
prompt: `Fix two dashboard issues: 1) Order Alerts showing 'No alerts at this time' and '0 Active Alerts' - check if this is a data issue or code issue, verify the SLA breach detection is working correctly, and ensure alerts display when there are actual breaches. 2) Analytics tab issues - 'Top Products by Revenue' shows 'Unknown Product' with ฿0 revenue, and 'Revenue by Food Category' appears empty. Check the data fetching logic in the Analytics tab, verify product and category data is being properly aggregated from orders, fix any issues with revenue calculations, and ensure realistic mock data is displayed when API data is unavailable. Focus on making the Analytics tab display meaningful data.`

## Chore Description

This chore addresses two critical issues in the Executive Dashboard:

**Issue 1: Order Alerts Not Displaying**
- The Order Alerts section shows "No alerts at this time" and "0 Active Alerts"
- Despite the recent fix for 7-day alert window (commit 4e178cf), alerts are still not displaying
- Need to verify:
  - SLA breach detection logic is working correctly
  - Alert data is being properly passed from data fetching to UI component
  - Mock data detection is not blocking real alerts
  - Data pipeline integrity from API → processing → display

**Issue 2: Analytics Tab Empty Data**
- "Top Products by Revenue" shows "Unknown Product" with ฿0 revenue
- "Revenue by Food Category" appears completely empty
- Need to verify:
  - Product and category data exists in API orders
  - Data aggregation functions (`calculateTopProducts`, `calculateRevenueByCategory`) are working correctly
  - Order items structure matches expected format
  - Mock data fallback provides realistic data when API is unavailable

## Root Cause Analysis

### Alert System Issues
Based on code review:
1. **Data Pipeline**: `fetchOrdersWithCache` → `processOrderAlerts` → `AlertsSection`
2. **SLA Detection**: Located in `src/lib/sla-utils.ts` - filters SUBMITTED/PROCESSING orders only
3. **Alert Processing**: `processOrderAlerts` in `data-fetching.ts` - maps filtered orders to OrderAlert format
4. **Mock Data Protection**: CLAUDE.md states alerts should NEVER use mock data - return empty instead
5. **Possible Issues**:
   - API may be returning orders without SLA breaches in current 7-day window
   - Orders may not have status SUBMITTED/PROCESSING (filtered out by SLA detection)
   - Mock data flag may be incorrectly set, triggering empty alert protection
   - Data completeness validation may be blocking alert processing

### Analytics Tab Issues
Based on code review:
1. **Data Functions**: `calculateTopProducts` and `calculateRevenueByCategory` in `utils.ts`
2. **Dependencies**: Both rely on `order.items` array structure
3. **Product Data**: Expects `product_name`, `product_sku`, `quantity`, `unit_price`, `total_price`
4. **Category Data**: Expects `item.product_details?.category` or `item.category`
5. **Possible Issues**:
   - API orders may not include `items` array
   - Items array may be empty or have different structure
   - Product names defaulting to "Unknown Product"
   - Categories missing or incorrectly structured
   - Mock data not providing realistic product/category information

## Relevant Files
Use these files to complete the chore:

### Data Fetching & Processing
- **`src/components/executive-dashboard/data-fetching.ts`** - Core data fetching logic, `processOrderAlerts` function that maps orders to alerts, handles caching and pagination
- **`src/lib/sla-utils.ts`** - SLA breach detection logic, `filterSLABreach` and `filterApproachingSLA` functions, status filtering
- **`src/components/executive-dashboard/utils.ts`** - Contains `calculateTopProducts` and `calculateRevenueByCategory` functions, product/category aggregation logic

### UI Components
- **`src/components/executive-dashboard/alerts-section.tsx`** - Alert display component, shows "No alerts at this time" when empty
- **`src/components/executive-dashboard/analytics-tab.tsx`** - Analytics tab UI, displays product and category charts

### Hooks & State Management
- **`src/components/executive-dashboard/hooks.ts`** - `useDashboardData` hook that processes dashboard data, calls calculation functions, manages state

### API & Mock Data
- **`app/api/orders/external/route.ts`** - Proxy API endpoint, handles mock data fallback, sets `mockData: true` flag
- **`src/lib/mock-data.ts`** - Mock data generator, provides fallback data when API unavailable

### Type Definitions
- **`src/components/executive-dashboard/types.ts`** - TypeScript interfaces for ApiOrder, OrderAlert, ApiOrderItem structures

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Investigate Order Alerts Data Pipeline
- Add comprehensive logging to trace alert data flow from API to UI
- Check if API is returning orders with SLA breaches
- Verify `processOrderAlerts` is being called with valid orders
- Log the output of `filterSLABreach` and `filterApproachingSLA` functions
- Check if mock data flag is incorrectly set
- Verify orders have status SUBMITTED or PROCESSING (required for SLA detection)
- Inspect actual order data structure from API response

### 2. Debug SLA Breach Detection
- Review `calculateSLAStatus` in `sla-utils.ts` to ensure logic is correct
- Verify the 20% threshold for approaching SLA is working
- Check if `target_minutes` and `elapsed_minutes` fields exist in order.sla_info
- Validate that elapsed time is actually exceeding target time for breaches
- Test with sample orders to confirm breach detection works

### 3. Fix Alert Display Issues
- If orders have no real SLA breaches, add test logging to confirm this
- If mock data protection is blocking alerts, review the detection logic
- If data is missing, trace back to API response structure
- Ensure `orderAlerts` and `approachingSla` arrays are properly populated
- Fix any type mismatches between ApiOrder and OrderAlert interfaces

### 4. Investigate Analytics Tab Data Issues
- Add logging to `calculateTopProducts` to see input orders structure
- Check if `order.items` array exists and is populated
- Log the structure of actual items in orders
- Verify product_name, product_sku, quantity, unit_price fields exist
- Check if `calculateRevenueByCategory` receives orders with category data
- Log intermediate aggregation results

### 5. Fix Product Data Aggregation
- If `order.items` is missing or empty, check API response structure
- If product names are missing, update field mapping (check for alternatives)
- Ensure quantity and price calculations handle missing/null values
- Fix any revenue calculation issues (ensure unit_price * quantity logic)
- Add fallback values for missing product names (but not "Unknown Product")

### 6. Fix Category Data Aggregation
- Check for alternative category field names in items structure
- Update path to category data if `product_details.category` doesn't exist
- Ensure categories are properly grouped and summed
- Add meaningful category fallback (not "Other" for all items)
- Verify returned format matches AnalyticsTab component expectations

### 7. Enhance Mock Data for Analytics
- Update `getMockOrders` in `mock-data.ts` to include realistic product items
- Ensure mock orders have `items` array with complete product data
- Include product_name, product_sku, quantity, unit_price, total_price
- Add realistic product categories (Food, Beverages, Household, etc.)
- Verify mock data produces non-empty analytics charts

### 8. Add Data Validation & Error Handling
- Add validation in calculation functions to handle missing items array
- Log warnings when orders don't have expected structure
- Provide graceful degradation with empty states instead of "Unknown"
- Add error boundaries for calculation failures
- Ensure UI shows helpful messages when data is actually empty vs. broken

### 9. Test Complete Data Pipeline
- Run development server and check browser console logs
- Verify alerts display when real API has SLA breaches
- Verify analytics tab shows data with both real API and mock data
- Test with various order structures and edge cases
- Confirm no "Unknown Product" or empty category charts

### 10. Validate Fix with Production Scenarios
- Test with actual API response structure (if available)
- Verify 7-day alert window is working correctly
- Ensure analytics calculations are performant with large datasets
- Check mobile responsiveness of analytics tab
- Confirm no console errors or warnings

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server and verify:
  - No TypeScript compilation errors
  - Browser console shows correct data flow logs
  - Order Alerts section displays alerts when SLA breaches exist
  - Analytics tab shows Top Products with real product names and revenue
  - Revenue by Food Category pie chart displays with categories

- `npm run build` - Production build test:
  - Build completes without errors
  - No type errors in calculation functions
  - Tree shaking doesn't remove required code

- **Manual Testing Checklist**:
  - [ ] Open Executive Dashboard in browser
  - [ ] Check Order Alerts section - should show alerts if breaches exist, or "No alerts" with valid reason
  - [ ] Check Analytics tab - Top Products should show actual products with revenue
  - [ ] Check Analytics tab - Revenue by Category should show pie chart with categories
  - [ ] Inspect browser console for data pipeline logs
  - [ ] Verify no "Unknown Product" unless truly missing from data
  - [ ] Test with mock data fallback (disable API credentials)
  - [ ] Verify mock data produces realistic analytics charts

## Notes

**Critical Requirements from CLAUDE.md**:
1. **NO MOCK DATA FOR ALERTS**: "Alerts NEVER display if API returns mock data flag" - must check this carefully
2. **7-Day Alert Window**: Recent fix (commit 4e178cf) removed today-only filtering - verify this is working
3. **Alert Pipeline**: 4 stages - Orders received → SLA filtering → Alert mapping → UI display
4. **Analytics Dependencies**: Both product and category calculations depend on `order.items` array structure

**Data Structure Assumptions to Verify**:
```typescript
interface ApiOrder {
  id: string
  order_no: string
  status: string  // Must be SUBMITTED or PROCESSING for SLA alerts
  sla_info?: {
    target_minutes: number  // Actually in seconds!
    elapsed_minutes: number // Actually in seconds!
    status: string
  }
  items?: Array<{
    product_id: string
    product_name: string
    product_sku: string
    quantity: number
    unit_price: number
    total_price: number
    product_details?: {
      category: string
    }
  }>
}
```

**Debugging Strategy**:
1. Start with console logs to understand actual data structure
2. Don't assume field names - verify with actual API response
3. Check for null/undefined values in calculations
4. Verify mock data flag isn't incorrectly triggering empty states
5. Test both real API and mock data scenarios

**Expected Outcomes**:
- Order Alerts displays real alerts when SLA breaches exist in 7-day window
- Order Alerts shows clear message when no breaches (not misleading "0 Active Alerts")
- Analytics tab shows actual product names and revenues
- Revenue by Category shows realistic food categories with distribution
- No "Unknown Product" or ฿0 revenue unless data genuinely missing
- Mock data fallback provides realistic analytics for development/testing
