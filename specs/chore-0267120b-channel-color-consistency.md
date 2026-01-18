# Chore: Fix Order Analysis Channel Color Consistency

## Metadata
adw_id: `0267120b`
prompt: `Fix Order Analysis charts - channel colors not consistent between charts. The two stacked bar charts use different colors for the same channels: Orders by Channel uses TOL (blue), MKP (orange) while Revenue by Channel uses TOL (blue), MKP (green). MKP should be the same color in both charts for visual consistency.`

## Chore Description
The Order Analysis page displays two stacked bar charts: "Orders by Channel" and "Revenue by Channel". Currently, these charts use inconsistent colors for the MKP (Marketplace) channel:

- **Orders by Channel**: TOL (blue `#0ea5e9`), MKP (orange `#f97316`)
- **Revenue by Channel**: TOL (blue `#0ea5e9`), MKP (green `#16a34a`)

This inconsistency is caused by the type definitions in `src/types/order-analysis.ts` which intentionally defines two separate color constants:
- `CHANNEL_COLORS` for orders (MKP = orange)
- `CHANNEL_COLORS_REVENUE` for revenue (MKP = green)

The fix requires standardizing both charts to use the same colors:
- TOL: Blue (`#3b82f6` - Tailwind blue-500)
- MKP: Orange (`#f97316` - Tailwind orange-500)

## Relevant Files
Use these files to complete the chore:

- **`src/types/order-analysis.ts`** - Contains `CHANNEL_COLORS` and `CHANNEL_COLORS_REVENUE` constants. The root cause - `CHANNEL_COLORS_REVENUE` uses green for MKP instead of orange.
- **`src/components/order-analysis/stacked-order-chart.tsx`** - Uses `CHANNEL_COLORS` for Bar fill colors (line 136, 142). Currently correct with orange MKP.
- **`src/components/order-analysis/stacked-revenue-chart.tsx`** - Uses `CHANNEL_COLORS_REVENUE` for Bar fill colors (line 136, 142). Currently incorrect with green MKP.
- **`src/components/order-analysis/channel-legend.tsx`** - Uses both color constants based on `variant` prop. Legend must match chart colors.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update CHANNEL_COLORS constant to use standard blue
- In `src/types/order-analysis.ts`, update `CHANNEL_COLORS.TOL` from `#0ea5e9` to `#3b82f6` (Tailwind blue-500)
- Keep `CHANNEL_COLORS.MKP` as `#f97316` (already correct orange)

### 2. Update CHANNEL_COLORS_REVENUE to match CHANNEL_COLORS
- In `src/types/order-analysis.ts`, update `CHANNEL_COLORS_REVENUE.TOL` from `#0ea5e9` to `#3b82f6`
- Update `CHANNEL_COLORS_REVENUE.MKP` from `#16a34a` (green) to `#f97316` (orange)
- Update the JSDoc comment to reflect that both color schemes are now identical

### 3. Update JSDoc comments for clarity
- Update the comment block at line 8-12 to indicate colors are consistent across all charts
- Remove mention of "Green (#16a34a) for revenue" since MKP will now be orange in both

### 4. Verify chart components use correct imports
- Confirm `stacked-order-chart.tsx` imports and uses `CHANNEL_COLORS`
- Confirm `stacked-revenue-chart.tsx` imports and uses `CHANNEL_COLORS_REVENUE`
- No changes needed in chart components since they already use the constants

### 5. Verify legend component uses correct constants
- Confirm `channel-legend.tsx` uses both color constants based on variant
- No changes needed since both constants will now have identical values

### 6. Validate with Playwright MCP
- Navigate to Order Analysis page
- Take screenshot to verify both charts show:
  - TOL bars in blue (`#3b82f6`)
  - MKP bars in orange (`#f97316`)
- Verify legend colors match bar colors in both charts

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compiles without errors
- Use Playwright MCP to navigate to `http://localhost:3000/order-analysis` and capture screenshots showing:
  1. Both charts visible with data
  2. TOL appears blue in both charts
  3. MKP appears orange in both charts
  4. Legend colors match chart bar colors

## Notes
- The color change from light blue (`#0ea5e9`) to standard blue (`#3b82f6`) provides better contrast and follows Tailwind's blue-500 standard
- Both color constants (`CHANNEL_COLORS` and `CHANNEL_COLORS_REVENUE`) are kept separate for potential future differentiation, but their values are now identical
- The `variant` prop in `ChannelLegend` component remains functional for future flexibility
- Consider consolidating to a single color constant in a future refactor if differentiation is not needed
