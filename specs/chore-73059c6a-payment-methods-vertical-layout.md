# Chore: Fix Payment Methods display layout to vertical format

## Metadata
adw_id: `73059c6a`
prompt: `Fix Payment Methods display layout to match the reference design. Current implementation uses a table with column headers, but it should use a vertical layout. Requirements: 1) First row should show: payment method icon + name on left, status badge in middle, total amount on right (฿933.00), all on same horizontal line, 2) Below that, display card/member details vertically with labels: 'CREDIT CARD: 525667XXXXXX4575', 'Expiry Date: **/*****', 'Amount to be charged: ฿933.00', 'Amount charged: ฿933.00', 3) Remove the table structure with column headers (Payment Method | Amount to be Charged | Amount Charged | Status), 4) Use a clean vertical list format with labeled fields instead, 5) Keep the deduplication and aggregation logic from the current implementation, 6) Maintain consistent spacing and typography. File to modify: src/components/order-detail/payments-tab.tsx, specifically the Payment Methods Card section (lines 192-291).`

## Chore Description
Redesign the Payment Methods card in the Payments Tab to use a vertical layout instead of the current table-based column structure. The current implementation displays payment methods in a 12-column grid with headers "Payment Method | Amount to be Charged | Amount Charged | Status". The new design requires:

1. **Header row**: Payment method icon + name (left), status badge (center), total amount (right) - all on same horizontal line
2. **Details section**: Vertical list with labeled fields for card details and amounts
3. **Remove**: Table column headers entirely
4. **Preserve**: All existing deduplication and aggregation logic for handling multiple payment methods

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail/payments-tab.tsx** (lines 191-291) - The main file to modify. Contains the Payment Methods Card component with the current table-based layout that needs to be converted to vertical format.
- **src/components/order-badges.tsx** - Contains `PaymentStatusBadge` component used for displaying payment status. No changes needed.
- **src/lib/currency-utils.ts** - Contains `formatCurrency` function used for displaying amounts. No changes needed.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove Table Column Headers
- Delete the column headers section (lines 205-211) that displays "Payment Method | Amount to be Charged | Amount Charged | Status"
- This removes the table-like structure and prepares for vertical layout

### 2. Redesign Payment Method Header Row
- Replace the 12-column grid layout with a flexbox layout
- Left side: Payment method icon + name (keep existing icon logic for T1 vs Credit Card)
- Center: Status badge using `PaymentStatusBadge` component
- Right side: Total amount using `formatCurrency(payment.totalAmount)`
- Use `justify-between` and `items-center` for proper alignment

### 3. Create Vertical Details Section
- Below the header row, create a vertical list of labeled fields
- For credit cards, display:
  - `CREDIT CARD: {cardNumber}` (uppercase label)
  - `Expiry Date: {expiryDate}`
  - `Amount to be charged: {formatCurrency(amountToBeCharged)}`
  - `Amount charged: {formatCurrency(amountCharged)}`
- For T1/loyalty points, display:
  - `Member ID: {memberId}`
  - `Amount to be charged: {formatCurrency(amountToBeCharged)}`
  - `Amount charged: {formatCurrency(amountCharged)}`
- Use consistent spacing (ml-11 to align with icon) and text styling

### 4. Handle Conditional Display of Amounts
- Only show "Amount to be charged" line if `amountToBeCharged > 0`
- Only show "Amount charged" line if `amountCharged > 0`
- Use green text styling for "Amount charged" value to indicate completed settlement

### 5. Maintain Existing Logic
- Keep the `paymentMethods` array and its deduplication logic unchanged
- Keep the `AggregatedPaymentMethod` interface unchanged
- Keep the `getPaymentMethodKey` function unchanged
- Only modify the JSX rendering portion within CardContent

### 6. Apply Consistent Styling
- Use `text-sm` for detail labels
- Use `text-gray-500` for labels
- Use `text-gray-900` for values
- Use `font-semibold text-green-700` for charged amounts
- Maintain `p-3 rounded-lg` container styling for multiple payment methods

### 7. Validate Build
- Run `pnpm build` to verify no TypeScript errors
- Test with development server to verify visual layout

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation and Next.js build succeeds
- `pnpm dev` - Start development server and visually inspect Payment Methods card on order detail page
- Navigate to an order with payment details (e.g., order CDS260130158593 or CDS260121226285 in mock data) to verify:
  1. Table column headers are removed
  2. Payment method header shows icon + name on left, status in middle, amount on right
  3. Card/member details display vertically with proper labels
  4. Multiple payment methods display correctly (if applicable)
  5. Deduplication still works for orders with multiple settlements of same payment method

## Notes
- The aggregation logic (grouping multiple transactions by payment method key) MUST be preserved
- The change is purely visual/layout - no business logic changes
- Test with both single-payment and multi-payment orders (CDS260130158593 has Credit Card + T1 Points)
- Test with orders that have multiple settlements for the same payment method (CDS260121226285)
