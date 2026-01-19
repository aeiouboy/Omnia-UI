# Chore: Order Analysis Page Implementation

## Metadata
adw_id: `CFR08`
prompt: `Implement Order Analysis page with stacked bar chart summary views and CSV export`

## Chore Description
Implement the Order Analysis page featuring two stacked bar charts (Orders/Day and Revenue/Day) aggregated by channel. Include a CSV export function.

## Relevant Files
*   `src/hooks/use-order-summary.ts` (New)
*   `src/components/order-analysis/stacked-revenue-chart.tsx` (Update)
*   `app/order-analysis/page.tsx` (New)
*   `src/types/order-analysis.ts` (Reference)

## Step by Step Tasks

### 1. Implement Data Hook (use-order-summary.ts)
*   Create `src/hooks/use-order-summary.ts`.
*   Implement `fetchOrderSummary` that calls `/api/orders/summary`.
*   Implement `useOrderSummary` hook that:
    *   Accepts `dateFrom` and `dateTo`.
    *   Fetches orders (handling pagination to get all necessary data for the range).
    *   Aggregates data by `date` and `channel`.
    *   Returns `OrderAnalysisData` with `dailyOrdersByChannel` and `dailyRevenueByChannel`.
    *   Handles loading and error states.

### 2. Update Revenue Chart Component
*   Update `src/components/order-analysis/stacked-revenue-chart.tsx`.
*   Replace dummy data with `data` prop of type `RevenueDailySummary[]`.
*   Align channels and colors with `CHANNEL_COLORS` (TOL, MKP, Grab, Line Man, Gokoo).
*   Update Tooltip to show currency correctly.

### 3. Create Order Analysis Page
*   Create `app/order-analysis/page.tsx`.
*   Implement the layout with:
    *   Page Title "Order Analysis".
    *   Date Range Picker (default to last 7 or 30 days).
    *   View Toggle (Orders / Revenue / Both).
    *   Export Button (calling `exportOrderAnalysisToCSV`).
*   Embed `StackedOrderChart` and `StackedRevenueChart` passing the data from the hook.

### 4. Verification
*   Verify charts render with correct stacking.
*   Verify Export generates correct CSV with columns: Date, Total Amount, TOL, MKP, QC (QC = Grab+LineMan+Gokoo).

## Validation Commands
*   `npm run build`
