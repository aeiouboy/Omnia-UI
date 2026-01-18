# Chore: Fix Order Analysis page mock data

## Metadata
adw_id: `cb642103`
prompt: `Fix Order Analysis page mock data - charts showing 'No data available' with all values at 0`

## Chore Description
The Order Analysis page UI was updated correctly but displays NO DATA:
- Total Revenue: ฿0 (should be ~฿117,699)
- Total Orders: 0 (should be ~149)
- Average Order Value: ฿0 (should be ~฿790)
- Both charts show 'No data available for selected period'

**Root Cause Analysis:**
The `/api/orders/summary/route.ts` has mock data generation logic at lines 235-267, but it only triggers when:
1. `process.env.NODE_ENV === 'development'` AND
2. `orders.length === 0` after a successful API response

The problem is that **error responses bypass the mock data generation entirely**:
- Authentication failures (lines 58-78) return empty data arrays directly
- API errors (lines 155-174) return empty data arrays directly
- Server/network errors (lines 207-226) return empty data arrays directly

None of these error paths call `transformToSummary()` where the mock data logic lives. When the external API fails, the response contains `{ success: false, data: { data: [], ... } }` with no mock data.

## Relevant Files
Use these files to complete the chore:

- **app/api/orders/summary/route.ts** - API route that needs mock data fallback in ALL error paths (not just the success path). Lines 58-78, 155-174, 207-226 return empty arrays without triggering mock data generation.
- **src/hooks/use-order-summary.ts** - Client-side hook that consumes the API. Uses `getChannelGroup()` to map channels to TOL/MKP. Validates data structure expectations.
- **src/types/order-analysis.ts** - Type definitions for `OrderSummary`, `ChannelDailySummary`, `RevenueDailySummary`. Mock data must conform to these types.
- **app/order-analysis/page.tsx** - Page component that displays the data. Uses KPI cards and chart components.
- **src/components/order-analysis/stacked-order-chart.tsx** - Chart component that shows empty state when `totalOrders === 0`.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create a dedicated mock data generator function
- Extract mock data generation logic into a reusable function at the top of `route.ts`
- Function signature: `generateMockOrderData(dateFrom: string, dateTo: string): OrderSummary[]`
- Generate exactly 149 orders distributed across the date range
- Target total revenue: ~฿117,699 (average ~฿790 per order)
- Channel distribution: 60% TOL, 40% MKP
- Revenue per order: ฿400-฿1200 range (variable)
- Use deterministic seeding based on date to ensure consistent results

### 2. Update the authentication error path (lines 58-78)
- Add mock data fallback when `process.env.NODE_ENV === 'development'`
- Call `generateMockOrderData()` with dateFrom/dateTo from request params
- Return success response with mock data instead of empty error response
- Log warning: "⚠️ Auth failed, using mock data for development"

### 3. Update the API error path (lines 155-174)
- Add mock data fallback when `process.env.NODE_ENV === 'development'`
- Call `generateMockOrderData()` with dateFrom/dateTo from request params
- Return success response with mock data instead of empty error response
- Log warning: "⚠️ API error, using mock data for development"

### 4. Update the server/network error path (lines 207-226)
- Add mock data fallback when `process.env.NODE_ENV === 'development'`
- Call `generateMockOrderData()` with dateFrom/dateTo from request params
- Return success response with mock data instead of empty error response
- Log warning: "⚠️ Server error, using mock data for development"

### 5. Update the transformToSummary mock data condition
- Keep existing mock data logic for empty API responses
- Ensure it uses the same `generateMockOrderData()` function for consistency
- Remove duplicate logic from lines 248-266

### 6. Validate mock data structure matches type definitions
- Ensure generated orders have all required `OrderSummary` fields:
  - `id`: string
  - `order_no`: string
  - `status`: string (use 'COMPLETED')
  - `channel`: string (alternating TOL/MKP mapped channels)
  - `total_amount`: number (฿400-฿1200)
  - `order_date`: string (ISO format within date range)
  - `sla_info`: object with target_minutes, elapsed_minutes, status

### 7. Validate with Playwright MCP
- Navigate to Order Analysis page at http://localhost:3000/order-analysis
- Take screenshot to verify:
  - Total Orders: ~149
  - Total Revenue: ~฿117,699
  - Average Order Value: ~฿790
  - Both charts show stacked bars for TOL (blue) and MKP (orange/green)
  - No "No data available" messages

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `pnpm dev` - Start development server
- Open http://localhost:3000/order-analysis in browser
- Verify KPI cards show non-zero values (~149 orders, ~฿117,699 revenue, ~฿790 avg)
- Verify both charts display stacked bar data for TOL and MKP channels
- Check browser console for "⚠️" mock data warning messages
- Use Playwright MCP `browser_snapshot` to capture page state

## Notes
- The fix ensures mock data works in development regardless of external API status
- Mock data is ONLY generated in development mode (`process.env.NODE_ENV === 'development'`)
- Production mode will continue to show real API data or appropriate error states
- Channel mapping uses existing `getChannelGroup()` logic in the hook:
  - TOL channels: 'Web', 'TOL', 'Tops Online'
  - MKP channels: 'Shopee', 'Lazada', 'Grab', 'Lineman'
- Revenue variation (฿400-฿1200) creates realistic looking chart data
- Using seeded random (based on index) ensures consistent mock data across refreshes
