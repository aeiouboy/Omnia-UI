# Chore: Order Analysis Page Implementation

## Metadata
adw_id: `e4de77f5`
prompt: `Implement Order Analysis page displaying daily Order totals and Revenue totals by channel with stacked bar chart visualization and CSV export.`

## Chore Description

Create a new Order Analysis page (`/orders/analysis`) that displays daily order metrics with channel breakdown. The page should show:

1. **Summary Cards**: Total Revenue, Total Orders, and Average Order Value (AOV)
2. **Interactive Chart**: Stacked bar chart showing revenue by channel with dates on x-axis, plus an optional line overlay for order count trends
3. **Filters**: Date range picker (default 7-day rolling window) and Channel filter (TOL/MKP/All)
4. **Export**: CSV download functionality with daily breakdown by channel

### Channel Breakdown Requirements
- **TOL (Tops Online)**: Standard delivery, Express delivery, Click & Collect
- **MKP (Marketplace)**: Shopee, Lazada

### Data Source
- Use existing order data from `/api/orders/external/route.ts`
- Apply GMT+7 timezone standards (same as executive dashboard)
- Reference chart components in `src/components/ui/chart.tsx`
- Use currency utilities from `src/lib/currency-utils.ts`

### Expected Chart Layout
- **Y-axis (primary)**: Revenue in Thai Baht (฿)
- **X-axis**: Dates (7-day rolling window)
- **Stacked bars**: Each channel type as a different color
- **Legend**: Showing all channel categories

### Sample CSV Export Structure
```csv
date,channel,orders,revenue
2025-01-08,TOL-Standard,150,45000
2025-01-08,TOL-Express,80,32000
2025-01-08,TOL-ClickAndCollect,45,13500
2025-01-08,MKP-Shopee,200,50000
2025-01-08,MKP-Lazada,120,36000
```

## Relevant Files

### Existing Files to Reference

- **`app/api/orders/external/route.ts`**: External orders API with date filtering and mock data fallback - serves as the primary data source for fetching orders within date ranges
- **`src/components/ui/chart.tsx`**: Recharts wrapper components (ChartContainer, ChartTooltip, ChartLegend) - provides the foundation for building the stacked bar chart
- **`src/lib/currency-utils.ts`**: Thai Baht formatting utilities (`formatCurrencyInt`, `formatCurrency`, `formatCurrencyShort`) - ensures consistent currency display across the page
- **`src/lib/export-utils.ts`**: CSV export utilities (`exportToCSV`, `exportOrderAnalysisToCSV`) - provides export functionality patterns to follow
- **`src/components/executive-dashboard/utils.ts`**: Data aggregation utilities (`calculateDailyOrders`, `calculateChannelVolume`) - reference for similar aggregation patterns needed for order analysis
- **`src/lib/utils.ts`**: GMT+7 timezone utilities (`getGMT7Time`, `formatGMT7Time`) - ensures all date operations use the correct timezone
- **`src/lib/channel-utils.ts`**: Channel normalization (`mapLegacyChannel`, `normalizeChannel`) - handles channel value standardization for consistent grouping
- **`app/orders/page.tsx`**: Example orders page structure using DashboardShell pattern - demonstrates the standard layout pattern to follow
- **`src/components/dashboard-shell.tsx`**: Main dashboard layout wrapper - provides consistent page layout and navigation

### New Files to Create

#### `app/orders/analysis/page.tsx`
- Next.js App Router page component for Order Analysis
- Server component that wraps the OrderAnalysisView client component

#### `src/components/order-analysis-view.tsx`
- Client component containing all the analysis logic and UI
- Manages state for filters, data fetching, and chart rendering
- Handles CSV export functionality

#### `src/lib/order-analysis-utils.ts` (optional)
- Utility functions for aggregating order analysis data
- Functions for channel grouping, daily aggregation, and AOV calculation
- Data transformation functions for chart and export formats

#### `src/hooks/use-order-analysis.ts`
- Custom React hook for fetching and processing order analysis data
- Handles API calls to `/api/orders/external` with date filtering
- Returns processed data in the format needed by the analysis view

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Order Analysis Data Utilities
- Create `src/lib/order-analysis-utils.ts` with the following functions:
  - `aggregateOrdersByDayAndChannel(orders, dateFrom, dateTo)`: Groups orders by date and channel, calculating order count and revenue per channel
  - `calculateSummaryMetrics(analysisData)`: Computes total revenue, total orders, and AOV from aggregated data
  - `transformDataForChart(analysisData)`: Converts aggregated data to Recharts format with stacked bar structure
  - `transformDataForExport(analysisData)`: Formats data for CSV export with the required column structure
- Import and use existing utilities: `getGMT7Time`, `safeToISOString` from `src/lib/utils.ts`, `mapLegacyChannel` from `src/lib/channel-utils.ts`
- Follow the GMT+7 timezone standard: all date grouping should use Asia/Bangkok timezone
- Test utility functions with sample data to ensure correct aggregation

### 2. Create Order Analysis Hook
- Create `src/hooks/use-order-analysis.ts` with:
  - `useOrderAnalysis(dateFrom, dateTo, channelFilter)` hook that fetches orders from `/api/orders/external/route.ts`
  - State management for loading, error, and data states
  - Integration with `aggregateOrdersByDayAndChannel` utility for data processing
  - Automatic data refresh when date range or channel filter changes
- Handle API errors with graceful fallback to empty data
- Log data fetching and processing for debugging (following existing patterns in executive dashboard)

### 3. Create Order Analysis View Component
- Create `src/components/order-analysis-view.tsx` client component with:
  - **Summary Cards Section**: Three cards displaying Total Revenue (฿), Total Orders, and Average Order Value
  - **Filters Section**: Date range picker (with 7-day default) and Channel dropdown (All/TOL/MKP)
  - **Chart Section**: Stacked bar chart using `ChartContainer` from `src/components/ui/chart.tsx`
  - **Export Button**: Triggers CSV download with formatted data
- Use mobile-first responsive design: grid-cols-1 on mobile, lg:grid-cols-3 for desktop
- Apply existing Tailwind CSS patterns from dashboard-shell.tsx
- Integrate `useOrderAnalysis` hook for data fetching
- Handle loading states with skeletons, empty states, and error messages

### 4. Implement Chart Visualization
- Import required chart components: `ChartContainer`, `ChartTooltip`, `ChartLegend` from `src/components/ui/chart.tsx`
- Import Recharts components: `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `ResponsiveContainer`, `Tooltip`, `Legend`
- Configure chart with:
  - X-axis: Formatted dates (DD/MM format for readability)
  - Y-axis: Revenue in Thai Baht using `formatCurrencyInt` for labels
  - Stacked bars: One bar per channel type (TOL-Standard, TOL-Express, TOL-ClickAndCollect, MKP-Shopee, MKP-Lazada)
  - Custom tooltip using `ChartTooltipContent` for detailed hover information
- Define chart configuration with channel colors matching the app's color scheme
- Ensure chart is responsive on all screen sizes

### 5. Implement CSV Export Functionality
- Create export function in `src/lib/export-utils.ts`:
  - `exportOrderAnalysisToCsv(analysisData, filename)` function
  - Format CSV with columns: date, channel, orders, revenue
  - Apply Thai Baht formatting to revenue values
  - Include BOM (Byte Order Mark) for Excel UTF-8 compatibility
- Add export button to OrderAnalysisView component with Download icon
- Trigger export on button click with current filtered data
- Generate filename with date range: `order-analysis-{dateFrom}-to-{dateTo}.csv`

### 6. Create Analysis Page Route
- Create `app/orders/analysis/page.tsx` as a Next.js server component
- Wrap `OrderAnalysisView` in `DashboardShell` layout
- Add page header with "Order Analysis" heading and descriptive text
- Ensure consistent styling with other pages in the app
- Verify the page is accessible at `/orders/analysis` route

### 7. Add Navigation Link (Optional Enhancement)
- Update navigation component to include link to Order Analysis page
- Add menu item in `src/components/side-nav.tsx` or `src/components/bottom-nav.tsx`
- Use appropriate icon (e.g., BarChart3 or TrendingUp from lucide-react)
- Position logically near the Orders management link

### 8. Implement Date Range and Channel Filtering
- Add date picker component for selecting date range (use existing patterns from OrderManagementHub if available)
- Default to 7-day rolling window (today - 7 days to today)
- Add channel filter dropdown with options: All Channels, TOL Only, MKP Only
- Ensure filters trigger data refetch through the `useOrderAnalysis` hook
- Update URL query parameters when filters change for shareable links

### 9. Style and Polish
- Apply consistent styling using the enterprise color scheme
- Ensure proper spacing, borders, and shadows matching existing dashboard
- Add hover effects and transitions for interactive elements
- Test responsive behavior on mobile, tablet, and desktop breakpoints
- Verify all text is readable and properly aligned
- Add loading skeletons for better perceived performance

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# Type check to ensure no TypeScript errors
npm run build

# Development server - verify page loads at /orders/analysis
npm run dev

# Lint check - ensure code follows project standards
npm run lint

# Verify exports and imports are correct
grep -r "useOrderAnalysis" src/components/
grep -r "order-analysis-utils" src/lib/
```

## Notes

### Channel Mapping Strategy
The application uses a three-channel standard (`web`, `lazada`, `shopee`) as defined in `src/lib/channel-utils.ts`. For the Order Analysis page, we need to map these to the business-friendly channel names:
- **TOL (Tops Online)**: Maps to `web` channel, subdivided by delivery type (Standard, Express, Click & Collect)
- **MKP-Shopee**: Maps to `shopee` channel
- **MKP-Lazada**: Maps to `lazada` channel

The delivery type information should be extracted from the `deliveryTypeCode` field in orders if available, or determined from order metadata.

### Data Volume Considerations
- The external API returns paginated data (default page size may be limited)
- For accurate 7-day analysis, may need to fetch multiple pages
- Consider implementing a "fetch all pages" mode similar to OrderManagementHub
- Mock data fallback is already handled by the external API route

### Performance Optimization
- Use React.memo for chart components to prevent unnecessary re-renders
- Implement debouncing for date range picker changes
- Cache analysis results for unchanged filter combinations
- Consider virtualizing the chart if displaying more than 30 days of data

### Timezone Handling
- All date operations MUST use GMT+7 (Asia/Bangkok) timezone
- Use `getGMT7Time()` and `safeToISOString()` for date conversions
- Date labels should display in DD/MM format for Thai users
- CSV export dates should use ISO format (YYYY-MM-DD) for sorting

### Mobile-First Design
- Summary cards: grid-cols-1 on mobile, lg:grid-cols-3 on desktop
- Chart height: minimum 300px on mobile, 400px on desktop
- Filters: stacked vertically on mobile, horizontal row on desktop
- Export button: full width on mobile, auto width on desktop
