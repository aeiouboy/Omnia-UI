# Chore: Restore Order-Level Coupon Display in Line Items

## Metadata
adw_id: `f2b32bd2`
prompt: `Implement spec chore-12c12c28-mao-order-line-item-details-regression-fix.md to restore the complete January 16th implementation of MAO order line item details. Restore the order-level coupon display (order.couponCodes[]) in the Items tab expanded view alongside line-level promotions. The fix must add back the removed code block (lines 901-928) that displays AUTOAPPLY (-฿170) and 15FRESH (-฿100) coupons. Test with order W1156251121946800.`

## Chore Description
This chore restores the order-level coupon display functionality that was removed during a January 16th regression. The current implementation in `order-detail-view.tsx` only displays item-level promotions (`item.promotions[]`) in the "Promotions & Coupons" section of expanded line items in the Items tab. The fix must add back the display of order-level coupons (`order.couponCodes[]`) which contain codes like:
- **AUTOAPPLY** (CPN9): -฿170.00
- **15FRESH** (CPN2): -฿100.00

The coupon codes are stored at the order level in the `couponCodes` array (see `CouponCode` interface in `src/types/payment.ts`), not at the item level. The UI must display both item-level promotions AND order-level coupons in the same "Promotions & Coupons" section for each expanded line item.

## Relevant Files
Use these files to complete the chore:

### Primary Files to Modify

- **`src/components/order-detail-view.tsx`** (lines 869-901) - The main component containing the Items tab with expanded item details. The "Promotions & Coupons" section at lines 869-901 currently only maps over `item.promotions[]`. Must add a second loop for `order?.couponCodes[]` after the promotions section.

### Type Definition Files

- **`src/types/payment.ts`** (lines 47-52) - Contains `CouponCode` interface with fields:
  - `code: string` - e.g., "AUTOAPPLY", "15FRESH"
  - `description: string` - e.g., "CPN9|AUTOAPPLY", "CPN2|15FRESH"
  - `discountAmount: number` - e.g., -170.00, -100.00
  - `appliedAt: string` - timestamp

- **`src/components/order-management-hub.tsx`** - Contains `Order` interface which includes `couponCodes?: CouponCode[]` at the order level.

### Reference Files

- **`src/lib/mock-data.ts`** (lines 3404-3417) - Contains MAO order `W1156251121946800` with `couponCodes` array at order level for testing.

- **`specs/chore-12c12c28-mao-order-line-item-details-regression-fix.md`** - The original spec describing the complete regression fix requirements.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify Order Object Access in Items Tab
- Confirm that the `order` object (which contains `couponCodes[]`) is accessible in the Items tab rendering section (line 662 onwards in `order-detail-view.tsx`)
- The `order` object comes from the `OrderDetailView` component props and should already be in scope
- The mapping function at line 664 `filteredItems.map((item: ApiOrderItem, index)` has access to `order` from the parent closure

### 2. Locate the Promotions & Coupons Section
- Navigate to lines 869-901 in `order-detail-view.tsx`
- This section displays "Promotions & Coupons" header and maps over `item.promotions[]`
- The current code at line 873 checks: `item.promotions && item.promotions.length > 0`
- The fallback at line 898 shows: "No promotions or coupons applied"

### 3. Add Order-Level Coupons Display After Promotions
- After the promotions mapping (after line 897, before the closing div at line 901)
- Add a second conditional section to display `order?.couponCodes[]`
- Each coupon should display in a similar card format:
  - **Discount**: Show `coupon.discountAmount` in red (negative value like `-฿170.00`)
  - **Type**: Extract from `description` by splitting on `|` and taking first part (e.g., `CPN9`)
  - **Coupon Code**: Show `coupon.code` (e.g., `AUTOAPPLY`)
  - **Description**: Optionally show full description
- Use the same styling as promotion cards: `bg-white p-2 rounded border border-gray-200 text-xs`

### 4. Implement the Coupon Display Code
- Insert the following pattern after the promotions section:
```tsx
{/* Order-level Coupons */}
{order?.couponCodes && order.couponCodes.length > 0 && (
  <div className="space-y-2 mt-2">
    {order.couponCodes.map((coupon, idx) => {
      const couponType = coupon.description?.split('|')[0] || 'COUPON'
      return (
        <div key={coupon.code || `coupon-${idx}`} className="bg-white p-2 rounded border border-gray-200 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Discount</span>
            <span className="text-red-600 font-medium">฿{Math.abs(coupon.discountAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Type</span>
            <span className="text-gray-900 font-mono">{couponType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Code</span>
            <span className="text-gray-900 font-mono">{coupon.code}</span>
          </div>
        </div>
      )
    })}
  </div>
)}
```

### 5. Update Empty State Condition
- Modify the empty state check at line 898 to account for both promotions AND coupons
- Change from: `!(item.promotions && item.promotions.length > 0)`
- To: `!(item.promotions?.length || order?.couponCodes?.length)`
- This ensures "No promotions or coupons applied" only shows when BOTH are empty

### 6. Validate TypeScript Compilation
- Run `pnpm build` to ensure no TypeScript errors
- Verify that the `CouponCode` type is properly recognized from `order.couponCodes[]`
- Confirm that the `order` object access from component props is valid

### 7. Visual Testing with Test Order
- Run `pnpm dev` and navigate to Order Management Hub
- Search for order `W1156251121946800`
- Open the order details and go to the Items tab
- Expand any item (e.g., Betagro Chicken)
- Verify the "Promotions & Coupons" section shows:
  - Item promotions (if any): BOGO discounts from `item.promotions[]`
  - Order coupons: AUTOAPPLY (-฿170.00) and 15FRESH (-฿100.00) from `order.couponCodes[]`

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `pnpm dev` - Start development server on http://localhost:3000
- Navigate to Order Management Hub → Search `W1156251121946800` → Click order → Items tab → Expand any item
- Verify "Promotions & Coupons" section displays both item promotions AND order coupons
- Screenshot comparison: The expanded item should show coupon cards with AUTOAPPLY and 15FRESH alongside any item-level promotions

## Notes

### Data Structure Reference
- **Item-level promotions**: `item.promotions[]` with `{discountAmount, promotionId, promotionType, secretCode?}`
- **Order-level coupons**: `order.couponCodes[]` with `{code, description, discountAmount, appliedAt}`
- Both should be displayed in the same UI section but as separate card entries

### Coupon Description Parsing
The `description` field contains composite value like `CPN9|AUTOAPPLY`:
- Split by `|` to extract type: `CPN9`
- The `code` field contains the coupon name: `AUTOAPPLY`
- Display format: `Type: CPN9`, `Code: AUTOAPPLY`

### Test Order Data
Order `W1156251121946800` (MAO test order) contains:
- 3 BOGO promotions at item level (Betagro, Salmon, Thammachart items)
- 2 coupon codes at order level:
  - AUTOAPPLY: -฿170.00 (CPN9)
  - 15FRESH: -฿100.00 (CPN2)

This order is ideal for validating both promotions and coupons display simultaneously.

### Regression Context
The regression was caused by spec `chore-8d877d95-remove-order-level-coupon-from-line-items.md` which removed the order-level coupon display. This fix restores that functionality as specified in the original January 16th implementation.
