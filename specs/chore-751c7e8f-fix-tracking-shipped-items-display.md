# Chore: Fix Tracking Tab Shipped Items Display

## Metadata
adw_id: `751c7e8f`
prompt: `Fix Tracking tab Shipped Items display to show individual line items per 1 qty instead of summarized quantities. Current behavior aggregates items (e.g., 'Shipped Qty: 3'). Since Omnia-UI splits order lines per 1 qty, the display should show each unit as a separate row with '1PCS'. Reference design shows: 1) Each product appears as separate entry with qty 1, 2) Format: Product Name on first line, Barcode + '• 1PCS' on second line, 3) Badge showing 'x1' on the right side, 4) Same product name repeats for each unit (e.g., if qty=3, show 3 rows). Files to modify: src/components/order-detail/tracking-tab.tsx (ShippedItemsSection component) to expand aggregated shippedItems into individual 1-qty rows, and update the row format to match reference design with product name, barcode/SKU, '• 1PCS' label, and qty badge.`

## Chore Description
The Tracking tab's Shipped Items section currently displays aggregated product quantities in a table format (e.g., "Shipped Qty: 3"). This does not align with Omnia-UI's philosophy of splitting order lines per 1 quantity unit.

The fix requires transforming the `ShippedItemsSection` component from a tabular display with aggregated quantities to a card-style list where each unit appears as a separate row. For example, if a product has `shippedQty: 3`, it should display 3 separate rows, each showing the same product with quantity 1.

**Reference Design Format:**
- **Row 1 (Product Name):** Full product name displayed prominently
- **Row 2 (Details):** `[Barcode/SKU] • 1PCS` format
- **Right side:** Badge showing `x1`
- **Repetition:** Same product repeats for each unit in the shipped quantity

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail/tracking-tab.tsx** (lines 185-215) - Contains the `ShippedItemsSection` component that needs to be modified. Currently renders a table with aggregated quantities; needs to be converted to a card-style list with expanded individual rows.

- **src/types/audit.ts** (lines 344-350) - Defines the `ShippedItem` interface with fields: `productName`, `sku`, `shippedQty`, `orderedQty`, `uom`. The `shippedQty` field will be used to determine how many individual rows to render.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Expand ShippedItems Array into Individual Units
- In the `ShippedItemsSection` component, create a new expanded array using `useMemo` or `flatMap`
- For each `ShippedItem` in the original array, generate `shippedQty` individual entries
- Each expanded entry should reference the same product info but represent a single unit

### 2. Replace Table Layout with Card-Style List
- Remove the current `<table>` structure (thead, tbody, tr, td elements)
- Replace with a vertical list using `<div>` elements with appropriate flex/grid styling
- Each row should be a card-like container with subtle border or background

### 3. Update Row Format to Match Reference Design
- **Line 1:** Display `productName` as the primary text (font-medium)
- **Line 2:** Display `sku` followed by bullet separator `•` and `1PCS` (text-muted-foreground, smaller font)
- **Right side:** Add a badge component showing `x1` (small, rounded, muted background)

### 4. Apply Consistent Styling
- Use Tailwind CSS classes consistent with other components in the codebase
- Ensure proper spacing between rows (gap-2 or gap-3)
- Add hover state for rows if appropriate
- Maintain responsive behavior for mobile/tablet views

### 5. Validate the Implementation
- Run the development server and navigate to an order detail page with tracking data
- Verify shipped items display as individual rows
- Confirm products with qty > 1 show multiple identical rows
- Check that the format matches: Product Name / Barcode • 1PCS / x1 badge
- Ensure the component still handles empty shippedItems array gracefully

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation passes with no errors
- `pnpm lint` - Verify ESLint rules pass
- `pnpm dev` - Start development server and manually verify the Tracking tab Shipped Items section displays correctly with individual 1-qty rows

## Notes
- The existing `ShippedItem` interface does not need modification; the transformation happens at render time
- The `shippedQty` field determines how many times each product row should repeat
- The `uom` field should be replaced with hardcoded `1PCS` as per the reference design
- Keep the section header "Shipped Items" unchanged
- The `orderedQty` field from the original interface is no longer displayed in the new design
