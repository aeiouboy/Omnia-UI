# Chore: Payment Methods Amount Fallback Logic

## Metadata
adw_id: `fee70f1e`
prompt: `Update Payment Methods aggregation logic so Amount to be charged equals Amount charged when no separate AUTHORIZATION transactions exist. In src/components/order-detail/payments-tab.tsx, modify the paymentMethods useMemo (lines 77-122): After building the methodMap from order.paymentDetails, add a post-processing step that iterates through Array.from(methodMap.values()) and for each payment method, if amountToBeCharged is 0 and amountCharged is greater than 0, set amountToBeCharged = amountCharged. This ensures for orders with only SETTLEMENT transactions (completed orders), both Amount to be charged and Amount charged show the same value, representing the total amount that was both authorized and charged.`

## Chore Description
For orders that only have SETTLEMENT transactions (no separate AUTHORIZATION transactions), the current aggregation logic results in `amountToBeCharged` showing 0 while `amountCharged` displays the correct value. This is misleading for completed orders where authorization and settlement happened simultaneously.

The fix adds a post-processing step after building the payment method map that copies `amountCharged` to `amountToBeCharged` when:
1. `amountToBeCharged` is 0 (no AUTHORIZATION transactions found)
2. `amountCharged` is greater than 0 (SETTLEMENT transactions exist)

This ensures both fields display the same value for orders where the payment was immediately settled without a separate authorization step.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail/payments-tab.tsx** - Contains the `paymentMethods` useMemo hook (lines 77-122) that needs modification to add the fallback logic

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Post-Processing Logic to paymentMethods useMemo
- Locate the `paymentMethods` useMemo in `src/components/order-detail/payments-tab.tsx` (lines 77-122)
- Find line 108 where `Array.from(methodMap.values())` is returned
- Before the return statement, add a post-processing loop:
  ```typescript
  // Post-process: For orders with only SETTLEMENT transactions (no separate AUTHORIZATION),
  // copy amountCharged to amountToBeCharged so both fields display the same value
  for (const method of methodMap.values()) {
      if (method.amountToBeCharged === 0 && method.amountCharged > 0) {
          method.amountToBeCharged = method.amountCharged;
      }
  }
  ```
- This should be inserted between lines 106 (end of for loop) and 108 (return statement)

### 2. Validate TypeScript Compilation
- Run TypeScript check to ensure no compilation errors
- Verify the logic is syntactically correct

### 3. Visual Validation
- Start the development server
- Navigate to an order with only SETTLEMENT transactions (e.g., CDS260130806823)
- Verify both "Amount to be charged" and "Amount charged" display the same value

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `pnpm dev` - Start development server and manually verify payment display at http://localhost:3000

## Notes
- The fallback logic only triggers when `amountToBeCharged` is exactly 0 and `amountCharged` is positive
- This preserves the correct behavior for orders that have both AUTHORIZATION and SETTLEMENT transactions (the amounts stay separate)
- The non-MAO fallback path (lines 110-121) already sets both amounts correctly for paid orders, so this change only affects the MAO order path with explicit paymentDetails
