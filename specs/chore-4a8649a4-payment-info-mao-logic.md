# Chore: Update Payment Information Section to Match MAO Payment Logic

## Metadata
adw_id: `4a8649a4`
prompt: `Update Payment Information section in order-detail-view.tsx for order W1156251121946800 to match MAO payment logic. Current fields (Subtotal, Discounts, Charges, Shipping Fee, Amount Included Taxes, Amount Excluded Taxes, Taxes, Total) need to be restructured to display: 1) Item Subtotal (฿1,850.00), 2) Total Discounts with minus sign (-฿917.00), 3) Estimated S&H with plus sign (+฿0.00), 4) Other Charges with plus sign (+฿0.00), 5) Estimated Taxes with plus sign (+฿0.00), 6) Order Total with equals sign (=฿933.00), 7) Informational Taxes shown separately (฿32.53). The calculation logic should be: Order Total = Item Subtotal - Total Discounts + Estimated S&H + Other Charges + Estimated Taxes. Update the Payment type definition in src/types/payment.ts if needed. Reference mock data in src/lib/mock-data.ts for order W1156251121946800 to ensure correct field mapping.`

## Chore Description
Update the Payment Information card in the Order Detail Overview tab to match the MAO (Manhattan Order Application) payment display logic. The current implementation shows a flat list of payment fields, but MAO uses a specific calculation formula with operator signs that make the payment breakdown clear and easy to verify.

**Current Implementation:**
- Subtotal, Discounts, Charges, Shipping Fee, Amount Included Taxes, Amount Excluded Taxes, Taxes, Total

**Required MAO Format:**
1. Item Subtotal (no sign)
2. Total Discounts (with minus sign prefix: -)
3. Estimated S&H (with plus sign prefix: +)
4. Other Charges (with plus sign prefix: +)
5. Estimated Taxes (with plus sign prefix: +)
6. Order Total (with equals sign prefix: =)
7. Informational Taxes (separate, display-only, not part of calculation)

**Calculation Formula:**
```
Order Total = Item Subtotal - Total Discounts + Estimated S&H + Other Charges + Estimated Taxes
```

**Reference Order W1156251121946800 Values:**
- Item Subtotal: ฿1,850.00
- Total Discounts: ฿917.00
- Estimated S&H: ฿0.00
- Other Charges: ฿0.00
- Estimated Taxes: ฿0.00
- Order Total: ฿933.00
- Informational Taxes: ฿32.53 (display-only)

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** (lines 642-693): Contains the Payment Information card component. The payment display logic needs to be restructured from the current flat list to the MAO format with operator signs.

- **src/types/payment.ts**: Contains payment-related type definitions. May need to add new fields for `estimatedShipping`, `otherCharges`, `estimatedTaxes`, and `informationalTaxes` if not present.

- **src/lib/mock-data.ts** (lines 5330-5343): Contains the `payment_info` object for order W1156251121946800 with the reference values:
  ```typescript
  payment_info: {
    method: 'CREDIT_CARD',
    status: 'PAID',
    transaction_id: '17636994333493701826',
    subtotal: 1850,
    discounts: 917,
    charges: 0,
    amountIncludedTaxes: 933,
    amountExcludedTaxes: 933,
    taxes: 0,
    cardNumber: '525667XXXXXX4575',
    expiryDate: '**/****'
  }
  ```

- **src/lib/currency-utils.ts**: Contains `formatCurrency()` function used for Thai Baht formatting with decimal places.

### New Files
None required.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Payment Type Definition
- Open `src/types/payment.ts`
- Add new fields to support MAO payment structure if not already present:
  - `itemSubtotal?: number` - Item subtotal before discounts
  - `totalDiscounts?: number` - Total discount amount
  - `estimatedShipping?: number` - Estimated shipping and handling
  - `otherCharges?: number` - Other charges/fees
  - `estimatedTaxes?: number` - Estimated tax amount
  - `orderTotal?: number` - Final order total
  - `informationalTaxes?: number` - Display-only tax information (not part of calculation)

### 2. Update Payment Information Card UI
- Open `src/components/order-detail-view.tsx`
- Locate the Payment Information Card section (lines 642-693)
- Replace the existing payment fields with the MAO format structure:
  1. **Item Subtotal row**: Label "Item Subtotal", value without sign
  2. **Total Discounts row**: Label "Total Discounts", value with minus sign prefix (-฿X.XX in red)
  3. **Estimated S&H row**: Label "Estimated S&H", value with plus sign prefix (+฿X.XX)
  4. **Other Charges row**: Label "Other Charges", value with plus sign prefix (+฿X.XX)
  5. **Estimated Taxes row**: Label "Estimated Taxes", value with plus sign prefix (+฿X.XX)
  6. **Separator line**
  7. **Order Total row**: Label "Order Total", value with equals sign prefix (=฿X.XX), bold styling
  8. **Separator line**
  9. **Informational Taxes row**: Label "Informational Taxes", value without sign, muted/lighter styling with "(Info only)" suffix

### 3. Map Existing Fields to MAO Structure
- Map `order?.payment_info?.subtotal` to Item Subtotal
- Map `order?.payment_info?.discounts` to Total Discounts
- Map `order?.orderDeliveryFee` or `0` to Estimated S&H
- Map `order?.payment_info?.charges` or `0` to Other Charges
- Map `order?.payment_info?.taxes` or `0` to Estimated Taxes
- Map `order?.total_amount` to Order Total
- Add new field for Informational Taxes (calculate as 7% of amountExcludedTaxes if available, or use a fixed field)

### 4. Style Updates for Operator Signs
- Discount row: Red text color for the value with minus sign
- S&H, Charges, Taxes rows: Standard text with plus sign prefix
- Order Total row: Bold text, larger font size, equals sign prefix
- Informational Taxes row: Muted/gray text to indicate it's display-only

### 5. Validate the Implementation
- Run the development server: `pnpm dev`
- Navigate to Order Detail page for order W1156251121946800
- Verify the Payment Information section displays:
  - Item Subtotal: ฿1,850.00
  - Total Discounts: -฿917.00 (red)
  - Estimated S&H: +฿0.00
  - Other Charges: +฿0.00
  - Estimated Taxes: +฿0.00
  - Order Total: =฿933.00 (bold)
  - Informational Taxes: ฿32.53 (muted)
- Verify the calculation matches: 1850 - 917 + 0 + 0 + 0 = 933

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript compilation errors
- `pnpm lint` - Ensure no linting errors
- `pnpm dev` - Start development server and visually verify Payment Information section for order W1156251121946800 displays correctly with:
  - Proper operator signs (-, +, =)
  - Correct values matching the formula
  - Appropriate styling (red for discounts, bold for total, muted for informational)

## Notes
- The `informationalTaxes` field value (฿32.53) appears to be a separate calculated tax that is shown for reference but not included in the Order Total calculation. This may be VAT or another tax shown for informational purposes.
- The current mock data has `taxes: 0` but the prompt specifies ฿32.53 for Informational Taxes. This should be either added to the mock data or calculated from existing fields (e.g., 7% of `amountExcludedTaxes` if that represents the pre-VAT amount).
- The formatting should use the existing `formatCurrency()` function from `src/lib/currency-utils.ts` for consistent Thai Baht display with comma separators.
- Consider whether to show rows with zero values (like S&H and Charges when they are ฿0.00) or conditionally hide them. The MAO format shows all rows regardless of value.
