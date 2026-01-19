# Chore: UI Layout and Display Sizing Improvements for Better Usability

## Metadata
adw_id: `23a335dc`
prompt: `Analyze and improve layout and display sizing across Order Search, Inventory, and Inventory Management pages for better usability and user-friendliness`

## Chore Description
This chore improves the layout and display sizing across four key pages in the Omnia-UI application to enhance usability and user-friendliness. The improvements focus on optimizing table column widths, filter section layouts, KPI card grids, visual separation between sections, and cross-page consistency in styling. Key areas include compact badges, consistent spacing, sticky headers, alternating row colors, and standardized typography.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** - Main Order Search page component with filters and orders table
  - Contains filter section layout (lines 1848-2288)
  - Contains order table rendering (lines 1652-1787)
  - Badge components usage and table column definitions

- **app/inventory/page.tsx** - Inventory Management page with KPI cards and product table
  - Contains KPI summary cards (lines 519-554)
  - Contains product table with Image, Product Name, Barcode, Brand, Item Type, Channel, Config, Stock, Status columns
  - Currently uses `lg:grid-cols-3` for KPI cards

- **app/inventory-new/supply/page.tsx** - Inventory Supply page with filters and supply data table
  - Contains KPI summary cards (lines 256-304, currently 4-column)
  - Contains horizontal filter bar (lines 306-367)
  - Contains supply data table (lines 369-493)

- **app/inventory-new/stores/page.tsx** - Stock Card page with store performance table
  - Contains KPI summary cards (lines 315-364)
  - Contains store table with sortable columns (lines 509-673)
  - Currently uses `lg:grid-cols-3` for KPI cards

### New Files
No new files needed - all changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Order Search Page - Filter Section Improvements
- Locate the filter section starting at line 1848 in `src/components/order-management-hub.tsx`
- Add subtle background color to filter section container: add `bg-muted/30 rounded-lg p-4` class to the main filters div
- Modify the search box grid to make it span full width on first row: change `sm:col-span-2 lg:col-span-2` to `sm:col-span-2 lg:col-span-3 xl:col-span-4`
- Reduce vertical spacing between filter section and CardContent: change `mt-4 space-y-3` to `mt-3 space-y-2`
- Update the CardContent padding from `p-6` to `p-4` for tighter content density

### 2. Order Search Page - Table and Badge Improvements
- In the `renderOrderTable` function (line 1653), optimize table column min-widths:
  - Change `min-w-[150px]` on Order Number to `min-w-[140px]`
  - Change `min-w-[120px]` on Order Total to `min-w-[100px]`
  - Keep Status and SLA Status columns at `min-w-[120px]`
- For SLA Status badges, add consistent badge width: `min-w-[80px] text-center` class
- For status badges, use compact padding: update Badge components with `px-2 py-0.5 text-xs`

### 3. Inventory Page - KPI Card Grid and Table Improvements
- Locate KPI cards section at line 519 in `app/inventory/page.tsx`
- Confirm grid is `lg:grid-cols-3` (already correct)
- In the product table (line 612), reduce Image column width: change `w-[80px]` to `max-w-[60px]`
- Make Product Name column flexible by adding `flex-1` to the TableCell
- Add hover transition to table rows: change `hover:bg-muted/50` to `hover:bg-muted/50 transition-colors`
- Add sticky table header: wrap TableHeader with `sticky top-0 bg-background z-10` class

### 4. Inventory Supply Page - Layout Reorganization
- Locate KPI cards at line 256 in `app/inventory-new/supply/page.tsx`
- Update KPI card grid: change `grid gap-4 md:grid-cols-2 lg:grid-cols-4` (already correct - verify)
- Add consistent card heights: add `h-full` to each Card component
- Reduce overall page padding: in `<div className="space-y-6">` change to `space-y-4`
- In the filter bar (line 307), ensure search inputs are inline:
  - Wrap Store ID and Item ID inputs with filters in same flex container
  - Add responsive wrapping: `flex flex-wrap gap-3 items-center`
- In the table (line 373):
  - Add `text-right` class to Quantity and Available Qty TableHead and TableCell columns
  - Add alternating row colors: add `even:bg-muted/30` to TableRow className

### 5. Stock Card Page - Grid and Table Improvements
- Locate KPI cards at line 316 in `app/inventory-new/stores/page.tsx`
- Confirm grid uses `lg:grid-cols-3` (currently correct)
- In the table Store column (line 602):
  - Ensure alignment with `flex items-center gap-2` (already present)
- Make numeric columns center-aligned:
  - Total Products, Low Stock, Out of Stock columns already have `text-center`
- Add hover state for table rows indicating clickability:
  - Ensure `cursor-pointer hover:bg-muted/50` is present (already there)
  - Add `transition-colors` for smooth hover effect

### 6. Cross-Page Consistency Improvements
- Standardize page header spacing across all four pages:
  - Use `text-2xl font-semibold` for h1 elements (check current: some use `text-3xl font-bold`)
  - Update `app/inventory/page.tsx` line 448: change `text-3xl font-bold` to `text-2xl font-semibold`
  - Update `app/inventory-new/supply/page.tsx` line 237: change `text-3xl font-bold` to `text-2xl font-semibold`
  - Stock Card page already uses `text-2xl font-bold` at line 297 - change to `text-2xl font-semibold`
- Ensure consistent KPI card styling:
  - All cards should use `rounded-lg border` (default from Card component)
  - Verify CardHeader has appropriate padding
- Standardize table styling:
  - TableBody cells should use `text-sm`
  - TableHeader cells should use `font-medium`
- Standardize action button sizes:
  - Export, Refresh buttons should use `size="sm"` attribute
  - In `app/inventory/page.tsx` line 476-479, buttons already have appropriate sizing

### 7. Validate Implementation
- Run `pnpm build` to ensure no TypeScript errors
- Verify all modified files compile without errors
- Visual review: Confirm filter sections have subtle background
- Visual review: Confirm tables have improved spacing and alignment
- Visual review: Confirm KPI cards display in consistent grid layouts

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Build the project and verify no TypeScript or compilation errors
- `pnpm lint` - Run ESLint to check for any code style issues

## Notes
- Badge padding changes should be minimal to maintain readability while being more compact
- The `bg-muted/30` class provides a 30% opacity subtle background that works in both light and dark themes
- Sticky table headers improve usability when scrolling through long lists
- Alternating row colors (`even:bg-muted/30`) help users track rows across wide tables
- Font weight changes from `font-bold` to `font-semibold` provide a slightly softer, more modern look while maintaining hierarchy
- The transition-colors class adds smooth hover effects with minimal performance impact
