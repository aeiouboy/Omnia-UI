# Chore: Revert Payment Information to Original Omnia-UI Field Names

## Metadata
adw_id: `1fb44230`
prompt: `Revert Payment Information section in order-detail-view.tsx to original Omnia-UI field names and style, then update values to match To-Be column. Original field names to restore: Subtotal, Discounts, Charges, Shipping Fee, Amount Included Taxes, Amount Excluded Taxes, Taxes, Total. Remove all MAO-style operator signs (+, -, =) and '(Info only)' suffix. Keep original simple display style without operator prefixes. Update values for order W1156251121946800: Subtotal ฿1,850.00, Discounts -฿917.00, Charges ฿0.00, Shipping Fee ฿0.00, Amount Included Taxes ฿933.00, Amount Excluded Taxes ฿900.47 (changed from ฿933.00), Taxes ฿32.53 (changed from ฿0.00), Total ฿933.00. Update mock data payment_info to set amountExcludedTaxes=900.47 and taxes=32.53. Keep red color styling only for Discounts value.`

## Chore Description
This chore reverts the Payment Information section in the order detail view from the MAO (Manhattan Active Omni) style back to the original Omnia-UI field names and display style. The current implementation uses MAO-style labels (Item Subtotal, Total Discounts, Estimated S&H, Other Charges, Estimated Taxes, Order Total, Informational Taxes) with operator sign prefixes (+, -, =). This needs to be reverted to the To-Be column specification with original Omnia-UI field names and simple display style.

### Current MAO-Style Implementation (To Be Reverted)
- Item Subtotal: ฿1,850.00 (no prefix)
- Total Discounts: -฿917.00 (minus prefix, red color)
- Estimated S&H: +฿0.00 (plus prefix)
- Other Charges: +฿0.00 (plus prefix)
- Estimated Taxes: +฿0.00 (plus prefix)
- Order Total: =฿933.00 (equals prefix, bold)
- Informational Taxes: ฿32.53 (Info only) (muted, suffix)

### Target To-Be Implementation (Original Omnia-UI)
- Subtotal: ฿1,850.00
- Discounts: -฿917.00 (red color only)
- Charges: ฿0.00
- Shipping Fee: ฿0.00
- Amount Included Taxes: ฿933.00
- Amount Excluded Taxes: ฿900.47 (NEW VALUE - changed from ฿933.00)
- Taxes: ฿32.53 (NEW VALUE - changed from ฿0.00)
- Total: ฿933.00 (bold)

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** (lines 641-702): Contains the Payment Information card component that needs to be reverted from MAO-style to original Omnia-UI field names and remove operator sign prefixes
- **src/lib/mock-data.ts** (lines 5331-5344): Contains payment_info for order W1156251121946800 - need to update `amountExcludedTaxes` from 933 to 900.47 and `taxes` from 0 to 32.53
- **src/types/payment.ts** (lines 78-87): Contains MAOPaymentDisplay interface - may need cleanup but not critical for this change

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Mock Data Values for Order W1156251121946800
- Open `src/lib/mock-data.ts`
- Find the payment_info section for order W1156251121946800 (around line 5331)
- Change `amountExcludedTaxes: 933` to `amountExcludedTaxes: 900.47`
- Change `taxes: 0` to `taxes: 32.53`
- Remove the `informationalTaxes: 32.53` field (no longer needed since Taxes field now holds this value)

### 2. Revert Payment Information Section UI in order-detail-view.tsx
- Open `src/components/order-detail-view.tsx`
- Locate the Payment Information card (around line 641-702)
- Replace the entire payment breakdown section with original Omnia-UI field names:
  - Change "Item Subtotal" to "Subtotal"
  - Change "Total Discounts" to "Discounts" (keep red color, remove minus prefix from format string)
  - Remove "Estimated S&H" row (replaced by "Shipping Fee")
  - Add "Shipping Fee" row using `order?.orderDeliveryFee ?? 0`
  - Change "Other Charges" to "Charges"
  - Remove "Estimated Taxes" row (this was the incorrect taxes location)
  - Add "Amount Included Taxes" row using `order?.payment_info?.amountIncludedTaxes`
  - Add "Amount Excluded Taxes" row using `order?.payment_info?.amountExcludedTaxes`
  - Add "Taxes" row using `order?.payment_info?.taxes`
  - Change "Order Total" to "Total"
  - Remove "Informational Taxes" row entirely
- Remove all operator sign prefixes (+, -, =) from the formatted values
- Keep the minus sign only as part of the Discounts value (e.g., "-฿917.00")
- Remove "(Info only)" suffix styling
- Maintain bold styling for Total row only

### 3. Clean Up MAOPaymentDisplay Interface (Optional)
- The `MAOPaymentDisplay` interface in `src/types/payment.ts` can remain as-is since it's not directly used in the reverted implementation
- If needed for cleanup later, it can be deprecated or removed in a separate chore

### 4. Validate the Changes
- Run `pnpm build` to ensure no TypeScript errors
- Run `pnpm dev` and navigate to order W1156251121946800 to visually verify:
  - All 8 field labels match To-Be specification
  - Values are correct: Subtotal ฿1,850.00, Discounts -฿917.00, Charges ฿0.00, Shipping Fee ฿0.00, Amount Included Taxes ฿933.00, Amount Excluded Taxes ฿900.47, Taxes ฿32.53, Total ฿933.00
  - Only Discounts has red color
  - Only Total has bold styling
  - No operator prefixes (+, -, =) appear before values
  - No "(Info only)" suffix appears

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript compilation errors
- `pnpm dev` - Start development server and navigate to http://localhost:3000, then view order W1156251121946800 to verify Payment Information section displays correctly

## Notes
- The `formatCurrency` function handles Thai Baht formatting consistently
- The Discounts field should display the value with a leading minus sign as part of the value itself (e.g., "-฿917.00"), not as an operator prefix
- The `orderDeliveryFee` field at the order level should be used for Shipping Fee (not from payment_info)
- The Total row should reference `order?.total_amount` for consistency with the order total
- Red color class for Discounts: `text-red-600`
- Bold styling for Total: `font-semibold` on the wrapper div and `text-lg font-mono` on the value span
