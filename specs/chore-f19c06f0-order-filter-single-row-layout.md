# Chore: Fix Order Management Hub Filter Layout - Single Row with Channels Width Fix

## Metadata
adw_id: `f19c06f0`
prompt: `Fix Order Management Hub filter layout issues (src/components/order-management-hub.tsx): (1) Move Order Date filter group to be on the SAME ROW as the Order and Payment groups - it should appear next to the Payment group, not on a separate row below. The layout should be: [Order group] [Payment group] [Order Date group] all on one row with flex-wrap for responsive behavior. (2) Fix Channels dropdown truncation - change min-width to min-w-[130px] so it displays 'All Channels' instead of 'All...'. Use Playwright MCP to validate the layout shows all three filter groups on the same row.`

## Chore Description
This chore corrects the filter layout in the Order Management Hub to place all three filter groups (Order, Payment, and Order Date) on the same row instead of having Order Date on a separate second row. The current multi-row layout (implemented in chore-d09ace7a) is being reverted to a single-row layout with improved dropdown widths.

**Two specific fixes required:**
1. **Layout Change**: Remove the multi-row structure and place all three filter groups (Order, Payment, Order Date) on a single row with `flex flex-wrap` for responsive behavior
2. **Channels Dropdown Width**: Increase the Channels dropdown `min-width` from `min-w-[100px]` to `min-w-[130px]` to prevent "All Channels" text truncation

**Target layout:** `[Order group] [Payment group] [Order Date group]` on one row with flex-wrap enabling natural wrapping on narrower screens.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** - Main file to modify. Contains the filter groups layout structure at lines ~1965-2094. The current implementation uses a two-row layout (`space-y-4` container with two child divs) that needs to be consolidated into a single-row layout.

### Reference Files
- **specs/chore-d09ace7a-order-date-filter-second-row.md** - Previous spec that introduced the multi-row layout. This chore reverses that change while keeping the Channels dropdown width fix.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Capture Before Screenshot
- Start development server with `pnpm dev` if not already running
- Use Playwright MCP to navigate to `http://localhost:3000/orders` (Order Management page)
- Wait for page to fully load and filters to render
- Capture a screenshot showing the current multi-row filter layout
- Save as `.playwright-mcp/validation-filter-layout-before-single-row.png`
- Verify current state: Order Date group is on a separate row below Order and Payment groups

### 2. Fix Channels Dropdown Width
- In `src/components/order-management-hub.tsx`, locate the Channels dropdown Select component (line ~2001-2011)
- Change the `SelectTrigger` className from `min-w-[100px]` to `min-w-[130px]`
- This ensures "All Channels" text displays fully without truncation

**Before:**
```tsx
<SelectTrigger className="h-9 min-w-[100px] border-0 bg-transparent focus:ring-0">
```

**After:**
```tsx
<SelectTrigger className="h-9 min-w-[130px] border-0 bg-transparent focus:ring-0">
```

### 3. Consolidate Filter Groups to Single Row
- Locate the "Filter Groups - Multi-row Layout" section (line ~1965-2094)
- Remove the `space-y-4` parent container that creates vertical spacing
- Merge the two row divs into a single `flex flex-wrap gap-4 items-start` container
- Move the Order Date group div inside the same flex container as Order and Payment groups
- Remove the standalone `{/* Row 2: Date Range Group */}` wrapper div

**Current structure (multi-row):**
```tsx
{/* Filter Groups - Multi-row Layout */}
<div className="space-y-4">
  {/* Row 1: Order and Payment Groups */}
  <div className="flex flex-wrap gap-4 items-start">
    {/* Order Filters Group */}
    <div className="...">...</div>
    {/* Payment Filters Group */}
    <div className="...">...</div>
  </div>

  {/* Row 2: Date Range Group */}
  <div className="flex">
    {/* Order Date Group */}
    <div className="...">...</div>
  </div>
</div>
```

**Target structure (single-row):**
```tsx
{/* Filter Groups - Single Row with Flex Wrap */}
<div className="flex flex-wrap gap-4 items-start">
  {/* Order Filters Group */}
  <div className="...">...</div>
  {/* Payment Filters Group */}
  <div className="...">...</div>
  {/* Order Date Group */}
  <div className="...">...</div>
</div>
```

### 4. Update Comments for Clarity
- Change comment from `{/* Filter Groups - Multi-row Layout */}` to `{/* Filter Groups - Single Row with Flex Wrap */}`
- Remove row-specific comments (`{/* Row 1: ... */}`, `{/* Row 2: ... */}`)
- Keep individual group comments (`{/* Order Filters Group */}`, `{/* Payment Filters Group */}`, `{/* Order Date Group */}`)

### 5. Verify TypeScript Compilation
- Run `pnpm build` to ensure no TypeScript errors were introduced
- Check that all components compile successfully
- Fix any type errors if they occur (none expected for layout-only changes)

### 6. Capture After Screenshot and Validate
- Use Playwright MCP to refresh the Order Management page
- Wait for filters to render with new layout
- Capture a screenshot showing the single-row layout
- Save as `.playwright-mcp/validation-filter-layout-after-single-row.png`
- Validate improvements:
  - All three filter groups (Order, Payment, Order Date) are on the same row
  - Channels dropdown shows full "All Channels" text (no truncation)
  - Filter groups maintain proper spacing with `gap-4`
  - Layout wraps responsively on narrower viewports
- Take a snapshot using `browser_snapshot` to verify accessibility tree structure

### 7. Test Responsive Wrapping Behavior
- Use Playwright MCP to resize browser to tablet width (768px)
- Verify that filter groups wrap naturally to new rows as needed
- Confirm the flex-wrap behavior works correctly
- Resize back to desktop width (1280px) and verify all groups fit on one row if space allows
- Capture additional screenshots if wrapping behavior needs documentation

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compiles without errors
- `pnpm lint` - Verify no linting errors introduced
- Navigate to `http://localhost:3000/orders` in browser and verify:
  - All three filter groups (Order, Payment, Order Date) appear on the same row
  - Channels dropdown displays full "All Channels" text without truncation
  - Filter groups wrap responsively when viewport narrows
  - All dropdowns and date pickers function correctly
  - Active filters summary bar (if present) displays correctly below filter groups
  - Layout maintains visual consistency with bordered containers

## Notes

### Key Changes Summary:
1. **Layout**: `space-y-4` multi-row container → single `flex flex-wrap gap-4` container
2. **Channels width**: `min-w-[100px]` → `min-w-[130px]`

### Responsive Behavior:
- With `flex-wrap`, the browser will naturally wrap filter groups to new rows when horizontal space is insufficient
- This provides responsive behavior without enforcing a specific row structure
- On wide desktop screens, all three groups should fit on one row
- On tablet/narrower screens, groups will wrap as needed

### Visual Grouping Preserved:
- Each filter group retains its bordered container styling
- Groups are visually distinct with the existing `border border-border/40 rounded-md bg-muted/5` classes
- Spacing between groups maintained with `gap-4`

### Related Files:
- **specs/chore-d09ace7a-order-date-filter-second-row.md** - This chore reverses the multi-row layout from that spec
- **specs/chore-64c18693-order-management-filter-layout-ux.md** - Original filter reorganization reference
