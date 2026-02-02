# Chore: Implement Payment Transaction Type Badge (Version 1)

## Metadata
adw_id: `1a65e82b`
prompt: `Implement Payment Transaction Type Badge (Version 1) from wf_specs/wf-payment-transaction-types.md. Add a transaction type badge (Authorization, Settlement, Refunded) next to the payment status badge in the Payments tab. Badge colors: Authorization=blue, Settlement=green, Refunded=orange. Update src/types/payment.ts to add transactionType field and modify src/components/order-detail/payments-tab.tsx to display the badge.`

## Chore Description
This chore implements Version 1 of the Payment Transaction Type feature as specified in `wf_specs/wf-payment-transaction-types.md`. The implementation adds a visual badge next to the existing payment status badge in the Payments tab to display the transaction type (Authorization, Settlement, or Refunded). This is the minimal, low-risk approach that provides immediate value by showing transaction type information without requiring extensive API changes or complex UI modifications.

### Key Requirements:
1. Add a `transactionType` field to the `PaymentTransaction` interface in `src/types/payment.ts`
2. Display a color-coded transaction type badge next to the payment status badge in the Payments tab
3. Use specific badge colors: Authorization (blue), Settlement (green), Refunded (orange)
4. Ensure the badge displays for each payment method card in the collapsible payment methods section
5. Maintain mobile responsiveness and existing UI layout patterns

### Badge Color Scheme:
| Transaction Type | Badge Style |
|-----------------|-------------|
| Authorization | `bg-blue-100 text-blue-700` |
| Settlement | `bg-green-100 text-green-700` |
| Refunded | `bg-orange-100 text-orange-700` |

## Relevant Files

### Files to Modify:

- **src/types/payment.ts** (lines 1-77)
  - Add `transactionType` field to the `PaymentTransaction` interface
  - Define a TypeScript union type for transaction types: `'AUTHORIZATION' | 'SETTLEMENT' | 'REFUNDED'`
  - This is the type definition file for all payment-related data structures

- **src/components/order-detail/payments-tab.tsx** (lines 1-181)
  - Modify the payment method card header section (around lines 93-106) to add the transaction type badge
  - Add badge rendering logic next to the existing payment status badge (currently at line 103-105)
  - Create a helper function or inline logic to map transaction types to badge colors
  - Ensure the badge displays properly in the responsive layout (flex layout with gap spacing)
  - Import the `Badge` component from `@/components/ui/badge` (already imported at line 2)

- **src/components/order-management-hub.tsx** (lines 220-268)
  - Update the `Order` interface to include the `transactionType` field in `paymentDetails` array
  - Ensure the `PaymentTransaction` type import is updated to reflect the new field
  - This file defines the main `Order` interface that already imports `PaymentTransaction` type (line 33)

### Reference Files:

- **wf_specs/wf-payment-transaction-types.md** (lines 1-288)
  - Complete wireframe specification document
  - Contains Version 1, 2, and 3 designs with ASCII wireframes
  - Badge color scheme definitions (lines 45-50)
  - Data requirements and implementation notes (lines 53-58, 273-288)

- **src/components/order-badges.tsx** (referenced in payments-tab.tsx:8)
  - Contains existing badge components like `PaymentStatusBadge`
  - Reference for consistent badge styling patterns used throughout the application

### New Files:
None required for Version 1 implementation. All changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Payment Type Definitions
- Open `src/types/payment.ts`
- Add a TypeScript union type definition for transaction types:
  ```typescript
  export type TransactionType = 'AUTHORIZATION' | 'SETTLEMENT' | 'REFUNDED'
  ```
- Add the `transactionType` field to the `PaymentTransaction` interface (after line 21, before the closing brace):
  ```typescript
  transactionType?: TransactionType
  ```
- Ensure the field is optional to maintain backward compatibility with existing data
- Save the file

### 2. Create Transaction Type Badge Component Logic
- Open `src/components/order-detail/payments-tab.tsx`
- Add a helper function near the top of the component (after line 15, before the main component function) to get badge styles:
  ```typescript
  function getTransactionTypeBadgeStyles(type: string): string {
    switch (type) {
      case 'AUTHORIZATION':
        return 'bg-blue-100 text-blue-700'
      case 'SETTLEMENT':
        return 'bg-green-100 text-green-700'
      case 'REFUNDED':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }
  ```
- Import the `TransactionType` type from `@/types/payment`:
  ```typescript
  import type { PaymentTransaction, TransactionType } from "@/types/payment"
  ```

### 3. Update Payment Method Data Structure
- In the `PaymentsTab` component (around lines 27-51), update the `paymentMethods` array type definition to include `transactionType`:
  ```typescript
  const paymentMethods: {
    type: string;
    name: string;
    amount: number;
    status: string;
    transactionType?: TransactionType;  // Add this line
    details: {
      cardNumber?: string;
      expiry?: string;
      memberId?: string;
    };
  }[] = [
    // ... existing payment methods
  ]
  ```
- Add mock transaction type data to the existing payment methods (for testing purposes):
  - Main payment method: `transactionType: 'SETTLEMENT'` (line ~48)
  - T1 redemption method: `transactionType: 'SETTLEMENT'` (line ~59)
- Note: In production, this data should come from the API via `order.paymentDetails[].transactionType`

### 4. Add Transaction Type Badge to UI
- Locate the payment method card header section (lines 93-116)
- Find the section where the payment status badge is rendered (around line 103-105)
- Add the transaction type badge immediately after the payment status badge:
  ```typescript
  <Badge variant="secondary" className={method.status === 'PAID' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
    {method.status}
  </Badge>
  {method.transactionType && (
    <Badge variant="secondary" className={getTransactionTypeBadgeStyles(method.transactionType)}>
      {method.transactionType}
    </Badge>
  )}
  ```
- Ensure proper spacing between badges using the existing `gap-3` class in the parent container (line 94)

### 5. Add Visual Display in Collapsible Details Section
- Locate the collapsible content section (lines 117-151)
- After the card details section (around line 138), add a transaction type row:
  ```typescript
  {method.transactionType && (
    <div className="flex gap-2">
      <span className="font-semibold text-gray-700">Transaction Type:</span>
      <span className="text-gray-900 font-medium">{method.transactionType}</span>
    </div>
  )}
  ```
- This provides additional detail visibility when the payment card is expanded

### 6. Update Order Interface Import
- Open `src/components/order-management-hub.tsx`
- Verify that the `PaymentTransaction` type is imported from `@/types/payment` (line 33)
- Confirm that the `Order` interface includes `paymentDetails?: PaymentTransaction[]` (line 260)
- No changes needed if the import is already present and correct

### 7. Test Responsive Layout
- Run the development server: `pnpm dev`
- Navigate to an order detail page with payment information
- Verify the transaction type badge displays next to the payment status badge
- Check mobile responsiveness:
  - Badges should wrap gracefully on smaller screens
  - Colors should be clearly visible
  - Badge text should be readable
- Test with different transaction types (Authorization, Settlement, Refunded)

### 8. Validate Implementation
- Ensure no TypeScript errors in modified files
- Verify badge colors match the specification:
  - Authorization: blue background with dark blue text
  - Settlement: green background with dark green text
  - Refunded: orange background with dark orange text
- Check that the badge only appears when `transactionType` is present (graceful handling of optional field)
- Confirm the layout maintains consistency with existing payment status badge

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# 1. Check for TypeScript errors in modified files
npx tsc --noEmit src/types/payment.ts
npx tsc --noEmit src/components/order-detail/payments-tab.tsx
npx tsc --noEmit src/components/order-management-hub.tsx

# 2. Run full TypeScript check
npx tsc --noEmit

# 3. Run ESLint on modified files
npx eslint src/types/payment.ts src/components/order-detail/payments-tab.tsx

# 4. Start development server to visually test
pnpm dev
# Then navigate to: http://localhost:3000/orders
# Open an order detail modal and check the Payments tab

# 5. Build production bundle to ensure no build errors
pnpm build
```

## Notes

### Implementation Strategy:
- **Version 1 Approach**: This is the minimal implementation that adds transaction type visibility without requiring major API changes or complex UI restructuring
- **Mock Data**: The initial implementation uses mock transaction type data (`'SETTLEMENT'`) for testing. In production, this should be replaced with actual data from `order.paymentDetails[].transactionType`
- **Backward Compatibility**: The `transactionType` field is optional to ensure the UI gracefully handles orders without this data
- **Future Enhancements**: This implementation sets the foundation for Version 2 (timeline view) or Version 3 (separate transaction section) as described in the wireframe specification

### UI/UX Considerations:
- **Badge Placement**: The transaction type badge appears next to the payment status badge, providing immediate visibility without cluttering the interface
- **Color Coding**: Different colors help users quickly distinguish transaction states at a glance
- **Responsive Design**: The flex layout with gap spacing ensures badges wrap properly on mobile devices
- **Detail View**: The transaction type is also shown in the expanded details section for users who need more information

### Technical Considerations:
- **Type Safety**: Using TypeScript union types ensures only valid transaction types are used
- **Optional Fields**: The `?` modifier on `transactionType` ensures the app doesn't break when the field is missing
- **Component Reuse**: Using the existing `Badge` component maintains UI consistency across the application
- **Performance**: No additional API calls required; data is assumed to be part of the existing order payload

### Testing Checklist:
- [ ] TypeScript compilation successful
- [ ] No ESLint errors
- [ ] Badge displays correctly on desktop view
- [ ] Badge wraps properly on mobile view
- [ ] Colors match specification (blue, green, orange)
- [ ] Badge only appears when transaction type is present
- [ ] Expanded details section shows transaction type
- [ ] Production build successful

### API Integration Notes (for future implementation):
- The current implementation uses mock data for `transactionType`
- When the external API is updated to provide transaction type information, update the following:
  1. Remove mock `transactionType` assignments in `PaymentsTab` component
  2. Ensure `order.paymentDetails` array includes `transactionType` field from API
  3. Map API transaction type values to the expected `TransactionType` union type
  4. Consider adding transaction type to the `ApiPaymentInfo` interface if needed
