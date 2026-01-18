# Chore: Responsive Tablet/Desktop Screen Improvements

## Metadata
adw_id: `bf78ffe9`
prompt: `Improve responsive behavior for tablet/smaller desktop screens:
1. Order Management: Make table horizontally scrollable with fixed Order Number column
2. Inventory Availability: Stack search fields in 2x2 grid on medium screens
3. Stock Card: Ensure table columns resize gracefully
4. Order Dashboard: Stack KPI cards 2x2 on medium screens instead of 3x1`

## Chore Description
This chore improves the responsive layout behavior for tablet and smaller desktop screens (768px-1024px range, typically `md:` breakpoint in Tailwind). The focus is on ensuring tables scroll horizontally with key columns fixed, filter fields stack in a 2x2 grid pattern for better space utilization, and KPI cards adapt to a 2x2 layout on medium screens instead of the current 3-column or single-column layouts.

## Relevant Files
Use these files to complete the chore:

- **`src/components/order-management-hub.tsx`** (lines 1654-1790): Contains the `renderOrderTable()` function with the Order Management table. Currently has `overflow-x-auto` and `min-w-full` on the Table. Need to add sticky positioning for Order Number column.

- **`app/inventory-new/supply/page.tsx`** (lines 316-413): Contains the Inventory Availability filter section with 4 search inputs and 2 select dropdowns arranged with `flex flex-wrap`. Need to convert to responsive grid layout for 2x2 stacking on medium screens.

- **`app/inventory-new/stores/page.tsx`** (lines 409-466): Contains the Stock Card filter controls and table. Table already has `overflow-x-auto`. Need to ensure column widths resize gracefully with proper min-widths.

- **`src/components/order-analysis-view.tsx`** (lines 218-260): Contains the Order Dashboard KPI cards grid with `grid-cols-1 lg:grid-cols-3`. Need to add `md:grid-cols-2` for 2x2 stacking on medium screens.

### New Files
None required - all changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Order Management Table with Fixed Order Number Column
- In `src/components/order-management-hub.tsx`, locate the `renderOrderTable()` function (around line 1654)
- Modify the table container to support horizontal scrolling with a fixed first column:
  - Add `relative` class to the table container div
  - Add `sticky left-0 z-10 bg-white` classes to the Order Number `<TableHead>` (first column header)
  - Add `sticky left-0 z-10 bg-white` classes to the Order Number `<TableCell>` (first column in each row)
  - Add a subtle right border/shadow to the sticky column to visually separate it from scrollable content using `border-r border-gray-200` or `shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]`
- Ensure the urgency row styling doesn't override the sticky column background by using conditional classes

### 2. Update Inventory Availability Search Fields to 2x2 Grid
- In `app/inventory-new/supply/page.tsx`, locate the filter section (around line 316)
- Replace the current `flex flex-wrap gap-3` layout with a responsive grid:
  - Change from: `<div className="flex flex-wrap gap-3 items-center">`
  - Change to: `<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-center">`
- This creates:
  - 2 columns on small screens (2x3 stacking for 6 filter elements)
  - 3 columns on medium screens (2x2 for main filters + row for dropdowns)
  - 6 columns on large screens (all filters in one row, current behavior)
- Adjust individual input widths: Remove fixed `w-[160px]` and `w-[180px]` widths, replace with `w-full` so inputs fill their grid cells

### 3. Update Stock Card Table for Graceful Column Resizing
- In `app/inventory-new/stores/page.tsx`, locate the table section (around line 619)
- Review the current `TableHead` elements and ensure they have proper responsive widths:
  - Keep `w-[300px]` for Store Name but add `min-w-[200px]` as fallback
  - Keep `w-[150px]` for Store ID but add `min-w-[100px]` as fallback
  - Add `whitespace-nowrap` to numeric column headers to prevent text wrapping
  - Add `text-nowrap` to badge cells to keep them compact
- Ensure the table container maintains `overflow-x-auto` for scrollability
- Add `min-w-[800px]` to the `<Table>` element to prevent excessive column compression

### 4. Update Order Dashboard KPI Cards to 2x2 Grid on Medium Screens
- In `src/components/order-analysis-view.tsx`, locate the KPI cards grid (around line 218)
- Change from: `<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">`
- Change to: `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">`
- This creates:
  - 1 column on mobile (current behavior)
  - 2 columns on medium screens (new - 2x2 with AOV card in second row)
  - 3 columns on large screens (current behavior)

### 5. Validate All Changes
- Run `pnpm build` to ensure no TypeScript errors
- Run `pnpm lint` to verify no linting issues
- Test responsive behavior at common breakpoints:
  - Mobile: 375px (should stack vertically)
  - Tablet: 768px (should use 2x2 layouts)
  - Small Desktop: 1024px (should transition to full layouts)
  - Desktop: 1280px+ (should display full layouts)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds
- `pnpm lint` - Check for linting errors
- Manual testing at different viewport sizes using browser DevTools responsive mode:
  - 768px width: Verify KPI cards are 2x2, filters are 2-3 columns, tables scroll horizontally
  - 1024px width: Verify layouts transition appropriately
  - Verify Order Number column stays fixed while scrolling the order table horizontally

## Notes

### Tailwind Breakpoints Reference
- `sm`: 640px
- `md`: 768px (tablet)
- `lg`: 1024px (small desktop)
- `xl`: 1280px (desktop)

### Sticky Column Considerations
- The sticky column implementation requires proper z-index stacking to work correctly
- Background color must be explicitly set on sticky cells to prevent content showing through
- Consider adding a subtle visual separator (border or shadow) between fixed and scrollable content
- Row hover states and urgency backgrounds need to account for the sticky column

### Grid Layout Behavior
- Using `grid-cols-2 md:grid-cols-3 lg:grid-cols-6` provides progressive enhancement
- Grid items should use `w-full` to fill their cells rather than fixed widths
- Gap utilities (`gap-3`) work consistently across breakpoints
