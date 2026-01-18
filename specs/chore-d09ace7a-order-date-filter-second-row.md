# Chore: Move Order Date Filter Group to Second Row

## Metadata
adw_id: `d09ace7a`
prompt: `Move Order Date filter group to a second line in Order Management Hub (src/components/order-management-hub.tsx). Currently the Order Date group is on the same row as Order and Payment filter groups, causing the Channels dropdown to be truncated. Move the Order Date group (containing From/To date pickers) to its own row below the Order and Payment groups. This improves horizontal spacing and prevents filter truncation. Use Playwright MCP to validate the layout change.`

## Chore Description
This chore addresses a layout issue discovered during validation of the recent filter reorganization (chore-64c18693). The current implementation places three filter groups (Order, Payment, and Order Date) on a single row using `flex flex-wrap`, which causes horizontal space constraints. This results in the Channels dropdown showing truncated "All..." text instead of the full "All Channels" label.

The solution is to restructure the filter groups into a multi-row layout:
- **Row 1**: Order filters group (Status, Store No, Channel) + Payment filters group (Status, Method)
- **Row 2**: Order Date group (From/To date pickers)

This provides better horizontal spacing, prevents dropdown truncation, and improves visual breathing room while maintaining the logical grouping established in the previous reorganization.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** - Main file to modify. The filter groups are currently rendered in a single flex container at lines ~1966-2088 ("Row 2: Filter Groups" section)
- **specs/chore-64c18693-order-management-filter-layout-ux.md** - Reference specification showing the previous filter reorganization work

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Capture Before Screenshot
- Start development server with `pnpm dev` if not already running
- Use Playwright MCP to navigate to `http://localhost:3000/orders` (Order Management page)
- Wait for page to fully load and filters to render
- Capture a screenshot showing the current filter layout with truncation issue
- Save as `.playwright-mcp/validation-order-filters-before-row-split.png`
- Inspect the Channels dropdown to confirm truncation ("All..." instead of "All Channels")

### 2. Restructure Filter Groups Layout
- Locate the "Row 2: Filter Groups" section (line ~1966) in `src/components/order-management-hub.tsx`
- Change from single flex container to multi-row layout:
  - Create a parent container with `space-y-4` for vertical spacing between rows
  - **First row**: Wrap Order and Payment filter groups in a `flex flex-wrap gap-4 items-start` container
  - **Second row**: Place Order Date filter group in its own `flex` container
- Maintain all existing filter group styling (`border border-border/40 rounded-md bg-muted/5 hover:border-border/60 transition-colors`)
- Ensure proper indentation and code readability

### 3. Update Comments for Clarity
- Update the "Row 2: Filter Groups" comment to "Filter Groups - Multi-row Layout"
- Add sub-comments for clarity:
  - `{/* Row 1: Order and Payment Groups */}`
  - `{/* Row 2: Date Range Group */}`
- Keep all other comments unchanged

### 4. Verify TypeScript Compilation
- Run `pnpm build` to ensure no TypeScript errors were introduced
- Check that all components compile successfully
- Fix any type errors if they occur (none expected for layout-only changes)

### 5. Capture After Screenshot and Validate
- Use Playwright MCP to refresh the Order Management page
- Wait for filters to render with new layout
- Capture a screenshot showing the improved layout
- Save as `.playwright-mcp/validation-order-filters-after-row-split.png`
- Validate improvements:
  - Channels dropdown shows full "All Channels" text (no truncation)
  - Order Date group is on its own row below Order and Payment groups
  - All filter groups maintain proper spacing and visual grouping
  - Layout is responsive and works on tablet/desktop widths
- Take a snapshot using `browser_snapshot` to verify accessibility tree structure

### 6. Test Responsive Behavior
- Use Playwright MCP to resize browser to tablet width (768px)
- Verify that filter groups wrap properly without overlapping
- Resize to desktop width (1280px) and verify optimal spacing
- Capture screenshot at tablet width if needed for documentation

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compiles without errors
- `pnpm lint` - Verify no linting errors introduced
- Navigate to `http://localhost:3000/orders` in browser and verify:
  - Order and Payment filter groups are on the first row
  - Order Date filter group is on the second row (its own dedicated row)
  - Channels dropdown displays full "All Channels" text without truncation
  - All dropdowns show complete placeholder text
  - Filter groups maintain visual consistency with bordered containers
  - Layout remains responsive on tablet (768px) and desktop (1280px+) widths
  - Active filters summary bar (if present) displays below filter groups correctly

## Notes

### Current Filter Layout Structure (Post chore-64c18693):
```jsx
{/* Row 2: Filter Groups */}
<div className="flex flex-wrap gap-4 items-start">
  {/* Order Filters Group - Status, Store No, Channel */}
  <div className="flex items-center gap-2 p-2 border ...">...</div>

  {/* Payment Filters Group - Status, Method */}
  <div className="flex items-center gap-2 p-2 border ...">...</div>

  {/* Date Range Group - From, To */}
  <div className="flex items-center gap-2 p-2 border ...">...</div>
</div>
```

### Target Layout Structure:
```jsx
{/* Filter Groups - Multi-row Layout */}
<div className="space-y-4">
  {/* Row 1: Order and Payment Groups */}
  <div className="flex flex-wrap gap-4 items-start">
    {/* Order Filters Group */}
    <div className="flex items-center gap-2 p-2 border ...">...</div>

    {/* Payment Filters Group */}
    <div className="flex items-center gap-2 p-2 border ...">...</div>
  </div>

  {/* Row 2: Date Range Group */}
  <div className="flex">
    {/* Order Date Group */}
    <div className="flex items-center gap-2 p-2 border ...">...</div>
  </div>
</div>
```

### Identified Issue Details:
- **Problem**: Three filter groups on one row compete for horizontal space
- **Symptom**: Channels dropdown shows truncated "All..." instead of "All Channels"
- **Root Cause**: Flex wrapping occurs within filter groups before intended, causing text truncation
- **Solution**: Dedicate second row to Order Date group, giving Row 1 groups more horizontal space

### Design Rationale:
- Order Date filters logically separate from status/channel filters (temporal vs categorical)
- Date pickers require more horizontal space (two pickers + labels + separators)
- Two groups on first row provide optimal spacing for all dropdowns
- Multi-row layout improves visual hierarchy and scannability

### Related Files:
- **specs/chore-64c18693-order-management-filter-layout-ux.md** - Previous filter reorganization
- **Context #3226** - Implementation of main filter layout reorganization
- **Context #3230** - Validation discovering the truncation issue
