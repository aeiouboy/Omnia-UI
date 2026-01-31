# Chore: Fix Incorrect Unit Price for Lipstick Item in Order CDS260130806823

## Metadata
adw_id: `05222eb9`
prompt: `Fix incorrect unit price for Lipstick item in order CDS260130806823 mock data. In src/lib/mock-data.ts, find the order with id 'CDS260130806823' and update the Lipstick Loveshine Candy Glow item (SKU: CDS26769646, quantity: 2). Change unit_price from 3700 to 1850 so that the Items tab displays '฿1,850.00 each' instead of '฿3,700.00 each'. The total should remain ฿3,700.00 (2 items × ฿1,850). Only modify the unit_price field for this specific line item.`

## Chore Description
The mock data for order CDS260130806823 contains an incorrect unit price for the Lipstick Loveshine Candy Glow Valentines Limited E item. Currently, the `unit_price` field is set to 3700 THB, which causes the UI to display "฿3,700.00 each" in the Items tab. However, this is incorrect - the unit price should be 1850 THB per item, with a quantity of 2, resulting in a total of 3700 THB.

This is a cosmetic data correction that affects how the price is displayed in the order detail view. The total amount (3700 THB) remains unchanged, but the per-unit pricing needs to accurately reflect that each lipstick costs 1850 THB.

**Item Details:**
- Product: Lipstick Loveshine Candy Glow Valentines Limited E
- SKU: CDS26769646
- Quantity: 2 pieces
- Current unit_price: 3700 (incorrect)
- Correct unit_price: 1850
- Total price: 3700 (unchanged)

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** (line ~8729) - Contains the MAO order CDS260130806823 mock data with the incorrect unit_price value that needs to be corrected
- **src/components/order-detail-view.tsx** (reference only) - The UI component that displays the unit price in the Items tab; no changes needed here, just for validation context

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Locate the Order in Mock Data
- Open `src/lib/mock-data.ts`
- Search for order ID `CDS260130806823` (appears around line 8520-8533)
- Locate the `maoOrderCDS260130806823Items` array definition
- Find the line item with ID `LINE-CDS26080-005` (the Lipstick Loveshine item)
- Verify the SKU is `CDS26769646` and product name is "Lipstick Loveshine Candy Glow Valentines Limited E"

### 2. Update the Unit Price Field
- Within the LINE-CDS26080-005 item object (around line 8729), locate the `unit_price` field
- Change the value from `unit_price: 3700` to `unit_price: 1850`
- Verify that `quantity: 2` remains unchanged
- Verify that `total_price: 3700` remains unchanged (this is correct: 2 × 1850 = 3700)
- Do NOT modify any other fields in this line item

### 3. Verify Price Breakdown Consistency
- Check that the `priceBreakdown` object for this item (lines 8745-8753) remains unchanged:
  - `subtotal: 3700` (correct - this is the line total)
  - `amountExcludedTaxes: 3457.94` (correct)
  - `taxes: 242.06` (correct)
  - `total: 3700` (correct)
- The priceBreakdown reflects the total for the line, not per-unit values

### 4. Verify Settled Items Section
- Locate the `settledItems` array within the order's `paymentDetails` (around line 8928-8936)
- Confirm the entry for SKU CDS26769646 shows:
  - `unitPrice: 1850` (should match the corrected value)
  - `itemAmount: 3700` (line total)
  - `quantity: 2`
- Update the `unitPrice` in settledItems if it differs from 1850

### 5. Validate the Change
- Save the file
- Start the development server: `pnpm dev`
- Navigate to the order detail page for order CDS260130806823
- Click on the "Items" tab
- Expand the Lipstick Loveshine Candy Glow item details
- Verify the display shows "฿1,850.00 each" (not "฿3,700.00 each")
- Verify the total price still shows ฿3,700.00
- Verify the quantity shows 2 pieces

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# 1. Verify the unit_price field was changed correctly
grep -A 5 "LINE-CDS26080-005" src/lib/mock-data.ts | grep "unit_price: 1850"

# 2. Verify the total_price remains unchanged
grep -A 6 "LINE-CDS26080-005" src/lib/mock-data.ts | grep "total_price: 3700"

# 3. Verify quantity remains 2
grep -A 2 "LINE-CDS26080-005" src/lib/mock-data.ts | grep "quantity: 2"

# 4. Check for any syntax errors in the TypeScript file
pnpm exec tsc --noEmit src/lib/mock-data.ts

# 5. Start dev server and manually verify the UI (visual check)
pnpm dev
# Then navigate to: http://localhost:3000 → Orders → CDS260130806823 → Items tab
```

## Notes

### Current Data Structure
The order CDS260130806823 represents a real MAO (Manhattan Active Omni) order with:
- 6 line items total
- 5 promotional items (FREE, unit_price: 0)
- 1 paid item: Lipstick Loveshine (the item being corrected)
- Total order amount: ฿3,700.00
- Informational taxes: ฿242.06 (VAT, not separately charged)

### Why This Correction Matters
The UI displays unit prices in the order detail view to show customers the per-item cost. When the unit_price field contains the line total instead of the per-unit cost, it creates confusion and makes the pricing appear incorrect. This correction ensures the mock data accurately represents real-world order data from Manhattan OMS.

### Related Fields Not Changed
- `priceBreakdown.subtotal` - This represents the line item subtotal (total for all units), so it correctly remains 3700
- `total_price` - This is the line item total, correctly remains 3700
- `paymentDetails.settledItems[].unitPrice` - Should also be verified to show 1850

### Post-Fix Verification
After the fix, the Items tab should display:
```
Lipstick Loveshine Candy Glow Valentines Limited E
฿1,850.00 each
Quantity: 2
Total: ฿3,700.00
```

This matches the expected format where users can see both the per-unit price (฿1,850) and the line total (฿3,700).
