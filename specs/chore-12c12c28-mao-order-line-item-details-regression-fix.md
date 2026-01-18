# Chore: MAO Order Line Item Details Regression Fix

## Metadata
adw_id: `12c12c28`
prompt: `COMPREHENSIVE REGRESSION FIX: Restore the complete Friday implementation of MAO order line item details. The screenshot shows the EXACT correct implementation that must be restored.`

## Chore Description
This chore addresses a regression in the MAO order line item expanded details view within the Items tab of the Order Detail View. The Friday implementation showed a complete 3-column layout with all required fields correctly displayed. The regression has caused certain fields and sections to be missing or improperly displayed.

The fix must restore the complete implementation with:
1. **SECTION 1 (Product Details)** - Left column with 8 fields
2. **SECTION 2 (Pricing & Promotions)** - Middle column with pricing info AND both promotions AND coupons displayed as separate rows
3. **SECTION 3 (Fulfillment & Shipping)** - Right column with shipping info and booking slots
4. **SECTION 4 (Price Breakdown)** - Bottom of right column with 7 price breakdown fields

**CRITICAL REGRESSION**: The coupons array is currently NOT being displayed in the Items tab expanded view. The implementation must show BOTH promotions (from `item.promotions[]`) AND coupons (from `order.couponCodes[]`) in the Pricing & Promotions section as separate rows.

## Relevant Files
Use these files to complete the chore:

### Primary Files to Modify

- **`src/components/order-detail-view.tsx`** (lines 758-1008) - Main file containing the Items tab expanded item view. The 3-column layout exists but the coupons display is missing. Must add logic to display coupons alongside promotions.

### Type Definition Files

- **`src/types/payment.ts`** (lines 47-52) - Contains `CouponCode` interface with fields: `code`, `description`, `discountAmount`, `appliedAt`. Already properly defined.

- **`src/components/order-management-hub.tsx`** (lines 98-149) - Contains `ApiOrderItem` interface. Note: This interface does NOT have a `coupons` array at the item level. Coupons are at the ORDER level via `couponCodes?: CouponCode[]`.

### Mock Data Files

- **`src/lib/mock-data.ts`** (lines 3404-3417) - Contains MAO order `W1156251121946800` with `couponCodes` array at order level:
  ```typescript
  couponCodes: [
    { code: 'AUTOAPPLY', description: 'CPN9|AUTOAPPLY', discountAmount: -170.00, appliedAt: '...' },
    { code: '15FRESH', description: 'CPN2|15FRESH', discountAmount: -100.00, appliedAt: '...' }
  ]
  ```

### Reference Screenshots
The prompt references a screenshot showing the exact correct implementation with:
- Promotions displayed as: `-฿76.00 | 9400006839 | BOGO`
- Coupons displayed as: `-฿17.78 | CPN9 | CPN9 | AUTOAPPLY` and `-฿5.14 | CPN2 | CPN2 | 15FRESH`

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify Current ApiOrderItem Interface Structure
- Read `src/components/order-management-hub.tsx` lines 98-149 to confirm ApiOrderItem structure
- Confirm that coupons are stored at ORDER level (`order.couponCodes[]`) not ITEM level
- Understand that the fix requires passing `order.couponCodes` to the Items tab rendering

### 2. Update Order Detail View to Access Order-Level Coupons
- In `src/components/order-detail-view.tsx`, the Items tab rendering (starting around line 662) needs access to `order.couponCodes`
- Ensure the expanded item details can access the order-level coupon data
- The `order` object is already available in scope via the `OrderDetailView` component props

### 3. Modify the Promotions & Coupons Section Display
- Locate the "Promotions & Coupons" section in order-detail-view.tsx (around lines 869-901)
- Current implementation only maps over `item.promotions[]`
- Add a second mapping loop for `order?.couponCodes[]` to display coupons AFTER promotions
- Each coupon row should display:
  - Discount amount (red, negative value like `-฿17.78`)
  - Type extracted from description (e.g., `CPN9` from `CPN9|AUTOAPPLY`)
  - Coupon name/description (e.g., `CPN9 | AUTOAPPLY`)

### 4. Update Coupon Row Display Format
- Add coupon display rows with the same structure as promotion rows
- Extract coupon type from `description` field by splitting on `|` and taking first part
- Display format per screenshot:
  ```
  | Discount     | Type  | Coupon Name      |
  | -฿17.78      | CPN9  | CPN9 | AUTOAPPLY |
  | -฿5.14       | CPN2  | CPN2 | 15FRESH   |
  ```
- Use similar styling to promotion rows (bg-white, p-2, rounded, border, text-xs)

### 5. Verify All Product Details Fields Are Present (Column 1)
- Confirm these fields are displayed in the expanded item view:
  - UOM (from `item.uom`)
  - Supply Type ID (from `item.supplyTypeId`)
  - Substitution (from `item.substitution` - Yes/No)
  - Bundle (from `item.bundle` - Yes/No)
  - Bundle Ref (from `item.bundleRef` or N/A)
  - Packed Ordered Qty (from `item.packedOrderedQty` - conditional on pack UOM)
  - Gift Wrapped (from `item.giftWrapped` - Yes/No)
  - Gift Message (from `item.giftWrappedMessage` or -)

### 6. Verify All Fulfillment & Shipping Fields Are Present (Column 3)
- Confirm these fields are displayed:
  - Shipping Method (from `item.shippingMethod`)
  - Fulfillment Status (from `item.fulfillmentStatus`)
  - Route (from `item.route`)
  - Booking Slot From (from `item.bookingSlotFrom`)
  - Booking Slot To (from `item.bookingSlotTo`)
  - ETA (from `item.eta`)

### 7. Verify Price Breakdown Section (Bottom of Column 3)
- Confirm these fields are displayed:
  - Subtotal
  - Discount (negative)
  - Charges
  - Amount Excl. Tax
  - Taxes (7%)
  - Amount Incl. Tax
  - Total

### 8. Validate with Build and Visual Testing
- Run `pnpm build` to ensure no TypeScript errors
- Test with MAO order `W1156251121946800` which has both promotions and coupons
- Verify the expanded item details show both promotions and coupons in the correct format

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `pnpm dev` - Start dev server and navigate to Order Management Hub
- Search for order `W1156251121946800` and open order details
- Go to Items tab and expand any item
- Verify Pricing & Promotions section shows BOTH promotions (if any) AND coupons
- Compare visual output to the reference screenshot described in the prompt

## Notes

### Data Structure Clarification
- **Promotions** are at the ITEM level: `item.promotions[]` with fields `{discountAmount, promotionId, promotionType, secretCode?}`
- **Coupons** are at the ORDER level: `order.couponCodes[]` with fields `{code, description, discountAmount, appliedAt}`
- The UI must display BOTH in the same "Promotions & Coupons" section

### Coupon Description Parsing
The `description` field in `CouponCode` contains a composite value like `CPN9|AUTOAPPLY`:
- Split by `|` to extract: `type = CPN9`, `name = AUTOAPPLY`
- Display as: `Type: CPN9`, `Coupon Name: CPN9 | AUTOAPPLY` (or just the description as-is)

### Existing Implementation Reference
The current promotions display code at lines 872-899 in order-detail-view.tsx can serve as a template for the coupons display. The same card/row structure should be used for visual consistency.

### MAO Order Test Data
Order `W1156251121946800` has:
- 3 BOGO promotions at item level (Betagro, Salmon, Thammachart)
- 2 coupon codes at order level (AUTOAPPLY -170.00, 15FRESH -100.00)
This order is ideal for testing both promotions and coupons display.
