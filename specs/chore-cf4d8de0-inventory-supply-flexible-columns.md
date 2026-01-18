# Chore: Inventory Supply Table Flexible Column Sizing

## Metadata
adw_id: `cf4d8de0`
prompt: `Fix the Inventory Supply table at app/inventory-new/supply/page.tsx - remove fixed column widths and use flexible sizing`

## Chore Description
Remove fixed width classes from the Inventory Supply table and replace them with flexible sizing approaches. The current implementation uses fixed widths like `w-[100px]`, `w-[120px]`, `w-[140px]` which prevent the table from adapting to content size. This chore will update the table to use `whitespace-nowrap` for auto-fit columns and `table-auto` for automatic column sizing, allowing the table to better utilize available space while keeping content readable.

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/supply/page.tsx** - Main file containing the Inventory Supply table that needs modification. Contains 7 TableHead elements with fixed widths and TableCell elements with truncation styles that need to be updated.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add table-auto Class to Table Component
- Locate the Table component on line 339
- Change `<Table className="w-full">` to `<Table className="table-auto w-full">`
- This enables automatic column sizing based on content

### 2. Update TableHead Elements with Flexible Classes
- **Store ID (line 342-350)**: Remove `w-[100px]`, add `whitespace-nowrap`
- **Store Name (line 351-353)**: Remove `w-[120px]`, add `whitespace-nowrap`
- **Item ID (line 354-362)**: Remove `w-[140px]`, add `whitespace-nowrap`
- **Product Name (line 363-365)**: Keep as-is, no width constraint (allow natural wrapping)
- **Quantity (line 366-374)**: Remove `w-[90px]`, change `text-center` to `whitespace-nowrap text-right`
- **Available Qty (line 375-383)**: Remove `w-[100px]`, change `text-center` to `whitespace-nowrap text-right`
- **Supply Type (line 384-392)**: Remove `w-[130px]`, add `whitespace-nowrap`

### 3. Update TableCell Elements
- **Store Name cell (line 418-432)**: Remove `truncate` class and `max-w-[120px]` from the span element
- Keep the Tooltip component but remove truncation - content should display fully
- **Quantity cells (lines 440-443, 445-451)**: Change `text-center` to `text-right` to align with headers
- Keep `text-xs` on Item ID cell for compact display

### 4. Clean Up Store Name Cell Markup
- The Store Name cell currently has tooltip with truncation
- Update to show full text without truncation but keep tooltip for accessibility:
  ```tsx
  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
      {item.storeName || "—"}
  </TableCell>
  ```
- Remove the TooltipProvider/Tooltip wrapper since content is no longer truncated

### 5. Validate with Playwright MCP
- Navigate to http://localhost:3000/inventory-new/supply
- Take a screenshot to validate the flexible column sizing
- Verify columns auto-fit to content width
- Verify Product Name column can wrap naturally

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the code compiles without errors
- Use Playwright MCP `browser_navigate` to http://localhost:3000/inventory-new/supply
- Use Playwright MCP `browser_take_screenshot` to capture the updated table layout
- Verify in screenshot that:
  - Store ID, Store Name, Item ID columns fit content without fixed widths
  - Quantity and Available Qty columns are right-aligned
  - Product Name column allows natural text wrapping
  - No horizontal scrolling on standard viewport widths

## Notes
- The tooltip on Store Name can be completely removed since content will no longer be truncated
- Keep `font-mono text-xs` on Item ID for compact monospace display
- The `table-auto` class combined with `whitespace-nowrap` will cause columns to fit their content exactly
- Product Name intentionally has no whitespace-nowrap to allow wrapping for long product names
