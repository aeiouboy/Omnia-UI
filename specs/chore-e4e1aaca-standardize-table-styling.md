# Chore: Standardize Table Styling Across All Pages

## Metadata
adw_id: `e4e1aaca`
prompt: `Standardize table styling across all pages: 1. Ensure consistent row height across Order Management, Inventory Availability, and Stock Card tables 2. Standardize badge/pill styling for status indicators (On Hand, Pre-Order, PAID, PENDING, etc.) 3. Make sortable column headers visually consistent with sort indicator placement 4. Add hover state for clickable rows in Stock Card 5. Ensure numeric columns (quantities, totals) are right-aligned consistently`

## Chore Description

This chore standardizes table styling across three main data tables in the Omnia UI application:

1. **Order Management Hub** (`order-management-hub.tsx`) - The main order table
2. **Inventory Availability** (`app/inventory-new/supply/page.tsx`) - Inventory supply table
3. **Stock Card** (`stock-by-store-table.tsx`) - Stock by store detail table

The goal is to create visual consistency across all tables for:
- Row heights (consistent padding)
- Badge/pill styling for status indicators
- Sortable column header styling with consistent sort indicator placement
- Hover states for interactive rows
- Right-alignment for numeric columns

## Relevant Files

### Primary Files
- **`src/components/order-management-hub.tsx`** - Order Management table (lines 1656-1790). Currently uses `TableHeader className="bg-light-gray"`, custom styling with `font-heading text-deep-navy`, and `h-12` header height from base component.

- **`app/inventory-new/supply/page.tsx`** - Inventory Availability table (lines 428-561). Uses inline sort icon component (`SortIcon`), `hover:bg-muted/50` on sortable headers, alternating row colors (`bg-muted/30`), and right-aligned numeric columns.

- **`src/components/inventory/stock-by-store-table.tsx`** - Stock Card table (lines 150-262). Uses `ArrowUpDown/ArrowUp/ArrowDown` icons for sorting, `cursor-pointer hover:bg-muted/50` on headers, and lacks row click hover state.

### Supporting Files
- **`src/components/ui/table.tsx`** - Base table components. `TableHead` has `h-12 px-4` default, `TableCell` has `p-4`, `TableRow` has `hover:bg-muted/50` default.

- **`src/components/ui/badge.tsx`** - Base badge component with `rounded-full`, `px-2.5 py-0.5`, `text-xs font-semibold` defaults.

- **`src/components/order-badges.tsx`** - Status badge components (PaymentStatusBadge, OrderStatusBadge, etc.). Uses `font-mono text-sm` with various color schemes.

### New Files
None - this chore modifies existing files only.

## Step by Step Tasks

### 1. Define Table Styling Constants
- Create a shared styling reference at the top of each table component for documentation
- Standard row height: Use `p-4` on TableCell (consistent with base component)
- Header styling: `h-12 px-4` with `bg-muted/30` background
- Sortable header styling: `cursor-pointer hover:bg-muted/50` with consistent icon placement

### 2. Standardize Inventory Availability Table (supply/page.tsx)
- Update `TableRow` to not use alternating colors (lines 507-541) - remove `${index % 2 === 1 ? 'bg-muted/30' : ''}` as it conflicts with hover states
- Ensure all TableHead with sorting have consistent pattern:
  - `cursor-pointer hover:bg-muted/50` class
  - Sort icon positioned with `ml-1.5` gap inside a `flex items-center` wrapper
  - For right-aligned headers, use `flex items-center justify-end`
- Verify numeric columns use `text-right` on both TableHead and TableCell
- Update inline SortIcon component to use Lucide icons (ArrowUp, ArrowDown, ArrowUpDown) for consistency with Stock Card table

### 3. Standardize Stock Card Table (stock-by-store-table.tsx)
- Add row hover styling for clickable behavior by ensuring TableRow has `cursor-pointer hover:bg-muted/50` (currently missing cursor-pointer)
- Verify all numeric columns (Available, Reserved, Safety Stock, Total) have `text-right` on both header and cell
- Confirm sort icon placement is consistent: icon after text with `ml-1` gap
- Add subtle transition: `transition-colors duration-100` to TableRow

### 4. Standardize Order Management Table (order-management-hub.tsx)
- Update header styling from `bg-light-gray` to `bg-muted/30` for consistency (line 1658)
- Remove custom `hover:bg-light-gray/80` and use standard `hover:bg-transparent` on header row (line 1659)
- Ensure row styling uses consistent classes with other tables
- Verify Order Total column has `text-right` alignment (currently just displays text, not aligned)

### 5. Standardize Badge/Pill Styling for Status Indicators
- In `app/inventory-new/supply/page.tsx`:
  - Supply Type badges (lines 534-539): Currently uses `rounded-full px-2.5 py-0.5 text-xs font-medium`
  - Update to use consistent `font-mono text-sm` like order-badges.tsx for consistency
  - Quantity badges (lines 521-531): Currently uses `rounded-md px-2 py-1 text-sm font-semibold`
  - Keep as-is since these are numeric indicators, not status badges
- Review and ensure color schemes are consistent:
  - On Hand: `bg-blue-100 text-blue-800`
  - Pre-Order: `bg-yellow-100 text-yellow-800`
  - PAID: `bg-green-100 text-green-800`
  - PENDING: `bg-orange-100 text-orange-800`

### 6. Ensure Consistent Right-Alignment for Numeric Columns
- **Order Management**: Update Order Total column to have `text-right` on TableHead and TableCell (line 1663, 1736)
- **Inventory Availability**: Already correct with `text-right` on Total Qty and Available Qty columns
- **Stock Card**: Already correct with `text-right` on Available, Reserved, Safety Stock, Total columns

### 7. Validate All Changes
- Run `pnpm build` to ensure no TypeScript or build errors
- Run `pnpm dev` to visually verify:
  - Row heights are consistent across all three tables
  - Badges have consistent font styling and padding
  - Sort icons appear consistently positioned
  - Numeric columns are right-aligned
  - Hover states work on all interactive rows

## Validation Commands

Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation passes with no errors
- `pnpm lint` - Verify no ESLint issues introduced
- `pnpm dev` - Start dev server and manually verify:
  - Navigate to `/orders` - Check Order Management table styling
  - Navigate to `/inventory-new/supply` - Check Inventory Availability table
  - Navigate to `/inventory-new/stores` and select an item - Check Stock Card table

## Notes

### Current Styling Differences Observed

| Aspect | Order Management | Inventory Availability | Stock Card |
|--------|------------------|----------------------|------------|
| Header BG | `bg-light-gray` | None | None |
| Row Height | `p-4` (default) | `p-4` (default) | `p-4` (default) |
| Sort Icons | N/A (not sortable) | Text arrows `↑`/`↓` | Lucide icons |
| Hover | Custom urgency-based | `hover:bg-muted/50` | None on row |
| Alternating | No | Yes (`bg-muted/30`) | No |
| Numeric Align | Left | Right | Right |

### Design Decisions
- Prefer Lucide icons (ArrowUp, ArrowDown, ArrowUpDown) over text arrows for sorting
- Use `hover:bg-muted/50` as standard row hover state
- Remove alternating row colors to maintain clean hover states
- All status badges should use `font-mono text-sm` for consistency with order-badges.tsx
- Quantity indicators (numeric values) can use different styling than status badges

### Backward Compatibility
- Changes are purely visual - no functional changes to data or behavior
- Custom urgency styling in Order Management table should be preserved alongside new standards
