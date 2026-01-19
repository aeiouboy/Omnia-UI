# Chore: Improve Order Management Filter Layout for Better Usability

## Metadata
adw_id: `5ae25818`
prompt: `Improve Order Management page filter layout for better usability - fix truncated dropdowns, overcrowded filters, inconsistent widths, poor visual hierarchy, and missing active filter count`

## Chore Description
This chore addresses multiple UX issues with the Order Management page filter layout identified through Playwright analysis:

1. **TRUNCATED DROPDOWNS**: 'All Channels' displays as 'All...' and 'All Methods' displays as 'All...' due to insufficient minimum width
2. **OVERCROWDED MAIN FILTERS**: Order, Payment, and Date filters are crammed into a single row causing horizontal overflow
3. **INCONSISTENT WIDTHS**: Advanced filter input fields have varying widths creating visual inconsistency
4. **POOR VISUAL HIERARCHY**: Weak visual separation between filter groups makes it hard to scan
5. **NO ACTIVE FILTER COUNT**: No indication on the advanced filters toggle button showing how many filters are active

The improvements will enhance usability by preventing text truncation, improving layout organization, and providing better visual feedback for active filters.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** (lines ~1940-2220) - Main component containing all filter UI code. This is the primary file to modify with dropdown widths, layout structure, and visual hierarchy improvements.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix Main Filter Dropdown Widths (Prevent Truncation)
Update the SelectTrigger minimum widths in the Order and Payment filter groups to prevent text truncation:

- Change Status dropdown (line ~1971): `min-w-[85px]` → `min-w-[110px]`
- Change Store dropdown (line ~1986): `min-w-[85px]` → `min-w-[120px]`
- Change Channel dropdown (line ~2000): `min-w-[105px]` → `min-w-[140px]` (critical for "All Channels")
- Change Payment Status dropdown (line ~2016): `min-w-[80px]` → `min-w-[110px]`
- Change Payment Method dropdown (line ~2028): `min-w-[100px]` → `min-w-[150px]` (critical for "All Methods" and "Credit Card on Delivery")

### 2. Improve Main Filters Layout for Smaller Viewports
Modify the filter groups container (line ~1966) to wrap properly on smaller screens:

- Change `<div className="flex gap-2 items-center overflow-x-auto">` to use `flex-wrap` for better responsive behavior
- Add `lg:flex-nowrap` to maintain single row on large screens
- Consider using `gap-3` for better spacing between groups

### 3. Enhance Visual Hierarchy of Filter Groups
Improve the visual styling of filter group containers for better separation:

- Add subtle background color to each filter group: change `bg-muted/5` to `bg-muted/10`
- Increase border visibility: change `border-border/40` to `border-border/60`
- Add slight shadow for depth: add `shadow-sm` class to filter group divs
- Ensure consistent padding: verify all groups use `p-1.5` or standardize to `p-2`

### 4. Standardize Advanced Filter Input Widths
Make all input fields in the Advanced Filters section consistent:

- Product Search SKU field (line ~2141): Keep `min-w-[200px]`
- Product Search Item field (line ~2153): Keep `min-w-[200px]`
- Customer Search Name field (line ~2169): Change `min-w-[180px]` → `min-w-[200px]`
- Customer Search Email field (line ~2178): Change `min-w-[180px]` → `min-w-[200px]`
- Customer Search Phone field (line ~2187): Change `min-w-[160px]` → `min-w-[200px]`
- Order Type dropdown container (line ~2203): Add `min-w-[160px]` to the container div

### 5. Add Active Filter Count Badge to Toggle Button
The advanced filter count badge already exists (lines ~2127-2131) but verify it displays correctly:

- Confirm the `advancedFilterCount` computed value properly counts all active filters
- Ensure the badge is visible and styled appropriately
- The badge should show count when filters are active AND the panel is collapsed

### 6. Verify Clear All Button Styling
Confirm the Clear All button (line ~2109) follows the project's UI consistency standards:

- Should have `hover:bg-gray-100` class (already present)
- Verify proper visibility when filters are active

### 7. Test Responsive Behavior
Validate the layout at different viewport widths:

- On tablet (1024px): Filters should stack vertically if needed without truncation
- On desktop (1280px): All filter groups should be visible without horizontal scroll
- Date pickers should remain functional at all sizes

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript or build errors after changes
- Use Playwright MCP to verify:
  1. Navigate to Order Management page at http://localhost:3000/orders
  2. Verify all dropdown text is fully visible (no truncation) - "All Channels", "All Status", "All Methods" should be fully readable
  3. Check filter groups have clear visual separation with subtle backgrounds
  4. Open Advanced Filters and verify all input fields have consistent widths
  5. Apply some filters and verify the active filter count badge shows on the toggle button when collapsed
  6. Test at 1280px viewport width - all filters visible
  7. Test at 1024px viewport width - filters should wrap gracefully without truncation

## Notes
- The current implementation already has good structure with filter groups and active filter display
- Main issues are width constraints causing truncation and some visual polish
- The `overflow-x-auto` class allows horizontal scrolling but we want to minimize the need for it
- The advanced filter count badge logic already exists and should work correctly
- Keep the `flex-shrink-0` on filter groups to prevent them from compressing
