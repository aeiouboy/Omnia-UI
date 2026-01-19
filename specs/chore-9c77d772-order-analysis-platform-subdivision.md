# Chore: Order Analysis Platform Subdivision

## Metadata
adw_id: `9c77d772`
prompt: `Fix Order Analysis page to show detailed channel subdivision as originally specified. Current Issue: The page only shows high-level channels (TOL, MKP, QC) but should show platform subdivision: TOL should split into: TOL-Standard, TOL-Express, TOL-ClickAndCollect; MKP should split into: MKP-Shopee, MKP-Lazada. Required Changes: 1. Update src/hooks/use-order-analysis.ts to aggregate by platform, not just channel. 2. Update src/components/order-analysis-view.tsx chart to show 5 stacked bars. 3. Update src/types/order-analysis.ts to include platform-level fields. 4. Update CSV export in src/lib/export-utils.ts to include platform breakdown. 5. Keep Summary Cards unchanged. 6. Update chart legend to show all 5 platform categories. Reference existing channel-utils.ts for delivery type mapping. Maintain GMT+7 timezone standards and mobile-first responsive design.`

## Chore Description
The Order Analysis page currently displays only high-level channel aggregation (TOL, MKP, QC) but should show detailed platform subdivision to provide better visibility into order distribution across different platforms. This enhancement will:

1. **TOL Subdivision**: Split TOL channel into three delivery type platforms:
   - TOL-Standard: Standard Home Delivery (deliveryTypeCode: RT-HD-STD)
   - TOL-Express: Express Home Delivery (deliveryTypeCode: RT-HD-EXP)
   - TOL-ClickAndCollect: Click & Collect (deliveryTypeCode: RT-CC-STD, RT-CC-EXP)

2. **MKP Subdivision**: Split MKP channel into two marketplace platforms:
   - MKP-Shopee: Shopee marketplace (channel: shopee)
   - MKP-Lazada: Lazada marketplace (channel: lazada)

3. **QC Channel**: Keep QC consolidated (no subdivision needed)

The changes affect the data aggregation logic, type definitions, chart visualization, and CSV export format while preserving the existing summary cards and filtering functionality.

## Relevant Files
Use these files to complete the chore:

### Core Files to Modify

- **src/types/order-analysis.ts** - Type definitions for order analysis data
  - Change from 3-channel (TOL, MKP, QC) to 5-platform model
  - Update ChannelDailySummary and RevenueDailySummary interfaces
  - Update CHANNEL_COLORS constant with 5 platform colors
  - Update OrderAnalysisExportRow interface for platform breakdown
  - Add new PlatformName type

- **src/hooks/use-order-analysis.ts** - Data aggregation hook
  - Update normalizeChannelName function to return platform-level categories
  - Add deliveryTypeCode extraction logic for TOL subdivision
  - Update aggregateOrdersByDateAndChannel to aggregate by 5 platforms instead of 3 channels
  - Modify initialization and aggregation logic to handle new platform structure

- **src/components/order-analysis-view.tsx** - Chart visualization component
  - Update chart to display 5 stacked bars instead of 3
  - Modify chartConfig to include all 5 platform colors
  - Update Legend component to show all 5 platform categories
  - Adjust filter logic to work with platform subdivision
  - Keep Summary Cards unchanged (Total Revenue, Total Orders, AOV)

- **src/lib/export-utils.ts** - CSV export functionality
  - Update exportOrderAnalysisByChannelToCSV function
  - Change columns from date,channel,orders,revenue to date,channel,platform,orders,revenue
  - Modify export row generation to include platform field
  - Update filename generation if needed

### Reference Files

- **src/lib/channel-utils.ts** - Channel mapping utilities
  - Reference for understanding channel normalization (web, lazada, shopee)
  - Contains mapLegacyChannel function for standard channel names

- **src/components/order-badges.tsx** - Delivery type badge mappings
  - Contains getDeliveryTypeCodeLabel function for delivery type codes
  - Reference for delivery type code values (RT-HD-STD, RT-HD-EXP, RT-CC-STD, RT-CC-EXP)
  - Useful for understanding delivery type categorization

- **src/components/order-management-hub.tsx** - Order data structure
  - Contains Order interface with deliveryTypeCode field
  - Reference for understanding order data structure
  - Contains DeliveryTypeCode type definition

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Type Definitions
- Open `src/types/order-analysis.ts`
- Replace `CHANNEL_NAMES` array with 5 platform names: `['TOL-Standard', 'TOL-Express', 'TOL-ClickAndCollect', 'MKP-Shopee', 'MKP-Lazada']`
- Update `CHANNEL_COLORS` constant to include 5 platform colors:
  - TOL-Standard: Blue (#0ea5e9)
  - TOL-Express: Orange (#f97316)
  - TOL-ClickAndCollect: Emerald (#10b981)
  - MKP-Shopee: Purple (#a855f7)
  - MKP-Lazada: Pink (#ec4899)
- Update `ChannelDailySummary` interface to replace TOL, MKP, QC fields with TOL_Standard, TOL_Express, TOL_ClickAndCollect, MKP_Shopee, MKP_Lazada
- Update `RevenueDailySummary` interface with same platform fields
- Update `OrderAnalysisExportRow` interface to include platform field
- Add new `PlatformName` type derived from CHANNEL_NAMES

### 2. Update Data Aggregation Logic
- Open `src/hooks/use-order-analysis.ts`
- Rename `normalizeChannelName` function to `normalizePlatformName`
- Update function to extract platform from both channel and deliveryTypeCode:
  - For TOL (web channel): check deliveryTypeCode to determine Standard/Express/ClickAndCollect
    - RT-HD-STD → TOL-Standard
    - RT-HD-EXP → TOL-Express
    - RT-CC-STD or RT-CC-EXP → TOL-ClickAndCollect
    - Default (no deliveryTypeCode) → TOL-Standard
  - For MKP (lazada channel) → MKP-Lazada
  - For MKP (shopee channel) → MKP-Shopee
  - For other channels → default to TOL-Standard
- Update `aggregateOrdersByDateAndChannel` function:
  - Change initialization from `{ TOL: 0, MKP: 0, QC: 0 }` to 5-platform structure
  - Update aggregation to use normalizePlatformName instead of normalizeChannelName
  - Ensure totalOrders and totalRevenue calculations sum all 5 platforms

### 3. Update Chart Visualization
- Open `src/components/order-analysis-view.tsx`
- Update `chartConfig` constant to include all 5 platforms with colors from CHANNEL_COLORS
- Modify Bar chart rendering:
  - Replace 3 Bar components (TOL, MKP, QC) with 5 Bar components for each platform
  - Use stackId="revenue" for all bars to maintain stacking
  - Apply radius={[4, 4, 0, 0]} only to the top-most bar (MKP-Lazada)
- Update Legend component to display all 5 platform categories
- Ensure channelFilter logic works with new platform structure:
  - When "TOL" selected: show TOL-Standard, TOL-Express, TOL-ClickAndCollect
  - When "MKP" selected: show MKP-Shopee, MKP-Lazada
  - When "all" selected: show all 5 platforms
- Keep Summary Cards section unchanged

### 4. Update CSV Export Format
- Open `src/lib/export-utils.ts`
- Locate `exportOrderAnalysisByChannelToCSV` function
- Update CSV header from `date,channel,orders,revenue` to `date,channel,platform,orders,revenue`
- Modify row generation to include platform field:
  - Add platform column between channel and orders
  - Example format: `2025-01-08,TOL,Standard,150,45000`
- Update TypeScript type for data parameter to include platform field
- Test CSV export to ensure proper formatting with BOM for UTF-8

### 5. Update Component Imports
- In `src/components/order-analysis-view.tsx`, update imports from `@/types/order-analysis`:
  - Ensure ChannelDailySummary and RevenueDailySummary are imported
  - Import PLATFORM_COLORS (if renamed from CHANNEL_COLORS) or update references
- In `src/hooks/use-order-analysis.ts`, update imports to match new type definitions
- Verify all type references use the new platform-level fields

### 6. Validate and Test
- Run TypeScript compilation: `pnpm build` to check for type errors
- Start development server: `pnpm dev`
- Navigate to Order Analysis page
- Verify chart displays 5 stacked bars with correct colors
- Verify legend shows all 5 platform categories
- Test channel filter dropdown (all/TOL/MKP)
- Test date range picker functionality
- Test CSV export and verify format: date,channel,platform,orders,revenue
- Verify summary cards still display correct totals
- Check mobile responsive design (chart should be readable on mobile)
- Verify GMT+7 timezone standards are maintained

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# TypeScript compilation check
pnpm build

# Development server test
pnpm dev

# Linting check
pnpm lint
```

Manual validation steps:
1. Open Order Analysis page at `/orders/analysis`
2. Verify chart shows 5 stacked bars (TOL-Standard, TOL-Express, TOL-ClickAndCollect, MKP-Shopee, MKP-Lazada)
3. Check chart legend displays all 5 platforms with correct colors
4. Test channel filter: select "TOL Only" and verify 3 TOL platforms display
5. Test channel filter: select "MKP Only" and verify 2 MKP platforms display
6. Click "Export CSV" and verify file contains columns: date,channel,platform,orders,revenue
7. Verify summary cards (Total Revenue, Total Orders, AOV) still calculate correctly
8. Test on mobile viewport (375px width) and verify chart is responsive

## Notes

### Delivery Type Code Mapping
The TOL subdivision uses deliveryTypeCode field from order data:
- **RT-HD-STD**: Standard Home Delivery → TOL-Standard
- **RT-HD-EXP**: Express Home Delivery → TOL-Express
- **RT-CC-STD**: Standard Click & Collect → TOL-ClickAndCollect
- **RT-CC-EXP**: Express Click & Collect → TOL-ClickAndCollect

If deliveryTypeCode is missing for TOL orders, default to TOL-Standard.

### Channel Mapping
The MKP subdivision uses the normalized channel field:
- **shopee** channel → MKP-Shopee
- **lazada** channel → MKP-Lazada

### Color Scheme
Use distinct colors for each platform to ensure visual clarity:
- TOL variants should share blue tones but be distinguishable (Standard: sky, Express: orange, ClickAndCollect: emerald)
- MKP variants should have distinct colors (Shopee: purple, Lazada: pink)

### Backward Compatibility
- Summary Cards calculations remain unchanged (sum all platforms)
- Date range filtering logic remains unchanged
- Filter dropdown options remain "All Channels", "TOL Only", "MKP Only"
- Mobile-first responsive design must be maintained

### Data Structure
The order data from `/api/orders/summary` includes:
- `channel`: Normalized channel (web, lazada, shopee)
- `deliveryTypeCode`: Delivery type code for TOL subdivision
- `order_date`: Date in GMT+7 timezone
- `total_amount`: Order revenue in Thai Baht
