# Chore: Fix Payments Tab Display for Mixed-Fulfillment Orders

## Metadata
adw_id: `0ceb9923`
prompt: `Fix Payments Tab Display for Mixed-Fulfillment Orders. Two bugs cause incorrect payment display for order CDS251229874674`

## Chore Description
The Payments Tab displays incorrect payment information for order CDS251229874674, a mixed-fulfillment order with two separate BANK_TRANSFER payments (฿822.00 and ฿399.00). Two bugs need to be fixed:

**BUG 1** (ALREADY FIXED): The `isMaoOrder` check at line 421 in `order-management-hub.tsx` has already been updated to recognize CDS-prefixed orders. No action needed.

**BUG 2** (ACTIVE): The `payments-tab.tsx` component checks `hasExplicitPaymentDetails` at line 40 but only uses it to suppress T1 redemption display. The component never maps the `paymentDetails` array to `paymentMethods`, so orders with explicit payment details still show a single "Main" payment instead of the actual invoice entries.

Additionally, the `PaymentTransaction` type needs to include `invoiceNo` field which exists in the mock data.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail/payments-tab.tsx** - Main file to fix. Lines 45-71 define `paymentMethods` array but only create a single "Main" entry. Need to map `order.paymentDetails` when available.
- **src/types/payment.ts** - Type definition for `PaymentTransaction`. Missing `invoiceNo` field that exists in mock data.
- **src/lib/mock-data.ts** - Contains the test order CDS251229874674 with two `paymentDetails` entries at lines 9489-9511. Each has `invoiceNo` field.
- **src/components/order-management-hub.tsx** - Reference only. Lines 421-422 already include CDS prefix check (no changes needed).

### New Files
None required.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add invoiceNo to PaymentTransaction Type
- Open `src/types/payment.ts`
- Add `invoiceNo?: string` field to the `PaymentTransaction` interface after line 27 (after `transactionType`)

### 2. Update paymentMethods Initialization in payments-tab.tsx
- Open `src/components/order-detail/payments-tab.tsx`
- Replace lines 45-71 with conditional logic:
  - If `hasExplicitPaymentDetails` is true, map `order.paymentDetails` to `paymentMethods` array where each entry has:
    - `type: "Invoice"`
    - `name: detail.method` (e.g., "BANK_TRANSFER")
    - `amount: detail.amount`
    - `status: detail.status`
    - `transactionType: 'SETTLEMENT'`
    - `invoiceNo: detail.invoiceNo`
    - `details: {}` (empty object)
  - Otherwise, use existing single "Main" payment logic

### 3. Add invoiceNo to paymentMethods Type Definition
- In `payments-tab.tsx`, update the `paymentMethods` type definition (lines 45-55) to include `invoiceNo?: string`

### 4. Update CollapsibleContent to Display Invoice Number
- In `payments-tab.tsx`, add a new condition in the CollapsibleContent section (around line 144)
- When `method.type === 'Invoice'` and `method.invoiceNo` exists, display:
  ```tsx
  <div className="flex gap-2">
    <span className="font-semibold text-gray-700">Invoice Number:</span>
    <span className="text-gray-900 font-medium">{method.invoiceNo}</span>
  </div>
  ```

### 5. Update Icon for Invoice Payment Type
- In the icon rendering section (lines 116-122), add a condition for `method.type === 'Invoice'` to show an appropriate icon (can use the same CreditCard icon or Banknote icon from lucide-react)

### 6. Validate TypeScript Compilation
- Run `npm run build` to verify no TypeScript errors
- Check that the build completes successfully

### 7. Visual Validation
- Start dev server with `pnpm dev`
- Navigate to order CDS251229874674
- Verify Payment Methods shows (2) entries
- Verify both BANK_TRANSFER entries display with correct amounts (฿822.00 and ฿399.00)
- Verify Invoice Number displays in collapsible details for each payment

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run build` - Verify TypeScript compilation succeeds
- `pnpm dev` - Start development server to visually verify
- Navigate to http://localhost:3000 and search for order CDS251229874674
- Click on Payments tab and verify:
  - Payment Methods header shows "(2)"
  - Two BANK_TRANSFER entries are visible
  - Amounts show ฿822.00 and ฿399.00
  - Expanding each shows Invoice Number field

## Notes
- BUG 1 from the original prompt has already been fixed in a previous session (see session #S518 in context)
- The `paymentDetails` array in mock data has `invoiceNo` field but the TypeScript type doesn't define it yet
- The expected display should match MAO order specification with multiple invoice entries
- The `transactionType` should default to 'SETTLEMENT' for paid invoices
