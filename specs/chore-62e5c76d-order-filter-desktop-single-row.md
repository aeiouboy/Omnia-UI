# Chore: Fix Order Management Hub Filter Layout - Desktop Single Row

## Metadata
adw_id: `62e5c76d`
prompt: `Fix Order Management Hub filter layout - Order Date group is still wrapping to a second row instead of staying on the same row as Order and Payment groups (src/components/order-management-hub.tsx). The issue is that the filter groups container uses flex-wrap and the combined width causes wrapping. Fix by: (1) Reduce individual filter group widths - make dropdowns more compact with smaller min-widths, (2) Or change the Order group to have fewer dropdowns per group, (3) Or use flex-nowrap with horizontal scroll if content overflows. The goal is: [Order group] [Payment group] [Order Date group] ALL on ONE visual row on desktop (1280px+). Use Playwright MCP to validate at desktop viewport width.`

## Chore Description
The Order Management Hub filter layout is currently wrapping the Order Date group to a second row despite using `flex flex-wrap`. This happens because the combined minimum widths of all three filter groups exceed the available container width at desktop viewport (1280px+).

**Current min-width totals:**
- **Order group**: Status (120px) + Store (120px) + Channel (130px) + padding/gaps ≈ ~450px
- **Payment group**: Status (100px) + Method (130px) + padding/gaps ≈ ~280px
- **Order Date group**: From (120px) + To (120px) + padding/gaps ≈ ~300px
- **Total**: ~1030px + inter-group gaps (~48px) = **~1078px minimum**

At 1280px viewport, after accounting for sidebar (~240px) and page padding (~48px), the available width is ~992px, which is less than the 1078px minimum required.

**Solution approach**: Reduce dropdown min-widths to fit all three groups on one row at desktop width:
1. Reduce Order group dropdown widths: Status (100px), Store (100px), Channel (110px)
2. Reduce Payment group dropdown widths: Status (90px), Method (110px)
3. Reduce Order Date button widths: From (100px), To (100px)

**New estimated total**: ~800px (well within the ~992px available)

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** - Main file to modify. Contains the filter groups layout structure at lines ~1966-2079. Dropdown min-widths need to be reduced while maintaining usability.

### Reference Files
- **specs/chore-f19c06f0-order-filter-single-row-layout.md** - Previous spec that established the single-row layout structure (already implemented)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Capture Before Screenshot
- Start development server with `pnpm dev` if not already running
- Use Playwright MCP to navigate to `http://localhost:3000/orders` (Order Management page)
- Set viewport to desktop width (1280px x 800px) using `browser_resize`
- Wait for page to fully load and filters to render
- Capture a screenshot showing the current filter layout with wrapping
- Save as `.playwright-mcp/validation-filter-desktop-before.png`
- Take a browser snapshot to document current state

### 2. Reduce Order Filters Group Widths
In `src/components/order-management-hub.tsx`, locate the Order Filters Group (lines ~1968-2010):

**Status dropdown (line ~1971):**
```tsx
// Before:
<SelectTrigger className="h-9 min-w-[120px] border-0 bg-transparent focus:ring-0">

// After:
<SelectTrigger className="h-9 min-w-[100px] border-0 bg-transparent focus:ring-0">
```

**Store dropdown (line ~1986):**
```tsx
// Before:
<SelectTrigger className="h-9 min-w-[120px] border-0 bg-transparent focus:ring-0">

// After:
<SelectTrigger className="h-9 min-w-[100px] border-0 bg-transparent focus:ring-0">
```

**Channel dropdown (line ~2000):**
```tsx
// Before:
<SelectTrigger className="h-9 min-w-[130px] border-0 bg-transparent focus:ring-0">

// After:
<SelectTrigger className="h-9 min-w-[110px] border-0 bg-transparent focus:ring-0">
```

### 3. Reduce Payment Filters Group Widths
Locate the Payment Filters Group (lines ~2012-2037):

**Payment Status dropdown (line ~2016):**
```tsx
// Before:
<SelectTrigger className="h-9 min-w-[100px] border-0 bg-transparent focus:ring-0">

// After:
<SelectTrigger className="h-9 min-w-[90px] border-0 bg-transparent focus:ring-0">
```

**Payment Method dropdown (line ~2028):**
```tsx
// Before:
<SelectTrigger className="h-9 min-w-[130px] border-0 bg-transparent focus:ring-0">

// After:
<SelectTrigger className="h-9 min-w-[110px] border-0 bg-transparent focus:ring-0">
```

### 4. Reduce Order Date Group Widths
Locate the Order Date Group (lines ~2039-2079):

**From date button (line ~2047):**
```tsx
// Before:
"h-9 min-w-[120px] justify-start text-left font-normal px-2",

// After:
"h-9 min-w-[100px] justify-start text-left font-normal px-2",
```

**To date button (line ~2070):**
```tsx
// Before:
"h-9 min-w-[120px] justify-start text-left font-normal px-2",

// After:
"h-9 min-w-[100px] justify-start text-left font-normal px-2",
```

### 5. Verify TypeScript Compilation
- Run `pnpm build` to ensure no TypeScript errors were introduced
- Check that all components compile successfully
- Layout-only changes should not cause any type errors

### 6. Capture After Screenshot and Validate Desktop Layout
- Use Playwright MCP to navigate to `http://localhost:3000/orders`
- Set viewport to desktop width (1280px x 800px) using `browser_resize`
- Wait for filters to render with new layout
- Capture a screenshot showing all three groups on one row
- Save as `.playwright-mcp/validation-filter-desktop-after.png`
- Take a browser snapshot to verify structure
- **Validation criteria:**
  - All three filter groups (Order, Payment, Order Date) are on the SAME visual row
  - No wrapping to second row
  - Dropdown text is readable (may truncate slightly but remains usable)
  - Filter groups maintain proper spacing with `gap-4`

### 7. Test Responsive Wrapping at Narrower Viewport
- Use Playwright MCP to resize browser to tablet width (768px x 800px)
- Verify that filter groups wrap naturally to new rows as needed
- Confirm the flex-wrap behavior still works correctly for smaller screens
- Capture screenshot as `.playwright-mcp/validation-filter-tablet-wrapping.png`

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compiles without errors
- `pnpm lint` - Verify no linting errors introduced
- Navigate to `http://localhost:3000/orders` at 1280px viewport width and verify:
  - All three filter groups (Order, Payment, Order Date) appear on ONE visual row
  - Dropdown text remains readable (placeholders may truncate slightly)
  - All dropdowns and date pickers function correctly
  - Active filters summary bar displays correctly below filter groups
  - On narrower viewports, groups wrap responsively as expected

## Notes

### Width Reduction Summary:
| Element | Before | After | Savings |
|---------|--------|-------|---------|
| Order Status | 120px | 100px | 20px |
| Order Store | 120px | 100px | 20px |
| Order Channel | 130px | 110px | 20px |
| Payment Status | 100px | 90px | 10px |
| Payment Method | 130px | 110px | 20px |
| Date From | 120px | 100px | 20px |
| Date To | 120px | 100px | 20px |
| **Total Saved** | | | **130px** |

### Text Truncation Considerations:
- "All Channels" (11 chars) may show as "All Chan..." at 110px - acceptable
- "Cash on Delivery" (16 chars) will truncate at 110px - acceptable since full text shows on hover
- Date format "dd/MM/yyyy" (10 chars) fits well at 100px with icon

### Alternative Approaches (Not Used):
1. **flex-nowrap + overflow-x-auto**: Would require horizontal scrolling, poor UX
2. **Reorganize dropdowns**: Would change group semantics, harder to maintain
3. **Responsive breakpoints**: More complex CSS, current approach is simpler

### Responsive Behavior Preserved:
- `flex-wrap` remains in place for narrower viewports
- At tablet/mobile widths, groups will stack naturally
- Desktop (1280px+) is the target for single-row layout
