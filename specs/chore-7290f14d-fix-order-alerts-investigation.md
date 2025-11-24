# Chore: Fix Order Alerts Not Displaying - Deep Investigation

## Metadata
adw_id: `7290f14d`
prompt: `Fix Order Alerts showing 'No alerts at this time' when there should be alerts. Investigation steps: 1) Check the fetchOrderAlerts() and fetchApproachingSla() functions to see what data they're returning, 2) Verify the API is returning orders with SLA breaches (check the filterSLABreach and filterApproachingSLA functions), 3) Check if the AlertsSection component is properly displaying the alerts data, 4) Look at the console logs to see if alerts are being filtered out, 5) Verify the SLA calculation logic is correctly identifying breaches (elapsed_minutes > target_minutes), 6) Check if there are any conditions blocking alerts from displaying in the UI, 7) Add more detailed logging to understand the data flow, 8) Fix any issues preventing alerts from showing up.`

## Chore Description
The Order Alerts section in the Executive Dashboard consistently displays "No alerts at this time" even when there should be SLA breach alerts or approaching deadline warnings. This is a critical business issue as operations teams rely on these alerts to proactively manage orders and prevent SLA violations.

### Root Cause Analysis
Investigation of the codebase reveals **TWO PRIMARY ISSUES**:

#### Issue 1: Overly Strict Mock Data Detection (Lines 2013-2018, 2123-2128)
The `fetchOrderAlerts()` and `fetchApproachingSla()` functions have a critical check that returns empty arrays when:
- `testData.mockData === true` (explicit mock data flag)

**Problem:** The test query uses today's date only (`dateFrom=today&dateTo=today`), which may legitimately return 0 results if no orders exist for today. However, the main data fetch uses a 7-day range and may contain valid alert data. The current logic blocks all alerts if the test query suggests mock data.

#### Issue 2: Today-Only Alert Filtering (Line 737-774 in data-fetching.ts)
The `processOrderAlerts()` function in `/src/components/executive-dashboard/data-fetching.ts` filters orders to show **ONLY today's alerts** using GMT+7 timezone:

```typescript
const todayStr = safeToISOString(today, undefined, 'processOrderAlerts:today').split('T')[0]
const todaysOrders = orders.filter(order => {
  const orderDateStr = safeToISOString(orderGMT7, undefined, `processOrderAlerts:orderId=${order.id}`).split('T')[0]
  return orderDateStr === todayStr
})
```

**Problem:** If there are no orders placed TODAY (even if there are breaching orders from yesterday or earlier in the 7-day window), no alerts will be displayed. This contradicts the 7-day data fetching strategy.

### Impact
- **Critical SLA breach alerts are not shown** when they occur on orders from previous days
- **Approaching deadline warnings are hidden** for orders not placed today
- **Operations teams cannot proactively manage orders** that are breaching but were placed 1-6 days ago
- **Business decision-making is impaired** due to missing critical operational intelligence
- **False sense of compliance** when alerts show "No alerts at this time" despite having breaching orders

### Business Context
Per CLAUDE.md critical business rules:
> **CRITICAL: NEVER USE MOCK DATA FOR ALERTS**
> - Critical Alerts (SLA breaches, approaching deadlines) must use real API data only
> - If mock data detected, return EMPTY alerts to prevent false critical alerts

This chore must respect this rule while fixing the blocking behavior that prevents legitimate alerts.

## Relevant Files
Use these files to complete the chore:

### Core Alert Logic
- **`/src/components/executive-dashboard.tsx`** (lines 2003-2199)
  - Contains `fetchOrderAlerts()` function (line 2003)
  - Contains `fetchApproachingSla()` function (line 2113)
  - Has mock data detection that may be overly strict
  - Already has comprehensive console logging for debugging
  - Has fallback logic showing 50%/30% threshold orders when no breaches found

### Alert Data Processing
- **`/src/components/executive-dashboard/data-fetching.ts`** (lines 737-813)
  - Contains `processOrderAlerts()` function - **CRITICAL LOCATION**
  - Filters orders to TODAY ONLY (GMT+7 timezone)
  - This is where the today-only filtering happens
  - Maps orders to OrderAlert format
  - Handles timezone conversion and date comparison

### SLA Calculation & Filtering
- **`/src/lib/sla-utils.ts`**
  - Contains `calculateSLAStatus()` (lines 23-72) - Core SLA calculation logic
  - Contains `filterSLABreach()` (lines 77-82) - Identifies breached orders
  - Contains `filterApproachingSLA()` (lines 87-92) - Identifies approaching orders
  - **Important:** Only considers SUBMITTED and PROCESSING orders (line 25-34)
  - Uses 20% threshold for approaching status (line 56)
  - Values in seconds despite field names suggesting minutes (line 48-49)

### UI Components
- **`/src/components/executive-dashboard/alerts-section.tsx`**
  - Receives `orderAlerts` and `approachingSla` props
  - Contains `SLABreachSection` component (lines 122-191) - Red urgent alerts
  - Contains `ApproachingSLASection` component (lines 193-226) - Yellow warnings
  - Contains `NoAlertsMessage` component (lines 228-236) - "No alerts" display
  - Component rendering logic is correct - just needs proper data

- **`/src/components/critical-alerts-banner.tsx`**
  - Top-level banner for critical alerts
  - Rendered in executive-dashboard.tsx (line 2912)
  - Shows expandable alert summary
  - Correctly returns null when no alerts

### Type Definitions
- **`/src/components/executive-dashboard/types.ts`**
  - Contains `OrderAlert` interface definition
  - Defines alert data structure with all required fields

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Investigate Current Alert Data Flow
**Goal:** Understand exactly what's happening in the alert pipeline

- Start development server: `pnpm dev`
- Open browser to http://localhost:3000
- Open browser console (F12)
- Navigate to Executive Dashboard
- Look for these console log patterns:
  ```
  🚨 Processing X orders for TODAY's alerts...
  📅 TODAY (GMT+7): YYYY-MM-DD
  📅 TODAY's orders for alerts: X/Y (date)
  🚨 TODAY's SLA alerts: X breaches, Y approaching
  🚨 Found X SLA breached orders out of Y total orders
  ⚠️ Found X orders approaching SLA deadline out of Y total orders
  ```
- Document in console:
  - Total orders fetched from API
  - Orders filtered to today
  - Breaches found in today's orders
  - Approaching found in today's orders
  - Whether test API check is blocking or allowing

### 2. Verify SLA Calculation Logic
**Goal:** Confirm SLA breach detection is working correctly

- Add temporary logging in `src/lib/sla-utils.ts` `calculateSLAStatus()`:
  ```typescript
  console.log('🔍 SLA Calculation:', {
    orderId: order.id,
    status: order.status,
    targetSeconds: targetSeconds,
    elapsedSeconds: elapsedSeconds,
    isBreach: isBreach,
    isApproaching: isApproaching,
    remainingSeconds: remainingSeconds
  })
  ```
- Run dashboard and verify:
  - SLA calculation correctly identifies breaches (elapsed > target)
  - Approaching logic works (remaining <= 20% of target)
  - Only SUBMITTED/PROCESSING orders are evaluated
  - Values are in seconds, not minutes

### 3. Fix Mock Data Detection Logic
**Goal:** Make mock data detection more intelligent

In `/src/components/executive-dashboard.tsx`:

**For `fetchOrderAlerts()` function (lines 2003-2111):**
- Locate mock data check (lines 2013-2018)
- Current logic:
  ```typescript
  if (testData.mockData === true) {
    console.log("🚨 CRITICAL: API explicitly returning mock data...")
    return []
  }
  ```
- **Keep this check** - it's correct per business rules
- **Add additional context logging** after the check:
  ```typescript
  console.log("✅ API status check passed:", {
    success: testData.success,
    mockData: testData.mockData,
    testQueryPaginationTotal: testData.data?.pagination?.total,
    note: "Test query uses today only - main fetch uses 7 days"
  })
  ```

**For `fetchApproachingSla()` function (lines 2113-2199):**
- Apply same logging enhancement (lines 2123-2128)
- Ensure consistency with fetchOrderAlerts logic

### 4. Fix Today-Only Alert Filtering Logic
**Goal:** Show alerts from the entire 7-day window, not just today

**This is the CRITICAL fix for the root cause.**

In `/src/components/executive-dashboard/data-fetching.ts`:

**Option A: Remove Today-Only Filtering (Recommended)**
- Locate `processOrderAlerts()` function (line 737)
- Find the today-only filtering logic (lines 746-774):
  ```typescript
  const todaysOrders = orders.filter(order => {
    // ... date filtering to today only
    return orderDateStr === todayStr
  })
  ```
- **REMOVE the today-only filter** entirely
- Change to process ALL orders in the 7-day window:
  ```typescript
  // Process ALL orders from 7-day window for alerts
  console.log(`🚨 Processing ${orders.length} orders for alerts (7-day window)...`)

  // Filter orders with valid dates
  const validOrders = orders.filter(order => {
    if (!order.order_date) {
      console.warn(`⚠️ Invalid date detected`, { orderId: order.id })
      return false
    }
    const orderDate = new Date(order.order_date)
    return !isNaN(orderDate.getTime())
  })

  console.log(`📅 Valid orders for alerts: ${validOrders.length}/${orders.length}`)

  // Apply SLA filtering to all valid orders
  const slaBreaches = filterSLABreach(validOrders)
  const approachingSLA = filterApproachingSLA(validOrders)
  ```
- Update logging to reflect 7-day window instead of "TODAY"
- This ensures alerts show for ANY order in the 7-day range that has SLA issues

**Option B: Make Today-Only Filtering Configurable (Alternative)**
- Add a parameter to `processOrderAlerts()`:
  ```typescript
  export function processOrderAlerts(
    orders: ApiOrder[],
    todayOnly: boolean = false  // Default to showing all alerts
  ): { ... }
  ```
- Keep the today filtering logic but make it conditional:
  ```typescript
  const ordersToProcess = todayOnly ? todaysOrders : orders
  ```
- Update callers to pass `todayOnly: false` for alerts

**Recommendation:** Use Option A - Remove the today-only filter entirely. SLA breaches from ANY day in the 7-day window should trigger alerts.

### 5. Enhance Alert Data Flow Logging
**Goal:** Add comprehensive logging to track alert pipeline

Add detailed console logs at each stage:

In `/src/components/executive-dashboard/data-fetching.ts` `processOrderAlerts()`:
```typescript
console.log(`📊 ALERT PIPELINE STAGE 1: Orders received`, {
  totalOrders: orders.length,
  windowDescription: '7-day window'
})

console.log(`📊 ALERT PIPELINE STAGE 2: SLA filtering`, {
  breaches: slaBreaches.length,
  approaching: approachingSLA.length,
  processedOrders: orders.length
})

console.log(`📊 ALERT PIPELINE STAGE 3: Alert mapping`, {
  orderAlerts: orderAlerts.length,
  approachingAlerts: approachingAlerts.length,
  criticalAlerts: orderAlerts.slice(0, 5).length
})
```

In `/src/components/executive-dashboard.tsx` after calling alert functions:
```typescript
console.log(`📊 ALERT PIPELINE FINAL: UI display`, {
  orderAlertsCount: orderAlerts.length,
  approachingSlaCount: approachingSla.length,
  willDisplay: (orderAlerts.length + approachingSla.length) > 0
})
```

### 6. Verify AlertsSection Component Data Handling
**Goal:** Ensure UI component receives and displays data correctly

In `/src/components/executive-dashboard/alerts-section.tsx`:
- Add logging in component:
  ```typescript
  console.log('🎨 AlertsSection render:', {
    orderAlertsCount: orderAlerts.length,
    approachingSlaCount: approachingSla.length,
    isLoading,
    totalActiveAlerts: orderAlerts.length + approachingSla.length
  })
  ```
- Verify:
  - Component receives non-empty arrays when alerts exist
  - Loading state is handled correctly
  - NoAlertsMessage only shows when genuinely no alerts
  - SLABreachSection renders when orderAlerts.length > 0
  - ApproachingSLASection renders when approachingSla.length > 0

### 7. Test and Validate Complete Alert Flow
**Goal:** End-to-end verification of alert system

Run through complete test scenarios:

**Test Scenario 1: Orders with SLA Breaches**
- Ensure API has orders with `elapsed_minutes > target_minutes`
- Check console for full pipeline logs
- Verify alerts appear in CriticalAlertsBanner
- Confirm SLABreachSection displays with red styling
- Check order details are correct (number, customer, location, times)

**Test Scenario 2: Orders Approaching SLA**
- Ensure API has orders within 20% of SLA deadline
- Verify approaching alerts display with yellow styling
- Check remaining time is calculated correctly
- Confirm ApproachingSLASection shows up to 4 orders

**Test Scenario 3: No Alerts Scenario**
- Test with API returning only compliant orders
- Verify "No alerts at this time" message displays
- Ensure no console errors
- Confirm fallback debug logic may activate (50%/30% thresholds)

**Test Scenario 4: Mock Data Detection**
- Test with `mockData: true` in API response
- Verify alerts are NOT displayed (per business rules)
- Check console shows: "🚨 CRITICAL: API explicitly returning mock data..."
- Ensure "No alerts at this time" is shown, not an error

**Test Scenario 5: Multi-Day SLA Breaches**
- Test with orders from 2-3 days ago that are breaching
- **KEY TEST:** These should now display after removing today-only filter
- Verify alerts show for older orders in 7-day window
- Confirm date/time displays are correct with GMT+7

### 8. Clean Up Temporary Logging
**Goal:** Remove temporary debug logs after fixes verified

- Remove temporary logging added in step 2 from `sla-utils.ts`
- Keep the enhanced pipeline logging from step 5 (useful for operations)
- Ensure no console.log statements with sensitive data
- Keep error logging and critical warnings

### 9. Document Changes
**Goal:** Update documentation to reflect new behavior

Add to CLAUDE.md if needed:
```markdown
### Alert System Behavior
- **7-Day Alert Window**: Alerts display for ANY order in the 7-day window with SLA issues
- **No Today-Only Filtering**: Breaches from any day in the window trigger alerts
- **GMT+7 Timezone**: All date/time calculations use Asia/Bangkok timezone
- **Mock Data Protection**: Alerts NEVER display if API returns mock data flag
- **SLA Thresholds**: Breach when elapsed > target, Approaching when remaining <= 20% of target
```

## Validation Commands
Execute these commands to validate the chore is complete:

### Build & Type Check
```bash
# Type checking
npx tsc --noEmit

# Build for production
pnpm build
```
**Expected:** No TypeScript errors, build succeeds

### Development Server
```bash
pnpm dev
```
**Expected:** Server starts on http://localhost:3000 without errors

### Manual Testing Checklist

**1. Console Log Verification**
Navigate to http://localhost:3000 and check browser console for:

✅ **Alert Pipeline Logs (Should See):**
```
📊 ALERT PIPELINE STAGE 1: Orders received
📊 ALERT PIPELINE STAGE 2: SLA filtering
📊 ALERT PIPELINE STAGE 3: Alert mapping
📊 ALERT PIPELINE FINAL: UI display
🚨 Found X SLA breached orders out of Y total orders
⚠️ Found X orders approaching SLA deadline out of Y total orders
```

✅ **API Status Logs (Should See):**
```
✅ API status check passed: { success: true, mockData: false, ... }
✅ Allowing X breach alert(s) through - API has real breach data
```

❌ **Should NOT See (unless genuinely mock data):**
```
🚨 CRITICAL: API explicitly returning mock data - returning EMPTY alerts
```

**2. UI Component Verification**

Navigate through these checks:

- [ ] Executive Dashboard loads without errors
- [ ] CriticalAlertsBanner appears at top (if alerts exist)
- [ ] SLA breach alerts display with RED styling
- [ ] Approaching SLA alerts display with YELLOW styling
- [ ] Alert details are correct:
  - [ ] Order ID/Number displayed
  - [ ] Customer name shown
  - [ ] Store location present
  - [ ] Channel badge visible
  - [ ] Target time correct
  - [ ] Elapsed time accurate
  - [ ] Time over (breaches) or time remaining (approaching) calculated correctly
- [ ] "No alerts at this time" only appears when genuinely no alerts
- [ ] Expand/collapse functionality works
- [ ] Escalate button is present and clickable

**3. Multi-Day Alert Verification**

**CRITICAL TEST - Validates the main fix:**

- [ ] Check if there are orders from 2-3 days ago with SLA issues
- [ ] Verify these older orders' alerts ARE NOW DISPLAYED
- [ ] Confirm alerts are not limited to today's orders only
- [ ] Check console shows processing of 7-day window, not just today

**4. Edge Case Testing**

- [ ] Test with 0 orders from API (should show "No alerts", not error)
- [ ] Test with orders but no SLA breaches (should show "No alerts")
- [ ] Test with only approaching orders (no breaches)
- [ ] Test with only breached orders (no approaching)
- [ ] Test with mix of breached and approaching
- [ ] Test mock data scenario if possible (should show "No alerts")

**5. Performance Check**

- [ ] Dashboard loads in < 3 seconds
- [ ] Alert section renders without lag
- [ ] Console logs are not excessive (< 50 logs on load)
- [ ] No memory leaks or infinite loops in console

### Success Criteria

The chore is complete when:

1. ✅ Alerts display for orders from ANY day in the 7-day window (not just today)
2. ✅ SLA breach detection works correctly (elapsed > target)
3. ✅ Approaching SLA detection works correctly (remaining <= 20% of target)
4. ✅ Mock data check still blocks fake alerts per business rules
5. ✅ Console logs clearly show alert pipeline stages
6. ✅ UI components render alerts with correct styling and data
7. ✅ "No alerts" message only shows when genuinely no alerts
8. ✅ No TypeScript or build errors
9. ✅ All edge cases handled gracefully

## Notes

### Critical Business Rules (from CLAUDE.md)

**NEVER USE MOCK DATA FOR ALERTS:**
- Critical Alerts (SLA breaches, approaching deadlines) must be real data only
- If `mockData: true` detected in API response, return EMPTY alerts
- Never show fake critical alerts that could trigger incorrect business decisions

**This chore respects this rule** by:
1. Keeping the `testData.mockData === true` check that blocks mock alerts
2. Fixing the today-only filtering that blocks legitimate multi-day alerts
3. Making the mock data detection smarter (doesn't block on pagination.total === 0)
4. Ensuring real breach data from the 7-day window is processed correctly

### Root Cause Summary

**Primary Issue:** The `processOrderAlerts()` function in `data-fetching.ts` filters alerts to show ONLY today's orders (GMT+7), even though the dashboard fetches 7 days of data. This means orders from yesterday or earlier that are breaching SLA are hidden from the alert system.

**Secondary Issue:** The mock data detection in `fetchOrderAlerts()` and `fetchApproachingSla()` could benefit from enhanced logging to show why decisions are made.

### Implementation Strategy

**Minimal, Surgical Changes:**
1. Remove today-only filtering in `processOrderAlerts()` (lines 746-774 in data-fetching.ts)
2. Process ALL orders from 7-day window for alert detection
3. Enhance console logging to show alert pipeline stages
4. Keep all existing SLA calculation logic (it's correct)
5. Keep mock data detection (it's correct per business rules)
6. Don't change UI components (they're working correctly)

**Impact of Changes:**
- **Positive:** Operations teams will now see alerts for ALL orders in 7-day window with SLA issues
- **Positive:** More accurate operational intelligence for decision-making
- **Neutral:** Alert volume may increase (but this is correct behavior)
- **No Negative:** No performance impact, no breaking changes

### Testing Considerations

**Comprehensive Testing Required:**
- Test with real API data containing multi-day orders
- Verify older orders (2-3 days ago) now show alerts if breaching
- Ensure today-only filtering removal doesn't break anything
- Validate timezone handling (GMT+7) still works correctly
- Confirm mock data detection still blocks when needed

**Fallback Debug Logic:**
- The system has 50%/30% threshold fallback logic for debugging
- This helps verify the pipeline is working even without true breaches
- Production should rely on real breach detection at 100%/20% thresholds
- Fallback may activate when no actual breaches but orders are in progress

### Related Issues

This chore fixes the alert display issue previously documented in:
- `specs/chore-ebf767da-fix-order-alerts-display.md` (partial solution)

The new investigation approach (adw_id: 7290f14d) identified the additional root cause of today-only filtering, which was not addressed in the previous chore spec.
