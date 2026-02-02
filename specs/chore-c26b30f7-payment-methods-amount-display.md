# Chore: Enhance Payment Methods with Amount to be Charged and Amount Charged

## Metadata
adw_id: `c26b30f7`
prompt: `Enhance Payment Methods display on payment tab to show 'Amount to be Charged' and 'Amount Charged' for each payment method. Implementation requirements: 1) Add two new columns to the payment methods section: 'Amount to be Charged' (authorization amount) and 'Amount Charged' (settlement amount), 2) When an order has 1 payment method but multiple settlement transactions, display the payment method information only once (deduplicate by payment method type), 3) Aggregate settlement amounts across all settlement transactions for that payment method to show total 'Amount Charged', 4) Keep 'Amount to be Charged' from the authorization transaction, 5) Use consistent currency formatting with formatCurrency from lib/utils.ts, 6) Maintain the existing payment tab structure and add these enhancements to the payment methods table/section. The changes should be made in src/components/order-detail/payments-tab.tsx or related payment components.`

## Chore Description
Enhance the Payment Methods card in the Payments Tab to display more granular payment information with two new amount columns:

1. **Amount to be Charged** - The authorization/hold amount for a payment method
2. **Amount Charged** - The actual settlement/captured amount

When an order has multiple settlement transactions for the same payment method (e.g., CREDIT_CARD with same card number appearing 3 times), the system should:
- Display the payment method only ONCE (deduplicate by method + cardNumber/memberId)
- Sum all AUTHORIZATION transaction amounts as "Amount to be Charged"
- Sum all SETTLEMENT transaction amounts as "Amount Charged"

This provides clearer visibility into payment lifecycle states (authorization vs. settlement) while avoiding duplicate payment method rows.

## Relevant Files
Use these files to complete the chore:

### Existing Files to Modify

- **`src/components/order-detail/payments-tab.tsx`** - Main file to modify. Contains the `PaymentsTab` component with the Payment Methods card (lines 141-208). The `paymentMethods` useMemo (lines 52-72) and settlements processing (lines 75-95) need to be enhanced with deduplication and aggregation logic.

- **`src/lib/currency-utils.ts`** - Contains `formatCurrency()` function already used in payments-tab.tsx. No modifications needed, just reference for consistent currency formatting.

- **`src/types/payment.ts`** - Defines `TransactionType` ('AUTHORIZATION' | 'SETTLEMENT' | 'REFUNDED') and `PaymentTransaction` interface. May need a new interface for aggregated payment method display.

### Reference Files (for understanding data structure)

- **`src/lib/mock-data.ts`** - Contains test data demonstrating the scenarios:
  - Order `CDS260130158593` (line 9237): 2 payment methods (CREDIT_CARD + T1) with SETTLEMENT transactions
  - Order `CDS260121226285` (line 10702): 1 payment method (CREDIT_CARD) with 3 AUTHORIZATION transactions that need deduplication

- **`src/components/order-management-hub.tsx`** (line 270) - Defines `Order.paymentDetails` as `PaymentTransaction[]`

### New Files
None required - all changes will be in existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Aggregated Payment Method Interface
- Add a new interface `AggregatedPaymentMethod` in `payments-tab.tsx` to represent deduplicated payment methods:
  ```typescript
  interface AggregatedPaymentMethod {
    method: string;
    cardNumber?: string;
    expiryDate?: string;
    memberId?: string;
    status: string;
    amountToBeCharged: number;  // Sum of AUTHORIZATION amounts
    amountCharged: number;       // Sum of SETTLEMENT amounts
    totalAmount: number;         // Total amount (for display)
  }
  ```

### 2. Implement Payment Method Deduplication Logic
- Replace the existing `paymentMethods` useMemo (lines 52-72) with new logic that:
  - Groups transactions by payment method key (`method + cardNumber` or `method + memberId`)
  - For each group, sum AUTHORIZATION amounts into `amountToBeCharged`
  - For each group, sum SETTLEMENT amounts into `amountCharged`
  - Return array of `AggregatedPaymentMethod` objects

- Deduplication key logic:
  ```typescript
  const getPaymentMethodKey = (payment: PaymentTransaction) => {
    if (payment.cardNumber) return `${payment.method}-${payment.cardNumber}`;
    if (payment.memberId) return `${payment.method}-${payment.memberId}`;
    return payment.method;
  };
  ```

### 3. Update Payment Methods Card UI
- Modify the Payment Methods Card (lines 141-208) to display a table structure:
  - Column 1: Payment Method (icon + name)
  - Column 2: Amount to be Charged (authorization total)
  - Column 3: Amount Charged (settlement total)
  - Column 4: Status badge

- Add column headers above the payment method rows:
  ```
  Payment Method | Amount to be Charged | Amount Charged | Status
  ```

- Use `formatCurrency()` for both amount columns
- Keep the existing card/member details display below each row

### 4. Handle Edge Cases
- When `amountToBeCharged` equals `0`, display "—" instead of "฿0.00"
- When `amountCharged` equals `0`, display "—" instead of "฿0.00"
- For orders without explicit paymentDetails, use total_amount for both columns
- Maintain backward compatibility with non-MAO orders using the fallback logic

### 5. Update Total Amount Display
- Keep the total amount display in the card header (line 149-151)
- Ensure it shows the actual order total, not sum of aggregated amounts

### 6. Validate with Test Data
- Test with order `CDS260130158593`: Should show 2 rows (CREDIT_CARD and T1 Points)
- Test with order `CDS260121226285`: Should show 1 row (CREDIT_CARD) with aggregated amounts from 3 transactions
- Verify currency formatting is consistent with `฿X,XXX.XX` pattern

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `pnpm lint` - Run ESLint to check for code style issues
- `pnpm dev` - Start development server and manually verify:
  1. Navigate to order `CDS260130158593` → Payments tab → Verify 2 payment methods displayed with Amount to be Charged and Amount Charged columns
  2. Navigate to order `CDS260121226285` → Payments tab → Verify 1 payment method with aggregated authorization amounts (should total ฿4,551.25)

## Notes
- The current implementation (lines 52-72) creates a separate entry for each `paymentDetails` item. The enhancement requires grouping by payment method before rendering.
- Transaction type is already available via `PaymentTransaction.transactionType` field
- The Settlement Transactions section (lines 211-262) should remain unchanged - it shows individual transaction details with item breakdowns
- Currency formatting should use `formatCurrency` from `@/lib/currency-utils` which is already imported
- Consider adding subtle visual distinction (muted text) when an amount column shows "—" to indicate no transactions of that type
