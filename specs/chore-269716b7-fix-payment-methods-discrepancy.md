# Chore: Fix Payment Methods Discrepancy Between MAO and Omnia-UI

## Metadata
adw_id: `269716b7`
prompt: `Fix payment methods discrepancy between MAO and Omnia-UI for order W1156251121946800. MAO shows 1 payment method (CREDIT_CARD: 525667XXXXXX4575, ฿933.00) but Omnia-UI shows 2 methods. Issue: payments-tab.tsx (lines 50-60) incorrectly adds 'T1 Point Redemption' as a second payment method when customerRedeemAmount > 0. The T1 member number (8048068914) in MAO is customer info for earning points, NOT a payment method. Fix: 1) Check mock-data.ts for order W1156251121946800 - ensure customerRedeemAmount is 0 or undefined since MAO shows no T1 redemption. 2) Review payments-tab.tsx logic to only show T1 as payment method when there's actual T1 point redemption used for payment (not just T1 membership). Reference MAO screenshot at .playwright-mcp/mao-W1156251121946800-complete-data.png for correct payment display.`

## Chore Description

This chore fixes a data discrepancy where the Omnia-UI payments tab displays 2 payment methods when MAO (Manhattan Active Omni) shows only 1. The root cause is two-fold:

1. **Demo data processing adds fake redemption amounts**: In `order-management-hub.tsx` (lines 411-414), the demo order processing code adds `customerRedeemAmount` to ALL orders (including MAO orders) based on index position (`index % 3 === 0`), which incorrectly marks ~30% of orders as having T1 redemption.

2. **Payments tab misinterprets T1 membership as T1 payment**: In `payments-tab.tsx` (line 20), the logic `hasT1Redemption = (order.customerRedeemAmount || 0) > 0` treats any non-zero redemption amount as a separate payment method, but T1 member numbers (like 8048068914) are for earning loyalty points, not payment methods.

**Reference**: MAO screenshot at `.playwright-mcp/mao-W1156251121946800-complete-data.png` shows:
- PAYMENT INFO section: Only CREDIT_CARD: 525667XXXXXX4575 with ฿933.00
- Order Status section: "The1 member 8048068914" - this is CUSTOMER INFO, not a payment method

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** (lines 411-414, 421-425): Contains the demo data processing code that incorrectly adds `customerRedeemAmount` to MAO orders. The `isMaoOrder` check pattern already exists for channel mocking (lines 421-425) and should be extended to financial fields.

- **src/components/order-detail/payments-tab.tsx** (lines 20, 50-60): Contains the payment method display logic that incorrectly adds T1 Point Redemption as a second payment method based solely on `customerRedeemAmount > 0`. Needs to check for actual T1 redemption payment records.

- **src/lib/mock-data.ts** (lines 3662-3734, 3721-3733): Contains the MAO order `W1156251121946800` definition with correct `paymentDetails` array showing only CREDIT_CARD payment. This file does NOT contain `customerRedeemAmount` for this order (confirmed via grep search).

- **.playwright-mcp/mao-W1156251121946800-complete-data.png**: Reference screenshot from MAO showing correct payment display with single CREDIT_CARD payment method.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Prevent Demo Processing from Adding Fake Redemption to MAO Orders
- Open `src/components/order-management-hub.tsx`
- Find lines 411-414 where `customerRedeemAmount` is added to demo orders
- Add the `isMaoOrder` check (similar to lines 421-425) to skip financial field modifications for MAO orders
- Change from:
  ```typescript
  // Financial fields
  const hasRedemption = index % 3 === 0 // ~30% of orders
  demoOrder.customerRedeemAmount = hasRedemption ? Math.floor(Math.random() * 500) : 0
  demoOrder.orderDeliveryFee = [0, 40, 60, 80][index % 4]
  demoOrder.customerPayAmount = (demoOrder.total_amount || 0) - (demoOrder.customerRedeemAmount || 0)
  ```
- To:
  ```typescript
  // Financial fields - EXCLUDE MAO orders (they have their own payment data)
  const isMaoOrder = apiOrder.id?.startsWith('W') || apiOrder.order_no?.startsWith('W')
  if (!isMaoOrder) {
    const hasRedemption = index % 3 === 0 // ~30% of orders
    demoOrder.customerRedeemAmount = hasRedemption ? Math.floor(Math.random() * 500) : 0
    demoOrder.orderDeliveryFee = [0, 40, 60, 80][index % 4]
    demoOrder.customerPayAmount = (demoOrder.total_amount || 0) - (demoOrder.customerRedeemAmount || 0)
  }
  ```

### 2. Fix Payments Tab T1 Redemption Detection Logic
- Open `src/components/order-detail/payments-tab.tsx`
- Update the `hasT1Redemption` logic (line 20) to check for actual T1 redemption payments
- The logic should verify T1 redemption was used as a payment method, not just that a customer has T1 membership
- Consider checking:
  - `paymentDetails` array for T1-related payment records
  - OR ensure `customerRedeemAmount` is explicitly set by the order source (not demo processing)
  - A robust check: Only show T1 redemption if `customerRedeemAmount > 0` AND there's evidence of actual T1 payment (e.g., payment_info mentions T1, or paymentDetails contains T1 entry)
- For this fix, the simplest approach is to also check that the order has T1 redemption data beyond just `customerRedeemAmount`:
  ```typescript
  // Only show T1 redemption if there's an actual redemption amount AND
  // it's not a MAO order (which has explicit paymentDetails that should be used)
  const hasExplicitPaymentDetails = order.paymentDetails && order.paymentDetails.length > 0;
  const hasT1Redemption = (order.customerRedeemAmount || 0) > 0 && !hasExplicitPaymentDetails;
  ```

### 3. Validate the Fix
- Start the development server: `pnpm dev`
- Navigate to order W1156251121946800 detail page
- Verify the Payments tab shows only 1 payment method (CREDIT_CARD)
- Compare against the MAO screenshot to ensure visual parity
- Test a non-MAO order to ensure T1 redemption still shows for demo orders that legitimately have it

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript compilation errors
- `pnpm dev` - Start development server for manual testing
- Open browser to `http://localhost:3000/orders/W1156251121946800` and verify Payments tab shows only 1 payment method
- Take screenshot comparison with `.playwright-mcp/mao-W1156251121946800-complete-data.png`

## Notes

- The T1 member number (8048068914) displayed in MAO is for the loyalty program to award points on purchases. It does NOT indicate T1 points were used as payment.
- MAO orders (those with IDs starting with 'W') have explicit `paymentDetails` arrays that should be the source of truth for payment methods.
- The demo processing code is necessary for non-MAO orders to simulate various payment scenarios, but it should not override MAO order data.
- Future enhancement: Consider creating a dedicated `PaymentMethod` component that can render payment details from either the MAO `paymentDetails` array or the legacy `customerRedeemAmount` field, maintaining a clear separation of concerns.
