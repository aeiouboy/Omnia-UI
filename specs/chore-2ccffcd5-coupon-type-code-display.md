# Chore: Update coupon type code display

## Metadata
adw_id: `2ccffcd5`
prompt: `Update coupon detail display in order-detail-view.tsx to show the coupon type code (like 'CPN9' or 'CPN2') instead of the generic 'COUPON' promotionType. The type code should be extracted from the order-level couponCodes array which has a description field in the format 'TYPE|NAME' (e.g., 'CPN9|AUTOAPPLY'). Match line-item coupon promotionId to order-level couponCodes.code to get the correct type code. Reference MAO order W1156251121946800 which has couponCodes with codes like AUTOAPPLY (CPN9) and 15FRESH (CPN2). The order object is available in the component as selectedOrder with couponCodes array containing {code, description, discountAmount, appliedAt} fields.`

## Chore Description
Update the order detail view's coupon display to show specific coupon type codes (e.g., 'CPN9', 'CPN2') instead of the generic 'COUPON' string from `promotionType`.

Currently, when displaying promotions in the Items tab, line items with `promotionType === 'COUPON'` show "Type: COUPON" which is not informative. The actual coupon type code (like 'CPN9' for AUTOAPPLY or 'CPN2' for 15FRESH) is stored in the order-level `couponCodes` array in the `description` field with format `TYPE|NAME` (e.g., 'CPN9|AUTOAPPLY').

The fix requires:
1. When rendering a coupon promotion, look up the `promotionId` (e.g., 'AUTOAPPLY') in the order's `couponCodes` array by matching to `couponCodes[].code`
2. Parse the matched coupon's `description` field to extract the type code before the `|` delimiter
3. Display this extracted type code instead of 'COUPON'

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** (lines 945-984) - Contains the "Promotions & Coupons" section rendering logic that needs to be updated. The `order` prop contains `couponCodes` array.
- **src/types/payment.ts** (lines 46-51) - Defines the `CouponCode` interface with `code`, `description`, `discountAmount`, and `appliedAt` fields.
- **src/components/order-management-hub.tsx** (line 259) - Shows that the `Order` type has `couponCodes?: CouponCode[]` property.
- **src/lib/mock-data.ts** (lines 5684-5697) - Contains example couponCodes data structure for MAO order W1156251121946800:
  ```typescript
  couponCodes: [
    { code: 'AUTOAPPLY', description: 'CPN9|AUTOAPPLY', discountAmount: -170.00, appliedAt: '...' },
    { code: '15FRESH', description: 'CPN2|15FRESH', discountAmount: -100.00, appliedAt: '...' }
  ]
  ```

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create helper function to extract coupon type code
- Add a helper function inside or before the `OrderDetailView` component to look up coupon type from order-level couponCodes
- Function signature: `getCouponTypeCode(promotionId: string, couponCodes?: CouponCode[]): string`
- Logic:
  1. If no couponCodes array, return 'COUPON' (fallback)
  2. Find matching coupon where `couponCode.code === promotionId`
  3. If found, parse `description` field by splitting on `|` and taking first part
  4. Return extracted type code (e.g., 'CPN9') or 'COUPON' if not found

### 2. Update the coupon Type display in Promotions & Coupons section
- Locate the promotion rendering code around line 964 where `{promo.promotionType}` is displayed
- For coupon promotions (where `promo.promotionType === 'COUPON'`), replace:
  ```tsx
  <span className="text-gray-900">{promo.promotionType}</span>
  ```
  With:
  ```tsx
  <span className="text-gray-900">{getCouponTypeCode(promo.promotionId, order?.couponCodes)}</span>
  ```

### 3. Import CouponCode type if needed
- Check if `CouponCode` type needs to be imported from `@/types/payment`
- If not already imported via the Order type, add the import

### 4. Validate the implementation
- Run development server: `pnpm dev`
- Navigate to order W1156251121946800 detail page
- Expand an item with coupon promotions (e.g., Betagro Egg Tofu)
- Verify the Type field shows 'CPN9' or 'CPN2' instead of 'COUPON'
- Confirm non-coupon promotions (like BOGO) still show their original promotionType

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the project compiles without TypeScript errors
- `pnpm lint` - Check for any linting issues
- Manual validation: Navigate to http://localhost:3000/orders, search for order W1156251121946800, expand an item with AUTOAPPLY coupon, verify Type shows 'CPN9' instead of 'COUPON'

## Notes
- The helper function should handle edge cases:
  - Missing or empty couponCodes array
  - Promotion not found in couponCodes
  - Description field without `|` delimiter (fallback to full description or 'COUPON')
- Keep the original 'Coupon ID' and 'Coupon name' display logic unchanged
- Only the Type field display logic needs to be updated for coupon-type promotions
- The order object is passed as `order` prop to the component and contains `couponCodes?: CouponCode[]`
