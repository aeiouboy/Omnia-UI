# Chore: Add Payment Method Details to Overview Tab

## Metadata
adw_id: `c09c8007`
prompt: `Fix payment information display inconsistency in order-detail-view.tsx. Currently the 'Payment Information' section on the Overview tab only shows financial totals (Subtotal, Discounts, Taxes, Total) but does NOT display the payment method details (credit card number, expiry date, amount to be charged, amount charged, billing address, billing name). However, the Payments tab correctly shows 2 payment methods for order W1156251121946800: CREDIT_CARD (฿672) and T1 Point Redemption (฿261). The fix should add a 'Payment Method' subsection to the Payment Information section on Overview tab that shows the primary/first payment method details (card number masked, expiry date, amounts, billing info) similar to the Payments tab display. The data is available in order.paymentMethods array. Reference the Payments tab implementation in order-detail-view.tsx for the payment method display format. The Payment Information section should show: 1) Financial summary (existing), 2) Primary payment method card details when paymentMethods array has data. This matches MAO's display where Payment Info shows single card details while full Payments tab shows all methods.`

## Chore Description
The Payment Information section on the Overview tab of the Order Detail View currently only displays financial totals (Subtotal, Discounts, Charges, Shipping Fee, Taxes, and Total). It does not show any payment method details such as:
- Primary payment method type (e.g., CREDIT_CARD)
- Masked card number (e.g., 411111XXXXXX1111)
- Card expiry date
- Amount to be charged / Amount charged
- Billing name and billing address

However, the Payments tab correctly displays this information for all payment methods. To maintain consistency with MAO (Manhattan Active Omni) display patterns, the Overview tab should show a condensed primary payment method summary below the financial totals.

The solution will:
1. Reuse the payment method construction logic from `payments-tab.tsx` to derive payment methods from existing Order fields (`customerPayAmount`, `customerRedeemAmount`, `payment_info`, `paymentType`)
2. Display only the primary (first) payment method in the Overview tab
3. Show card details for credit card payments: masked card number, expiry date, amount charged
4. Show T1 member ID for T1 Point Redemption payments
5. Include billing name and address (from `order.customer.name` and `order.shipping_address`)

## Relevant Files
Use these files to complete the chore:

- **`src/components/order-detail-view.tsx`** - Main file to modify. Contains the Overview tab with Payment Information Card section (lines 661-720). Need to add primary payment method display after the financial summary.

- **`src/components/order-detail/payments-tab.tsx`** - Reference implementation for payment method display format. Contains the logic to construct `paymentMethods` array from order fields (lines 20-48) and the display components for card details, T1 redemption, and amounts (lines 114-147).

- **`src/components/order-management-hub.tsx`** - Contains the `Order` interface definition (lines 216-264) showing available fields: `customerPayAmount`, `customerRedeemAmount`, `paymentType`, `payment_info`, `customer`, `shipping_address`.

- **`src/lib/currency-utils.ts`** - Contains `formatCurrency` utility for consistent currency display.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Extract Payment Method Construction Logic into Reusable Helper
- Review `payments-tab.tsx` lines 20-60 for the payment method construction logic
- Create a helper function `getPrimaryPaymentMethod(order: Order)` that returns the primary payment method object with:
  - `type`: 'Main' | 'T1'
  - `name`: Payment method name (e.g., 'CREDIT_CARD')
  - `amount`: Payment amount
  - `status`: Payment status
  - `details`: Card number, expiry, or T1 member ID
- This helper can be placed in `order-detail-view.tsx` or extracted to a utility

### 2. Add Primary Payment Method Section to Overview Tab
- Locate the Payment Information Card in `order-detail-view.tsx` (lines 661-720)
- After the existing `<Separator />` and Total display (line 718), add:
  - Another `<Separator />` to separate financial summary from payment method
  - A "Primary Payment Method" subsection header
  - Conditional display of payment method details when available:
    - For credit card: show method name, masked card number, expiry date, amount to be charged, amount charged
    - For T1 redemption: show T1 and member ID
- Add billing information below payment method:
  - Billing Name (from `order.customer?.name`)
  - Billing Address (from `order.shipping_address`)

### 3. Style the Payment Method Display
- Use consistent styling with the existing Payment Information section
- Use `text-sm text-enterprise-text-light` for labels
- Use `font-medium` or `font-mono` for values as appropriate
- Keep the display compact since this is a summary view

### 4. Handle Edge Cases
- Handle case when no payment method data is available (no customerPayAmount or payment_info)
- Handle case when payment method is not a credit card (show method name only, no card details)
- Handle missing billing address or customer name gracefully

### 5. Validate the Implementation
- Run `pnpm build` to ensure no TypeScript errors
- Test with order W1156251121946800 to verify:
  - Primary payment method (CREDIT_CARD ฿672) is displayed on Overview tab
  - Card details are shown (masked number, expiry)
  - Billing name and address are displayed
- Compare with Payments tab to ensure consistency in display format

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript compilation errors
- `pnpm lint` - Ensure no linting errors
- Manual validation: Navigate to Order Detail View for order W1156251121946800 and verify:
  1. Overview tab shows Payment Information with financial totals (existing)
  2. Below totals, a "Primary Payment Method" section displays:
     - Payment method: CREDIT_CARD
     - Card number: 411111XXXXXX1111
     - Expiry: 8/2029
     - Amount charged: ฿672.00
  3. Billing information shows:
     - Billing Name: WEERAPAT WIRUNTANGTRAKUL
     - Billing Address: (from shipping_address)
  4. Payments tab still shows full payment methods list (unchanged)

## Notes
- The payment methods are not stored directly on the Order object but are derived from `customerPayAmount`, `customerRedeemAmount`, `payment_info.method`, and `paymentType` fields
- The Payments tab constructs these locally in the component - the same logic should be reused for consistency
- This change adds display-only UI and does not modify any data structures
- The design matches MAO's pattern where Payment Info section shows primary payment details while Payments tab shows the complete breakdown
