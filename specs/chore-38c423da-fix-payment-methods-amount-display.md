# Chore: Fix Payment Methods Amount Display

## Metadata
adw_id: `38c423da`
prompt: `Fix Payment Methods display to show both Amount to be charged and Amount charged fields. Changes needed in src/components/order-detail/payments-tab.tsx: 1) In the header row (line 229), change from payment.totalAmount to payment.amountCharged to display the individual payment method's charged amount (e.g., ฿2,490.00 for Credit Card, ฿500.00 for The1 Points), 2) Keep BOTH 'Amount to be charged' field (lines 260-266) AND 'Amount charged' field (lines 268-274) in the vertical details section, 3) Remove the conditional display - show both fields even if values are 0 (remove the 'if amountToBeCharged > 0' and 'if amountCharged > 0' conditions), 4) Display layout should be: Header row shows Icon + Payment Name | Status Badge | Amount Charged, then vertical details show card/member info, Amount to be charged, and Amount charged.`

## Chore Description
The Payment Methods card in the Payments Tab needs to be updated to properly display both authorization and settlement amounts. Currently, the header row shows `payment.totalAmount` which combines both types, but it should show only the `payment.amountCharged` (settlement amount) for clarity. Additionally, the "Amount to be charged" and "Amount charged" fields in the vertical details section are conditionally hidden when their values are 0, which makes the UI inconsistent. Both fields should always be visible regardless of their values.

## Relevant Files
Use these files to complete the chore:

- **`src/components/order-detail/payments-tab.tsx`** - The main file containing the Payment Methods card component that needs to be modified. Contains the AggregatedPaymentMethod interface and the UI rendering logic for payment method rows.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Header Row Amount Display
- At line 229, change `{formatCurrency(payment.totalAmount)}` to `{formatCurrency(payment.amountCharged)}`
- This displays the individual payment method's charged/settled amount in the header row
- Example: Credit Card shows ฿2,490.00, The1 Points shows ฿500.00

### 2. Remove Conditional Display for Amount to be Charged
- At lines 261-266, remove the conditional `{payment.amountToBeCharged > 0 && (` wrapper
- The "Amount to be charged" field should always be displayed
- Keep the inner `<div>` with its label and value intact

### 3. Remove Conditional Display for Amount Charged
- At lines 269-274, remove the conditional `{payment.amountCharged > 0 && (` wrapper
- The "Amount charged" field should always be displayed
- Keep the inner `<div>` with its label and value intact, including the green text styling

### 4. Validate the Changes
- Run the development server and verify the Payment Methods card
- Confirm header row shows: Icon + Payment Name | Status Badge | Amount Charged
- Confirm vertical details show: card/member info, Amount to be charged, Amount charged (both visible even if 0)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `pnpm dev` - Start development server and visually verify the Payment Methods card in the Payments Tab displays correctly

## Notes
- The `totalAmount` field in AggregatedPaymentMethod is still useful for internal calculations but should not be displayed in the header row
- The green styling (`text-green-700`) on the "Amount charged" value should be preserved to visually distinguish completed settlements
- Orders with split payments (e.g., Credit Card + The1 Points) will now show individual charged amounts in each payment method's header row rather than the combined total
