# Chore: Remove Amount Display from Payment Method Header Row

## Metadata
adw_id: `45ef9ac8`
prompt: `Remove the amount display from payment method header row in src/components/order-detail/payments-tab.tsx. In the header row section (around lines 213-232), remove the span element that displays formatCurrency(payment.amountCharged) (lines 228-230). The header row should only show: Icon + Payment Method Name on the left, and Status Badge on the right. Remove the entire span with className 'font-semibold text-gray-900' that contains the formatCurrency call. Keep the amounts only in the vertical details section below (Amount to be charged and Amount charged fields).`

## Chore Description
Further simplify the Payment Methods card header row by removing the amount display that currently appears next to the status badge. This follows the recent vertical layout refactoring (chore-73059c6a) and amount display fixes (chore-38c423da, chore-fee70f1e). The header row currently displays:
- Left: Payment method icon + name
- Center/Right: Status badge + Amount charged

The new design should only show:
- Left: Payment method icon + name
- Right: Status badge

All amount information (Amount to be charged and Amount charged) will remain exclusively in the vertical details section below the header, maintaining the clean separation between method identification and financial details.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail/payments-tab.tsx** (lines 220-240) - The main file to modify. Contains the Payment Methods Card component with the header row that currently displays the amount. Need to remove the amount span element while preserving the icon/name and status badge layout.

### Related Context Files (no changes needed)
- **specs/chore-73059c6a-payment-methods-vertical-layout.md** - Previous refactoring that restructured payment methods from table to vertical layout
- **specs/chore-38c423da-fix-payment-methods-amount-display.md** - Previous fix that changed header amount from totalAmount to amountCharged
- **specs/chore-fee70f1e-payment-amount-fallback-logic.md** - Previous fix that added fallback logic for settlement-only transactions

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Read Current Implementation
- Read src/components/order-detail/payments-tab.tsx focusing on lines 220-240
- Identify the exact span element displaying `formatCurrency(payment.amountCharged)`
- Verify the surrounding flex layout structure

### 2. Remove Amount Display Span
- Locate the header row section within the payment method mapping (around line 221-240)
- Find the div with `className="flex items-center gap-4"` that contains the status badge and amount
- Remove the span element with `className="font-semibold text-gray-900"` that displays `formatCurrency(payment.amountCharged)`
- Keep the `PaymentStatusBadge` component in place

### 3. Update Flex Layout
- The header row flex container should now only contain:
  - Left side: `<div className="flex items-center gap-3">` with icon + payment method name
  - Right side: `PaymentStatusBadge` component only (no amount)
- Remove the nested `<div className="flex items-center gap-4">` wrapper if it becomes unnecessary
- Ensure `justify-between` alignment still works correctly with just two elements

### 4. Verify Vertical Details Section
- Confirm that the vertical details section (lines 242-279) still contains both:
  - "Amount to be charged" field (line 269-272)
  - "Amount charged" field (line 275-278)
- No changes needed to this section - amounts remain here

### 5. Validate Build and Visual Output
- Run TypeScript check to ensure no compilation errors
- Verify the layout renders correctly with only icon/name and status badge in header

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation and Next.js build succeeds with no errors
- Visual inspection: Navigate to order detail page with payment methods and verify:
  1. Header row shows ONLY: Payment method icon + name (left) and Status badge (right)
  2. No amount display appears in the header row
  3. Both "Amount to be charged" and "Amount charged" still display correctly in the vertical details section below
  4. Layout remains properly aligned with flexbox justify-between
  5. Multiple payment methods still render correctly (if applicable)

## Notes
- This is a pure UI simplification - no business logic changes
- The change affects only the header row JSX rendering (approximately 3-5 lines to remove)
- The vertical details section with both amount fields remains completely unchanged
- Test with orders that have multiple payment methods to ensure consistent layout
- Reference orders in mock data: CDS260130158593 (Credit Card + T1 Points), CDS260130806823
