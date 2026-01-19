# Chore: Fix Order Analysis Page Export Functionality

## Metadata
adw_id: `9ddd68da`
prompt: `Fix Order Analysis page export functionality (app/order-analysis/page.tsx, src/lib/export-utils.ts). Current issue: Export file cannot be viewed or has incorrect data format. Required export format: CSV/Excel with columns [Date, Channel, Platform, Order Count, Revenue]. Data requirements: (1) Date column in YYYY-MM-DD format, (2) Channel column with values 'TOL' or 'MKP', (3) Platform column with subdivisions - TOL has 'Standard Delivery', 'Express Delivery', 'Click & Collect'; MKP has 'Shopee', 'Lazada', (4) Order Count as integer, (5) Revenue as decimal number. Each row represents one date+channel+platform combination. Example rows: '2026-01-10,TOL,Standard Delivery,3,10771.00' and '2026-01-10,MKP,Shopee,4,16526.00'. The export should aggregate order data by date, channel, and platform subdivision. Check use-order-summary.ts hook for data source and ensure export-utils.ts generates proper file format. Filename pattern: 'order-analysis-{startDate}-to-{endDate}.csv'. Use Playwright MCP to test export button click and verify downloaded file contains correct data structure.`

## Chore Description

The Order Analysis page export functionality is broken with two major issues:

1. **CSV Format Corruption**: The current export uses `toLocaleString()` for formatting the Total Amount column, which adds commas (e.g., "16,885"). These commas are breaking the CSV structure since commas are used as delimiters. Looking at `.playwright-mcp/order-analysis-export-2026-01-18.csv`, rows like `2026-01-12,16,885,13,9` are being parsed as 5 columns instead of 4.

2. **Missing Platform Subdivisions**: The required export format needs granular platform data:
   - **TOL platforms**: Standard Delivery, Express Delivery, Click & Collect
   - **MKP platforms**: Shopee, Lazada

   Currently, the export only has aggregate TOL/MKP counts without platform breakdown.

3. **Incorrect Filename Pattern**: Current filename is `order_analysis_export_{date}` but should be `order-analysis-{startDate}-to-{endDate}.csv`.

The fix requires:
- Updating the mock data generator to include `delivery_type` field for platform subdivision
- Modifying the data aggregation in `use-order-summary.ts` to track platform-level metrics
- Rewriting the `exportOrderAnalysisToCSV` function with proper CSV escaping and new column structure
- Updating `handleExport` in the page component to pass the new data structure

## Relevant Files

- **`app/order-analysis/page.tsx`** - Contains the `handleExport()` function that prepares export data. Currently builds rows with only date, totalAmount, tolOrders, mkpOrders. Needs to aggregate by date+channel+platform.

- **`src/lib/export-utils.ts`** - Contains `exportOrderAnalysisToCSV()` function (lines 393-434). Issue: Uses `toLocaleString()` which adds commas that corrupt CSV. Needs new column structure: Date, Channel, Platform, Order Count, Revenue.

- **`src/hooks/use-order-summary.ts`** - Contains data fetching and aggregation logic. Currently aggregates only by channel (TOL/MKP). Needs to also track platform subdivision (delivery_type/channel source).

- **`app/api/orders/summary/route.ts`** - API endpoint that generates mock data. The `generateMockOrderData()` function (lines 42-84) only includes `channel` field. Needs to add `delivery_type` for platform subdivision.

- **`src/types/order-analysis.ts`** - Type definitions. May need new interfaces for platform-level summary data.

### New Files
- None required - all changes are modifications to existing files

## Step by Step Tasks

### 1. Fix Mock Data Generator to Include Platform Subdivision
- Update `generateMockOrderData()` in `app/api/orders/summary/route.ts`
- Add `delivery_type` field to mock order data
- For TOL channels: randomly assign 'Standard Delivery', 'Express Delivery', or 'Click & Collect'
- For MKP channels: use the channel name itself as platform (Shopee, Lazada, Grab, Lineman)
- Ensure `transformToSummary()` preserves the `delivery_type` field

### 2. Update OrderSummary Interface to Include Platform
- In `app/api/orders/summary/route.ts`, add `delivery_type?: string` to the `OrderSummary` interface
- In `src/types/order-analysis.ts`, add `delivery_type?: string` to the `OrderSummary` interface
- Add new export interface for platform-level data rows

### 3. Create Platform-Level Export Data Structure
- Add new interface `OrderAnalysisExportRow` in `src/types/order-analysis.ts`:
  ```typescript
  interface PlatformExportRow {
    date: string           // YYYY-MM-DD
    channel: 'TOL' | 'MKP'
    platform: string       // e.g., 'Standard Delivery', 'Shopee'
    orderCount: number     // integer
    revenue: number        // decimal
  }
  ```

### 4. Update Export Function in export-utils.ts
- Rewrite `exportOrderAnalysisToCSV()` to accept platform-level data
- New function signature:
  ```typescript
  export function exportOrderAnalysisToCSV(
    data: PlatformExportRow[],
    startDate: string,
    endDate: string
  ): void
  ```
- Use proper CSV escaping for all values (no `toLocaleString()`)
- Headers: `Date,Channel,Platform,Order Count,Revenue`
- Revenue should be formatted as decimal with 2 decimal places (e.g., `10771.00`)
- Filename pattern: `order-analysis-{startDate}-to-{endDate}.csv`

### 5. Update handleExport in Order Analysis Page
- Modify `handleExport()` function in `app/order-analysis/page.tsx`
- Aggregate data by date + channel + platform instead of just date
- Map through `dailyOrdersByChannel` and create rows for each platform
- Use the `dateRange.from` and `dateRange.to` for filename
- Platform mapping logic:
  - TOL: Group by `delivery_type` field (Standard Delivery, Express Delivery, Click & Collect)
  - MKP: Group by source channel (Shopee, Lazada, Grab, Lineman → simplify to Shopee, Lazada)

### 6. Add Platform Aggregation to useOrderSummary Hook
- Extend the data structure in `use-order-summary.ts` to track platform-level breakdown
- Add new aggregation logic to create platform-level daily summaries
- Store in a new field `dailyPlatformBreakdown` or extend existing structures

### 7. Validate Export with Playwright MCP
- Navigate to Order Analysis page at http://localhost:3000/order-analysis
- Click the Export button
- Verify downloaded file exists with correct filename pattern
- Read and validate CSV structure:
  - Correct headers: Date,Channel,Platform,Order Count,Revenue
  - Date in YYYY-MM-DD format
  - Channel values are 'TOL' or 'MKP'
  - Platform values match expected subdivisions
  - Order Count is integer (no commas)
  - Revenue is decimal with 2 decimal places

## Validation Commands

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `pnpm lint` - Ensure no linting errors in modified files
- Use Playwright MCP to:
  1. `mcp__playwright__browser_navigate` to http://localhost:3000/order-analysis
  2. `mcp__playwright__browser_snapshot` to capture page state
  3. `mcp__playwright__browser_click` on Export button
  4. Verify downloaded CSV file in `.playwright-mcp/` directory
  5. Read file and validate structure matches requirements

## Notes

### Platform Subdivision Mapping

**TOL (Tops Online) Platforms:**
- Standard Delivery - Default home delivery
- Express Delivery - 3H Delivery, Next Day, Express
- Click & Collect - Store pickup orders

**MKP (Marketplace) Platforms:**
- Shopee - Orders from Shopee
- Lazada - Orders from Lazada
- (Note: Grab and Lineman from mock data should be mapped to appropriate category or kept as separate platforms)

### CSV Format Considerations

The current bug is that `toLocaleString()` adds thousands separators (commas) which break CSV parsing. The fix must:
1. Use raw numeric values for Order Count
2. Use `toFixed(2)` for Revenue decimal formatting
3. Properly escape any fields that might contain commas (though none should in this case)

### Data Flow

```
API/Mock Data (with delivery_type)
    ↓
useOrderSummary hook (aggregate by date+channel+platform)
    ↓
handleExport (format for export)
    ↓
exportOrderAnalysisToCSV (generate CSV with proper escaping)
    ↓
Download file (order-analysis-{startDate}-to-{endDate}.csv)
```
