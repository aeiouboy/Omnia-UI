# Chore: Order Analysis - Two Channel Stacked Bars (TOL & MKP)

## Metadata
adw_id: `c9d03cae`
prompt: `Update Order Analysis page to show TWO metrics with 2-channel stacked bars (TOL and MKP only). Orders chart FIRST, then Revenue chart SECOND.`

## Chore Description

**Current Issue:**
- The Order Analysis page currently displays 5 platform subdivisions (TOL-Standard, TOL-Express, TOL-ClickAndCollect, MKP-Shopee, MKP-Lazada)
- Only shows Revenue chart, missing the Orders chart
- Overly granular platform subdivision via deliveryTypeCode

**Required Changes:**
1. Reduce from 5 platforms to 2 channels (TOL and MKP only)
2. Add new "Orders by Channel" chart as the FIRST chart card
3. Move existing "Revenue by Channel" chart to SECOND position
4. Remove deliveryTypeCode subdivision logic
5. Map channels: 'web' → TOL, 'shopee'|'lazada' → MKP
6. Update export CSV to use 2 channels instead of 5 platforms

**Color Scheme:**
- TOL: Blue (#0ea5e9)
- MKP: Purple (#a855f7)

## Relevant Files

### Files to Modify

1. **src/types/order-analysis.ts**
   - Change `CHANNEL_COLORS` from 5 platforms to 2 channels
   - Change `CHANNEL_NAMES` from 5 platforms to 2 channels
   - Update `ChannelDailySummary` interface fields (TOL, MKP only)
   - Update `RevenueDailySummary` interface fields (TOL, MKP only)
   - Keep `OrderAnalysisData` interface (already has separate arrays for orders and revenue)

2. **src/hooks/use-order-analysis.ts**
   - Rename `normalizePlatformName` to `normalizeChannelName`
   - Simplify logic: map 'web' → TOL, 'shopee'|'lazada' → MKP
   - Remove deliveryTypeCode parameter and subdivision logic
   - Update `aggregateOrdersByDateAndChannel` to aggregate by 2 channels
   - Initialize data structure with TOL and MKP fields only

3. **src/components/order-analysis-view.tsx**
   - Add NEW "Orders by Channel" chart card as FIRST card
   - Move existing "Revenue by Channel" chart to SECOND position
   - Both charts show 2 stacked bars (TOL, MKP)
   - Update chart config for 2 channels
   - Update legend to show 2 channels with correct colors
   - Remove platform subdivision references
   - Update filter logic for 2 channels

4. **src/lib/export-utils.ts**
   - Update `exportOrderAnalysisByChannelToCSV` function
   - Change CSV columns to: date,channel,orders,revenue
   - Export 2 channels (TOL, MKP) instead of 5 platforms

## Step by Step Tasks

### 1. Update Type Definitions
**File:** `src/types/order-analysis.ts`

- Replace `CHANNEL_COLORS` with 2 channels:
  - TOL: '#0ea5e9' (Sky Blue)
  - MKP: '#a855f7' (Purple)
- Replace `CHANNEL_NAMES` with: ['TOL', 'MKP']
- Update `ChannelDailySummary` interface:
  - Remove: 'TOL-Standard', 'TOL-Express', 'TOL-ClickAndCollect', 'MKP-Shopee', 'MKP-Lazada'
  - Add: 'TOL' and 'MKP' fields
- Update `RevenueDailySummary` interface:
  - Remove: 'TOL-Standard', 'TOL-Express', 'TOL-ClickAndCollect', 'MKP-Shopee', 'MKP-Lazada'
  - Add: 'TOL' and 'MKP' fields
- Update `OrderAnalysisExportRow` interface if needed

### 2. Update Data Aggregation Hook
**File:** `src/hooks/use-order-analysis.ts`

- Rename `normalizePlatformName` function to `normalizeChannelName`
- Simplify channel mapping logic:
  - 'web' channel → 'TOL'
  - 'shopee' or 'lazada' channel → 'MKP'
  - Remove `deliveryTypeCode` parameter entirely
- Update `aggregateOrdersByDateAndChannel` function:
  - Initialize with 2-channel structure: TOL, MKP
  - Remove 5-platform initialization
  - Aggregate orders by 2 channels only
- Update all references from 5 platforms to 2 channels

### 3. Update View Component - Add Orders Chart
**File:** `src/components/order-analysis-view.tsx`

- Add NEW chart card for "Orders by Channel" as the FIRST chart card
  - Use `dailyOrdersByChannel` data
  - Display 2 stacked bars: TOL and MKP
  - Same layout and styling as Revenue chart
  - Chart height: h-80
  - Responsive container
  - Legend showing 2 channels with correct colors
- Update `filteredData` useMemo for 2 channels:
  - Remove platform subdivision logic
  - Filter by TOL or MKP channels
- Update `handleExport` function:
  - Export 2 channels instead of 5 platforms
  - CSV format: date,channel,orders,revenue

### 4. Update View Component - Reorganize Revenue Chart
**File:** `src/components/order-analysis-view.tsx`

- Move existing "Revenue by Channel" chart to SECOND position (below Orders chart)
- Update chart to use 2 channels (TOL, MKP)
- Remove 5-platform bar references
- Add 2-channel bars:
  - TOL bar (blue)
  - MKP bar (purple) with radius
- Update chart config for 2 channels
- Update legend to show TOL and MKP only

### 5. Update Export Utility
**File:** `src/lib/export-utils.ts`

- Update `exportOrderAnalysisByChannelToCSV` function
- Change CSV header from "date,channel,platform,orders,revenue" to "date,channel,orders,revenue"
- Remove platform column logic
- Export data by 2 channels (TOL, MKP)
- Each row: date, channel name, orders count, revenue amount

### 6. Update Channel Filter Logic
**File:** `src/components/order-analysis-view.tsx`

- Update `ChannelFilter` type if needed (keep "all" | "TOL" | "MKP")
- Simplify filter logic for 2 channels:
  - When "TOL" selected: show TOL data only
  - When "MKP" selected: show MKP data only
  - When "all" selected: show both TOL and MKP
- Remove platform subdivision filtering

### 7. Clean Up References
**Files:** Multiple

- Remove any remaining references to 5 platforms
- Remove deliveryTypeCode logic from order analysis flow
- Update comments and documentation
- Ensure consistency across all files

## Validation Commands

```bash
# Build the project to check for TypeScript errors
npm run build

# Start development server to test changes
npm run dev

# Run ESLint to check for code quality issues
npm run lint

# Check for TypeScript errors
npx tsc --noEmit
```

**Manual Validation Steps:**
1. Navigate to Order Analysis page
2. Verify TWO chart cards are displayed:
   - FIRST: "Orders by Channel" with 2 stacked bars (TOL, MKP)
   - SECOND: "Revenue by Channel" with 2 stacked bars (TOL, MKP)
3. Verify chart colors: TOL (blue), MKP (purple)
4. Verify legend shows 2 channels with correct colors
5. Test date range picker - data should update correctly
6. Test channel filter (All/TOL/MKP)
7. Test Export CSV - verify format: date,channel,orders,revenue
8. Verify no TypeScript errors in console
9. Verify charts render correctly with sample data

## Notes

**Channel Mapping Logic:**
- `web` channel → TOL (includes all web orders regardless of deliveryTypeCode)
- `shopee` channel → MKP
- `lazada` channel → MKP
- All other channels default to TOL

**Data Structure:**
- Both charts use the same date range
- Orders chart: shows order counts per day
- Revenue chart: shows revenue amounts per day
- Both maintain separate data arrays in `OrderAnalysisData`

**Chart Layout:**
- Each chart card: h-80 height, responsive container
- Stacked bar chart using Recharts
- Tooltip shows individual channel values + total
- Legend centered below chart

**Export Format:**
- CSV with BOM for Excel UTF-8 compatibility
- Columns: date, channel, orders, revenue
- One row per channel per day
- Example:
  ```csv
  date,channel,orders,revenue
  2026-01-14,TOL,150,450000
  2026-01-14,MKP,89,267000
  2026-01-15,TOL,162,486000
  2026-01-15,MKP,95,285000
  ```

**Backward Compatibility:**
- This change breaks backward compatibility with any code expecting 5 platforms
- Update any dependent code or tests accordingly
