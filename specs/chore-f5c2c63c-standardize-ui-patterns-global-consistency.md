# Chore: Standardize UI Patterns Across All Pages

## Metadata
adw_id: `f5c2c63c`
prompt: `Standardize UI patterns across all pages: (1) Ensure all search/filter input fields have minimum width of 160px to prevent placeholder truncation, (2) Standardize empty state icons to consistent 64px size across Inventory Availability, Stock Card, and Order Management, (3) Add consistent horizontal scroll indicators to all data tables that overflow, (4) Standardize Clear All button styling with hover:bg-gray-100 effect across all filter sections, (5) Ensure all dropdown filters have consistent width and alignment across pages`

## Chore Description
This chore aims to create a consistent user experience across the entire Omnia UI application by standardizing five key UI patterns that currently have inconsistent implementations:

1. **Search/Filter Input Field Widths**: Currently, filter inputs use varying widths (w-40, w-[160px], min-w-[160px], min-w-[180px]). This inconsistency causes placeholder text truncation on some pages but not others. We need to standardize all search/filter input fields to use `min-w-[160px]` to ensure placeholder text is never truncated.

2. **Empty State Icon Sizes**: Empty state components across different pages use inconsistent icon sizes (h-20 w-20, h-6 w-6 in inline states). We need to standardize these to a consistent 64px (h-16 w-16) size for better visual hierarchy and consistency.

3. **Horizontal Scroll Indicators**: Data tables with overflow content need visual indicators to show users that horizontal scrolling is available. Currently, only some tables implement this pattern. We need to add consistent scroll indicators to all tables that may overflow.

4. **Clear All Button Styling**: Clear All buttons across different filter sections have inconsistent hover effects. Some use `hover:bg-accent`, others have no hover effect. We need to standardize to `hover:bg-gray-100` for a consistent, subtle hover effect.

5. **Dropdown Filter Width and Alignment**: Dropdown filters (Select components) have inconsistent widths ranging from min-w-[160px] to w-[280px]. We need to establish a consistent width pattern based on content type.

## Relevant Files

### Pages to Update
- **app/inventory/page.tsx** - Main inventory availability page with search filters, dropdowns, and Clear All button
- **app/inventory-new/supply/page.tsx** - Inventory supply page with search inputs and filters
- **app/inventory-new/stores/page.tsx** - Stock card page with view type dropdown and search filters
- **src/components/order-management-hub.tsx** - Order management with extensive filtering and table overflow

### Components to Update
- **src/components/inventory/inventory-empty-state.tsx** - Empty state component used across inventory pages (icon size: currently h-20 w-20, should be h-16 w-16)
- **src/components/order-analysis/chart-empty-state.tsx** - Empty state for order analysis charts

### Reference Files for Patterns
- **app/stock-config/page.tsx** - Recent example with min-w-[160px] filter inputs (good pattern to replicate)
- **specs/chore-e7f8285e-stock-config-ui-improvements.md** - Recent chore that standardized filter widths
- **docs/ui/prompt-07-global-consistency.txt** - UI consistency guidelines

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Audit Current Filter Input Widths
- Search all page files for Input components used in filter/search contexts
- Document current width classes: `w-40`, `w-[160px]`, `min-w-[160px]`, `min-w-[180px]`, etc.
- Identify which inputs have placeholder truncation issues
- Create a mapping of which inputs need width updates

### 2. Standardize Filter Input Widths to min-w-[160px]
- Update **app/inventory/page.tsx**:
  - Search fields at lines 629-660: Change `min-w-[180px]` to `min-w-[160px]` for all 4 search inputs
  - Brand filter dropdown at line 668: Keep `min-w-[180px]` (dropdown, not search input)
- Update **app/inventory-new/supply/page.tsx**:
  - Store ID search at line 325: Already uses `w-[160px]`, change to `min-w-[160px]`
  - Store Name search at line 336: Already uses `w-[180px]`, change to `min-w-[160px]`
  - Product ID search at line 347: Already uses `w-[160px]`, change to `min-w-[160px]`
  - Product Name search at line 358: Already uses `w-[180px]`, change to `min-w-[160px]`
- Update **app/inventory-new/stores/page.tsx**:
  - Store ID search at line 443: Already uses `min-w-[160px]` ✓ (no change needed)
  - Store Name search at line 454: Already uses `min-w-[160px]` ✓ (no change needed)
- Update **src/components/order-management-hub.tsx**:
  - Search for all Input components in filter section
  - Standardize to `min-w-[160px]` for search inputs

### 3. Standardize Empty State Icon Sizes to 64px (h-16 w-16)
- Update **src/components/inventory/inventory-empty-state.tsx**:
  - Line 16: Change `h-20 w-20` to `h-16 w-16` for Package icon
  - This affects all inventory pages using this component
- Update **src/components/order-analysis/chart-empty-state.tsx**:
  - Verify icon size consistency (should also be h-16 w-16)
- Search for any inline empty states in table components:
  - Look for empty state icons in TableCell components
  - Standardize inline empty state icons to `h-12 w-12` (smaller for inline contexts)

### 4. Add Horizontal Scroll Indicators to Data Tables
- Identify all tables with `overflow-x-auto` that need scroll indicators:
  - **app/inventory/page.tsx** - Main products table (lines 694-896)
  - **app/inventory-new/supply/page.tsx** - Inventory supply table (lines 431-545)
  - **app/inventory-new/stores/page.tsx** - Stock card table (lines 630-786)
  - **src/components/order-management-hub.tsx** - Orders table
- For each table:
  - Add scroll indicator state: `const [showLeftScroll, setShowLeftScroll] = useState(false)`
  - Add scroll indicator state: `const [showRightScroll, setShowRightScroll] = useState(true)`
  - Add scroll event handler to detect scroll position
  - Add visual indicators (subtle shadows or arrows) on left/right edges when scrollable
  - Use existing pattern from order-management-hub if available

### 5. Standardize Clear All Button Hover Effect
- Update **app/inventory/page.tsx**:
  - Line 681-689: Clear All button - add `hover:bg-gray-100` class
- Update **app/inventory-new/supply/page.tsx**:
  - Line 403-411: Clear All button - change from `hover:bg-accent` to `hover:bg-gray-100`
- Update **app/inventory-new/stores/page.tsx**:
  - Line 463-475: Clear All button - change from `hover:bg-accent transition-colors` to `hover:bg-gray-100 transition-colors`
- Update **src/components/order-management-hub.tsx**:
  - Search for Clear All or Clear Filters buttons
  - Standardize to `hover:bg-gray-100`

### 6. Standardize Dropdown Filter Widths
- Establish width standards based on content type:
  - **Short dropdowns** (e.g., "All Brands", single field): `min-w-[160px]`
  - **Medium dropdowns** (e.g., "All Supply Types"): `min-w-[180px]`
  - **Long dropdowns** (e.g., View Types with descriptions): `w-[280px]` (fixed width to prevent layout shift)
- Update **app/inventory/page.tsx**:
  - Brand filter (line 668): Change to `min-w-[160px]` (currently min-w-[180px])
- Update **app/inventory-new/supply/page.tsx**:
  - Supply Type (line 364): Change to `min-w-[160px]` (currently w-[180px])
  - View Type (line 376): Keep `w-[280px]` ✓ (has descriptions)
- Update **app/inventory-new/stores/page.tsx**:
  - View Type Select (line 413): Keep `w-[280px]` ✓ (has descriptions)

### 7. Update Related Documentation
- Update **CLAUDE.md** to document the new UI consistency standards:
  - Add section "UI Consistency Standards" with the 5 standardized patterns
  - Reference this chore specification for detailed implementation
- Update **docs/ui/prompt-07-global-consistency.txt** if it exists:
  - Add the standardized patterns to the consistency guidelines

### 8. Build and Validate Changes
- Run `pnpm build` to ensure no TypeScript errors
- Verify no console errors in development mode
- Test each updated page:
  - Verify filter input widths allow full placeholder text to display
  - Verify empty states show consistent 64px icons
  - Verify Clear All buttons have consistent hover effect
  - Verify dropdown widths are appropriate for their content
  - Test horizontal scroll on tables with many columns

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# 1. Build the project to catch TypeScript errors
pnpm build

# 2. Start development server and manually test each page
pnpm dev

# 3. Search for any remaining inconsistent patterns
# Check for inconsistent input widths (should all use min-w-[160px] for search inputs)
rg "className.*w-40[^0-9]" app/ src/components/

# Check for old icon sizes in empty states (should be h-16 w-16, not h-20 w-20)
rg "className.*h-20.*w-20" src/components/

# Check for Clear All buttons without hover effect
rg "Clear All" app/ src/components/ -A 2 -B 2

# 4. Visual validation checklist:
# - Open http://localhost:3000/inventory - check filter widths, Clear All hover
# - Open http://localhost:3000/inventory-new/supply - check filter widths, Clear All hover
# - Open http://localhost:3000/inventory-new/stores - check filter widths, Clear All hover
# - Open each page and verify empty state icon size consistency
# - Test horizontal scroll on tables with many columns
```

## Notes

### Design Rationale
- **min-w-[160px]** chosen for filter inputs based on recent successful implementation in stock-config page (chore-e7f8285e)
- **h-16 w-16** (64px) for empty state icons provides good visual hierarchy without overwhelming the UI
- **hover:bg-gray-100** for Clear All buttons provides subtle feedback without being too prominent (consistent with secondary actions)
- **w-[280px]** for view type dropdowns prevents layout shift when items have multi-line descriptions

### Affected User Flows
- Inventory filtering and search
- Stock card filtering
- Order management filtering
- All empty state displays

### Backward Compatibility
- These are purely visual changes with no functional impact
- No breaking changes to component APIs
- All changes maintain existing behavior and accessibility

### Related Chores
- **chore-e7f8285e-stock-config-ui-improvements.md** - Established the min-w-[160px] pattern for filter inputs
- **chore-30c21158-order-dashboard-ui-improvements.md** - Empty state improvements for charts
- **chore-c306fac5-inventory-availability-ui-improvements.md** - Previous inventory UI improvements

### Testing Notes
- Test on different screen sizes (mobile, tablet, desktop)
- Verify placeholder text is fully visible on all filter inputs
- Test keyboard navigation for all updated components
- Verify accessibility (screen reader compatibility maintained)
