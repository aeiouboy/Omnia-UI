# Chore: Verify Order Analysis Charts Are Standard Stacked Column Charts

## Metadata
adw_id: `8f569b89`
prompt: `Verify Order Analysis charts are standard stacked column charts (NOT 100% stacked). Current Issue: Charts might be incorrectly configured as 100% stacked column charts.`

## Chore Description
Verify that the Order Analysis page charts display actual values (standard stacked columns) rather than normalized percentages (100% stacked). Standard stacked charts show varying column heights based on actual order counts and revenue amounts, while 100% stacked charts normalize all columns to equal height showing only percentages.

## Analysis Results

### VERIFICATION COMPLETE: Charts Are CORRECTLY Configured as Standard Stacked

Both Order Analysis charts are **correctly configured** as standard stacked column charts with actual values. No changes are required.

### Evidence of Standard Stacked Configuration:

**1. Order Analysis View (`src/components/order-analysis-view.tsx`)**
   - Line 295-362: Orders chart uses `BarChart` with `stackId="orders"` (standard stacked)
   - Line 388-456: Revenue chart uses `BarChart` with `stackId="revenue"` (standard stacked)
   - Y-axis shows actual order counts (e.g., 0, 3, 6, 9, 12)
   - No percentage normalization applied

**2. Standalone Chart Components**
   - `src/components/order-analysis/stacked-order-chart.tsx` (lines 105-138)
   - `src/components/order-analysis/stacked-revenue-chart.tsx` (lines 105-138)
   - Both use `stackId` property for standard stacking behavior
   - Y-axis domains calculated from actual data values with 10% padding:
     - Orders: `domain={[0, maxValue]}` where `maxValue = Math.max(...data.map(d => d.totalOrders)) * 1.1`
     - Revenue: `domain={[0, maxValue]}` where `maxValue = Math.max(...data.map(d => d.totalRevenue)) * 1.1`

**3. Y-Axis Configuration (Actual Values Display)**
   - Orders chart Y-axis: `tickFormatter={(value) => value.toLocaleString()}` (line 121)
   - Revenue chart Y-axis: `tickFormatter={(value) => '฿${value >= 1000 ? ...}'}` (line 121)
   - No percentage calculation anywhere in the chart configuration

**4. Tooltip Configuration**
   - Tooltips display actual values: `entry.value?.toLocaleString()` (orders)
   - Revenue tooltips show: `฿{entry.value?.toLocaleString()}`
   - Totals calculated by summing actual values, not percentages

**5. Recharts Standard Behavior**
   - Recharts `BarChart` with `stackId` creates standard stacked charts by default
   - To create 100% stacked charts, would need explicit percentage calculation
   - No such calculation exists in the codebase

### Key Differences:

| Feature | Standard Stacked (Current) ✅ | 100% Stacked (Not Used) ❌ |
|---------|-------------------------------|---------------------------|
| Column Height | Varies by day based on actual data | All columns same height (100%) |
| Y-Axis Scale | 0 to max value + 10% padding | 0-100 (percentage) |
| Data Display | Actual order counts/revenue | Percentages only |
| Total Calculation | `sum(actual_values)` | Normalized to 100% |

## Relevant Files
- `src/components/order-analysis-view.tsx` - Main Order Analysis page with both charts
- `src/components/order-analysis/stacked-order-chart.tsx` - Standalone orders chart component
- `src/components/order-analysis/stacked-revenue-chart.tsx` - Standalone revenue chart component
- `src/hooks/use-order-analysis.ts` - Data aggregation hook with actual value calculations
- `src/types/order-analysis.ts` - Type definitions for ChannelDailySummary and RevenueDailySummary

## Step by Step Tasks

### 1. Code Review Completed
- ✅ Reviewed OrderAnalysisView component chart configurations
- ✅ Verified BarChart stackId properties (standard stacking)
- ✅ Confirmed Y-axis domains use actual data values
- ✅ Checked tooltip displays show actual counts/revenue

### 2. Standalone Components Verified
- ✅ Reviewed StackedOrderChart component
- ✅ Reviewed StackedRevenueChart component
- ✅ Verified maxValue calculations use Math.max() on actual data
- ✅ Confirmed no percentage normalization logic exists

### 3. Data Aggregation Verified
- ✅ Reviewed useOrderAnalysis hook
- ✅ Confirmed aggregateOrdersByDateAndChannel sums actual values
- ✅ Verified totalOrders/totalRevenue are real sums, not percentages

### 4. Recharts Behavior Confirmed
- ✅ Confirmed BarChart with stackId creates standard stacked charts
- ✅ Verified no 100% stacked configuration exists
- ✅ No percentage calculations in any chart component

## Validation Commands

No changes required. To verify the charts are displaying correctly:

```bash
# Start development server
pnpm dev

# Navigate to Order Analysis page
# http://localhost:3000/orders/analysis

# Verify:
# 1. Column heights vary by day (not all equal)
# 2. Y-axis shows actual order counts (e.g., 0, 3, 6, 9, 12)
# 3. Revenue Y-axis shows actual amounts (e.g., ฿0, ฿10k, ฿20k, ฿40k)
# 4. Tooltips display actual values, not percentages
# 5. Column totals vary per day based on real data
```

## Notes

**Status: VERIFIED - NO CHANGES REQUIRED**

The Order Analysis charts are correctly implemented as standard stacked column charts displaying actual values. The concern about 100% stacked configuration is unfounded - the codebase uses standard Recharts stacked bar chart behavior with proper Y-axis scaling based on real data values.

**Key Configuration Points:**
- Standard stacking via `stackId` property (not percentage-based)
- Y-axis scales dynamically based on maximum data value + 10% padding
- Tooltips show absolute values with currency formatting where appropriate
- Data aggregation uses real sums, not normalized percentages
