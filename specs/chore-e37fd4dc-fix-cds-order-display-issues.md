# Chore: Fix CDS260130158593 Order Display Issues

## Metadata
adw_id: `e37fd4dc`
prompt: `Fix two issues in mock order CDS260130158593: ISSUE 1 - Channel field showing wrong value: The mock data correctly has channel: 'web' and sellingChannel: 'Web', but the UI is displaying 'lazada' in the Channel badge (top of order detail page) and in the order list table Channel column. The Overview tab correctly shows 'Selling Channel: Web'. Investigate why the channel is being displayed incorrectly and fix it. ISSUE 2 - Missing The1 Points payment method display: The Payments tab 'Payment Method' section only shows CREDIT_CARD payment, but this is a multi-payment order with TWO payment methods: Credit Card (฿2,490) + The1 Points (฿500). The Payment Method section should display BOTH payment methods, not just one. The Settlement Transactions section correctly shows both settlements. Update the Payments tab to display all payment methods from the paymentDetails array in the Payment Method section.`

## Chore Description
This chore fixes two distinct display issues affecting mock order CDS260130158593:

### Issue 1: Channel Field Showing 'lazada' Instead of 'web'
**Root Cause:** In `src/components/order-management-hub.tsx`, the MAO (Manhattan Active Omni) order detection logic only checks if the order ID starts with 'W':
```typescript
const isMaoOrder = apiOrder.id?.startsWith('W') || apiOrder.order_no?.startsWith('W')
```
However, order CDS260130158593 starts with 'CDS', not 'W'. This causes the code to treat it as a demo order and overwrite the `channel` field with a cycling value from `['web', 'lazada', 'shopee']`.

The mock data correctly defines:
- `channel: 'web'`
- `sellingChannel: 'Web'`

But this is overwritten during the demo data enhancement phase because the MAO detection fails.

### Issue 2: Payment Method Section Only Shows First Payment
**Root Cause:** In `src/components/order-detail/payments-tab.tsx`, the `paymentMethod` useMemo only extracts the first payment from `paymentDetails`:
```typescript
const paymentMethod = useMemo(() => {
    if (hasExplicitPaymentDetails && order.paymentDetails!.length > 0) {
        const firstPayment = order.paymentDetails![0];  // Only takes first payment!
        return {
            method: firstPayment.method || 'Unknown',
            ...
        };
    }
    ...
}, [order, hasExplicitPaymentDetails]);
```

For multi-payment orders like CDS260130158593 which has:
1. Credit Card payment: ฿2,490
2. The1 Points (T1) payment: ฿500

Only the Credit Card is displayed in the Payment Method card because the code only reads `paymentDetails[0]`.

## Relevant Files
Use these files to complete the chore:

- **`src/components/order-management-hub.tsx`** (lines 431-450) - Contains the MAO order detection logic that needs to be expanded to include 'CDS' prefix orders. The `isMaoOrder` check at line 432 only checks for 'W' prefix.

- **`src/components/order-detail/payments-tab.tsx`** (lines 52-68, 137-170) - Contains the Payment Method card that only displays the first payment. Needs to be refactored to loop through all `paymentDetails` and display each payment method.

- **`src/lib/mock-data.ts`** (line 8520-8699) - Contains the mock order CDS260130158593 definition for reference. Shows the correct data structure with `channel: 'web'` and `paymentDetails` array with 2 payments.

### New Files
None required.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix MAO Order Detection in Order Management Hub
- Open `src/components/order-management-hub.tsx`
- Locate line 432 with the `isMaoOrder` detection:
  ```typescript
  const isMaoOrder = apiOrder.id?.startsWith('W') || apiOrder.order_no?.startsWith('W')
  ```
- Update the detection to also include 'CDS' prefix orders:
  ```typescript
  const isMaoOrder = apiOrder.id?.startsWith('W') || apiOrder.order_no?.startsWith('W') ||
                     apiOrder.id?.startsWith('CDS') || apiOrder.order_no?.startsWith('CDS')
  ```
- This ensures CDS-prefixed orders from Manhattan Active Omni preserve their original mock data values (including channel)

### 2. Update Payment Method Display for Multi-Payment Orders
- Open `src/components/order-detail/payments-tab.tsx`
- Refactor the Payment Method section to support displaying multiple payment methods
- Create a new computed value `paymentMethods` (plural) that returns all payment methods:
  ```typescript
  const paymentMethods = useMemo(() => {
      if (hasExplicitPaymentDetails && order.paymentDetails!.length > 0) {
          return order.paymentDetails!.map(payment => ({
              method: payment.method || 'Unknown',
              cardNumber: payment.cardNumber,
              expiryDate: payment.expiryDate,
              memberId: payment.memberId,
              amount: payment.amount,
              status: payment.status || 'PENDING'
          }));
      }
      // Fallback for non-MAO orders
      return [{
          method: order.payment_info?.method || order.paymentType || 'Unknown Method',
          cardNumber: order.payment_info?.cardNumber,
          expiryDate: order.payment_info?.expiryDate,
          amount: order.total_amount,
          status: order.payment_info?.status || 'PENDING'
      }];
  }, [order, hasExplicitPaymentDetails]);
  ```
- Update the Payment Method Card rendering to loop through all methods and show each one distinctly
- Each payment method card should display:
  - Payment method name (CREDIT_CARD, T1, etc.)
  - Amount allocated to that method
  - Status badge
  - Card details (if credit card) or Member ID (if T1/loyalty)

### 3. Redesign Payment Method UI for Multiple Payments
- Change the Payment Method Card from a single card to a section that can display multiple payment cards
- Use a similar layout pattern as the settlements section but simpler (no collapsible)
- Each payment method should be a compact card showing:
  - Icon + method name + status badge (left side)
  - Amount (right side)
  - Additional details below (card number or member ID)
- Ensure the total shown still reflects the full order amount

### 4. Validate the Changes
- Run `pnpm dev` to start the development server
- Navigate to the order list page at http://localhost:3000/orders
- Find order CDS260130158593 in the table
- Verify the Channel column shows 'web' (not 'lazada')
- Click on the order to open the detail view
- Verify the Channel badge in Quick Info Cards shows 'web'
- Go to the Payments tab
- Verify both payment methods are displayed:
  - CREDIT_CARD: ฿2,490
  - T1 (The1 Points): ฿500
- Verify the Settlement Transactions still work correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript errors after the changes
- `pnpm lint` - Verify no linting errors introduced
- Manual testing via `pnpm dev`:
  1. Order list: Channel column for CDS260130158593 should show 'web'
  2. Order detail: Channel badge should show 'web'
  3. Payments tab: Should display both CREDIT_CARD and T1 payment methods with their respective amounts

## Notes
- The `paymentDetails` array in mock data uses different method identifiers:
  - `method: 'CREDIT_CARD'` for credit card payments
  - `method: 'T1'` for The1 Points loyalty redemption
- The T1 payment has a `memberId` field instead of `cardNumber`
- The detection logic change for MAO orders should be future-proofed. Consider checking for the presence of `paymentDetails` array as an additional indicator of MAO orders.
- The Payment Method card redesign should maintain visual consistency with the existing Bill Information card layout
