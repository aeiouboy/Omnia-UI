# Chore: Coupon Detail Display on Order Line Items

## Metadata
adw_id: `a9f556cb`
prompt: `Analyze and update coupon detail display on order line items in the order detail view. When an order line has a coupon applied, it should display these fields: 1) Discount - the discount amount, 2) Coupon ID - rename from 'Promo ID' to 'Coupon ID' and display values like 'AUTOAPPLY', 3) Type - display coupon type values like 'CPN9', 4) Coupon name - display the coupon name like 'AUTOAPPLY' or '15FRESH'. First analyze the current coupon/promotion data structure in src/types/ and src/lib/mock-data.ts to understand available fields, then update the order detail view component to show these coupon details properly. Reference MAO order W1156251121946800 mock data for sample coupon values.`

## Chore Description

Update the order line item "Promotions & Coupons" section in the order detail view to properly display coupon information when a coupon is applied. The current implementation displays promotions with a "Promo ID" label, but for items with coupons (promotionType: 'COUPON'), it should show coupon-specific fields:

1. **Discount** - Already exists, shows the discount amount (e.g., ฿-0.86)
2. **Coupon ID** - Rename from "Promo ID" to "Coupon ID" when the item is a coupon (e.g., 'AUTOAPPLY')
3. **Type** - Extract and display the coupon type code from the `secretCode` field (e.g., 'CPN9' from 'CPN9|AUTOAPPLY' description) or show the promotionType
4. **Coupon name** - Display the coupon code/name from `secretCode` field (e.g., 'AUTOAPPLY', '15FRESH')

### Data Structure Analysis

The promotion data in `ApiOrderItem.promotions` has the following structure:
```typescript
promotions?: {
  discountAmount: number    // Negative value e.g., -0.86
  promotionId: string       // e.g., 'AUTOAPPLY', '15FRESH', '1700015040'
  promotionType: string     // e.g., 'COUPON', 'BOGO', 'Red Hot'
  secretCode?: string       // e.g., 'AUTOAPPLY', '15FRESH' (present for coupons)
}[]
```

The order-level `couponCodes` in MAO order W1156251121946800 shows the format:
```typescript
couponCodes: [
  {
    code: 'AUTOAPPLY',
    description: 'CPN9|AUTOAPPLY',  // Type|Name format
    discountAmount: -170.00,
    appliedAt: '2025-11-21T10:42:00+07:00'
  }
]
```

### Display Logic

For items where `promotionType === 'COUPON'`:
- Show "Coupon ID" instead of "Promo ID"
- Display the `promotionId` value (which contains the coupon code like 'AUTOAPPLY')
- Show "Type" as 'COUPON' (from promotionType)
- Show "Coupon name" from `secretCode` (which is the same as promotionId for coupons)

For items where `promotionType !== 'COUPON'`:
- Keep existing "Promo ID" label and display

## Relevant Files

- **src/components/order-detail-view.tsx** - Main component containing the "Promotions & Coupons" section that needs to be updated (lines 945-976). This is where the display logic for promotions is rendered in the order line item detail expansion.

- **src/components/order-management-hub.tsx** - Contains the `ApiOrderItem` interface definition (lines 96-148) which includes the `promotions` array type definition.

- **src/lib/mock-data.ts** - Contains MAO order W1156251121946800 with sample coupon data (lines 4705-5697). Reference data includes:
  - LINE-W115625-002-0 and LINE-W115625-002-1: Items with BOGO + AUTOAPPLY coupon
  - LINE-W115625-004-0 through LINE-W115625-004-3: Items with BOGO + AUTOAPPLY + 15FRESH coupons
  - Order-level `couponCodes` array showing CPN9 and CPN2 type codes

- **src/types/payment.ts** - Contains `Promotion` and `CouponCode` type definitions (lines 35-51) for reference on expected coupon field structures.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Promotions & Coupons Display Logic
- Open `src/components/order-detail-view.tsx`
- Locate the "Promotions & Coupons Section" around line 945
- Modify the display logic inside the `item.promotions.map()` block to:
  - Check if `promo.promotionType === 'COUPON'` to determine if it's a coupon
  - For coupons: Display "Coupon ID" label instead of "Promo ID"
  - For coupons: Add a "Coupon name" field showing the `secretCode` value
  - For non-coupons: Keep the existing "Promo ID" label

### 2. Implement Conditional Label Rendering
- Inside the promotion map block, add conditional rendering:
  ```tsx
  <div className="flex justify-between">
    <span className="text-gray-500">
      {promo.promotionType === 'COUPON' ? 'Coupon ID' : 'Promo ID'}
    </span>
    <span className="text-gray-900 font-mono">{promo.promotionId}</span>
  </div>
  ```

### 3. Add Coupon Name Field for Coupons
- After the "Type" field, add a new conditional field for Coupon name:
  ```tsx
  {promo.promotionType === 'COUPON' && promo.secretCode && (
    <div className="flex justify-between">
      <span className="text-gray-500">Coupon name</span>
      <span className="text-gray-900 font-mono">{promo.secretCode}</span>
    </div>
  )}
  ```

### 4. Remove Redundant "Code" Field
- The current implementation already has a `secretCode` display labeled as "Code"
- This can be kept for backwards compatibility OR renamed to "Coupon name" for coupons only
- Decision: Keep the existing "Code" field logic but ensure it only shows for non-coupon promotions that have a secretCode, since for coupons we're adding a dedicated "Coupon name" field

### 5. Validate Build and Test
- Run `pnpm build` to ensure no TypeScript errors
- Test with MAO order W1156251121946800 in the browser to verify:
  - LINE-W115625-002-0: Shows BOGO promo + AUTOAPPLY coupon with proper labels
  - Coupon items display "Coupon ID" instead of "Promo ID"
  - Coupon items display "Coupon name" field

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `pnpm dev` - Start development server to manually test order W1156251121946800
- Navigate to order W1156251121946800, expand line item LINE-W115625-002-0, and verify:
  - BOGO promotion shows "Promo ID: 5200060159"
  - AUTOAPPLY coupon shows "Coupon ID: AUTOAPPLY"
  - AUTOAPPLY coupon shows "Coupon name: AUTOAPPLY"
  - Type field shows "COUPON" for coupon entries

## Notes

- The `secretCode` field in the promotion object contains the coupon code/name for COUPON type promotions
- The `promotionId` for coupons is the same as the coupon code (e.g., 'AUTOAPPLY', '15FRESH')
- Order-level `couponCodes` array contains additional metadata like the coupon type code (CPN9, CPN2) in the description field format "TYPE|NAME", but this is not currently exposed at the line item level
- The change is backwards compatible - non-coupon promotions will continue to display with "Promo ID" label
- Consider future enhancement: Parse the order-level couponCodes description to extract type codes and match them to line-item coupons for displaying specific type codes like 'CPN9'
