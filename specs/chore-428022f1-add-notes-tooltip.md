# Chore: Add Tooltip to Notes Column in Recent Transactions Table

## Metadata
adw_id: `428022f1`
prompt: `Add tooltip to Notes column in Recent Transactions table to show full content on hover: 1) In src/components/recent-transactions-table.tsx, import Tooltip, TooltipContent, TooltipProvider, TooltipTrigger from '@/components/ui/tooltip'. 2) Wrap the Notes cell content with Tooltip component - TooltipTrigger contains the truncated content, TooltipContent shows full notes text including user name (if exists), notes text, and order ID (if exists). 3) Tooltip should appear on hover with a slight delay (delayDuration={300}). 4) TooltipContent should have max-width of 300px and allow text to wrap naturally. 5) Keep the existing truncate behavior for the cell display, tooltip shows complete untruncated content.`

## Chore Description
Enhance the user experience of the Recent Transactions table by adding a tooltip to the Notes column. Currently, the Notes column displays truncated content with a max-width of 200px, making it difficult to read full transaction details. This chore adds a hover tooltip that displays the complete content including:
- User name (when present and appropriate based on transaction type)
- Full notes text (untruncated)
- Order reference ID (when present, with clickable link for stock_out/return transactions)

The tooltip should appear after a 300ms delay on hover, have a maximum width of 300px with natural text wrapping, while maintaining the existing truncated display in the table cell for clean UI presentation.

## Relevant Files
Use these files to complete the chore:

- **src/components/recent-transactions-table.tsx** (lines 247-278) - Main component file where the Notes column cell is rendered. Contains the truncated content display logic that needs to be wrapped with tooltip components.

- **src/components/ui/tooltip.tsx** - Tooltip UI component library based on Radix UI primitives. Provides TooltipProvider, Tooltip, TooltipTrigger, and TooltipContent components needed for the implementation.

- **src/types/inventory.ts** - Type definitions for StockTransaction interface to ensure type safety when accessing transaction properties.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Tooltip Component Imports
- Open `src/components/recent-transactions-table.tsx`
- Add imports for `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` from `@/components/ui/tooltip`
- Place the import statement near the top of the file with other UI component imports

### 2. Wrap Table Component with TooltipProvider
- Locate the main return statement in the `RecentTransactionsTable` component (around line 169)
- Wrap the entire `<Card>` component with `<TooltipProvider>`
- This enables tooltip functionality for all tooltips within the table

### 3. Implement Tooltip in Notes Column Cell
- Locate the Notes column `<TableCell>` (around line 247)
- Wrap the existing `<div className="truncate">` content with Tooltip components:
  - `<Tooltip>` as the root wrapper with `delayDuration={300}` prop
  - `<TooltipTrigger asChild>` wrapping the existing truncated div
  - `<TooltipContent>` with `className="max-w-[300px] whitespace-normal break-words"` containing the full untruncated content
- Ensure the TooltipTrigger contains the exact same truncated content as currently displayed
- Ensure the TooltipContent contains the complete untruncated version of:
  - User name with formatting (if applicable)
  - Full notes text
  - Reference ID with link (if applicable)

### 4. Test Tooltip Functionality
- Run `pnpm dev` to start the development server
- Navigate to a page displaying the Recent Transactions table
- Hover over Notes column cells to verify:
  - Tooltip appears after 300ms delay
  - Tooltip displays full content without truncation
  - Tooltip max-width is 300px with proper text wrapping
  - Table cell still displays truncated content
  - Links in tooltip are still clickable (for stock_out/return transactions)
  - Tooltip positioning is appropriate and readable

### 5. Verify Build and Type Safety
- Run `pnpm build` to ensure no TypeScript errors
- Verify no console errors or warnings in browser
- Check that tooltip behavior doesn't interfere with other table interactions (sorting, filtering, scrolling)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `pnpm lint` - Ensure code meets linting standards
- **Manual Testing**: Start dev server with `pnpm dev`, navigate to Recent Transactions table, and hover over Notes cells to verify tooltip behavior matches requirements

## Notes
- The tooltip should preserve all existing functionality including clickable order reference links
- The truncated display in the table cell should remain unchanged visually
- TooltipProvider should wrap the entire Card component to ensure proper tooltip context
- The `asChild` prop on TooltipTrigger prevents adding extra wrapper elements that could break styling
- Use `whitespace-normal break-words` in TooltipContent to ensure text wraps naturally within the 300px max-width
