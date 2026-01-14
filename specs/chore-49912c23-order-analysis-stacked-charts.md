# Chore: Order Analysis Stacked Bar Charts with CSV Export

## Metadata
adw_id: `49912c23`
prompt: `Prompt 8: Order Analysis - Summary Views & Export - Implement Order Analysis page with stacked bar chart summary views and CSV export`

## Chore Description
Implement an Order Analysis page that displays total order and revenue summary per day analysis using stacked bar charts. The feature includes:

1. **Two Stacked Bar Charts**:
   - Order/Day Chart: Shows order count by date, stacked by channel (Grab, Line Man, Gokoo, TOL, MKP)
   - Revenue/Day Chart: Shows revenue in Thai Baht by date, stacked by same channels

2. **Consistent Channel Color Scheme**:
   - Grab: Dark Blue (#1e3a8a)
   - Line Man: Orange (#f97316)
   - Gokoo: Dark Green (#166534)
   - TOL: Light Blue (#0ea5e9) - typically largest segment
   - MKP: Purple (#7c3aed)

3. **View Toggle**: Switch between 'Order Summary Per Day' and 'Revenue Summary Per Day' views, or display both charts stacked vertically

4. **CSV Export**: Single export button with filter-aware export functionality:
   - Columns: Date, Total Amount, TOL Orders, MKP Orders, QC Orders
   - UTF-8 encoding with BOM for Excel compatibility
   - Save to `/Users/naruechon/Omnia-UI/docs/CFR/`
   - Filename: `order_analysis_export_{YYYY-MM-DD}.csv`

## Relevant Files
Use these files to complete the chore:

### Existing Files to Modify/Reference
- **src/components/executive-dashboard/utils.ts** - Contains `calculateDailyOrders`, `calculateChannelVolume`, `calculateEnhancedChannelData` functions that aggregate order data by day and channel. Will reference for data transformation patterns.
- **src/components/ui/chart.tsx** - ChartContainer, ChartTooltip, ChartLegend components from Radix/Recharts. Use for consistent chart styling.
- **src/lib/export-utils.ts** - Has `exportToCSV`, `escapeCSVValue`, BOM export pattern in `exportTransactionsToExcel`. Will extend with new export function for order analysis.
- **src/lib/currency-utils.ts** - `formatCurrencyInt` for Thai Baht formatting with thousand separators.
- **app/api/orders/summary/route.ts** - Existing API that returns order summaries. Will use for data fetching.
- **src/components/animated-chart-components.tsx** - Contains Recharts imports (BarChart, Bar, etc.) and animation patterns.
- **src/components/dashboard-header.tsx** - Page header component pattern to follow.
- **src/components/dashboard-shell.tsx** - Page shell component pattern to follow.

### New Files to Create
- **app/order-analysis/page.tsx** - New page route for Order Analysis
- **src/components/order-analysis/stacked-order-chart.tsx** - Stacked bar chart for Order/Day view
- **src/components/order-analysis/stacked-revenue-chart.tsx** - Stacked bar chart for Revenue/Day view
- **src/components/order-analysis/order-analysis-content.tsx** - Main content component with view toggle and export
- **src/components/order-analysis/channel-legend.tsx** - Shared legend component for both charts
- **src/hooks/use-order-analysis.ts** - Custom hook for fetching and aggregating order analysis data

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Type Definitions
- Add type interfaces to `src/types/order-analysis.ts`:
  - `ChannelDailySummary` - daily order/revenue by channel
  - `OrderAnalysisData` - aggregated analysis data structure
  - `OrderAnalysisExportRow` - CSV export row format
- Define channel constants with colors and labels

### 2. Create Custom Hook for Order Analysis Data
- Create `src/hooks/use-order-analysis.ts`
- Fetch order data from `/api/orders/summary` with date range parameters
- Aggregate orders by date and channel using patterns from `calculateDailyOrders` and `calculateChannelVolume`
- Return structured data for charts: `{ dailyOrdersByChannel, dailyRevenueByChannel, isLoading, error }`
- Handle loading states and errors

### 3. Create Channel Legend Component
- Create `src/components/order-analysis/channel-legend.tsx`
- Define CHANNEL_COLORS constant: Grab (Dark Blue), Line Man (Orange), Gokoo (Dark Green), TOL (Light Blue), MKP (Purple)
- Render horizontal legend with colored squares and channel names
- Make reusable for both charts

### 4. Create Stacked Order Chart Component
- Create `src/components/order-analysis/stacked-order-chart.tsx`
- Use Recharts `BarChart` with stacked `Bar` components (stackId="orders")
- X-axis: Dates formatted as DD-MMM (e.g., 14-Jan)
- Y-axis: Order count (0 to max value + padding)
- Apply channel colors from CHANNEL_COLORS constant
- Include tooltip showing channel breakdown
- Use ChartContainer for consistent styling

### 5. Create Stacked Revenue Chart Component
- Create `src/components/order-analysis/stacked-revenue-chart.tsx`
- Use Recharts `BarChart` with stacked `Bar` components (stackId="revenue")
- X-axis: Dates formatted as DD-MMM
- Y-axis: Revenue in Thai Baht with thousand separators
- Apply same channel colors for consistency
- Include tooltip with `formatCurrencyInt` for values
- Use ChartContainer for consistent styling

### 6. Create Export Function for Order Analysis
- Add `exportOrderAnalysisToCSV` function to `src/lib/export-utils.ts`
- Accept daily summary data and date range
- Format columns: Date, Total Amount, TOL Orders, MKP Orders, QC Orders
- Use UTF-8 BOM for Excel compatibility (pattern from `exportTransactionsToExcel`)
- Generate filename: `order_analysis_export_{YYYY-MM-DD}.csv`

### 7. Create Order Analysis Content Component
- Create `src/components/order-analysis/order-analysis-content.tsx`
- Add view toggle state: 'orders' | 'revenue' | 'both'
- Render ToggleGroup for view selection
- Conditionally render charts based on view state
- Add Export button that triggers `exportOrderAnalysisToCSV`
- Include shared ChannelLegend component
- Handle loading/error states with appropriate UI

### 8. Create Order Analysis Page
- Create `app/order-analysis/page.tsx`
- Use DashboardShell and DashboardHeader components
- Render OrderAnalysisContent component
- Set page title: "Order Analysis"
- Add to navigation in `src/components/main-nav.tsx` (optional, under Analytics)

### 9. Add Date Range Filter (Optional Enhancement)
- Add date range picker to OrderAnalysisContent
- Pass date range to useOrderAnalysis hook
- Default to last 7 days

### 10. Validate Implementation
- Run TypeScript compilation: `pnpm build`
- Test chart rendering with sample data
- Verify CSV export generates correct format
- Test view toggle functionality
- Verify Thai Baht formatting in revenue chart

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation passes with no errors
- `pnpm lint` - Verify linting rules pass
- `ls -la docs/CFR/` - Verify export directory exists
- `cat docs/CFR/order_analysis_export_*.csv` - Verify CSV format after export test

## Notes

### Channel Color Mapping
```typescript
const CHANNEL_COLORS = {
  Grab: '#1e3a8a',      // Dark Blue
  'Line Man': '#f97316', // Orange
  Gokoo: '#166534',     // Dark Green
  TOL: '#0ea5e9',       // Light Blue (largest segment)
  MKP: '#7c3aed',       // Purple
}
```

### Date Formatting
- X-axis dates: `DD-MMM` format (e.g., "14-Jan")
- Use `date-fns` or native Date formatting
- Example: `new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })`

### CSV Export Format Reference
```csv
Date,Total Amount,TOL Orders,MKP Orders,QC Orders
2026-01-14,1750000,3000,400,200
2026-01-15,850000,1500,200,100
```

### Stacked Bar Implementation
- Use `stackId` prop on each `Bar` component with same value to stack
- Order of `Bar` components determines stack order (bottom to top)
- TOL should be at bottom (largest), other channels stacked above
