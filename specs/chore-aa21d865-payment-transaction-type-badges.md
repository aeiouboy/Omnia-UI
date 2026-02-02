# Chore: Payment Transaction Type Badges

## Metadata
adw_id: `aa21d865`
prompt: `Analyze the current payment system implementation in Omnia-UI and create a detailed specification for adding payment transaction type support (Authorization, Settlement, Refunded) following the UI design from wireframe specification wf_specs/wf-payment-transaction-types.md Version 1 (Transaction Type Badge - Minimal).`

## Chore Description

Add payment transaction type display (Authorization, Settlement, Refunded) to the Payments tab in Order Details. This implementation follows Wireframe Version 1 (Transaction Type Badge - Minimal) which adds a badge next to the existing payment status badge in the payment method card header.

**Key Requirements:**
- Display transaction type as a colored badge next to payment status
- Use updated color scheme: Authorization (yellow), Settlement (green), Refunded (gray)
- Add 'Transaction Type:' field in collapsed details section
- Maintain backward compatibility with existing payment data
- Add mock data examples for testing all transaction types

## Current State Analysis

### Existing Type Definitions (src/types/payment.ts)
- `TransactionType` already defined: `'AUTHORIZATION' | 'SETTLEMENT' | 'REFUNDED'`
- `PaymentTransaction` interface exists with `transactionType?: TransactionType` field
- Interface includes: id, method, status, transactionId, amount, currency, date, gateway, cardNumber, expiryDate, invoiceNo

### Current Payment Display (src/components/order-detail/payments-tab.tsx)
- Uses `Collapsible` component for expandable payment method cards
- Payment method card header shows: Icon, method name, status badge, amount
- Collapsed content shows: card number, expiry, amounts
- Status badge uses: `bg-green-100 text-green-700` for PAID, `bg-gray-100 text-gray-700` for other statuses
- Does NOT currently display transaction type information

### Order Interface (src/components/order-management-hub.tsx)
- `Order.paymentDetails` field exists: `PaymentTransaction[]`
- Used for MAO (Manhattan Active Omni) orders with explicit payment details
- Non-MAO orders infer payment from `payment_info` field

### Mock Data (src/lib/mock-data.ts)
- `paymentDetails` array exists in several orders (W115625, CDS251229874674, etc.)
- Current `paymentDetails` entries do NOT include `transactionType` field
- Need to add `transactionType` to existing paymentDetails and create test scenarios

## Relevant Files

### Files to Modify

- **src/types/payment.ts** (lines 1-84)
  - Types already defined - needs JSDoc documentation enhancement
  - TransactionType and PaymentTransaction interface exist

- **src/components/order-detail/payments-tab.tsx** (lines 1-181)
  - Main component to modify for badge display
  - Add transaction type badge in header (after status badge, line ~103)
  - Add 'Transaction Type:' in CollapsibleContent section
  - Add helper function for badge styling

- **src/lib/mock-data.ts** (lines 3095-3108, 8686-8699, 9798-9811, 10125-10138)
  - Add `transactionType` field to existing paymentDetails arrays
  - Create new test scenario orders with different transaction types

### Files for Reference (Read-Only)

- **src/components/order-management-hub.tsx** (lines 229-277)
  - Order interface definition
  - PaymentTransaction import

- **wf_specs/wf-payment-transaction-types.md**
  - UI design specification (Version 1 layout)

- **app/api/orders/external/route.ts**
  - API route - no changes needed
  - External API structure reference

## Step by Step Tasks

### 1. Enhance Type Definitions with JSDoc Documentation

- Open `src/types/payment.ts`
- Add JSDoc comments to `TransactionType` explaining each type:
  - `AUTHORIZATION`: Initial payment authorization hold
  - `SETTLEMENT`: Payment captured/settled with merchant
  - `REFUNDED`: Payment refunded to customer
- Verify `PaymentTransaction.transactionType` field exists (already present)
- No structural changes needed - types are already correct

### 2. Create Transaction Type Badge Helper Function

- Open `src/components/order-detail/payments-tab.tsx`
- Add helper function `getTransactionTypeBadgeStyle(type: TransactionType | undefined)`:
  ```typescript
  const getTransactionTypeBadgeStyle = (type?: TransactionType) => {
    switch (type) {
      case 'AUTHORIZATION':
        return 'bg-yellow-100 text-yellow-700'
      case 'SETTLEMENT':
        return 'bg-green-100 text-green-700'
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-500'
    }
  }
  ```
- Add helper function `formatTransactionTypeLabel(type: TransactionType | undefined)`:
  ```typescript
  const formatTransactionTypeLabel = (type?: TransactionType) => {
    switch (type) {
      case 'AUTHORIZATION':
        return 'Authorization'
      case 'SETTLEMENT':
        return 'Settlement'
      case 'REFUNDED':
        return 'Refunded'
      default:
        return null
    }
  }
  ```

### 3. Update Payment Method Interface

- In `payments-tab.tsx`, extend the `paymentMethods` array item type to include `transactionType`:
  ```typescript
  const paymentMethods: {
    type: string;
    name: string;
    amount: number;
    status: string;
    transactionType?: TransactionType;  // Add this field
    details: {
      cardNumber?: string;
      expiry?: string;
      memberId?: string;
    };
  }[] = [...]
  ```

### 4. Connect paymentDetails to Component Logic

- Modify the `paymentMethods` array construction to use `order.paymentDetails` when available
- If `order.paymentDetails` exists and has entries, use the first entry's `transactionType`
- Add fallback logic: infer transaction type from payment status
  - `PAID` status defaults to `SETTLEMENT`
  - `PENDING` status defaults to `AUTHORIZATION`
  - Other statuses show no transaction type badge

### 5. Add Transaction Type Badge to Payment Card Header

- Locate the payment method card header section (around line 103)
- Add transaction type badge AFTER the existing status badge:
  ```tsx
  {/* Existing status badge */}
  <Badge variant="secondary" className={method.status === 'PAID' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
    {method.status}
  </Badge>
  {/* NEW: Transaction type badge */}
  {method.transactionType && (
    <Badge variant="secondary" className={getTransactionTypeBadgeStyle(method.transactionType)}>
      {method.transactionType}
    </Badge>
  )}
  ```

### 6. Add Transaction Type to Collapsed Details Section

- Locate the CollapsibleContent section (around line 117-150)
- Add 'Transaction Type:' row before 'Amount to be charged:' (only if transactionType exists):
  ```tsx
  {method.transactionType && (
    <div className="flex gap-2">
      <span className="font-semibold text-gray-700">Transaction Type:</span>
      <span className="text-gray-900 font-medium">
        {formatTransactionTypeLabel(method.transactionType)}
      </span>
    </div>
  )}
  ```

### 7. Import TransactionType from payment.ts

- Add import at top of `payments-tab.tsx`:
  ```typescript
  import { TransactionType } from "@/types/payment"
  ```

### 8. Update Mock Data with Transaction Types

- Open `src/lib/mock-data.ts`
- Update existing `paymentDetails` arrays to include `transactionType`:
  - Order W115625 (line ~3095): Add `transactionType: 'SETTLEMENT'`
  - Order CDS251229874674 (line ~8686): Add `transactionType: 'SETTLEMENT'`
  - Order CDS260121226285 (line ~9798): Add `transactionType: 'AUTHORIZATION'`
  - Order W1156260115052036 (line ~10125): Add `transactionType: 'REFUNDED'`

### 9. Create Additional Test Scenario Orders

- Add new mock order for split payment scenario with mixed transaction types:
  ```typescript
  {
    // Order with split payment: Credit Card (settled) + T1 (settled)
    id: 'test-split-payment-001',
    order_no: 'TST-SPLIT-001',
    paymentDetails: [
      { transactionType: 'SETTLEMENT', method: 'CREDIT_CARD', ... },
      { transactionType: 'SETTLEMENT', method: 'T1_REDEMPTION', ... }
    ]
  }
  ```
- Add order without paymentDetails to test fallback behavior

### 10. Validate TypeScript Compilation

- Run `pnpm build` to verify no TypeScript errors
- Run `pnpm lint` to check for any linting issues
- Fix any type errors that arise from the changes

### 11. Visual Verification Testing

- Run `pnpm dev` to start development server
- Navigate to Order Details → Payments tab
- Verify badge colors:
  - Authorization badge: yellow background, yellow text
  - Settlement badge: green background, green text
  - Refunded badge: gray background, gray text
- Verify badge placement: After payment status, before amount
- Verify 'Transaction Type:' appears in expanded details
- Test with orders that have no transactionType (should not show badge)
- Test mobile responsive layout

## Validation Commands

Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compiles without errors
- `pnpm lint` - Check for linting issues
- `pnpm dev` - Start development server for visual testing

**Manual Testing Checklist:**
1. Open http://localhost:3000/orders
2. Click on order W115625 → Payments tab
3. Verify SETTLEMENT badge appears (green)
4. Click on order CDS260121226285 → Payments tab
5. Verify AUTHORIZATION badge appears (yellow)
6. Click on order W1156260115052036 → Payments tab
7. Verify REFUNDED badge appears (gray)
8. Expand payment card details
9. Verify 'Transaction Type:' row appears with correct label
10. Test on mobile viewport (responsive layout)

## Acceptance Criteria

1. **Badge Display**: Transaction type badge appears next to payment status badge in header
2. **Color Scheme**:
   - Authorization: `bg-yellow-100 text-yellow-700`
   - Settlement: `bg-green-100 text-green-700`
   - Refunded: `bg-gray-100 text-gray-700`
3. **Details Section**: 'Transaction Type:' field appears in expanded card content
4. **Backward Compatibility**: Orders without transactionType field display correctly (no badge)
5. **Type Safety**: No TypeScript errors in build
6. **Mock Data**: At least 4 orders with different transaction types for testing
7. **Mobile Responsive**: Badge layout works on mobile viewports

## Implementation Summary

| File | Changes |
|------|---------|
| `src/types/payment.ts` | Add JSDoc comments (optional enhancement) |
| `src/components/order-detail/payments-tab.tsx` | Add badge styling helper, badge rendering, import |
| `src/lib/mock-data.ts` | Add transactionType to 4+ paymentDetails arrays |

**Estimated LOC Changes:**
- payments-tab.tsx: ~40-50 lines added
- mock-data.ts: ~8-10 lines modified
- payment.ts: ~10 lines JSDoc comments (optional)

## Future Enhancement Path

### Upgrade to Version 2 (Timeline)
- Add transaction history array to PaymentTransaction interface
- Create TransactionTimeline component
- Requires API providing transaction event history

### Upgrade to Version 3 (Table)
- Create PaymentTransactionsTable component
- Add filtering by transaction type and status
- Add summary totals section
- Consider new API endpoint for transaction data

### API Integration Notes
- Current external API does not provide transaction type
- When API is updated, map response to PaymentTransaction.transactionType
- Consider caching strategy for transaction history data
- Payment gateway integration may be required for real-time transaction status

## Notes

- The `TransactionType` type already exists in `src/types/payment.ts` - no new type definition needed
- The `PaymentTransaction` interface already has the optional `transactionType` field
- The wireframe specifies blue for Authorization, but user requested yellow instead
- The wireframe specifies orange for Refunded, but user requested gray instead
- Badge colors in this spec reflect the USER'S UPDATED COLOR SCHEME (yellow/green/gray)
- Some mock orders have `paymentDetails` arrays but without `transactionType` - these need updating
- Orders without `paymentDetails` use `payment_info` and should infer transaction type from status
