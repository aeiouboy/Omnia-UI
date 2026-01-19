# Chore: Update Payments Tab to Match MAO Payment Display

## Metadata
adw_id: `9ea63bd1`
prompt: `Update Payments tab (src/components/order-detail/payments-tab.tsx) to match MAO payment display. Current issues: 1) Shows 2 payment methods (Credit Card + T1 Redemption) but MAO shows only 1 payment method (Credit Card with full amount ฿933.00), 2) Uses hardcoded cardNumber '411111XXXXXX1111' instead of order.payment_info.cardNumber '525667XXXXXX4575', 3) Uses hardcoded expiry '8/2029' instead of order.payment_info.expiryDate '**/****'. Fix by: 1) Remove the T1 Point Redemption payment method display - T1 redemption should NOT appear as a separate payment method (it's already reflected in discounts), 2) Update lines 42-45 to use actual order.payment_info.cardNumber and order.payment_info.expiryDate instead of hardcoded values, 3) Change mainPaymentAmount to use order.total_amount (฿933.00) instead of order.customerPayAmount (฿672.00) since the credit card is charged the full order total, 4) Update mock data in src/lib/mock-data.ts for order W1156251121946800 to ensure payment_info has correct cardNumber '525667XXXXXX4575' and expiryDate '**/****'. The Payments tab should show exactly what MAO Payment Info shows: single CREDIT_CARD payment method with card 525667XXXXXX4575, expiry **/****, amount ฿933.00.`

## Chore Description
The Payments tab in order detail view currently has three issues that cause it to display incorrect payment information compared to the MAO (Manhattan Active Omni) source system:

1. **Incorrect dual payment methods**: The tab shows two payment methods (Credit Card + T1 Redemption) when MAO only shows one payment method. T1 redemption is a discount mechanism, not a separate payment method.

2. **Hardcoded card details**: Lines 42-45 use placeholder values `411111XXXXXX1111` and `8/2029` instead of reading from `order.payment_info.cardNumber` and `order.payment_info.expiryDate`.

3. **Wrong payment amount**: Uses `order.customerPayAmount` (the amount after redemption) instead of `order.total_amount` (the actual credit card charge amount).

The fix ensures the Payments tab matches MAO Payment Info exactly: single CREDIT_CARD payment method with the correct card number, expiry date, and full order total amount.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail/payments-tab.tsx** - Main file to modify. Contains the payment methods construction logic (lines 20-60) that needs updating. Currently has hardcoded card details and T1 redemption logic.

- **src/lib/mock-data.ts** - Mock data file containing order W1156251121946800. Already has correct `payment_info.cardNumber` ('525667XXXXXX4575') and `payment_info.expiryDate` ('**/****') at lines 5640-5641. No changes needed but should verify data structure.

- **src/components/order-management-hub.tsx** - Contains the Order interface definition (lines 183-198, 238-253) that defines the payment-related fields including `payment_info` structure. Reference only.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Payment Amount Logic
- In `payments-tab.tsx` line 21, change `mainPaymentAmount` calculation from:
  ```typescript
  const mainPaymentAmount = (order.customerPayAmount || order.total_amount) || 0;
  ```
  to:
  ```typescript
  const mainPaymentAmount = order.total_amount || 0;
  ```
- This ensures the credit card shows the full order total (฿933.00) instead of the amount after T1 redemption

### 2. Remove T1 Redemption as Separate Payment Method
- Delete or comment out line 20: `const hasT1Redemption = (order.customerRedeemAmount || 0) > 0;`
- Remove the entire T1 redemption block (lines 50-60):
  ```typescript
  if (hasT1Redemption) {
      paymentMethods.push({
          type: "T1",
          name: "T1 Point Redemption",
          amount: order.customerRedeemAmount || 0,
          status: "PAID",
          details: {
              memberId: order.customer?.T1Number || "N/A"
          }
      });
  }
  ```
- T1 redemption is reflected in order discounts, not as a separate payment method

### 3. Replace Hardcoded Card Details with Dynamic Values
- Update lines 42-45 to use actual order data instead of placeholder values:
  ```typescript
  // From:
  ...(mainPaymentMethod.toLowerCase().includes("card") ? {
      cardNumber: "411111XXXXXX1111",
      expiry: "8/2029",
  } : {})

  // To:
  ...(mainPaymentMethod.toLowerCase().includes("card") ? {
      cardNumber: order.payment_info?.cardNumber || "XXXX XXXX XXXX XXXX",
      expiry: order.payment_info?.expiryDate || "**/**",
  } : {})
  ```
- This reads from `order.payment_info.cardNumber` and `order.payment_info.expiryDate`

### 4. Verify Mock Data Structure
- Confirm that `src/lib/mock-data.ts` for order W1156251121946800 has the correct payment_info structure at lines 5630-5642:
  ```typescript
  payment_info: {
    method: 'CREDIT_CARD',
    status: 'PAID',
    transaction_id: '17636994333493701826',
    subtotal: 1850,
    discounts: 917,
    charges: 0,
    amountIncludedTaxes: 933,
    amountExcludedTaxes: 900.47,
    taxes: 32.53,
    cardNumber: '525667XXXXXX4575',
    expiryDate: '**/****'
  }
  ```
- No changes needed if data matches above structure

### 5. Build and Validate
- Run `pnpm build` to ensure TypeScript compiles without errors
- Verify no type errors related to `payment_info.cardNumber` or `payment_info.expiryDate`

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript compilation errors
- `pnpm lint` - Check for linting issues
- Navigate to order W1156251121946800 in browser and verify Payments tab shows:
  - Single payment method: CREDIT_CARD
  - Card number: 525667XXXXXX4575
  - Expiry: **/****
  - Amount: ฿933.00
  - No T1 Point Redemption section

## Notes
- The T1 Point Redemption display logic in the UI (T1 icon, member ID display) can be kept for other use cases but should not render as a separate payment method since `hasT1Redemption` condition is removed
- The Billing Information section at the bottom of the Payments tab remains unchanged
- This change aligns the Omnia UI display with MAO (Manhattan Active Omni) source system data format
- The `payment_info` interface may need to be extended in the Order type to include `cardNumber` and `expiryDate` fields if TypeScript complains - check `src/components/order-management-hub.tsx` Order interface
