# Chore: Improve Order Dashboard Chart Legend Visibility

## Metadata
adw_id: `410601b0`
prompt: `Improve Order Dashboard charts at app/orders/analysis/page.tsx and src/components/order-analysis-view.tsx:
1. Ensure chart legends (TOL, MKP) are fully visible and not cut off at the bottom
2. Add consistent padding/margin below charts for legend visibility
3. Consider moving legends to the top-right of each chart for better visibility
4. Ensure Revenue by Channel chart is fully visible without scrolling
Files: src/components/order-analysis/stacked-order-chart.tsx, src/components/order-analysis/stacked-revenue-chart.tsx`

## Chore Description
The Order Dashboard charts have legend visibility issues where TOL and MKP legends are getting cut off at the bottom of the chart containers. This chore will:
1. Move chart legends to the top-right position within the card header area for better visibility
2. Increase chart container bottom margins to ensure legends are fully visible when using bottom position
3. Ensure consistent styling and spacing across both Orders by Channel and Revenue by Channel charts
4. Make the Revenue by Channel chart fully visible without requiring scrolling

The main issue is that the current `h-80` (320px) chart container height combined with the Legend component inside ResponsiveContainer doesn't leave enough room for the legend when positioned at bottom.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-analysis-view.tsx** - Main component containing both charts with inline Legend components. The charts use Recharts Legend with custom content renderer but don't have proper `wrapperStyle` positioning. This is the PRIMARY file to modify.

- **src/components/order-analysis/stacked-order-chart.tsx** - Standalone stacked order chart component using ChannelLegend as a separate component outside ResponsiveContainer. Uses `mt-4` class for legend spacing.

- **src/components/order-analysis/stacked-revenue-chart.tsx** - Standalone stacked revenue chart component using ChannelLegend as a separate component outside ResponsiveContainer. Uses `mt-4` class for legend spacing.

- **src/components/order-analysis/channel-legend.tsx** - Shared ChannelLegend component used by standalone chart components. Not used by main order-analysis-view.tsx.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Orders by Channel Chart in order-analysis-view.tsx
- Move the Legend to top-right position by adding `verticalAlign="top"` and `align="right"` props
- Add `wrapperStyle={{ paddingBottom: '10px' }}` to create space between legend and chart
- Increase chart margin top from 20 to 30 to accommodate the legend: `margin={{ top: 30, right: 30, left: 20, bottom: 5 }}`
- Update the custom legend content to use `pb-0` instead of `pt-4` since it will be at the top

### 2. Update Revenue by Channel Chart in order-analysis-view.tsx
- Apply the same legend positioning changes as the Orders chart
- Move Legend to top-right: `verticalAlign="top"` and `align="right"`
- Add `wrapperStyle={{ paddingBottom: '10px' }}`
- Update chart margin: `margin={{ top: 30, right: 30, left: 20, bottom: 5 }}`
- Update custom legend content padding

### 3. Update Standalone Chart Components (optional consistency)
- Update stacked-order-chart.tsx: Move ChannelLegend from after the chart to the CardHeader area
- Update stacked-revenue-chart.tsx: Move ChannelLegend from after the chart to the CardHeader area
- Use flexbox in CardHeader to position title left and legend right

### 4. Validate Chart Visibility
- Run the development server and navigate to `/orders/analysis`
- Verify both TOL and MKP legends are fully visible without cut-off
- Verify Revenue by Channel chart is fully visible without scrolling
- Test with different screen sizes to ensure responsive behavior

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript compilation errors
- `pnpm dev` - Start dev server and manually verify at http://localhost:3000/orders/analysis
  - Check that TOL and MKP legends appear in top-right of each chart
  - Verify legends are not cut off
  - Scroll page to verify Revenue by Channel chart is fully visible
  - Test window resizing for responsive behavior

## Notes
- The main order-analysis-view.tsx file uses inline Recharts Legend component with custom content, while the standalone chart components use the separate ChannelLegend component
- Recharts Legend supports `verticalAlign` (top/middle/bottom) and `align` (left/center/right) props
- The `wrapperStyle` prop on Legend allows custom CSS styling for positioning
- Moving legends to top-right is a common UX pattern that ensures visibility regardless of chart data height
- The standalone chart components may not be actively used if order-analysis-view.tsx contains all the chart rendering logic inline
