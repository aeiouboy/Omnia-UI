# Chore: Fix TooltipProvider Error on Inventory Detail Page

## Metadata
adw_id: `4da4525d`
prompt: `Fix critical TooltipProvider error on Inventory Detail page. The issue is at line 292 in src/components/inventory-detail-view.tsx where the Supply Type field uses Tooltip without wrapping it in TooltipProvider. The error message is 'Tooltip must be used within TooltipProvider'.`

## Chore Description
Fix a runtime error on the Inventory Detail page (/inventory/[id]) where a Tooltip component is used without being wrapped in a TooltipProvider. This causes the application to crash with the error: "Tooltip must be used within TooltipProvider".

**Root Cause**: At line 292 in `src/components/inventory-detail-view.tsx`, the Supply Type field uses a `<Tooltip>` component directly without wrapping it in `<TooltipProvider>`. According to Radix UI's requirements, all Tooltip components must be descendants of a TooltipProvider.

**Solution**: Wrap the Supply Type Tooltip in a TooltipProvider component.

## Relevant Files
Use these files to complete the chore:

- **`src/components/inventory-detail-view.tsx`** - Contains the problematic Tooltip at line 292 that needs to be wrapped in TooltipProvider

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify Current Implementation
- Read `src/components/inventory-detail-view.tsx` focusing on line 292
- Locate the Supply Type Tooltip component
- Confirm the Tooltip is not wrapped in TooltipProvider
- Note that TooltipProvider is already imported at the top of the file (line 51)

### 2. Fix Supply Type Tooltip
- In `src/components/inventory-detail-view.tsx` at line 292:
  - Wrap the existing `<Tooltip>` component with `<TooltipProvider>`
  - Ensure proper indentation is maintained
  - The fix should change from:
    ```tsx
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 cursor-help">
          <Badge>...</Badge>
          <Info className="h-3 w-3 text-muted-foreground" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">...</p>
      </TooltipContent>
    </Tooltip>
    ```
  - To:
    ```tsx
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help">
            <Badge>...</Badge>
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">...</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    ```

### 3. Verify Other Tooltip Usage
- Search for any other `<Tooltip>` usage in the same file that might have the same issue
- Note: The file already has a TooltipProvider wrapping other tooltips (line 348), so only the Supply Type tooltip at line 292 needs fixing

### 4. Test the Fix
- Start the development server with `pnpm dev`
- Navigate to http://localhost:3000/inventory
- Click on any product row to open the Inventory Detail page
- Verify the page loads without the "Tooltip must be used within TooltipProvider" error
- Verify the Supply Type field displays correctly with its tooltip
- Hover over the info icon next to the Supply Type badge to verify the tooltip appears

### 5. Validate Related Features
- Verify the 'Stock by Store' section displays as a table
- Verify the Recent Transactions section has an Export CSV button
- Verify all other tooltips on the page still work correctly
- Check browser console for any remaining errors

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server
- Navigate to http://localhost:3000/inventory and click any product:
  - Verify Inventory Detail page loads without "TooltipProvider" error
  - Verify Supply Type field displays with working tooltip
  - Verify hovering over the info icon shows tooltip content
  - Verify Stock by Store section displays as table
  - Verify Recent Transactions has Export CSV button
- `pnpm build` - Verify production build compiles without TypeScript errors
- `pnpm lint` - Verify no linting errors introduced

## Notes
- TooltipProvider is already imported at the top of the file, so no import changes are needed
- The file already has a TooltipProvider at line 348 wrapping the Stock Breakdown tooltips
- This is a simple fix - only adding one wrapper component
- The error only occurs on the Inventory Detail page (/inventory/[id]), not the main inventory list
- After fixing, the tooltip should work consistently with other tooltips on the page
