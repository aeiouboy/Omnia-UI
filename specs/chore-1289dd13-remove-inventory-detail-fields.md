# Chore: Remove Inventory Detail Fields and Disable Buttons

## Metadata
adw_id: `1289dd13`
prompt: `In inventory detail page (src/components/inventory-detail-view.tsx): Remove Store field, Supplier field, and Unit Price field from the product info section. Remove Min/Max Stock, Reorder Point, and Total Value from the Stock Breakdown additional info section. Disable the Edit and Reorder buttons (keep visible but add disabled prop with cursor-not-allowed style).`

## Chore Description
This chore simplifies the inventory detail page by removing several fields that are not currently needed in the UI. The changes will make the interface cleaner and more focused on essential information. Specifically:

1. **Product Info Section**: Remove Store, Supplier, and Unit Price fields
2. **Stock Breakdown Section**: Remove Min/Max Stock, Reorder Point, and Total Value from the additional info area at the bottom
3. **Action Buttons**: Disable Edit and Reorder buttons (keep them visible but non-interactive with disabled styling)

## Relevant Files
Use these files to complete the chore:

- **src/components/inventory-detail-view.tsx** (lines 1-775)
  - Main file to edit - contains the inventory detail view component
  - Product info section is around lines 299-354
  - Stock Breakdown additional info section is around lines 540-558
  - Edit and Reorder buttons are around lines 236-253

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove Store Field from Product Info Section
- Locate the Store field section (lines 308-314)
- Remove the entire div containing the Store icon, label, and value
- Keep the Barcode field and Item Type field

### 2. Remove Supplier Field from Product Info Section
- Locate the Supplier field section (lines 316-322)
- Remove the entire div containing the Supplier icon, label, and value
- This is the second field in the grid

### 3. Remove Unit Price Field from Product Info Section
- Locate the Unit Price field section (lines 324-330)
- Remove the entire div containing the Unit Price icon, label, and value
- This leaves only Barcode and Item Type in the product details grid

### 4. Remove Min/Max Stock, Reorder Point, and Total Value from Stock Breakdown
- Locate the "Additional Stock Info" section after the stock warnings (lines 540-558)
- Remove the entire section containing:
  - The Separator
  - The grid with Min/Max Stock, Reorder Point, and Total Value
- This section is at the bottom of the Stock Breakdown card before the closing TooltipProvider

### 5. Disable Edit Button
- Locate the Edit button (lines 236-243)
- Add `disabled` prop to the Button component
- Add `className="gap-2 cursor-not-allowed opacity-50"` to style it as disabled

### 6. Disable Reorder Button
- Locate the Reorder button (lines 244-252)
- Add `disabled` prop to the Button component
- Add `className="gap-2 cursor-not-allowed opacity-50"` to style it as disabled
- Keep the conditional rendering logic (only show when status is not healthy)

### 7. Verify Changes and Test
- Review the edited file to ensure all specified fields are removed
- Ensure the grid layouts still work properly with fewer fields
- Verify buttons are visible but disabled with proper styling
- Check that no unused imports remain (Store icon from lucide-react might still be used elsewhere)

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start dev server and verify the inventory detail page displays correctly without errors
- Navigate to an inventory detail page and verify:
  - Store, Supplier, and Unit Price fields are NOT visible in product info section
  - Min/Max Stock, Reorder Point, and Total Value are NOT visible in Stock Breakdown section
  - Edit and Reorder buttons are visible but disabled with grayed-out appearance
  - No console errors appear
- `npm run build` - Verify production build completes without TypeScript or lint errors
- `git diff src/components/inventory-detail-view.tsx` - Review the exact changes made

## Notes
- The grid layout may need adjustment since we're removing 3 fields from a 2-column grid
- After removing fields, the product info section will have only 2 items (Barcode and Item Type), so the grid will naturally adjust
- The disabled buttons should remain visible for UI consistency but be non-interactive
- Consider removing unused icon imports after the changes (Store, TrendingUp icons) if they're not used elsewhere in the component
- The Total Value calculation (`totalValue` variable around line 128) can be removed since it's no longer displayed
