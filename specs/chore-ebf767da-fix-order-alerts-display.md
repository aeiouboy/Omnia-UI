# Chore: Fix Order Alerts Not Displaying

## Metadata
adw_id: `ebf767da`
prompt: `Investigate and fix Order Alerts not displaying. The alerts should show critical SLA breach notifications and approaching deadline warnings. Check the following: 1) Find where Order Alerts are rendered (likely in executive-dashboard components), 2) Check if the data fetching logic is working correctly, 3) Verify the alert filtering logic for breaches and near-breaches, 4) Ensure the component is not hidden or has display issues, 5) Check if there's mock data that should be displayed, 6) Fix any issues preventing alerts from showing up.`

## Chore Description
The Order Alerts section in the Executive Dashboard is not displaying critical SLA breach notifications and approaching deadline warnings. Investigation reveals that the alerts are being blocked by an overly strict mock data detection mechanism that returns empty arrays when the API is suspected to be using mock data.

**Root Cause Analysis:**
The `fetchOrderAlerts()` and `fetchApproachingSla()` functions in `executive-dashboard.tsx` have a critical check at lines 2014-2017 and 2112-2115 that returns empty arrays when:
- `testData.mockData` is true
- `testData.success` is false
- `testData.data?.pagination?.total === 0`

This means even legitimate API responses with real data are being filtered out if the pagination total is 0 or if there's any indication of mock data, preventing alerts from displaying even when there are actual SLA breaches or approaching deadlines in the fetched orders.

**Impact:**
- Critical SLA breach alerts are not shown to operations teams
- Approaching deadline warnings are hidden
- Operations teams cannot proactively manage orders
- The CriticalAlertsBanner component receives empty arrays and shows "No alerts" message

## Relevant Files
Use these files to complete the chore:

- **`/src/components/executive-dashboard.tsx`** (lines 2003-2199)
  - Contains `fetchOrderAlerts()` and `fetchApproachingSla()` functions
  - Has overly strict mock data detection that blocks legitimate alerts
  - Already has fallback logic for debugging (50%/30% thresholds) that could be used

- **`/src/components/executive-dashboard/alerts-section.tsx`**
  - Receives `orderAlerts` and `approachingSla` props
  - Renders the alerts in a structured format
  - Already has proper UI components for displaying alerts (SLABreachSection, ApproachingSLASection)
  - Component logic is working correctly - just needs data

- **`/src/components/critical-alerts-banner.tsx`**
  - Top-level banner component for critical alerts
  - Renders at line 2912 in executive-dashboard.tsx
  - Returns null when no alerts, which is correct behavior
  - Component is properly wired up and functional

- **`/src/lib/sla-utils.ts`**
  - Contains `filterSLABreach()` and `filterApproachingSLA()` functions
  - These utility functions are being called and working correctly
  - Used by alert fetching functions to identify breach/approaching orders

- **`/src/components/executive-dashboard/types.ts`**
  - Contains `OrderAlert` interface definition
  - Type definitions are correct and match the data structure

### New Files
None required - all fixes can be made to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Modify Mock Data Detection Logic in fetchOrderAlerts
- Open `/src/components/executive-dashboard.tsx`
- Locate the `fetchOrderAlerts()` function (starts at line 2003)
- Modify the mock data detection block (lines 2014-2017):
  - **REMOVE** the condition that returns empty array for `pagination?.total === 0`
  - **KEEP** the check for `testData.mockData` being explicitly true
  - **MODIFY** to allow API responses to proceed even if pagination shows 0, since we fetch full data afterward
- Allow the function to proceed to `fetchOrdersFromApi()` and run `filterSLABreach()` logic
- This ensures real breach data is processed even if the test query returns 0 results

### 2. Modify Mock Data Detection Logic in fetchApproachingSla
- In the same file, locate `fetchApproachingSla()` function (starts at line 2101)
- Apply the same logic changes as step 1:
  - Modify mock data detection block (lines 2112-2115)
  - Remove the `pagination?.total === 0` condition from blocking logic
  - Keep the explicit `testData.mockData === true` check
  - Allow function to proceed to fetch and filter approaching SLA orders

### 3. Enhance Error Handling and Logging
- Add more detailed console logging in both functions to track:
  - Test API response details (success, mockData flag, pagination)
  - Number of orders fetched from main API call
  - Number of breaches/approaching found after filtering
  - Whether the mock data check is blocking or allowing through
- This will help with future debugging without breaking functionality

### 4. Verify Alert Data Flow
- Confirm that `orderAlerts` and `approachingSla` state variables are being set correctly
- Check that the state updates trigger re-renders of CriticalAlertsBanner
- Verify the data mapping at lines 2913-2932 in executive-dashboard.tsx is correct
- Ensure AlertsSection component receives the data properly

### 5. Test with Real API Data
- Start the development server: `pnpm dev`
- Open browser console and navigate to Executive Dashboard
- Look for console logs showing:
  - "🚨 Found X SLA breached orders out of Y total orders"
  - "⚠️ Found X orders approaching SLA deadline out of Y total orders"
- Verify that alerts appear in the CriticalAlertsBanner component
- Check that alert details (order number, customer, location, times) are displayed correctly

### 6. Test Edge Cases
- Test when API returns 0 orders (should show "No alerts" message, not error)
- Test when API returns orders but none breach SLA (should show "No alerts")
- Test when API has actual breaches (should display alerts)
- Test the fallback debugging logic (50%/30% thresholds) to ensure it activates when appropriate
- Verify error handling catches and logs issues without crashing

### 7. Validate Alert Display Components
- Verify CriticalAlertsBanner shows correct breach count and details
- Check that SLABreachSection displays urgent orders with red styling
- Confirm ApproachingSLASection shows approaching orders with yellow styling
- Test expand/collapse functionality in the banner
- Verify Escalate button is present and functional

## Validation Commands
Execute these commands to validate the chore is complete:

- **Start Development Server**
  ```bash
  pnpm dev
  ```
  Expected: Server starts on http://localhost:3000 without errors

- **Type Check**
  ```bash
  pnpm run type-check
  ```
  Expected: No TypeScript errors (if this command exists, otherwise skip)

- **Build Production**
  ```bash
  pnpm build
  ```
  Expected: Build completes successfully without errors

- **Manual Testing Checklist**
  1. Navigate to Executive Dashboard (http://localhost:3000)
  2. Open browser console (F12)
  3. Look for console logs showing alert detection:
     - "🚨 Found X SLA breached orders..." (should be > 0 if breaches exist)
     - "⚠️ Found X orders approaching SLA..." (should be > 0 if approaching)
  4. Verify CriticalAlertsBanner appears at top of dashboard (below header)
  5. Check that alert details are shown (order numbers, locations, times)
  6. Test expand/collapse functionality
  7. Verify "No alerts" message appears only when genuinely no alerts
  8. Check that mock data detection logs show the correct decision path

- **Verify Console Logs**
  Look for these specific log patterns in browser console:
  ```
  ✅ "Allowing alerts through - API has data"
  🚨 "Found X SLA breached orders out of Y total orders" (X > 0)
  ⚠️ "Found X orders approaching SLA deadline..." (X > 0)
  ```
  Should NOT see:
  ```
  🚨 "CRITICAL: API returning mock/no data - returning EMPTY alerts"
  ```

## Notes

### Critical Business Rule
Per CLAUDE.md instructions:
> **CRITICAL: NEVER USE MOCK DATA FOR ALERTS**
> **ABSOLUTELY FORBIDDEN - Mock data must NEVER be used for:**
> - Critical Alerts (SLA breaches, approaching deadlines)
> - Security alerts or warnings
> - Financial transactions or revenue alerts
> - System status alerts
> - Any alert that could trigger business decisions
> **Rule: Always check API status first - if mock data detected, return EMPTY alerts instead**

This chore fixes the issue while respecting the business rule. The solution:
1. Makes the mock data detection more intelligent (doesn't block on pagination.total === 0)
2. Still returns empty arrays if `mockData: true` is explicitly set in API response
3. Allows legitimate API data to proceed even if test query returns 0 (since full fetch happens after)
4. Maintains the integrity requirement that alerts must be based on real data

### Implementation Strategy
The fix is minimal and surgical:
- Only modify the conditional logic in mock data detection blocks
- Don't change the filtering logic (`filterSLABreach`, `filterApproachingSLA`)
- Don't modify UI components (they're working correctly)
- Enhance logging for better observability
- Respect the business rule while fixing the blocking behavior

### Testing Considerations
- The system already has fallback debug logic (50%/30% thresholds)
- This fallback should activate when no actual breaches exist but orders are in progress
- The fallback helps verify the pipeline is working even without true breaches
- Production should rely on real breach detection, not debug thresholds
