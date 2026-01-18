# Chore: Inventory Supply Table Column Sizing and UI Improvements

## Metadata
adw_id: `3a58ff9d`
prompt: `Improve the Inventory Supply page table UI at app/inventory-new/supply/page.tsx for better usability: resize table columns for better proportions, add text truncation with tooltips, and make Item ID font smaller`

## Chore Description
Improve the Inventory Supply page table UI for better usability and visual balance. The current table has inconsistent column widths that don't match the content they display. This chore will:

1. Resize all table columns to match their typical content width
2. Add text truncation with ellipsis for Store Name column
3. Ensure Product Name can display full text without truncation
4. Make Item ID use smaller font (text-xs) to fit better
5. Keep numeric columns right-aligned and centered appropriately
6. Add hover tooltips on truncated text for accessibility

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/supply/page.tsx** - Main file to modify. Contains the inventory supply table with column definitions in TableHead components and data rendering in TableBody.
- **src/components/ui/table.tsx** - Table component definitions for styling reference.
- **src/components/ui/tooltip.tsx** - Tooltip component for hover text on truncated content.

### New Files
- None required - all changes are modifications to existing file.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Take Screenshot of Current State
- Use Playwright MCP to navigate to http://localhost:3000/inventory-new/supply
- Wait for page to fully load
- Take a screenshot to document the current table layout before changes

### 2. Add Tooltip Import
- Add import for Tooltip, TooltipContent, TooltipProvider, TooltipTrigger from "@/components/ui/tooltip"
- Place import with other UI component imports at top of file

### 3. Update Table Header Column Widths
Update the TableHead components with new width specifications:
- **Store ID**: Change from `w-[120px]` to `w-[100px]` - compact for IDs like "CDS10154"
- **Store Name**: Change from `min-w-[180px]` to `w-[120px]` - fixed width for short names
- **Item ID**: Change from `w-[150px]` to `w-[140px]` - allow slight text wrap
- **Product Name**: Change from `min-w-[200px]` to no fixed width (flex/auto) - takes remaining space
- **Quantity**: Change from `w-[120px]` to `w-[90px]` - narrow centered column
- **Available Qty**: Keep at `w-[120px]` but change to `w-[100px]` - narrow centered column
- **Supply Type**: Change from `w-[200px]` to `w-[130px]` - badge display width

### 4. Update Store Name Cell with Truncation and Tooltip
- Wrap Store Name TableCell content with TooltipProvider, Tooltip, TooltipTrigger, TooltipContent
- Add CSS classes for truncation: `truncate max-w-[120px]` on the text span
- TooltipContent should show full store name
- Only show tooltip when content would be truncated (store name exists)

### 5. Update Item ID Cell Styling
- Change font from `text-sm` to `text-xs` for smaller display
- Keep `font-mono` class for monospace appearance
- Ensure the cell allows text wrap if needed for long IDs

### 6. Ensure Product Name Shows Full Text
- Remove any width constraints on Product Name column header
- Ensure TableCell for Product Name has no truncation classes
- Product Name should expand to fill available space

### 7. Verify Numeric Column Alignment
- Confirm Quantity and Available Qty columns have `text-center` on TableHead
- Confirm TableCell content is centered with `text-center` class
- Ensure the inline badge styling maintains centered alignment

### 8. Take Final Screenshot to Validate
- Use Playwright MCP to navigate to http://localhost:3000/inventory-new/supply
- Take a screenshot to show the improved table layout
- Compare with initial screenshot to confirm improvements

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript or build errors
- Use Playwright MCP browser_snapshot to verify:
  - Table columns are properly sized
  - Store Name truncates with ellipsis when needed
  - Product Name displays full text
  - Item ID uses smaller font
  - Numeric columns are centered

## Notes
- The table uses shadcn/ui Table components which inherit Tailwind CSS classes
- TooltipProvider should wrap the entire tooltip structure for proper context
- Consider using `title` attribute as fallback for basic tooltip if Tooltip component import causes issues
- The table has alternating row colors via `bg-muted/30` on odd rows - ensure this styling is preserved
- Sorting functionality must remain intact on sortable columns (Store ID, Item ID, Quantity, Available Qty, Supply Type)
