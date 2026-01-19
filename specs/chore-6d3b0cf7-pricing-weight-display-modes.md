# Chore: Update Pricing & Promotions section with weight-based display modes

## Metadata
adw_id: `6d3b0cf7`
prompt: `Update the Pricing & Promotions section in order-detail-view.tsx (around lines 773-830) to handle 2 display modes based on whether item has weight`

## Chore Description
Modify the Pricing & Promotions section in the order detail view to conditionally display different fields based on whether an item has weight data:

**Use Case 1 - Non-weight items (show Qty):**
When `item.weight` is undefined, null, or 0:
- Row 1: Price (left) | Qty (right)
- Row 2: Total (left) | (empty right)

**Use Case 2 - Weight items (show Weight fields):**
When `item.weight` exists and > 0:
- Row 1: Price (left) | Weight (right)
- Row 2: Weight (Actual) (left) | Total (right)

The implementation uses a 2-column grid layout with green color (text-green-600) for Price and Total values. The standalone Qty, Weight, and Weight (Actual) fields that were previously shown for all items should be removed and replaced with this conditional logic.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** (lines 774-838) - The main file to modify. Contains the Pricing & Promotions column within the item details accordion. Currently displays Price, Total, Qty, Weight, and Weight (Actual) as separate rows for all items regardless of weight presence.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove existing Price, Total, Qty, Weight fields
- Remove the current Price row (lines 780-783)
- Remove the current Total row (lines 784-787)
- Remove the current Qty row (lines 788-791)
- Remove the Weight row (lines 831-833)
- Remove the Weight (Actual) row (lines 834-837)

### 2. Add conditional weight-based display logic
- Add a `hasWeight` constant check: `item.weight && item.weight > 0`
- Implement a 2-column grid layout with `grid grid-cols-2 gap-x-4 gap-y-2 text-sm`
- Add conditional rendering based on `hasWeight`:
  - **Column 1, Row 1**: Always show Price with `text-green-600` color
  - **Column 2, Row 1**: Show Weight if `hasWeight`, otherwise show Qty
  - **Column 1, Row 2**: Show Weight (Actual) if `hasWeight`, otherwise show Total with `text-green-600` color
  - **Column 2, Row 2**: Show Total with `text-green-600` color if `hasWeight`, otherwise empty

### 3. Preserve unchanged sections
- Keep the Promotions & Coupons section (lines 793-824) unchanged
- Keep the Gift with Purchase field (lines 826-829) unchanged

### 4. Validate the implementation
- Ensure the grid layout renders correctly for both weight and non-weight items
- Verify Price and Total use `text-green-600` color
- Confirm Qty and Weight fields use `text-gray-900` color
- Test with items that have weight > 0 and items with weight = 0 or undefined

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm lint` - Ensure no linting errors
- `pnpm build` - Ensure the project builds without TypeScript errors
- `pnpm dev` - Start dev server and manually verify:
  1. Open an order with weight items (weight > 0) - should show Price | Weight, Weight (Actual) | Total layout
  2. Open an order with non-weight items (weight = 0 or undefined) - should show Price | Qty, Total | (empty) layout
  3. Verify Price and Total values display in green color
  4. Verify Qty and Weight values display in dark gray color

## Notes
- The `item.actualWeight` field should fall back to `item.weight` if not available
- The existing `space-y-3` wrapper should be replaced with the new `grid` layout for the pricing fields section only
- The Promotions & Coupons and Gift with Purchase sections remain outside the grid and keep their existing styling
