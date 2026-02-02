# Chore: Fix incorrect price display in Items tab for order CDS260130806823

## Metadata
adw_id: `c0f47edb`
prompt: `Fix incorrect price display in Items tab for order CDS260130806823. In src/components/order-detail-view.tsx around line 815, change the price calculation from 'formatCurrency((item.unit_price || 0) * item.quantity)' to 'formatCurrency(item.unit_price || 0)' to display the unit price instead of total amount. The label says 'each' so it should show the unit price (฿1,850.00), not the line total (฿3,700.00). Remove the '* item.quantity' multiplication.`

## Chore Description
The Items tab in the order detail view is displaying incorrect pricing information. The price column shows the line total (unit price × quantity) instead of the unit price per item. The column label clearly indicates "each", which semantically means it should display the unit price, not the total amount.

**Current Behavior**:
- Lipstick Loveshine item with unit_price: ฿1,850 and quantity: 2 displays as ฿3,700.00 "each"

**Expected Behavior**:
- Should display ฿1,850.00 "each" (the actual unit price)

**Root Cause**:
Line 815 in `src/components/order-detail-view.tsx` incorrectly multiplies unit_price by quantity before formatting.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** (line ~815) - Contains the incorrect price calculation in the Items tab rendering logic. This is the primary file requiring modification.
- **src/lib/mock-data.ts** (line ~8930-8937) - Contains mock order data for CDS260130806823 with the Lipstick item that demonstrates the issue. Used for validation testing.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify Current Implementation
- Read src/components/order-detail-view.tsx around line 815
- Confirm the current code shows `formatCurrency((item.unit_price || 0) * item.quantity)`
- Confirm the label below shows "each" (line ~818)

### 2. Fix Price Display Calculation
- Locate line 815 in src/components/order-detail-view.tsx
- Change from: `{formatCurrency((item.unit_price || 0) * item.quantity)}`
- Change to: `{formatCurrency(item.unit_price || 0)}`
- Remove the `* item.quantity` multiplication
- Save the file

### 3. Validate the Fix
- Start the development server to verify no compilation errors
- Navigate to order CDS260130806823 in the browser
- Verify the Lipstick item (SKU: CDS26769646) now shows ฿1,850.00 instead of ฿3,700.00
- Verify the label still says "each" below the price
- Check other items to ensure they also display unit prices correctly

### 4. Run Code Quality Checks
- Run TypeScript compilation to ensure no type errors
- Verify the change doesn't break any other functionality
- Confirm the fix aligns with the semantic meaning of "each"

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and verify the order detail view loads without errors
- `grep -n "formatCurrency((item.unit_price || 0) \* item.quantity)" src/components/order-detail-view.tsx` - Should return no results (confirms removal)
- `grep -n "formatCurrency(item.unit_price || 0)" src/components/order-detail-view.tsx` - Should return line 815 (confirms fix applied)
- Manual browser test: Navigate to order CDS260130806823 Items tab and verify Lipstick shows ฿1,850.00

## Notes
- This fix was previously identified in observation #5714 but the code change was not committed
- The mock data in src/lib/mock-data.ts correctly has unitPrice: 1850 and quantity: 2, so no changes needed there
- The fix is a simple one-line change that corrects the semantic display of "unit price per item"
- After this fix, users will see the correct per-unit pricing, and the line total can be calculated mentally (or displayed elsewhere if needed)
