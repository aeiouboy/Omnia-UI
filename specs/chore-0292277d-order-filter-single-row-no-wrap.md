# Chore: Fix Order Management Filter Layout - Single Row No Wrap

## Metadata
adw_id: `0292277d`
prompt: `Fix Order Management filter layout - three filter groups must fit on ONE row at desktop (src/components/order-management-hub.tsx). Current issues: (1) Order Date group wraps to second row - must stay on same row as Order and Payment groups, (2) Channels dropdown shows 'All...' (truncated), (3) Payment Methods shows 'All...' (truncated). Root cause: Combined width of all filter groups exceeds container width. Solution: (1) Remove flex-wrap from filter row container, (2) Use flex-shrink on filter groups to allow compression, (3) Reduce internal gaps within groups from gap-2 to gap-1, (4) Use truncate class on dropdown text with min-width that shows full text at 1280px viewport. Target: All 3 groups [Order] [Payment] [Order Date] on ONE row with no wrapping, dropdowns show 'All Channels' and 'All Methods' fully. Use Playwright MCP to validate at 1280px viewport width.`

## Chore Description
The Order Management Hub filter layout has three filter groups: **Order**, **Payment**, and **Order Date**. Currently, the Order Date group wraps to a second row at desktop widths due to the combined width of all groups exceeding the container width. Additionally, the "Channels" dropdown shows truncated "All..." instead of "All Channels", and "Payment Methods" shows "All..." instead of "All Methods".

**Current state analysis (lines 1966-2088):**
- Filter container: `flex flex-wrap gap-2 xl:gap-3 items-start` - flex-wrap causes wrapping
- Order group internal gaps: `gap-1.5` in the group container
- Current dropdown min-widths: 85px-90px (too small for full text display)
- No flex-shrink properties to allow compression

**Solution approach:**
1. Remove `flex-wrap` from the filter row container to prevent wrapping
2. Add `flex-shrink-0` on filter groups initially, but allow container to use `min-w-0` for compression
3. Reduce internal gaps from `gap-1.5` to `gap-1` within each filter group
4. Increase dropdown min-widths to show full text: "All Channels" needs ~100px, "All Methods" needs ~95px
5. Use `overflow-x-auto` as fallback for very narrow edge cases

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** - Main file to modify. Contains the filter groups layout at lines 1966-2088. Need to modify:
  - Line 1966: Filter row container classes (remove flex-wrap, add overflow handling)
  - Line 1968: Order group container (reduce gaps, add flex-shrink)
  - Line 2000: Channel dropdown (increase min-width to show "All Channels")
  - Line 2013: Payment group container (reduce gaps, add flex-shrink)
  - Line 2028: Payment Method dropdown (increase min-width to show "All Methods")
  - Line 2040: Order Date group container (reduce gaps, add flex-shrink)

### Reference Files
- **specs/chore-62e5c76d-order-filter-desktop-single-row.md** - Previous spec that attempted width reductions (partially successful)
- **specs/chore-f19c06f0-order-filter-single-row-layout.md** - Original single-row layout specification

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Start Development Server
- Ensure the development server is running with `pnpm dev`
- If not running, start it and wait for compilation to complete

### 2. Capture Before State with Playwright MCP
- Use Playwright MCP to navigate to `http://localhost:3000/orders`
- Resize viewport to 1280x800px using `browser_resize`
- Take a snapshot to document the current filter layout
- Capture screenshot as `.playwright-mcp/validation-order-filters-before-no-wrap.png`
- Note: Expect Order Date group on second row, truncated dropdown text

### 3. Modify Filter Row Container
In `src/components/order-management-hub.tsx`, locate line 1966:

**Current:**
```tsx
<div className="flex flex-wrap gap-2 xl:gap-3 items-start">
```

**Change to:**
```tsx
<div className="flex gap-2 items-center overflow-x-auto">
```

**Changes explained:**
- Remove `flex-wrap` to prevent wrapping
- Remove `xl:gap-3` (unnecessary with single row)
- Change `items-start` to `items-center` for better vertical alignment
- Add `overflow-x-auto` as fallback for very narrow viewports

### 4. Modify Order Filters Group Container
Locate line 1968 (Order Filters Group):

**Current:**
```tsx
<div className="flex items-center gap-1.5 p-1.5 border border-border/40 rounded-md bg-muted/5 hover:border-border/60 transition-colors">
```

**Change to:**
```tsx
<div className="flex items-center gap-1 p-1.5 border border-border/40 rounded-md bg-muted/5 hover:border-border/60 transition-colors flex-shrink-0">
```

**Changes explained:**
- Reduce `gap-1.5` to `gap-1` (tighter internal spacing)
- Add `flex-shrink-0` to prevent group from collapsing

### 5. Fix Channel Dropdown Width
Locate line 2000 (Channel SelectTrigger):

**Current:**
```tsx
<SelectTrigger className="h-9 min-w-[90px] border-0 bg-transparent focus:ring-0">
```

**Change to:**
```tsx
<SelectTrigger className="h-9 min-w-[105px] border-0 bg-transparent focus:ring-0">
```

**Changes explained:**
- Increase from 90px to 105px to fit "All Channels" (11 characters) fully

### 6. Modify Payment Filters Group Container
Locate line 2013 (Payment Filters Group):

**Current:**
```tsx
<div className="flex items-center gap-1.5 p-1.5 border border-border/40 rounded-md bg-muted/5 hover:border-border/60 transition-colors">
```

**Change to:**
```tsx
<div className="flex items-center gap-1 p-1.5 border border-border/40 rounded-md bg-muted/5 hover:border-border/60 transition-colors flex-shrink-0">
```

**Changes explained:**
- Reduce `gap-1.5` to `gap-1` (tighter internal spacing)
- Add `flex-shrink-0` to prevent group from collapsing

### 7. Fix Payment Method Dropdown Width
Locate line 2028 (Payment Method SelectTrigger):

**Current:**
```tsx
<SelectTrigger className="h-9 min-w-[90px] border-0 bg-transparent focus:ring-0">
```

**Change to:**
```tsx
<SelectTrigger className="h-9 min-w-[100px] border-0 bg-transparent focus:ring-0">
```

**Changes explained:**
- Increase from 90px to 100px to fit "All Methods" (11 characters) fully

### 8. Modify Order Date Group Container
Locate line 2040 (Order Date Group):

**Current:**
```tsx
<div className="flex items-center gap-1.5 p-1.5 border border-border/40 rounded-md bg-muted/5 hover:border-border/60 transition-colors">
```

**Change to:**
```tsx
<div className="flex items-center gap-1 p-1.5 border border-border/40 rounded-md bg-muted/5 hover:border-border/60 transition-colors flex-shrink-0">
```

**Changes explained:**
- Reduce `gap-1.5` to `gap-1` (tighter internal spacing)
- Add `flex-shrink-0` to prevent group from collapsing

### 9. Verify TypeScript Build
- Run `pnpm build` to ensure no compilation errors
- Verify all changes are syntactically correct

### 10. Validate with Playwright MCP at 1280px Viewport
- Navigate to `http://localhost:3000/orders`
- Resize viewport to 1280x800px using `browser_resize`
- Take a browser snapshot to verify DOM structure
- Capture screenshot as `.playwright-mcp/validation-order-filters-after-no-wrap.png`

**Validation criteria:**
- [ ] All three filter groups (Order, Payment, Order Date) on ONE row
- [ ] Channels dropdown shows "All Channels" fully (not truncated)
- [ ] Payment Method dropdown shows "All Methods" fully (not truncated)
- [ ] No horizontal scrollbar visible at 1280px width
- [ ] Proper spacing between filter groups

### 11. Test Narrower Viewport Behavior
- Resize viewport to 1024x800px
- Verify filters remain on single row or show horizontal scroll gracefully
- Take screenshot as `.playwright-mcp/validation-order-filters-1024px.png`

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compiles without errors
- Use Playwright MCP at 1280x800px viewport to verify:
  - All three filter groups on ONE visual row
  - "All Channels" text fully visible in dropdown
  - "All Methods" text fully visible in dropdown
  - No wrapping of Order Date group to second row
  - Functional dropdowns and date pickers

## Notes

### Width Budget Analysis at 1280px:
- Available width: 1280px - sidebar (240px) - padding (48px) = **~992px**
- Order group: ~290px (label + 3 dropdowns + dividers + padding)
- Payment group: ~240px (label + 2 dropdowns + dividers + padding)
- Order Date group: ~300px (label + 2 date buttons + separator + padding)
- Gaps between groups: ~16px (gap-2 = 8px * 2)
- **Total estimated: ~846px** - fits within 992px available

### Key Changes Summary:
| Change | Before | After | Impact |
|--------|--------|-------|--------|
| Filter container | flex-wrap gap-2 xl:gap-3 | flex gap-2 overflow-x-auto | Prevents wrapping |
| Group internal gaps | gap-1.5 | gap-1 | Saves ~12px total |
| Channel min-width | 90px | 105px | Shows "All Channels" |
| Payment Method min-width | 90px | 100px | Shows "All Methods" |
| Group flex-shrink | (default) | flex-shrink-0 | Prevents collapse |

### Alternative Not Used:
- **Responsive breakpoints**: Would add complexity without solving the core issue
- **Collapsible groups**: Would change UX significantly
- **Icon-only at narrow widths**: Would reduce usability
