# Chore: Fix Order Analysis Bar Charts Not Rendering

## Metadata
adw_id: `92e4718c`
prompt: `Fix Order Analysis charts - bars not rendering despite data being present. Y-axes are properly scaled but actual stacked bar charts are NOT VISIBLE.`

## Chore Description
The Order Analysis page displays correct KPI values (149 orders, ฿119,605 revenue) and the chart Y-axes are properly scaled (Orders: 0-25, Revenue: ฿0-฿19k), but the actual stacked bar charts are not visible. The chart area appears empty/white despite having valid data that would justify those axis scales.

The root cause is in the chart components where `showEmptyState = totalOrders === 0` or `totalRevenue === 0`. When this condition is true, a `ChartEmptyState` overlay with `z-10` and `bg-background/80 backdrop-blur-sm` is rendered over the chart, obscuring the bars completely.

**Potential causes identified:**
1. The `totalOrders` and `totalRevenue` props passed to charts may be 0 even when data exists
2. The ChartEmptyState overlay is shown and completely hides the rendered bars
3. The `filteredTotalOrders` and `filteredTotalRevenue` calculations in the page may return 0

## Relevant Files
Use these files to complete the chore:

- **src/components/order-analysis/stacked-order-chart.tsx** - Contains `showEmptyState = totalOrders === 0` logic (line 99) that triggers overlay. Need to verify/fix the empty state condition.
- **src/components/order-analysis/stacked-revenue-chart.tsx** - Contains `showEmptyState = totalRevenue === 0` logic (line 99) that triggers overlay. Need to verify/fix the empty state condition.
- **src/components/order-analysis/chart-empty-state.tsx** - The overlay component with `z-10` and `bg-background/80` that obscures bars.
- **app/order-analysis/page.tsx** - Passes `filteredTotalOrders` and `filteredTotalRevenue` to chart components (lines 231-242). Need to verify these calculations.
- **src/hooks/use-order-summary.ts** - Generates `data.totalOrders` and `data.totalRevenue` from API response aggregation (lines 129-136).
- **src/types/order-analysis.ts** - Type definitions for ChannelDailySummary and RevenueDailySummary with TOL and MKP fields.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Investigate and Confirm Root Cause
- Navigate to http://localhost:3000/order-analysis using Playwright MCP
- Take a browser snapshot to capture current state
- Add console.log debugging in the browser to check:
  - The actual `filteredOrderData` and `filteredRevenueData` arrays
  - The values of `filteredTotalOrders` and `filteredTotalRevenue`
  - Whether the data arrays have TOL/MKP values > 0

### 2. Fix StackedOrderChart Empty State Logic
- Open `src/components/order-analysis/stacked-order-chart.tsx`
- The issue is that `showEmptyState` should check if the data array has actual values, not just rely on `totalOrders` prop
- Change the empty state condition to verify actual data values:
  ```typescript
  // Check if any day has actual order data
  const hasOrderData = data.some(d => d.TOL > 0 || d.MKP > 0)
  const showEmptyState = !hasOrderData
  ```
- This ensures the overlay only shows when there's truly no data in the bars

### 3. Fix StackedRevenueChart Empty State Logic
- Open `src/components/order-analysis/stacked-revenue-chart.tsx`
- Apply the same fix:
  ```typescript
  // Check if any day has actual revenue data
  const hasRevenueData = data.some(d => d.TOL > 0 || d.MKP > 0)
  const showEmptyState = !hasRevenueData
  ```

### 4. Verify Page Calculations (Optional Defensive Fix)
- Open `app/order-analysis/page.tsx`
- Verify `filteredTotalOrders` and `filteredTotalRevenue` calculations are correct
- If needed, ensure these sum the actual TOL + MKP values from the filtered data

### 5. Validate with Playwright MCP
- Navigate to http://localhost:3000/order-analysis
- Take a screenshot to verify:
  - Orders by Channel chart shows blue (TOL) and orange (MKP) stacked bars
  - Revenue by Channel chart shows blue (TOL) and green (MKP) stacked bars
  - Both charts display bars for each day in the date range
  - Y-axes still show correct scales
  - Hovering over bars shows tooltip with channel breakdown

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- Playwright MCP browser validation:
  1. Navigate to http://localhost:3000/order-analysis
  2. Take snapshot to verify bars are visible
  3. Confirm both charts show colored stacked bars for each day
  4. Verify no empty state overlay is displayed when data exists

## Notes
- The chart components correctly define `dataKey="TOL"` and `dataKey="MKP"` matching the data structure
- CHANNEL_COLORS defines TOL as blue (#0ea5e9) and MKP as orange (#f97316) for orders
- CHANNEL_COLORS_REVENUE defines TOL as blue (#0ea5e9) and MKP as green (#16a34a) for revenue
- The data structure from use-order-summary.ts correctly spreads `...orderCounts` which includes TOL and MKP properties
- The fix focuses on the empty state condition logic rather than data key naming
