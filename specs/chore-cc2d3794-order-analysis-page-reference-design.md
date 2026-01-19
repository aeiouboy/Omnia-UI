# Chore: Fix Order Analysis Page to Match Reference Design

## Metadata
adw_id: `cc2d3794`
prompt: `Fix Order Dashboard (Order Analysis) page to match reference design with 3 KPI cards, channel dropdown filter, correct chart titles, and TOL/MKP only channels`

## Chore Description
The Order Analysis page (`/order-analysis`) has multiple issues that prevent it from matching the reference design:

1. **NO DATA DISPLAYED** - Charts show 'No data available' with 0 orders and ฿0 revenue because the API returns empty data and the mock data fallback has issues with pagination and date filtering
2. **MISSING KPI CARD** - Currently only 2 KPI cards (Total Orders, Total Revenue), but reference design requires 3 cards including 'Average Order Value' (Total Revenue / Total Orders)
3. **WRONG UI** - Page uses Tabs component (Orders/Revenue/Both) but should use 'All Channels' dropdown filter instead
4. **WRONG CHART TITLES** - Currently shows 'Order Summary Per Day' / 'Revenue Summary Per Day' but should be 'Orders by Channel' / 'Revenue by Channel'
5. **TOO MANY CHANNELS** - Legend shows 6 channels (TOL, MKP, QC, Grab, Line Man, Gokoo) but should only show 2 channels: TOL (blue) and MKP (orange for orders, green for revenue)

**Target Reference Design:**
- 3 KPI cards: Total Revenue (฿117,699), Total Orders (149), Average Order Value (฿790)
- 'All Channels' dropdown filter replacing tabs
- Chart titles: 'Orders by Channel' and 'Revenue by Channel'
- Only TOL and MKP channels in stacked bars
- Mock data: ~149 orders, ~฿117,699 total revenue over 7 days

## Relevant Files
Use these files to complete the chore:

- **app/order-analysis/page.tsx** - Main page component with KPI cards and view controls
  - Add 3rd KPI card for Average Order Value
  - Replace Tabs component with Channel dropdown filter
  - Update card subtitles to match reference design

- **src/components/order-analysis/stacked-order-chart.tsx** - Order count stacked bar chart
  - Change title from 'Order Summary Per Day' to 'Orders by Channel'
  - Remove QC bar, keep only TOL and MKP

- **src/components/order-analysis/stacked-revenue-chart.tsx** - Revenue stacked bar chart
  - Change title from 'Revenue Summary Per Day' to 'Revenue by Channel'
  - Remove QC bar, keep only TOL and MKP
  - Update MKP color to green (#16a34a) for revenue chart

- **src/components/order-analysis/channel-legend.tsx** - Legend component
  - Filter to show only TOL and MKP channels
  - Update MKP color for revenue chart context (if applicable)

- **src/types/order-analysis.ts** - Type definitions
  - Update CHANNEL_NAMES to only include TOL and MKP
  - Update CHANNEL_COLORS for the 2-channel scheme

- **src/hooks/use-order-summary.ts** - Data fetching hook
  - Ensure getChannelGroup maps all channels to either TOL or MKP only
  - Remove QC grouping logic

- **app/api/orders/summary/route.ts** - API endpoint with mock data fallback
  - Fix mock data generation to return proper pagination structure
  - Generate ~149 orders with ~฿117,699 total revenue over 7 days
  - Ensure orders are distributed across TOL and MKP channels only
  - Fix date distribution to match requested date range

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Type Definitions and Channel Configuration
- In `src/types/order-analysis.ts`:
  - Update `CHANNEL_NAMES` to only include `['TOL', 'MKP']`
  - Update `CHANNEL_COLORS` to show TOL as blue (#0ea5e9) and MKP as orange (#f97316) for orders
  - Add separate color constant for revenue MKP: green (#16a34a)
  - Update `ChannelDailySummary` interface to remove QC field
  - Update `RevenueDailySummary` interface to remove QC field

### 2. Fix API Mock Data Generation
- In `app/api/orders/summary/route.ts`:
  - Update mock data generation to create exactly ~149 orders
  - Set total revenue to approximately ฿117,699 (average ~฿790 per order)
  - Distribute orders across only 2 channels: 'TOL' (60%) and 'MKP' (40%)
  - Distribute orders evenly across the 7-day date range
  - Ensure pagination structure includes `hasNext: false` on the final page
  - Ensure mock data respects dateFrom and dateTo query parameters

### 3. Update Channel Grouping Logic in Hook
- In `src/hooks/use-order-summary.ts`:
  - Update `getChannelGroup` to map all channels to only TOL or MKP:
    - TOL: Web, TOL, Tops Online, and unknown channels
    - MKP: Grab, Lineman, Gokoo, Shopee, Lazada, QC, Marketplace
  - Remove QC from the orderCounts and revenueCounts initialization
  - Remove all references to QC, Grab, Line Man, Gokoo in daily buckets

### 4. Update Channel Legend Component
- In `src/components/order-analysis/channel-legend.tsx`:
  - Modify to only display TOL and MKP
  - Add prop to support different MKP color for revenue context (optional)

### 5. Update Stacked Order Chart
- In `src/components/order-analysis/stacked-order-chart.tsx`:
  - Change title from 'Order Summary Per Day' to 'Orders by Channel'
  - Remove the QC Bar component
  - Apply radius `[4, 4, 0, 0]` to MKP bar (top of stack)
  - Verify TOL uses blue (#0ea5e9) and MKP uses orange (#f97316)

### 6. Update Stacked Revenue Chart
- In `src/components/order-analysis/stacked-revenue-chart.tsx`:
  - Change title from 'Revenue Summary Per Day' to 'Revenue by Channel'
  - Remove the QC Bar component
  - Apply radius `[4, 4, 0, 0]` to MKP bar (top of stack)
  - Update MKP color to green (#16a34a) for revenue chart specifically

### 7. Update Order Analysis Page Layout
- In `app/order-analysis/page.tsx`:
  - Replace Tabs component with Select dropdown for channel filter:
    - Options: 'All Channels', 'TOL', 'MKP'
    - Filter chart data based on selection
  - Add 3rd KPI card for 'Average Order Value':
    - Value: `฿${Math.round(data.totalRevenue / data.totalOrders).toLocaleString()}`
    - Subtitle: 'per order'
    - Handle division by zero (show ฿0 if totalOrders is 0)
  - Update grid layout to `grid-cols-1 sm:grid-cols-3` for 3 cards
  - Keep existing date picker and export functionality
  - Remove viewMode state and Tabs imports

### 8. Validate Implementation with Playwright MCP
- Navigate to `http://localhost:3000/order-analysis`
- Take screenshot to verify:
  - 3 KPI cards display with correct values (~149 orders, ~฿117,699 revenue, ~฿790 AOV)
  - Channel dropdown shows 'All Channels' option
  - Charts display 'Orders by Channel' and 'Revenue by Channel' titles
  - Stacked bars show only TOL (blue) and MKP (orange/green) colors
  - Data is populated (not showing empty state)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript or build errors
- `pnpm lint` - Verify no linting issues
- Use Playwright MCP `browser_navigate` to `http://localhost:3000/order-analysis`
- Use Playwright MCP `browser_snapshot` to verify page structure
- Use Playwright MCP `browser_take_screenshot` to capture visual state
- Verify KPI cards show: Total Revenue, Total Orders, Average Order Value
- Verify chart titles are 'Orders by Channel' and 'Revenue by Channel'
- Verify legend shows only TOL and MKP channels
- Verify stacked bars display data (not empty state)

## Notes
- The mock data generation is key to fixing the "No data available" issue since the real API may not return data in development
- MKP color differs between charts: orange (#f97316) for orders, green (#16a34a) for revenue per reference design
- Average Order Value calculation must handle edge case where totalOrders is 0 to avoid division by zero
- Channel dropdown filter is UI-only - it filters the displayed chart data, not the API request
- Existing date picker and export functionality should remain unchanged
- The reference shows ~149 orders over 7 days, averaging ~21 orders per day
